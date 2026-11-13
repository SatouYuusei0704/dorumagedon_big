-- 1. アイテムに「タイプ」を付けて、そうびによってバトルの強さが変わるようにする
-- 2. キャラクター作成時に出身地のご当地アイテムを実際に渡す
-- 3. すれ違いの条件をゆるめる（時間差でもすれ違える）

-- ---------------------------------------------------------------------------
-- 1. アイテムのタイプ（効果の数値は src/features/battle/engine.ts の ITEM_TRAITS）
--   sword : ご当地わざのダメージアップ
--   shield: ガードの回数 +1
--   helmet: さいだいHPアップ
--   charm : エネルギーがたまった状態でスタート
--   basic : 効果なし（旅人のつるぎ）
-- ---------------------------------------------------------------------------
alter table public.items
  add column category text not null default 'basic'
  check (category in ('basic', 'sword', 'shield', 'helmet', 'charm'));

update public.items set category = 'sword'
  where slug in ('biwako_catfish_sword', 'gold_leaf_sword', 'tea_blade',
                 'dinosaur_blade', 'naniwa_harisen', 'apple_sword');
update public.items set category = 'shield'
  where slug in ('soba_shield', 'tower_shield');
update public.items set category = 'helmet'
  where slug in ('daruma_helmet', 'yatsuhashi_helmet');
update public.items set category = 'charm'
  where slug in ('magatama_charm', 'carved_bear');

-- ---------------------------------------------------------------------------
-- 2. はじめのご当地アイテム
--   キャラクター作成の「ご当地そうびをてにいれた！」で、出身地のアイテムを
--   1 人 1 回だけ渡し、何もそうびしていなければそのままそうびする。
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column starter_claimed boolean not null default false;

create or replace function public.claim_starter_item()
returns bigint
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  my_area text;
  claimed boolean;
  starter bigint;
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- 行ロックで二重受け取りを防ぐ
  select p.home_area, p.starter_claimed into my_area, claimed
  from public.profiles p where p.id = me for update;
  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;

  starter := public.item_for_area(my_area);
  if claimed then
    return null;  -- もう受け取っている
  end if;

  insert into public.user_items (user_id, item_id, quantity)
  values (me, starter, 1)
  on conflict (user_id, item_id) do update
    set quantity = public.user_items.quantity + 1;

  update public.profiles
  set starter_claimed = true,
      equipped_item_id = coalesce(equipped_item_id, starter)
  where id = me;

  return starter;
end;
$$;

revoke execute on function public.claim_starter_item() from public, anon;
grant execute on function public.claim_starter_item() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. すれ違い判定の条件をゆるめる
--   ブラウザはアプリを開いている間しか位置を送れないため、
--   「同時に 50m 以内」だとほとんど成立しない。
--   → 自分の今の位置から 200m 以内に、3 時間以内にいた人とすれ違う。
--   （自分の位置は 10 分以内に送ったもの。同じ相手とは 3 時間に 1 回まで）
-- ---------------------------------------------------------------------------
create or replace function public.check_encounters()
returns table (encounter_id bigint, partner_id uuid, received_item_id bigint)
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  my_pos geography;
  my_area text;
  partner uuid;
  partner_area text;
  item_me bigint;
  item_partner bigint;
  new_id bigint;
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select l.position into my_pos
  from public.locations l
  where l.user_id = me and l.updated_at > now() - interval '10 minutes';
  if my_pos is null then
    return;
  end if;

  select p.home_area into my_area from public.profiles p where p.id = me;

  for partner, partner_area in
    select l.user_id, p.home_area
    from public.locations l
    join public.profiles p on p.id = l.user_id
    where l.user_id <> me
      and l.updated_at > now() - interval '3 hours'
      and st_dwithin(l.position, my_pos, 200)
  loop
    -- 両者が同時に判定しても二重に記録しないよう、ペア単位でロックする
    perform pg_advisory_xact_lock(
      hashtextextended(least(me, partner)::text || greatest(me, partner)::text, 0)
    );

    if exists (
      select 1 from public.encounters e
      where least(e.user_a, e.user_b) = least(me, partner)
        and greatest(e.user_a, e.user_b) = greatest(me, partner)
        and e.encountered_at > now() - interval '3 hours'
    ) then
      continue;
    end if;

    -- お互いに「相手の出身地のアイテム」をもらう
    item_me := public.item_for_area(partner_area);
    item_partner := public.item_for_area(my_area);

    insert into public.encounters (user_a, user_b, item_to_a, item_to_b)
    values (me, partner, item_me, item_partner)
    returning id into new_id;

    insert into public.user_items (user_id, item_id, quantity)
    values (me, item_me, 1), (partner, item_partner, 1)
    on conflict (user_id, item_id) do update
      set quantity = public.user_items.quantity + 1;

    encounter_id := new_id;
    partner_id := partner;
    received_item_id := item_me;
    return next;
  end loop;
end;
$$;

revoke execute on function public.check_encounters() from public, anon;
grant execute on function public.check_encounters() to authenticated;
