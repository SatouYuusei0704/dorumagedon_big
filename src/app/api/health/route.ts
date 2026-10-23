import { NextResponse } from "next/server";

/** 動作確認用エンドポイント: GET /api/health */
export function GET() {
  return NextResponse.json({ status: "ok" });
}
