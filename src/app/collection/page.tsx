"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFooter } from "@/components/ui/AppFooter";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/features/auth";
import type { CollectionEntry } from "@/types/database";

/** アイテムがもらえる出身地の表示名 */
function areaLabel(item: CollectionEntry) {
  return item.prefecture ?? "ぜんこく";
}

/** 未入手アイテムの入手ヒント */
function obtainHint(item: CollectionEntry) {
  return item.prefecture
    ? `${item.prefecture}の ひとと すれちがうと てにはいる！`
    : "ご当地そうびの ない ちいきの ひとと すれちがうと てにはいる！";
}

export default function CollectionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [collection, setCollection] = useState<CollectionEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<CollectionEntry | null>(null);

  // 未ログインならログイン画面へ
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    fetch("/api/items")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setCollection)
      .catch(() => setError(true));
  }, [loading, user, router]);

  const obtainedCount = collection?.filter((i) => i.quantity > 0).length ?? 0;
  const totalCount = collection?.length ?? 0;
  const percent =
    totalCount === 0 ? 0 : Math.round((obtainedCount / totalCount) * 100);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1e293b] p-2 font-mono selection:bg-[#e11d48] selection:text-white">
      <div className="relative flex min-h-[750px] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border-4 border-[#0f172a] bg-[#fef08a] p-4 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <AppHeader title="コレクション" />

        {/* 1. 収集率 */}
        <div className="mb-4 rounded-xl border-4 border-[#0f172a] bg-[#1e293b] p-3 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#facc15]">
              ご当地そうび ずかん
            </span>
            <span className="text-xs font-bold tracking-wide">
              {obtainedCount} / {totalCount} しゅるい
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded border-2 border-slate-600 bg-slate-900">
            <div
              className="h-full bg-[#22c55e] transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-1 text-right text-[10px] font-bold text-slate-300">
            しゅうしゅうりつ {percent}%
          </p>
        </div>

        {/* 2. 図鑑一覧 */}
        <div className="flex-1 rounded-xl border-4 border-[#0f172a] bg-[#7dd3fc] p-3 shadow-inner">
          {error ? (
            <p className="text-center text-xs font-bold text-[#0f172a]">
              よみこみに しっぱいしました
            </p>
          ) : collection === null ? (
            <p className="text-center text-xs font-bold text-[#0f172a]">
              よみこみ中...
            </p>
          ) : collection.length === 0 ? (
            <p className="text-center text-xs font-bold text-[#0f172a]">
              アイテムが まだありません
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-2">
              {collection.map((item, index) => {
                const owned = item.quantity > 0;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className={`flex h-full w-full cursor-pointer flex-col items-center rounded-lg border-4 border-[#0f172a] p-1.5 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] ${
                        owned ? "bg-white" : "bg-slate-300"
                      }`}
                    >
                      <span className="flex w-full items-center justify-between text-[9px] font-bold">
                        <span className="text-slate-500">
                          No.{String(index + 1).padStart(3, "0")}
                        </span>
                        <span className="rounded bg-[#0f172a] px-1 text-[#facc15]">
                          {areaLabel(item)}
                        </span>
                      </span>
                      <span
                        className={`my-1 text-2xl ${owned ? "" : "opacity-30 brightness-0"}`}
                      >
                        {item.icon}
                      </span>
                      <span className="text-[10px] leading-tight font-bold text-[#0f172a]">
                        {owned ? item.name : "？？？"}
                      </span>
                      <span className="mt-auto pt-0.5 text-[10px] font-bold text-slate-600">
                        ×{item.quantity}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 画面下端いっぱいに広げる（親の p-4 を打ち消す） */}
        <AppFooter className="-mx-4 mt-4 -mb-4" />

        {/* 3. 詳細モーダル */}
        {selected && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <div
              className="w-full rounded-2xl border-4 border-[#0f172a] bg-[#fef08a] p-4 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 inline-block rounded-full bg-[#0f172a] px-3 py-1 text-xs font-bold text-[#facc15]">
                {areaLabel(selected)}
              </div>

              <div className="mb-4 rounded-xl border-4 border-[#0f172a] bg-white p-4 shadow-inner">
                <div
                  className={`mb-2 text-5xl ${selected.quantity > 0 ? "animate-bounce" : "opacity-30 brightness-0"}`}
                >
                  {selected.icon}
                </div>
                <div className="mb-1 text-base font-black text-[#ef4444]">
                  【 {selected.quantity > 0 ? selected.name : "？？？"} 】
                </div>
                <div className="text-[11px] font-bold text-slate-600">
                  {selected.quantity > 0 ? selected.description : "？？？"}
                </div>
              </div>

              <p className="mb-4 text-[11px] font-bold text-[#0f172a]">
                {selected.quantity > 0
                  ? `${selected.quantity}こ もっている`
                  : obtainHint(selected)}
              </p>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="block w-full cursor-pointer rounded-xl border-4 border-[#0f172a] bg-[#3b82f6] py-2.5 text-sm font-black text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-[#2563eb] active:translate-y-0.5"
              >
                とじる
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
