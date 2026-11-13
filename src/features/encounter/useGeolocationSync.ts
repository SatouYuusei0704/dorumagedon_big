"use client";

import { useEffect, useRef, useState } from "react";
import type { LocationResponse, NewEncounter } from "@/types/database";

/** 位置を送る間隔（サーバーは 10 分以内の位置で判定するので十分短い） */
const SEND_INTERVAL_MS = 30_000;

export type GeoStatus =
  /** 位置情報の取得を待っている */
  | "waiting"
  /** 位置を送信中（すれちがい通信中） */
  | "active"
  /** ブラウザーが位置情報に対応していない */
  | "unsupported"
  /** 位置情報の利用が許可されていない */
  | "denied"
  /** 取得・送信に失敗している */
  | "error";

type Options = {
  /** false の間は位置を取得しない（未ログイン時など） */
  enabled: boolean;
  /** 位置送信で新しいすれ違いが成立したときに呼ばれる */
  onEncounters?: (encounters: NewEncounter[]) => void;
};

/**
 * 端末の現在地を追いかけて、定期的に POST /api/location へ送る。
 * 送信のたびにサーバー側ですれ違い判定が行われる。
 */
export function useGeolocationSync({ enabled, onEncounters }: Options) {
  const [status, setStatus] = useState<GeoStatus>("waiting");
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);

  const positionRef = useRef<{ lat: number; lng: number } | null>(null);
  const sendingRef = useRef(false);
  const onEncountersRef = useRef(onEncounters);
  useEffect(() => {
    onEncountersRef.current = onEncounters;
  }, [onEncounters]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    let cancelled = false;

    const send = async () => {
      const pos = positionRef.current;
      // 画面が裏にある間や送信中は送らない
      if (!pos || sendingRef.current || document.hidden) return;
      sendingRef.current = true;
      try {
        const res = await fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pos),
        });
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const body = (await res.json()) as LocationResponse;
        if (cancelled) return;
        setStatus("active");
        setLastSentAt(new Date());
        if (body.encounters.length > 0) {
          onEncountersRef.current?.(body.encounters);
        }
      } catch {
        if (!cancelled) setStatus("error");
      } finally {
        sendingRef.current = false;
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const isFirst = positionRef.current === null;
        positionRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        // 最初に位置が取れたらすぐ送る（以降は一定間隔）
        if (isFirst) send();
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 30_000 },
    );

    const intervalId = window.setInterval(send, SEND_INTERVAL_MS);
    // 画面に戻ってきたらすぐ送る
    const onVisible = () => {
      if (!document.hidden) send();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
      positionRef.current = null;
    };
  }, [enabled]);

  return { status: enabled ? status : "waiting", lastSentAt };
}
