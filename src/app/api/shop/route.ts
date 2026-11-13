import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ShopBuyResponse, ShopItem, ShopResponse } from "@/types/database";

type BuyRow = { coins_left: number; owned: number };

/** ショップの商品と、自分のコイン・所持数を返す: GET /api/shop */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [itemsResult, ownedResult, profileResult] = await Promise.all([
    supabase
      .from("shop_items")
      .select("*")
      .order("sort_order")
      .returns<ShopItem[]>(),
    supabase
      .from("user_shop_items")
      .select("item_id, quantity")
      .eq("user_id", user.id)
      .returns<{ item_id: string; quantity: number }[]>(),
    supabase
      .from("profiles")
      .select("coins")
      .eq("id", user.id)
      .maybeSingle<{ coins: number }>(),
  ]);
  const error = itemsResult.error ?? ownedResult.error ?? profileResult.error;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const owned = new Map(
    (ownedResult.data ?? []).map((u) => [u.item_id, u.quantity]),
  );
  return NextResponse.json<ShopResponse>({
    coins: profileResult.data?.coins ?? 0,
    items: (itemsResult.data ?? []).map((item) => ({
      ...item,
      quantity: owned.get(item.id) ?? 0,
    })),
  });
}

/**
 * どうぐを 1 つ買う: POST /api/shop
 * body: { itemId: string }
 * コインが足りなければ 409。
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const itemId =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).itemId
      : undefined;
  if (typeof itemId !== "string" || itemId.length === 0) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("buy_shop_item", {
    p_item: itemId,
  });
  if (error) {
    // P0001: コイン不足 / P0002: 商品がない
    const status =
      error.code === "P0001" ? 409 : error.code === "P0002" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  const row = ((data ?? []) as BuyRow[])[0];
  return NextResponse.json<ShopBuyResponse>({
    coins: row?.coins_left ?? 0,
    quantity: row?.owned ?? 0,
  });
}
