"use client";

import { useEffect } from "react";
import { AvatarSprite } from "@/features/avatar";
import type { NewEncounter } from "@/types/database";

/** 自動で閉じるまでの時間 */
const AUTO_CLOSE_MS = 5_000;

type Props = {
  encounter: NewEncounter;
  onClose: () => void;
};

/** 「すれちがい成功！」の演出（タップか時間経過で閉じる） */
export function EncounterToast({ encounter, onClose }: Props) {
  useEffect(() => {
    const id = window.setTimeout(onClose, AUTO_CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [onClose]);

  const { partner, receivedItem } = encounter;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="alertdialog"
      aria-live="assertive"
      aria-label="すれちがい成功"
    >
      <div className="encounter-pop w-full max-w-[340px] border-4 border-[#0f172a] bg-[#fef08a] p-4 text-center font-mono text-[#0f172a] shadow-[6px_6px_0_#000]">
        <p className="encounter-flash mb-2 inline-block bg-[#e53935] px-3 py-1 text-sm font-black tracking-widest text-white">
          ★ すれちがい成功！ ★
        </p>
        <div className="my-2 flex h-28 items-center justify-center border-4 border-[#0f172a] bg-[#7dd3fc]">
          <AvatarSprite avatar={partner?.avatar} scale={0.9} />
        </div>
        <p className="text-sm font-bold">
          {partner ? `${partner.nickname}さん` : "だれか"}
          <span className="ml-1 text-xs text-slate-600">
            （{partner?.home_area ?? "出身地ふめい"}）
          </span>
        </p>
        <p className="mt-1 text-xs">と すれちがった！</p>
        {receivedItem && (
          <div className="mt-3 border-2 border-[#0f172a] bg-white px-2 py-2">
            <span className="mr-1 text-2xl">{receivedItem.icon}</span>
            <span className="text-sm font-black text-[#ef4444]">
              {receivedItem.name}
            </span>
            <p className="text-[11px] font-bold">を てにいれた！</p>
          </div>
        )}
        <p className="mt-3 text-[10px] text-slate-600">タップでとじる</p>
      </div>
      <style jsx>{`
        .encounter-pop {
          animation: pop 0.35s steps(4) both;
        }
        .encounter-flash {
          animation: flash 0.6s steps(2) 3;
        }
        @keyframes pop {
          from {
            transform: scale(0.4);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes flash {
          50% {
            background: #facc15;
            color: #0f172a;
          }
        }
      `}</style>
    </div>
  );
}
