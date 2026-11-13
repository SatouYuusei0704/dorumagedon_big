-- コインとショップ。
--   * バトルをすると勝っても負けてもコインがもらえる（勝つと多い）
--   * ショップでコインを使って「どうぐ」を買い、バトル中に使える
--   * コインと持ち物の増減は、すべて security definer の RPC 経由に限定する

-- ---------------------------------------------------------------------------
-- 1. コイン
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column coins integer not null default 0 check (coins >= 0);
-- 列単位の UPDATE 権限は nickname / home_area / avatar のみ（0004）なので、
-- coins はクライアントから直接は書き換えられない。

alter table public.battles
  add column coins integer not null default 0;

-- ---------------------------------------------------------------------------
-- 2. ショップの商品（バトル中の効果は src/features/battle/engine.ts の BATTLE_ITEMS）
-- ---------------------------------------------------------------------------
create table public.shop_items (
  id text primary key,
  name text not null,
  icon text not null,
  description text not null,
  price integer not null check (price > 0),
  sort_order integer not null default 0
);

insert into public.shop_items (id, name, icon, description, price, sort_order) values
  ('potion', 'かいふくドリンク', '🧃', 'HPを 30 かいふくする',                     30, 1),
  ('power',  'パワーだんご',     '🍡', 'このバトルのあいだ あたえるダメージ +3', 40, 2),
  ('tough',  'タフネスもち',     '🍙', 'このバトルのあいだ さいだいHP +15',      40, 3);

-- 持っているどうぐ
create table public.user_shop_items (
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_id text not null references public.shop_items (id),
  quantity integer not null default 0 check (quantity >= 0),
  primary key (user_id, item_id)
);

alter table public.shop_items enable row level security;
alter table public.user_shop_items enable row level security;
create policy "shop_items readable" on public.shop_items for select using (true);
create policy "user_shop_items own read" on public.user_shop_items for select
  using (auth.uid() = user_id);
revoke insert, update, delete on public.shop_items from anon, authenticated;
revoke insert, update, delete on public.user_shop_items from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. 買う
-- ---------------------------------------------------------------------------
create or replace function public.buy_shop_item(p_item text)
returns table (coins_left integer, owned integer)
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  item_price integer;
  my_coins integer;
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select s.price into item_price from public.shop_items s where s.id = p_item;
  if item_price is null then
    raise exception 'item not found' using errcode = 'P0002';
  end if;

  -- 行ロックで同時購入による二重払い・マイナスを防ぐ
  select p.coins into my_coins from public.profiles p where p.id = me for update;
  if my_coins is null then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;
  if my_coins < item_price then
    raise exception 'not enough coins' using errcode = 'P0001';
  end if;

  update public.profiles set coins = coins - item_price where id = me;

  insert into public.user_shop_items (user_id, item_id, quantity)
  values (me, p_item, 1)
  on conflict (user_id, item_id) do update
    set quantity = public.user_shop_items.quantity + 1
  returning quantity into owned;

  coins_left := my_coins - item_price;
  return next;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. 使う（バトル中に 1 つ消費する）
-- ---------------------------------------------------------------------------
create or replace function public.use_shop_item(p_item text)
returns integer
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  remaining integer;
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  update public.user_shop_items
  set quantity = quantity - 1
  where user_id = me and item_id = p_item and quantity > 0
  returning quantity into remaining;

  if remaining is null then
    raise exception 'item not owned' using errcode = '42501';
  end if;
  return remaining;
end;
$$;

revoke execute on function public.buy_shop_item(text) from public, anon;
revoke execute on function public.use_shop_item(text) from public, anon;
grant execute on function public.buy_shop_item(text) to authenticated;
grant execute on function public.use_shop_item(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. 勝敗の記録にコインの報酬を追加
--   勝ち 30 コイン / 負け 10 コイン。
--   バトルは何度でもできるので、コインがもらえるのは 1 日（日本時間）10 回まで。
--   （戻り値の列が増えるので、作り直す）
-- ---------------------------------------------------------------------------
drop function if exists public.record_battle(uuid, boolean);

create function public.record_battle(p_opponent uuid, p_won boolean)
returns table (new_battle_id bigint, reward_id bigint, coins_earned integer, coins_total integer)
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  opponent_area text;
  reward bigint := null;
  earned integer := 0;
  paid_today integer;
  inserted_id bigint;
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_opponent is null or p_opponent = me or p_won is null then
    raise exception 'invalid arguments' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.encounters e
    where least(e.user_a, e.user_b) = least(me, p_opponent)
      and greatest(e.user_a, e.user_b) = greatest(me, p_opponent)
  ) then
    raise exception 'not encountered' using errcode = '42501';
  end if;

  -- 同時に送られても報酬が二重にならないよう、自分の単位でロックする
  perform pg_advisory_xact_lock(hashtextextended('battle:' || me::text, 0));

  if p_won and not exists (
    select 1 from public.battles b
    where b.user_id = me
      and b.opponent_id = p_opponent
      and b.reward_item_id is not null
      and (b.fought_at at time zone 'Asia/Tokyo')::date
          = (now() at time zone 'Asia/Tokyo')::date
  ) then
    select p.home_area into opponent_area from public.profiles p where p.id = p_opponent;
    reward := public.item_for_area(opponent_area);

    insert into public.user_items (user_id, item_id, quantity)
    values (me, reward, 1)
    on conflict (user_id, item_id) do update
      set quantity = public.user_items.quantity + 1;
  end if;

  select count(*) into paid_today
  from public.battles b
  where b.user_id = me
    and b.coins > 0
    and (b.fought_at at time zone 'Asia/Tokyo')::date
        = (now() at time zone 'Asia/Tokyo')::date;
  if paid_today < 10 then
    earned := case when p_won then 30 else 10 end;
  end if;

  insert into public.battles (user_id, opponent_id, won, reward_item_id, coins)
  values (me, p_opponent, p_won, reward, earned)
  returning id into inserted_id;

  update public.profiles set coins = coins + earned where id = me
  returning coins into coins_total;

  new_battle_id := inserted_id;
  reward_id := reward;
  coins_earned := earned;
  return next;
end;
$$;

revoke execute on function public.record_battle(uuid, boolean) from public, anon;
grant execute on function public.record_battle(uuid, boolean) to authenticated;
