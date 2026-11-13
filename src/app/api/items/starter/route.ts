import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Item, StarterItemResponse } from "@/types/database";

/**
 * はじめのご当地アイテムを受け取る: POST /api/items/starter
 * 出身地のアイテムを 1 人 1 回だけもらい、何もそうびしていなければそうびする。
 * すでに受け取っている場合は item が null。
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("claim_starter_item");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let item: Item | null = null;
  if (data !== null) {
    const result = await supabase
      .from("items")
      .select("*")
      .eq("id", data as number)
      .maybeSingle<Item>();
    item = result.data ?? null;
  }
  return NextResponse.json<StarterItemResponse>({ item });
}
