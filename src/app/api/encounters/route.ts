import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  EncounterHistoryEntry,
  Item,
  PublicProfile,
} from "@/types/database";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

type EncounterRow = {
  id: number;
  user_a: string;
  user_b: string;
  encountered_at: string;
  a: PublicProfile | null;
  b: PublicProfile | null;
  to_a: Item | null;
  to_b: Item | null;
};

/**
 * 自分のすれ違い履歴を新しい順に返す: GET /api/encounters?limit=50
 * 相手のプロフィールと、自分が受け取った果物を含む。
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limitParam = Number(new URL(request.url).searchParams.get("limit"));
  const limit =
    Number.isInteger(limitParam) && limitParam > 0
      ? Math.min(limitParam, MAX_LIMIT)
      : DEFAULT_LIMIT;

  // RLS により自分が当事者の行だけが返る
  const { data, error } = await supabase
    .from("encounters")
    .select(
      `id, user_a, user_b, encountered_at,
       a:profiles!encounters_user_a_fkey(id, nickname, home_area, avatar),
       b:profiles!encounters_user_b_fkey(id, nickname, home_area, avatar),
       to_a:items!encounters_item_to_a_fkey(*),
       to_b:items!encounters_item_to_b_fkey(*)`,
    )
    .order("encountered_at", { ascending: false })
    .limit(limit)
    .returns<EncounterRow[]>();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const history: EncounterHistoryEntry[] = data.map((row) => {
    const iAmA = row.user_a === user.id;
    return {
      id: row.id,
      encounteredAt: row.encountered_at,
      partner: iAmA ? row.b : row.a,
      receivedItem: iAmA ? row.to_a : row.to_b,
    };
  });
  return NextResponse.json(history);
}
