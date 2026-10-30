-- auth.users にユーザーが作られたら profiles 行を自動作成する。
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- このマイグレーション以前に作られたユーザー分を補完する
insert into public.profiles (id)
select id from auth.users
on conflict do nothing;
