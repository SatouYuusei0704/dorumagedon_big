-- 出身地（都道府県）を profiles に追加し、新規登録時の入力値を profiles に保存する。
alter table public.profiles
  add column home_area text check (char_length(home_area) <= 10);

-- signUp の options.data（raw_user_meta_data）から冒険者名・出身地を受け取る
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, home_area)
  values (
    new.id,
    coalesce(
      nullif(left(trim(new.raw_user_meta_data ->> 'nickname'), 12), ''),
      'ななしさん'
    ),
    left(new.raw_user_meta_data ->> 'home_area', 10)
  )
  on conflict do nothing;
  return new;
end;
$$;
