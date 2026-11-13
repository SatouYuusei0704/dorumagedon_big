"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AvatarSprite,
  BODY_COLORS,
  FACE_TYPES,
  HAIR_STYLES,
} from "@/features/avatar";

// 都道府県ごとのご当地アイテムデータ
const REGIONAL_ITEMS: Record<
  string,
  { name: string; icon: string; desc: string }
> = {
  青森県: {
    name: "りんごのつるぎ",
    icon: "🍎🗡️",
    desc: "甘酸っぱい魔力を秘めた真っ赤な剣",
  },
  滋賀県: {
    name: "琵琶湖の大ナマズ剣",
    icon: "🐟🗡️",
    desc: "琵琶湖の主の力が宿った巨大な剣",
  },
  石川県: {
    name: "金箔のつるぎ",
    icon: "✨🗡️",
    desc: "金沢の輝きを秘めた煌びやかな剣",
  },
  群馬県: {
    name: "上州ダルマのかぶと",
    icon: "🔴🪖",
    desc: "七転び八起き！絶対に倒れない兜",
  },
  静岡県: {
    name: "茶摘みのやいば",
    icon: "🍃🗡️",
    desc: "富士山の風と茶葉の香りが漂う刀",
  },
  長野県: {
    name: "信州そばの盾",
    icon: "🍜🛡️",
    desc: "コシの強さで攻撃を跳ね返す盾",
  },
  京都府: {
    name: "八ツ橋のかぶと",
    icon: "🍡🪖",
    desc: "ほんのりニッキが香る歴史ある防具",
  },
  福井県: {
    name: "恐竜の化石ブレード",
    icon: "🦖🗡️",
    desc: "太古のロマン溢れる巨大な骨の剣",
  },
  島根県: {
    name: "勾玉のおまもり",
    icon: "☯️✨",
    desc: "出雲の神々の良縁と加護をもたらす宝玉",
  },
  東京都: {
    name: "タワーのたて",
    icon: "🗼🛡️",
    desc: "大都会の電波を守る強固な盾",
  },
  大阪府: {
    name: "なにわのハリセン",
    icon: "🪭",
    desc: "ツッコミのキレが倍増する伝説の道具",
  },
  北海道: {
    name: "木彫りのくま",
    icon: "🐻",
    desc: "鮭を咥えた強力なご当地お守り",
  },
};

const DEFAULT_ITEM = {
  name: "旅人のつるぎ",
  icon: "🗡️",
  desc: "全国を旅する者に与えられる基本の剣",
};

const PREFECTURES = [
  "青森県",
  "石川県",
  "滋賀県",
  "群馬県",
  "静岡県",
  "長野県",
  "京都府",
  "福井県",
  "島根県",
  "東京都",
  "大阪府",
  "北海道",
];

// useSearchParams を使うため Suspense で包む（Next.js のビルド要件）
export default function NewCharacterPage() {
  return (
    <Suspense>
      <NewCharacterContent />
    </Suspense>
  );
}

