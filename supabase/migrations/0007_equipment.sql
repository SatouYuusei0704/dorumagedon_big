-- そうび（装備アイテム）を DB に保存する。
--   * これまでは端末の localStorage に保存していたため、他の人から見えなかった
--   * 装備したアイテムがバトルの「ご当地わざ」になる
--   * 持っているアイテムしか装備できないよう、変更は equip_item() 経由に限定する

alter table public.profiles
  add column equipped_item_id bigint references public.items (id) on delete set null;

-- 列単位の UPDATE 権限は 0004 で nickname / home_area / avatar のみに絞っているので、
-- equipped_item_id はクライアントから直接は書き換えられない。

create or replace function public.equip_item(p_item bigint)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- null は「そうびをはずす」
  if p_item is not null and not exists (
    select 1 from public.user_items ui
    where ui.user_id = me and ui.item_id = p_item and ui.quantity > 0
  ) then
    raise exception 'item not owned' using errcode = '42501';
  end if;

  update public.profiles set equipped_item_id = p_item where id = me;
end;
$$;

revoke execute on function public.equip_item(bigint) from public, anon;
grant execute on function public.equip_item(bigint) to authenticated;
