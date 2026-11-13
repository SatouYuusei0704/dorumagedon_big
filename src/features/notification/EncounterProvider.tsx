"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useGeolocationSync, type GeoStatus } from "@/features/encounter";
import type {
  Encounter,
  EncounterHistoryEntry,
  NewEncounter,
} from "@/types/database";
import { EncounterToast } from "./EncounterToast";
import { useEncounterRealtime } from "./useEncounterRealtime";

/** すれちがい通信を動かす画面（ログイン後のゲーム画面） */
const GAME_PATHS = ["/park", "/collection", "/status", "/battle"];

type EncounterContextValue = {
  /** 位置情報の送信状態 */
  geoStatus: GeoStatus;
  /** すれ違いが成立するたびに増える。画面はこれを見て一覧を再取得する */
  encounterVersion: number;
};

const EncounterContext = createContext<EncounterContextValue>({
  geoStatus: "waiting",
  encounterVersion: 0,
});

/** すれちがい通信の状態と、すれ違い成立の通知を受け取る */
export function useEncounterEvents() {
  return useContext(EncounterContext);
}

/**
 * ログイン中のゲーム画面で、位置送信（すれ違い判定）と Realtime 通知を常時動かし、
 * すれ違いが成立したら「すれちがい成功！」を表示する。
 */
export function EncounterProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const enabled =
    !!user && GAME_PATHS.some((path) => pathname.startsWith(path));

  const [encounterVersion, setEncounterVersion] = useState(0);
  const [queue, setQueue] = useState<NewEncounter[]>([]);
  // 位置送信のレスポンスと Realtime の両方で同じすれ違いが届くので、表示済みを覚えておく
  const shownIds = useRef(new Set<number>());

  const pushEncounters = useCallback((encounters: NewEncounter[]) => {
    const fresh = encounters.filter((e) => !shownIds.current.has(e.id));
    if (fresh.length === 0) return;
    fresh.forEach((e) => shownIds.current.add(e.id));
    setQueue((prev) => [...prev, ...fresh]);
    setEncounterVersion((v) => v + 1);
  }, []);

  const { status: geoStatus } = useGeolocationSync({
    enabled,
    onEncounters: pushEncounters,
  });

  // 相手側の判定で成立したすれ違い: 履歴 API から相手と受け取ったアイテムを引く
  const onRealtimeInsert = useCallback(
    async (row: Encounter) => {
      if (shownIds.current.has(row.id)) return;
      try {
        const res = await fetch("/api/encounters?limit=10");
        if (!res.ok) return;
        const history = (await res.json()) as EncounterHistoryEntry[];
        const entry = history.find((h) => h.id === row.id);
        if (!entry) return;
        pushEncounters([
          {
            id: entry.id,
            partner: entry.partner,
            receivedItem: entry.receivedItem,
          },
        ]);
      } catch {
        // 通知に失敗しても次の位置送信で一覧は更新されるので無視する
      }
    },
    [pushEncounters],
  );
  useEncounterRealtime(enabled ? (user?.id ?? null) : null, onRealtimeInsert);

  // ログアウトしたら表示待ちを捨てる
  useEffect(() => {
    if (!user) setQueue([]);
  }, [user]);

  const current = queue[0] ?? null;
  const dismiss = useCallback(() => setQueue((prev) => prev.slice(1)), []);

  return (
    <EncounterContext.Provider value={{ geoStatus, encounterVersion }}>
      {children}
      {current && (
        <EncounterToast
          key={current.id}
          encounter={current}
          onClose={dismiss}
        />
      )}
    </EncounterContext.Provider>
  );
}
