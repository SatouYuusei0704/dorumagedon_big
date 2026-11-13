import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BattleResultResponse, BattleStats, Item } from "@/types/database";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RecordBattleRow = { new_battle_id: number; reward_id: number | null };

/** 自分の戦績を返す: GET /api/battles */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // RLS により自分の戦績だけが数えられる
  const [wins, losses] = await Promise.all([
    supabase
      .from("battles")
      .select("id", { count: "exact", head: true })
      .eq("won", true),
    supabase
      .from("battles")
      .select("id", { count: "exact", head: true })
      .eq("won", false),
  ]);
  if (wins.error || losses.error) {
    const message = (wins.error ?? losses.error)!.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
  return NextResponse.json<BattleStats>({
    wins: wins.count ?? 0,
    losses: losses.count ?? 0,
  });
}

/**
 * バトルの結果を記録する: POST /api/battles
 * body: { opponentId: string, won: boolean }
 * 勝ったら相手の出身地のアイテムをもらう（同じ相手から 1 日 1 回まで）。
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
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { opponentId, won } = body as Record<string, unknown>;
  if (
    typeof opponentId !== "string" ||
    !UUID_RE.test(opponentId) ||
    typeof won !== "boolean"
  ) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("record_battle", {
    p_opponent: opponentId,
    p_won: won,
  });
  if (error) {
    // 42501: すれ違ったことのない相手
    const status = error.code === "42501" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  const row = ((data ?? []) as RecordBattleRow[])[0];
  let reward: Item | null = null;
  if (row?.reward_id != null) {
    const { data: item } = await supabase
      .from("items")
      .select("*")
      .eq("id", row.reward_id)
      .maybeSingle<Item>();
    reward = item ?? null;
  }

  return NextResponse.json<BattleResultResponse>({ won, reward });
}
