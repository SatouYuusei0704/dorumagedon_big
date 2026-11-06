-- すれ違い機能のバックエンド。
--   * 位置更新とすれ違い判定は security definer の RPC 経由に限定する
--   * 所持アイテムはクライアントから書き換えられないようにする
--   * encounters を Realtime で配信する

-- ---------------------------------------------------------------------------
-- 1. 既存ポリシーの見直し（クライアントからの直接書き込みを塞ぐ）
-- ---------------------------------------------------------------------------

-- profiles: 自分の行の UPDATE だけ許可し、更新できる列も限定する
drop policy if exists "profiles own write" on public.profiles;
create policy "profiles own update" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (nickname, home_area, avatar) on public.profiles to authenticated;

alter table public.profiles
  add constraint profiles_nickname_length
  check (char_length(nickname) between 1 and 12);

-- locations: 読み取りは自分の行のみ。書き込みは update_location() 経由
drop policy if exists "locations own" on public.locations;
create policy "locations own read" on public.locations for select
  using (auth.uid() = user_id);
revoke insert, update, delete on public.locations from anon, authenticated;

-- user_items: 読み取りのみ。増減は check_encounters() 経由
drop policy if exists "user_items own" on public.user_items;
create policy "user_items own read" on public.user_items for select
  using (auth.uid() = user_id);
revoke insert, update, delete on public.user_items from anon, authenticated;

-- encounters: 書き込みは check_encounters() 経由
revoke insert, update, delete on public.encounters from anon, authenticated;

-- 任意の座標で他人との距離を引けてしまうため廃止（三角測量で位置が割れる）
drop function if exists public.nearby_users(double precision, double precision, double precision);

-- ---------------------------------------------------------------------------
-- 2. encounters に「お互いが受け取った果物」を記録する
-- ---------------------------------------------------------------------------
alter table public.encounters
  add column item_to_a bigint references public.items (id),
  add column item_to_b bigint references public.items (id);

-- 同じペアの直近のすれ違いを探すためのインデックス
create index encounters_pair_idx on public.encounters
  (least(user_a, user_b), greatest(user_a, user_b), encountered_at desc);
create index encounters_user_a_idx on public.encounters (user_a, encountered_at desc);
create index encounters_user_b_idx on public.encounters (user_b, encountered_at desc);

-- ---------------------------------------------------------------------------
-- 3. 位置の更新
-- ---------------------------------------------------------------------------
create or replace function public.update_location(lat double precision, lng double precision)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if lat is null or lng is null
     or lat not between -90 and 90 or lng not between -180 and 180 then
    raise exception 'invalid coordinates' using errcode = '22023';
  end if;

  insert into public.locations (user_id, position, updated_at)
  values (me, st_makepoint(lng, lat)::geography, now())
  on conflict (user_id) do update
    set position = excluded.position,
        updated_at = excluded.updated_at;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. すれ違い判定
--   自分の最新位置から半径 50m 以内・10分以内に位置を送った相手とすれ違う。
--   同じ相手とは 3 時間に 1 回まで。成立したら両者に果物を 1 つずつ渡す。
--   戻り値は今回新しく成立したすれ違い。
-- ---------------------------------------------------------------------------
create or replace function public.check_encounters()
returns table (encounter_id bigint, partner_id uuid, received_item_id bigint)
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  my_pos geography;
  partner uuid;
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

  for partner in
    select l.user_id
    from public.locations l
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

    -- レア度が高いほど出にくい重み付き抽選（重み = 1 / rarity）
    select i.id into item_me from public.items i
      order by -ln(1 - random()) * i.rarity limit 1;
    select i.id into item_partner from public.items i
      order by -ln(1 - random()) * i.rarity limit 1;

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

revoke execute on function public.update_location(double precision, double precision) from public, anon;
revoke execute on function public.check_encounters() from public, anon;
grant execute on function public.update_location(double precision, double precision) to authenticated;
grant execute on function public.check_encounters() to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Realtime: すれ違いが記録されたら当事者に配信する（RLS により当事者のみ受信）
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.encounters;
