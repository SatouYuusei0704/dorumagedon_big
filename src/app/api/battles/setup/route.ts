import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type {
  BattleFighter,
  BattleSetupResponse,
  Item,
  Profile,
} from "@/types/database";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type FighterProfile = Pick<
  Profile,
  "id" | "nickname" | "home_area" | "avatar" | "equipped_item_id"
>;

/** そうび中のアイテム、なければ出身地のアイテムをご当地わざにする */
async function toFighter(
  supabase: SupabaseClient,
  profile: FighterProfile,
): Promise<BattleFighter | null> {
  let itemId = profile.equipped_item_id;
  if (itemId === null) {
    const { data, error } = await supabase.rpc("item_for_area", {
      area: profile.home_area,
    });
    if (error || data === null) return null;
    itemId = data as number;
  }
  const { data: move } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .maybeSingle<Item>();
  if (!move) return null;
  return {
    profile: {
      id: profile.id,
      nickname: profile.nickname,
      home_area: profile.home_area,
      avatar: profile.avatar,
    },
    move,
  };
}

/**
 * バトルの準備: GET /api/battles/setup?opponent=<userId>
 * 自分と、すれ違ったことのある相手（NPC の敵）のデータを返す。
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const opponentId = new URL(request.url).searchParams.get("opponent") ?? "";
  if (!UUID_RE.test(opponentId) || opponentId === user.id) {
    return NextResponse.json({ error: "invalid opponent" }, { status: 400 });
  }

  // RLS により自分が当事者のすれ違いだけが見える
  const { data: encounter, error: encounterError } = await supabase
    .from("encounters")
    .select("id")
    .or(`user_a.eq.${opponentId},user_b.eq.${opponentId}`)
    .limit(1)
    .maybeSingle();
  if (encounterError) {
    return NextResponse.json(
      { error: encounterError.message },
      { status: 500 },
    );
  }
  if (!encounter) {
    return NextResponse.json({ error: "not encountered" }, { status: 403 });
  }

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, nickname, home_area, avatar, equipped_item_id")
    .in("id", [user.id, opponentId])
    .returns<FighterProfile[]>();
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }
  const me = profiles.find((p) => p.id === user.id);
  const opponent = profiles.find((p) => p.id === opponentId);
  if (!me || !opponent) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }

  const [player, enemy] = await Promise.all([
    toFighter(supabase, me),
    toFighter(supabase, opponent),
  ]);
  if (!player || !enemy) {
    return NextResponse.json({ error: "item not found" }, { status: 500 });
  }

  return NextResponse.json<BattleSetupResponse>({ player, enemy });
}