function NewCharacterContent() {
  const searchParams = useSearchParams();

  // ログイン画面から引き継いだデータ（なければデフォルト）
  const [name, setName] = useState("ゆうしゃ");
  const [selectedLocation, setSelectedLocation] = useState("石川県");

  useEffect(() => {
    const queryName = searchParams.get("name");
    const queryLocation = searchParams.get("location");
    if (queryName) setName(queryName);
    if (queryLocation) setSelectedLocation(queryLocation);
  }, [searchParams]);

  // アバターパーツ選択状態
  const [faceIndex, setFaceIndex] = useState(0);
  const [hairIndex, setHairIndex] = useState(0);
  const [bodyColorIndex, setBodyColorIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"face" | "hair" | "bodyColor">(
    "face",
  );
  const [showItemModal, setShowItemModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // DB に保存するアバター（広場などで他の人に表示される）
  const avatar = {
    skin: 0,
    hair: hairIndex,
    eyes: faceIndex,
    color: BODY_COLORS[bodyColorIndex].hex,
  };

  // 決定: アバターと出身地をプロフィールに保存してからアイテム演出を出す
  const handleDecide = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar, homeArea: selectedLocation }),
      });
      if (!res.ok) throw new Error();
      setShowItemModal(true);
    } catch {
      setSaveError("ほぞんに しっぱいしました。もういちど おしてください");
    } finally {
      setSaving(false);
    }
  };

  const MAX_PATTERNS = 4;

  const handlePrev = () => {
    if (activeTab === "face")
      setFaceIndex((prev) => (prev - 1 + MAX_PATTERNS) % MAX_PATTERNS);
    if (activeTab === "hair")
      setHairIndex((prev) => (prev - 1 + MAX_PATTERNS) % MAX_PATTERNS);
    if (activeTab === "bodyColor")
      setBodyColorIndex((prev) => (prev - 1 + MAX_PATTERNS) % MAX_PATTERNS);
  };

  const handleNext = () => {
    if (activeTab === "face") setFaceIndex((prev) => (prev + 1) % MAX_PATTERNS);
    if (activeTab === "hair") setHairIndex((prev) => (prev + 1) % MAX_PATTERNS);
    if (activeTab === "bodyColor")
      setBodyColorIndex((prev) => (prev + 1) % MAX_PATTERNS);
  };

  const obtainedItem = REGIONAL_ITEMS[selectedLocation] || DEFAULT_ITEM;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1e293b] p-2 font-mono selection:bg-[#e11d48] selection:text-white">
      <div className="relative flex min-h-[750px] w-full max-w-[420px] flex-col justify-between overflow-hidden rounded-2xl border-4 border-[#0f172a] bg-[#fef08a] p-4 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        {/* ヘッダー */}
        <div className="mb-3 flex items-center justify-between rounded-lg border-2 border-black bg-[#0f172a] p-2 text-white">
          <Link
            href="/login"
            className="rounded border border-white/40 bg-[#334155] px-2 py-1 text-xs hover:bg-[#475569]"
          >
            ◀ もどる
          </Link>
          <h1 className="text-sm font-bold tracking-wider text-[#facc15]">
            アバターをつくる
          </h1>
          <div className="w-12"></div>
        </div>

        {/* 1. プレビュー表示 */}
        <div className="relative mb-4 flex flex-col items-center justify-center rounded-xl border-4 border-[#0f172a] bg-[#7dd3fc] p-4 shadow-inner">
          <div className="mb-2 rounded-full bg-[#0f172a] px-3 py-0.5 text-xs font-bold text-white">
            PREVIEW
          </div>
          <div className="relative flex h-48 w-44 items-center justify-center overflow-hidden rounded-lg border-4 border-[#0f172a] bg-sky-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            <AvatarSprite avatar={avatar} scale={1.1} />
          </div>
        </div>

        {/* 2. パーツ選択タブ & コントローラー */}
        <div className="mb-4 rounded-xl border-4 border-[#0f172a] bg-white p-3 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="mb-3 flex gap-1 border-b-2 border-[#0f172a] pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("face")}
              className={`flex-1 rounded border-2 border-[#0f172a] py-1 text-xs font-bold transition-all ${
                activeTab === "face"
                  ? "bg-[#facc15]"
                  : "bg-slate-100 hover:bg-slate-200"
              }`}
            >
              かお
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("hair")}
              className={`flex-1 rounded border-2 border-[#0f172a] py-1 text-xs font-bold transition-all ${
                activeTab === "hair"
                  ? "bg-[#facc15]"
                  : "bg-slate-100 hover:bg-slate-200"
              }`}
            >
              かみがた
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bodyColor")}
              className={`flex-1 rounded border-2 border-[#0f172a] py-1 text-[10px] font-bold text-[#0f172a] transition-all sm:text-xs ${
                activeTab === "bodyColor"
                  ? "bg-[#facc15]"
                  : "bg-slate-100 hover:bg-slate-200"
              }`}
            >
              ボディカラー
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border-2 border-[#0f172a] bg-slate-100 p-2">
            <button
              type="button"
              onClick={handlePrev}
              className="cursor-pointer rounded bg-[#0f172a] px-3 py-1 font-bold text-white hover:bg-slate-700 active:translate-y-0.5"
            >
              ◀
            </button>
            <span className="text-xs font-bold text-[#0f172a]">
              {activeTab === "face" && `かお: ${FACE_TYPES[faceIndex].name}`}
              {activeTab === "hair" && `かみ色: ${HAIR_STYLES[hairIndex].name}`}
              {activeTab === "bodyColor" &&
                `ふく色: ${BODY_COLORS[bodyColorIndex].name}`}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="cursor-pointer rounded bg-[#0f172a] px-3 py-1 font-bold text-white hover:bg-slate-700 active:translate-y-0.5"
            >
              ▶
            </button>
          </div>
        </div>

        {/* 3. プロフィール & 出身地変更 */}
        <div className="mb-3 space-y-2 rounded-xl border-4 border-[#0f172a] bg-[#1e293b] p-3 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center justify-between rounded border border-slate-700 bg-slate-800/80 px-3 py-1.5">
            <span className="text-[11px] font-bold text-[#facc15]">なまえ</span>
            <span className="text-xs font-bold tracking-wide text-white">
              {name}
            </span>
          </div>

          <div className="flex items-center justify-between rounded border border-slate-700 bg-slate-800/80 px-3 py-1.5">
            <span className="text-[11px] font-bold text-[#facc15]">
              しゅっしんち
            </span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="cursor-pointer rounded border border-slate-600 bg-slate-900 px-2 py-0.5 text-xs font-bold text-[#facc15] focus:border-[#facc15] focus:outline-none"
            >
              {PREFECTURES.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 決定ボタン */}
        <button
          type="button"
          onClick={handleDecide}
          disabled={saving}
          className="w-full cursor-pointer rounded-xl border-4 border-[#0f172a] bg-[#ef4444] py-3 text-sm font-black tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-[#dc2626] active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] disabled:opacity-60"
        >
          {saving ? "ほぞん中..." : "このすがたで決定！"}
        </button>
        {saveError && (
          <p className="mt-2 text-center text-[11px] font-bold text-[#ef4444]">
            {saveError}
          </p>
        )}

        {/* 4. モーダル表示 */}
        {showItemModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full rounded-2xl border-4 border-[#0f172a] bg-[#fef08a] p-4 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-2 inline-block rounded-full bg-[#0f172a] px-3 py-1 text-xs font-bold text-[#facc15]">
                ITEM GET!
              </div>

              <h2 className="mb-3 text-sm font-bold text-[#0f172a]">
                {selectedLocation}のパワーを かんじる…！
              </h2>

              <div className="mb-4 rounded-xl border-4 border-[#0f172a] bg-white p-4 shadow-inner">
                <div className="mb-2 animate-bounce text-5xl">
                  {obtainedItem.icon}
                </div>
                <div className="mb-1 text-base font-black text-[#ef4444]">
                  【 {obtainedItem.name} 】
                </div>
                <div className="text-[11px] font-bold text-slate-600">
                  {obtainedItem.desc}
                </div>
              </div>

              <p className="mb-4 text-[11px] font-bold text-[#0f172a]">
                ご当地そうび を てにいれた！
              </p>

              <Link
                href="/park"
                className="block w-full rounded-xl border-4 border-[#0f172a] bg-[#3b82f6] py-2.5 text-sm font-black text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-[#2563eb] active:translate-y-0.5"
              >
                ひろばへ むかう ➔
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
