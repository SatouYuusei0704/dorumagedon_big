"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

const BODY_COLORS = [
  { name: "レッド", bg: "bg-[#e63946]" },
  { name: "ブルー", bg: "bg-[#1d3557]" },
  { name: "グリーン", bg: "bg-[#2a9d8f]" },
  { name: "イエロー", bg: "bg-[#e9c46a]" },
];

const HAIR_STYLES = [
  { name: "ダークブラウン", color: "bg-[#2b1e1a]" },
  { name: "ブラック", color: "bg-[#18181b]" },
  { name: "ゴールド", color: "bg-[#d97706]" },
  { name: "シルバー", color: "bg-[#94a3b8]" },
];

const FACE_TYPES = [
  { name: "ノーマル", eyeType: "normal" },
  { name: "キリッ", eyeType: "sharp" },
  { name: "にっこり", eyeType: "happy" },
  { name: "ロボ/メガネ", eyeType: "glasses" },
];

function NewCharacterContent() {
  const searchParams = useSearchParams();

  const [name, setName] = useState("ゆうしゃ");
  const [selectedLocation, setSelectedLocation] = useState("青森県");

  useEffect(() => {
    const queryName = searchParams.get("name");
    const queryLocation = searchParams.get("location");
    if (queryName) setName(queryName);
    if (queryLocation) setSelectedLocation(queryLocation);
  }, [searchParams]);

  const [faceIndex, setFaceIndex] = useState(0);
  const [hairIndex, setHairIndex] = useState(0);
  const [bodyColorIndex, setBodyColorIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"face" | "hair" | "bodyColor">(
    "face",
  );
  const [showItemModal, setShowItemModal] = useState(false);

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

  // 開発テスト用：自分の作成したアバター情報を持ったままバトルへ行くURL
  const devBattleUrl = `/battle?name=${encodeURIComponent(name)}&location=${encodeURIComponent(selectedLocation)}&hair=${hairIndex}&body=${bodyColorIndex}`;

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
            <div className="relative flex scale-110 flex-col items-center justify-center">
              <div
                className={`relative h-12 w-16 ${HAIR_STYLES[hairIndex].color} flex flex-col justify-end border-2 border-black p-1`}
              >
                <div className="absolute top-0 right-0 left-0 h-3 bg-black/10"></div>
                <div className="relative z-10 flex h-8 w-full items-center justify-around border-2 border-black bg-[#f8c39d] px-1">
                  {FACE_TYPES[faceIndex].eyeType === "normal" && (
                    <>
                      <div className="h-2.5 w-2.5 bg-black"></div>
                      <div className="h-2.5 w-2.5 bg-black"></div>
                    </>
                  )}
                  {FACE_TYPES[faceIndex].eyeType === "sharp" && (
                    <>
                      <div className="h-1.5 w-2.5 rotate-12 bg-black"></div>
                      <div className="h-1.5 w-2.5 -rotate-12 bg-black"></div>
                    </>
                  )}
                  {FACE_TYPES[faceIndex].eyeType === "happy" && (
                    <>
                      <div className="h-1 w-2.5 -translate-y-0.5 bg-black"></div>
                      <div className="h-1 w-2.5 -translate-y-0.5 bg-black"></div>
                    </>
                  )}
                  {FACE_TYPES[faceIndex].eyeType === "glasses" && (
                    <div className="flex h-2 w-full items-center justify-around border border-white bg-black/80">
                      <div className="h-1.5 w-1.5 bg-cyan-300"></div>
                      <div className="h-1.5 w-1.5 bg-cyan-300"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative flex items-center">
                <div className="h-8 w-2.5 border-y-2 border-l-2 border-black bg-[#2b1e1a]"></div>
                <div
                  className={`h-10 w-12 ${BODY_COLORS[bodyColorIndex].bg} flex justify-center border-2 border-black`}
                >
                  <div className="h-full w-4 border-x-2 border-black/20 bg-white"></div>
                </div>
                <div className="relative flex items-center">
                  <div className="h-8 w-2.5 border-y-2 border-r-2 border-black bg-[#2b1e1a]"></div>
                  <div className="absolute -top-3 left-1.5 flex flex-col items-center">
                    <div className="h-7 w-2 border border-black bg-slate-300"></div>
                    <div className="h-1.5 w-5 border border-black bg-slate-500"></div>
                  </div>
                </div>
              </div>
              <div className="flex w-12 justify-around gap-2">
                <div className="h-5 w-3 border-x-2 border-b-2 border-black bg-[#18181b]"></div>
                <div className="h-5 w-3 border-x-2 border-b-2 border-black bg-[#18181b]"></div>
              </div>
            </div>
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
              className={`flex-1 rounded border-2 border-[#0f172a] py-1 text-[10px] font-bold text-[#0f172a] transition-all sm:text-xs ${activeTab === "bodyColor" ? "bg-[#facc15]" : "bg-slate-100 hover:bg-slate-200"}`}
            >
              {" "}
              ボディカラー{" "}
            </button>{" "}
          </div>{" "}
          <div className="flex items-center justify-between rounded-lg border-2 border-[#0f172a] bg-slate-100 p-2">
            {" "}
            <button
              type="button"
              onClick={handlePrev}
              className="cursor-pointer rounded bg-[#0f172a] px-3 py-1 font-bold text-white hover:bg-slate-700 active:translate-y-0.5"
            >
              {" "}
              ◀{" "}
            </button>{" "}
            <span className="text-xs font-bold text-[#0f172a]">
              {" "}
              {activeTab === "face" && `かお: ${FACE_TYPES[faceIndex].name}`}
              {activeTab === "hair" &&
                `かみ色: ${HAIR_STYLES[hairIndex].name}`}{" "}
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
          onClick={() => setShowItemModal(true)}
          className="w-full cursor-pointer rounded-xl border-4 border-[#0f172a] bg-[#ef4444] py-3 text-sm font-black tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-[#dc2626] active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
        >
          このすがたで決定！
        </button>

        {/* 4. モーダル表示 */}
        {showItemModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full space-y-3 rounded-2xl border-4 border-[#0f172a] bg-[#fef08a] p-4 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="inline-block rounded-full bg-[#0f172a] px-3 py-1 text-xs font-bold text-[#facc15]">
                ITEM GET!
              </div>

              <h2 className="text-sm font-bold text-[#0f172a]">
                {selectedLocation}のパワーを かんじる…！
              </h2>

              <div className="rounded-xl border-4 border-[#0f172a] bg-white p-3 shadow-inner">
                <div className="mb-1 animate-bounce text-4xl">
                  {obtainedItem.icon}
                </div>
                <div className="mb-1 text-sm font-black text-[#ef4444]">
                  【 {obtainedItem.name} 】
                </div>
                <div className="text-[11px] font-bold text-slate-600">
                  {obtainedItem.desc}
                </div>
              </div>

              <p className="text-[11px] font-bold text-[#0f172a]">
                ご当地そうび を てにいれた！
              </p>

              {/* 本番用の広場へ向かうボタン */}
              <Link
                href="/start"
                className="block w-full rounded-xl border-4 border-[#0f172a] bg-[#3b82f6] py-2.5 text-xs font-black text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-[#2563eb] active:translate-y-0.5"
              >
                ひろばへ むかう ➔
              </Link>

              {/* 開発テスト用のバトル検証ボタン */}
              <Link
                href={devBattleUrl}
                className="block w-full rounded-xl border-2 border-[#0f172a] bg-[#f59e0b] py-2 text-[11px] font-black text-[#0f172a] shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-[#d97706] active:translate-y-0.5"
              >
                【開発用】バトル画面を試す ⚔️
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function NewCharacterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#1e293b] text-white">
          Loading...
        </div>
      }
    >
      <NewCharacterContent />
    </Suspense>
  );
}
