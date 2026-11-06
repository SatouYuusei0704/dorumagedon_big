-- アイテムを果物からご当地アイテムに置き換える。
--   * items に出身地・アイコン・説明を追加する
--   * すれ違ったら「相手の出身地のご当地アイテム」をもらう
--     （ご当地アイテムがない出身地・未設定なら「旅人のつるぎ」）

-- ---------------------------------------------------------------------------
-- 1. items に列を追加
-- ---------------------------------------------------------------------------
alter table public.items
  add column prefecture text unique,      -- null は出身地に関係ないアイテム
  add column icon text not null default '',
  add column description text not null default '';

-- ---------------------------------------------------------------------------
-- 2. 果物を削除（開発中のため所持数・履歴上の果物はリセットする）
-- ---------------------------------------------------------------------------
update public.encounters set item_to_a = null, item_to_b = null;
delete from public.user_items;
delete from public.items;

-- ---------------------------------------------------------------------------
-- 3. ご当地アイテムを登録
-- ---------------------------------------------------------------------------
insert into public.items (slug, name, rarity, prefecture, icon, description) values
  ('biwako_catfish_sword', '琵琶湖の大ナマズ剣', 1, '滋賀県', '🐟🗡️', '琵琶湖の主の力が宿った巨大な剣'),
  ('gold_leaf_sword',      '金箔のつるぎ',       1, '石川県', '✨🗡️', '金沢の輝きを秘めた煌びやかな剣'),
  ('daruma_helmet',        '上州ダルマのかぶと', 1, '群馬県', '🔴🪖', '七転び八起き！絶対に倒れない兜'),
  ('tea_blade',            '茶摘みのやいば',     1, '静岡県', '🍃🗡️', '富士山の風と茶葉の香りが漂う刀'),
  ('soba_shield',          '信州そばの盾',       1, '長野県', '🍜🛡️', 'コシの強さで攻撃を跳ね返す盾'),
  ('yatsuhashi_helmet',    '八ツ橋のかぶと',     1, '京都府', '🍡🪖', 'ほんのりニッキが香る歴史ある防具'),
  ('dinosaur_blade',       '恐竜の化石ブレード', 1, '福井県', '🦖🗡️', '太古のロマン溢れる巨大な骨の剣'),
  ('magatama_charm',       '勾玉のおまもり',     1, '島根県', '☯️✨', '出雲の神々の良縁と加護をもたらす宝玉'),
  ('tower_shield',         'タワーのたて',       1, '東京都', '🗼🛡️', '大都会の電波を守る強固な盾'),
  ('naniwa_harisen',       'なにわのハリセン',   1, '大阪府', '🪭',   'ツッコミのキレが倍増する伝説の道具'),
  ('carved_bear',          '木彫りのくま',       1, '北海道', '🐻',   '鮭を咥えた強力なご当地お守り'),
  ('traveler_sword',       '旅人のつるぎ',       1, null,     '🗡️',   '全国を旅する者に与えられる基本の剣');

-- ---------------------------------------------------------------------------
-- 4. 出身地からもらえるアイテムを決める
-- ---------------------------------------------------------------------------
create or replace function public.item_for_area(area text)
returns bigint
language sql stable set search_path = public
as $$
  select coalesce(
    (select i.id from public.items i where i.prefecture = area),
    (select i.id from public.items i where i.slug = 'traveler_sword')
  );
$$;

-- ---------------------------------------------------------------------------
-- 5. すれ違い判定（0004 から「もらうアイテムの決め方」だけ変更）
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
      and l.updated_at > now() - interval '10 minutes'
      and st_dwithin(l.position, my_pos, 50)
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
