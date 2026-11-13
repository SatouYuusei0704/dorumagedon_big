import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPrefecture } from "@/lib/prefectures";
import type { AvatarData, Profile } from "@/types/database";

const NICKNAME_MAX = 12;

function isAvatarData(value: unknown): value is AvatarData {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const isIndex = (n: unknown) => Number.isInteger(n) && (n as number) >= 0;
  return (
    isIndex(v.skin) &&
    isIndex(v.hair) &&
    isIndex(v.eyes) &&
    typeof v.color === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(v.color)
  );
}

/** 自分のプロフィールを返す: GET /api/profile */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}

/**
 * ニックネーム・出身地・アバター・そうびを更新する: PATCH /api/profile
 * body: { nickname?, homeArea?, avatar?, equippedItemId?: number | null }
 */
export async function PATCH(request: Request) {
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
  const { nickname, homeArea, avatar, equippedItemId } = body as Record<
    string,
    unknown
  >;
  if (
    equippedItemId !== undefined &&
    equippedItemId !== null &&
    !(Number.isInteger(equippedItemId) && (equippedItemId as number) > 0)
  ) {
    return NextResponse.json(
      { error: "invalid equippedItemId" },
      { status: 400 },
    );
  }

  const updates: Partial<Pick<Profile, "nickname" | "home_area" | "avatar">> =
    {};
  if (nickname !== undefined) {
    const trimmed = typeof nickname === "string" ? nickname.trim() : "";
    if (trimmed.length < 1 || trimmed.length > NICKNAME_MAX) {
      return NextResponse.json(
        { error: `nickname must be 1-${NICKNAME_MAX} characters` },
        { status: 400 },
      );
    }
    updates.nickname = trimmed;
  }
  if (homeArea !== undefined) {
    if (!isPrefecture(homeArea)) {
      return NextResponse.json({ error: "invalid homeArea" }, { status: 400 });
    }
    updates.home_area = homeArea;
  }
  if (avatar !== undefined) {
    if (!isAvatarData(avatar)) {
      return NextResponse.json({ error: "invalid avatar" }, { status: 400 });
    }
    updates.avatar = {
      skin: avatar.skin,
      hair: avatar.hair,
      eyes: avatar.eyes,
      color: avatar.color,
    };
  }
  if (Object.keys(updates).length === 0 && equippedItemId === undefined) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // そうびは「持っているアイテムか」をDB側で確かめる equip_item() で変更する
  if (equippedItemId !== undefined) {
    const { error } = await supabase.rpc("equip_item", {
      p_item: equippedItemId,
    });
    if (error) {
      const status = error.code === "42501" ? 403 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
