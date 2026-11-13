"use client";

import { useEffect, useState } from "react";
import { AppFooter } from "@/components/ui/AppFooter";
import { AppHeader } from "@/components/ui/AppHeader";
import { BATTLE_RULES } from "@/features/battle";
import type {
  ShopBuyResponse,
  ShopEntry,
  ShopResponse,
} from "@/types/database";

export default function ShopPage() {
  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean }>();

  // 未ログインの場合は middleware が /login へ送る
  useEffect(() => {
    fetch("/api/shop")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setShop)
      .catch(() => setLoadError(true));
  }, []);

  const buy = async (item: ShopEntry) => {
    if (!shop || buyingId) return;
    setBuyingId(item.id);
    setMessage(undefined);
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      if (res.status === 409) {
        setMessage({ text: "コインが たりません", error: true });
        return;
      }
      if (!res.ok) throw new Error();
      const result = (await res.json()) as ShopBuyResponse;
      setShop({
        coins: result.coins,
        items: shop.items.map((i) =>
          i.id === item.id ? { ...i, quantity: result.quantity } : i,
        ),
      });
      setMessage({ text: `${item.name} を かった！`, error: false });
    } catch {
      setMessage({
        text: "かえませんでした。もういちど ためしてください",
        error: true,
      });
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <main className="flex min-h-dvh justify-center bg-[#1e293b] font-mono">
      <div className="flex w-full max-w-[420px] flex-col bg-[#fef08a]">
        <div className="flex flex-1 flex-col p-4">
          <AppHeader title="ショップ" />

          {/* 所持コイン */}
          <div className="mb-3 flex items-center justify-between rounded-xl border-4 border-[#0f172a] bg-[#1e293b] px-4 py-3 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <span className="text-xs font-bold text-[#facc15]">
              もっているコイン
            </span>
            <span className="text-xl font-black">
              🪙 {shop ? shop.coins : "-"}
            </span>
          </div>

          <p className="mb-3 text-[11px] leading-5 font-bold text-[#0f172a]">
            バトルを すると コインが もらえます（かち 30 / まけ
            10。1日10回まで）。 かった どうぐは バトルの「アイテム」から
            つかえます（1バトル
            {BATTLE_RULES.itemUses}こ まで）。
          </p>

          {message && (
            <p
              aria-live="polite"
              className={`mb-3 border-2 px-3 py-2 text-xs font-bold ${
                message.error
                  ? "border-[#9e342e] bg-[#ffe0d4] text-[#8a2924]"
                  : "border-[#397b62] bg-[#e1f4d2] text-[#275b47]"
              }`}
            >
              {message.text}
            </p>
          )}

          {loadError ? (
            <p className="mt-8 text-center text-sm font-bold text-[#0f172a]">
              ショップを よみこめませんでした
            </p>
          ) : !shop ? (
            <p className="mt-8 text-center text-sm font-bold text-[#0f172a]">
              よみこみ中...
            </p>
          ) : (
            <ul className="grid gap-3">
              {shop.items.map((item) => {
                const canBuy = shop.coins >= item.price;
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border-4 border-[#0f172a] bg-white p-3 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                  >
                    <span className="grid h-14 w-14 shrink-0 place-items-center border-2 border-[#0f172a] bg-[#7dd3fc] text-3xl">
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-[#0f172a]">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[11px] font-bold text-slate-600">
                        {item.description}
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-[#27775a]">
                        もっている: {item.quantity}こ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => buy(item)}
                      disabled={!canBuy || buyingId !== null}
                      className="shrink-0 rounded-lg border-4 border-[#0f172a] bg-[#ef4444] px-2 py-2 text-center text-xs font-black text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 disabled:bg-slate-400 disabled:shadow-none"
                    >
                      {buyingId === item.id ? "…" : "かう"}
                      <span className="block text-[10px]">🪙 {item.price}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <AppFooter className="sticky bottom-0" />
      </div>
    </main>
  );
}
