"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppFooter } from "@/components/ui/AppFooter";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelWindow } from "@/components/ui/PixelWindow";
import { useAuth } from "@/features/auth";
import { createClient } from "@/lib/supabase/client";
import type {
  CollectionEntry,
  EncounterHistoryEntry,
  LocationResponse,
  PublicProfile,
} from "@/types/database";

// すれ違い API の動作確認用の仮画面（フロント担当が本番画面を作ったら削除する）

const AUTO_SEND_INTERVAL_MS = 30_000;

/** 実ユーザーと混ざらない太平洋上のテスト地点 */
const TEST_POINT = { lat: 10.0, lng: -160.0 };
/** テスト地点から北へ約20m（すれ違い成立） */
const TEST_POINT_NEAR = { lat: 10.00018, lng: -160.0 };

function describePartner(p: PublicProfile | null) {
  if (!p) return "（退会したユーザー）";
  return `${p.nickname}さん（${p.home_area ?? "出身地不明"}）`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DebugPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [useGps, setUseGps] = useState(false);
  const [autoSend, setAutoSend] = useState(false);
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [history, setHistory] = useState<EncounterHistoryEntry[]>([]);
  const [collection, setCollection] = useState<CollectionEntry[]>([]);

  const log = useCallback((message: string) => {
    const time = new Date().toLocaleTimeString("ja-JP");
    setLogs((prev) => [`[${time}] ${message}`, ...prev].slice(0, 30));
  }, []);

  const refresh = useCallback(async () => {
    const [h, c] = await Promise.all([
      fetch("/api/encounters").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/items").then((r) => (r.ok ? r.json() : [])),
    ]);
    setHistory(h);
    setCollection(c);
  }, []);

  // 未ログインならログイン画面へ
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    refresh();
  }, [loading, user, router, refresh]);

  // GPS モード: 端末の位置を追いかけて入力欄に反映する
  useEffect(() => {
    if (!useGps) return;
    if (!("geolocation" in navigator)) {
      log("この端末は位置情報に対応していません");
      setUseGps(false);
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      (err) => {
        log(`位置情報を取得できません: ${err.message}`);
        setUseGps(false);
      },
      { enableHighAccuracy: true, maximumAge: 10_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [useGps, log]);

  const send = useCallback(async () => {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (
      lat === "" ||
      lng === "" ||
      Number.isNaN(latNum) ||
      Number.isNaN(lngNum)
    ) {
      log("緯度・経度を入力してください");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: latNum, lng: lngNum }),
      });
      const body = await res.json();
      if (!res.ok) {
        log(`送信エラー (${res.status}): ${body.error ?? "不明"}`);
        return;
      }
      const { encounters } = body as LocationResponse;
      if (encounters.length === 0) {
        log(`位置を送信 (${latNum}, ${lngNum}) → すれ違いなし`);
      } else {
        for (const e of encounters) {
          log(
            `★すれ違い成功！ ${describePartner(e.partner)} から ${e.receivedItem?.name ?? "？"} をもらった`,
          );
        }
        refresh();
      }
    } catch {
      log("通信に失敗しました");
    } finally {
      setSending(false);
    }
  }, [lat, lng, log, refresh]);

  // 自動送信（最新の send を ref 経由で呼ぶ）
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);
  useEffect(() => {
    if (!autoSend) return;
    sendRef.current();
    const id = setInterval(() => sendRef.current(), AUTO_SEND_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoSend]);

  // Realtime: 相手側の判定で記録されたすれ違いも受け取る
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("debug-encounters")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "encounters" },
        () => {
          log("📡 Realtime: すれ違いが記録されました");
          refresh();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") log("📡 Realtime 接続OK");
        if (status === "CHANNEL_ERROR") log("📡 Realtime 接続エラー");
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, log, refresh]);

  const setPoint = (p: { lat: number; lng: number }) => {
    setUseGps(false);
    setLat(String(p.lat));
    setLng(String(p.lng));
  };

  const inputClass = "pixel-border w-full bg-white px-2 py-1 text-black";

  return (
    <main className="flex min-h-screen justify-center bg-slate-950 p-4 font-mono">
      <div className="w-full max-w-[390px] space-y-4">
        <PixelWindow title="すれ違いテスト（仮）">
          <p className="mb-2 text-xs">ログイン中: {user?.email ?? "..."}</p>
          <div className="mb-2 grid grid-cols-2 gap-2 text-sm">
            <label>
              緯度
              <input
                className={inputClass}
                inputMode="decimal"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                disabled={useGps}
              />
            </label>
            <label>
              経度
              <input
                className={inputClass}
                inputMode="decimal"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                disabled={useGps}
              />
            </label>
          </div>
          <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
            <PixelButton onClick={() => setPoint(TEST_POINT)}>
              テスト地点
            </PixelButton>
            <PixelButton onClick={() => setPoint(TEST_POINT_NEAR)}>
              その20m北
            </PixelButton>
          </div>
          <div className="mb-3 space-y-1 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useGps}
                onChange={(e) => setUseGps(e.target.checked)}
              />
              端末のGPSを使う
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoSend}
                onChange={(e) => setAutoSend(e.target.checked)}
              />
              30秒ごとに自動送信
            </label>
          </div>
          <PixelButton onClick={send} disabled={sending} className="w-full">
            {sending ? "送信中..." : "位置を送信してすれ違い判定"}
          </PixelButton>
        </PixelWindow>

        <PixelWindow title="ログ">
          {logs.length === 0 ? (
            <p className="text-xs">まだ何もありません</p>
          ) : (
            <ul className="max-h-48 space-y-1 overflow-y-auto text-xs">
              {logs.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          )}
        </PixelWindow>

        <PixelWindow title={`すれ違い履歴（${history.length}）`}>
          {history.length === 0 ? (
            <p className="text-xs">まだ誰ともすれ違っていません</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {history.map((h) => (
                <li key={h.id}>
                  {formatTime(h.encounteredAt)} {describePartner(h.partner)} →{" "}
                  {h.receivedItem?.name ?? "？"}
                </li>
              ))}
            </ul>
          )}
        </PixelWindow>

        <PixelWindow title="ご当地図鑑">
          <ul className="grid grid-cols-2 gap-1 text-sm">
            {collection.map((item) => (
              <li key={item.id}>
                {item.quantity > 0 ? item.name : "？？？"}
                {item.icon} ×{item.quantity}
              </li>
            ))}
          </ul>
        </PixelWindow>

        <Link
          href="/home"
          className="block text-center text-sm text-white underline"
        >
          ホームへもどる
        </Link>

        {/* 長い画面でも押せるように下に固定する */}
        <AppFooter className="sticky bottom-0" />
      </div>
    </main>
  );
}
