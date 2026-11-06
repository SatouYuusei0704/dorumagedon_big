import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CollectionEntry, Item, UserItem } from "@/types/database";

/**
 * 果物図鑑（全アイテム + 自分の所持数）を返す: GET /api/items
 * quantity が 0 のものは未入手。
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [itemsResult, ownedResult] = await Promise.all([
    supabase.from("items").select("*").order("id").returns<Item[]>(),
    supabase
      .from("user_items")
      .select("item_id, quantity")
      .eq("user_id", user.id)
      .returns<Pick<UserItem, "item_id" | "quantity">[]>(),
  ]);
  if (itemsResult.error || ownedResult.error) {
    const message = (itemsResult.error ?? ownedResult.error)!.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const owned = new Map(ownedResult.data.map((u) => [u.item_id, u.quantity]));
  const collection: CollectionEntry[] = itemsResult.data.map((item) => ({
    ...item,
    quantity: owned.get(item.id) ?? 0,
  }));
  return NextResponse.json(collection);
}
