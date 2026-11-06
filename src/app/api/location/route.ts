import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Item, LocationResponse, PublicProfile } from "@/types/database";

type CheckEncountersRow = {
  encounter_id: number;
  partner_id: string;
  received_item_id: number | null;
};

function isLatitude(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= -90 && v <= 90;
}

function isLongitude(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= -180 && v <= 180;
}

/**
 * 現在地を送信し、すれ違い判定を行う: POST /api/location
 * body: { lat: number, lng: number }
 * 今回新しく成立したすれ違いを返す。フロントは数十秒おきに呼ぶ想定。
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
  const { lat, lng } = body as Record<string, unknown>;
  if (!isLatitude(lat) || !isLongitude(lng)) {
    return NextResponse.json({ error: "invalid coordinates" }, { status: 400 });
  }

  const { error: updateError } = await supabase.rpc("update_location", {
    lat,
    lng,
  });
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: rows, error: checkError } =
    await supabase.rpc("check_encounters");
  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }

  const encounters = (rows ?? []) as CheckEncountersRow[];
  if (encounters.length === 0) {
    return NextResponse.json<LocationResponse>({ encounters: [] });
  }

  const partnerIds = encounters.map((e) => e.partner_id);
  const itemIds = encounters
    .map((e) => e.received_item_id)
    .filter((id): id is number => id !== null);

  const [profilesResult, itemsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nickname, home_area, avatar")
      .in("id", partnerIds)
      .returns<PublicProfile[]>(),
    supabase.from("items").select("*").in("id", itemIds).returns<Item[]>(),
  ]);
  if (profilesResult.error || itemsResult.error) {
    const message = (profilesResult.error ?? itemsResult.error)!.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const profiles = new Map(profilesResult.data.map((p) => [p.id, p]));
  const items = new Map(itemsResult.data.map((i) => [i.id, i]));

  return NextResponse.json<LocationResponse>({
    encounters: encounters.map((e) => ({
      id: e.encounter_id,
      partner: profiles.get(e.partner_id) ?? null,
      receivedItem:
        e.received_item_id !== null
          ? (items.get(e.received_item_id) ?? null)
          : null,
    })),
  });
}
