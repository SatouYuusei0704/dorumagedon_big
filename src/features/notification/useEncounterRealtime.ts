"use client";

import { useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Encounter } from "@/types/database";

/**
 * 自分が当事者のすれ違いが記録されたら通知を受け取る（Supabase Realtime）。
 * 相手側の位置送信で成立したすれ違いもここで受け取れる。
 * RLS により、自分が当事者の行だけが配信される。
 */
export function useEncounterRealtime(
  userId: string | null,
  onInsert: (encounter: Encounter) => void,
) {
  const supabase = useMemo(() => createClient(), []);
  const onInsertRef = useRef(onInsert);
  useEffect(() => {
    onInsertRef.current = onInsert;
  }, [onInsert]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`encounters:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "encounters" },
        (payload) => {
          const row = payload.new as Encounter;
          if (row.user_a === userId || row.user_b === userId) {
            onInsertRef.current(row);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);
}
