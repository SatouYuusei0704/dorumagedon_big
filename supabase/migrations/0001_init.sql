-- 初期スキーマ。Supabase の SQL Editor で実行するか `supabase db push` で適用する。
create extension if not exists postgis;

-- ユーザープロフィール（auth.users と 1:1）
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null default 'ななしさん',
  avatar jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 最新の位置情報（ユーザーごとに1行）
create table public.locations (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  position geography (point, 4326) not null,
  updated_at timestamptz not null default now()
);
create index locations_position_idx on public.locations using gist (position);

-- すれ違い履歴
create table public.encounters (
  id bigint generated always as identity primary key,
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  encountered_at timestamptz not null default now(),
  check (user_a <> user_b)
);

-- アイテム（果物）マスタ
create table public.items (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  rarity smallint not null default 1
);

-- 所持アイテム
create table public.user_items (
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_id bigint not null references public.items (id),
  quantity int not null default 0 check (quantity >= 0),
  primary key (user_id, item_id)
);

insert into public.items (slug, name, rarity) values
  ('apple', 'リンゴ', 1),
  ('grape', 'ブドウ', 1),
  ('orange', 'オレンジ', 1),
  ('peach', 'モモ', 2),
  ('melon', 'メロン', 3);

-- RLS: 自分のデータのみ書き込み可能
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.encounters enable row level security;
alter table public.items enable row level security;
alter table public.user_items enable row level security;

create policy "profiles readable" on public.profiles for select using (true);
create policy "profiles own write" on public.profiles for all using (auth.uid() = id);
create policy "locations own" on public.locations for all using (auth.uid() = user_id);
create policy "encounters own read" on public.encounters for select
  using (auth.uid() in (user_a, user_b));
create policy "items readable" on public.items for select using (true);
create policy "user_items own" on public.user_items for all using (auth.uid() = user_id);

-- 半径 radius_m メートル以内のユーザーを返す
create or replace function public.nearby_users(lat double precision, lng double precision, radius_m double precision)
returns table (user_id uuid, distance_m double precision)
language sql stable security definer set search_path = public
as $$
  select l.user_id,
         st_distance(l.position, st_makepoint(lng, lat)::geography) as distance_m
  from public.locations l
  where l.user_id <> auth.uid()
    and l.updated_at > now() - interval '10 minutes'
    and st_dwithin(l.position, st_makepoint(lng, lat)::geography, radius_m)
  order by distance_m;
$$;
