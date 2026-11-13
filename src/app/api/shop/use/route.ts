import { NextResponse } from "next/server";
import { isBattleItemId } from "@/features/battle";
import { createClient } from "@/lib/supabase/server";
import type { ShopUseResponse } from "@/types/database";

/**
 * バトル中にどうぐを 1 つ使う（所持数を減らす）: POST /api/shop/use
 * body: { itemId: string }
 * 持っていなければ 403。
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
  if (!isBattleItemId(itemId)) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("use_shop_item", {
    p_item: itemId,
  });
  if (error) {
    const status = error.code === "42501" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json<ShopUseResponse>({ quantity: data as number });
}
