-- すれちがいNPCバトル。
--   * すれ違った相手のデータを NPC の敵として、好きなときに戦える
--   * 勝敗を battles に記録し、勝ったら相手の出身地のご当地アイテムをもらう
--   * 報酬は同じ相手につき 1 日（日本時間）1 回まで

-- ---------------------------------------------------------------------------
-- 1. 青森のご当地アイテム（キャラクター作成画面に合わせて追加）
-- ---------------------------------------------------------------------------
insert into public.items (slug, name, rarity, prefecture, icon, description) values
  ('apple_sword', 'りんごのつるぎ', 1, '青森県', '🍎🗡️', '甘酸っぱい魔力を秘めた真っ赤な剣')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 2. 戦績
-- ---------------------------------------------------------------------------
create table public.battles (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  opponent_id uuid not null references public.profiles (id) on delete cascade,
  won boolean not null,
  -- 勝利でもらったアイテム（負け・報酬上限のときは null）
  reward_item_id bigint references public.items (id),
  fought_at timestamptz not null default now(),
  check (user_id <> opponent_id)
);

create index battles_user_idx on public.battles (user_id, fought_at desc);
create index battles_reward_idx on public.battles (user_id, opponent_id, fought_at desc)
  where reward_item_id is not null;

alter table public.battles enable row level security;
create policy "battles own read" on public.battles for select
  using (auth.uid() = user_id);
-- 書き込みは record_battle() 経由に限定する
revoke insert, update, delete on public.battles from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. 勝敗の記録
--   すれ違ったことのある相手とだけ記録できる。
--   勝ったら相手の出身地のアイテムを 1 つもらう（同じ相手から 1 日 1 回まで）。
-- ---------------------------------------------------------------------------
create or replace function public.record_battle(p_opponent uuid, p_won boolean)
returns table (new_battle_id bigint, reward_id bigint)
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  opponent_area text;
  reward bigint := null;
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

  -- 同時に送られても報酬が二重にならないよう、自分×相手の単位でロックする
  perform pg_advisory_xact_lock(
    hashtextextended('battle:' || me::text || ':' || p_opponent::text, 0)
  );

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

  insert into public.battles (user_id, opponent_id, won, reward_item_id)
  values (me, p_opponent, p_won, reward)
  returning id into inserted_id;

  new_battle_id := inserted_id;
  reward_id := reward;
  return next;
end;
$$;

revoke execute on function public.record_battle(uuid, boolean) from public, anon;
grant execute on function public.record_battle(uuid, boolean) to authenticated;
