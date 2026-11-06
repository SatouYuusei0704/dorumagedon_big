"use client";

import React, { useState } from "react";
import Link from "next/link";

// ==========================================
// 画像のデザインに合わせたパーツデータ定義
// ==========================================
const BODY_COLORS = [
  { name: "レッド", bg: "bg-[#e63946]" }, // 赤服
  { name: "ブルー", bg: "bg-[#1d3557]" }, // 青服
  { name: "グリーン", bg: "bg-[#2a9d8f]" }, // 緑服
  { name: "イエロー", bg: "bg-[#e9c46a]" }, // 黄服
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

// Next.js のページは独自の props を受け取れないため、表示用の仮データとして定義する
// TODO: ログイン中ユーザーのプロフィール（/api/profile）から取得する
const initialName = "ゆうしゃ";
const initialLocation = "石川県";

export default function NewCharacterPage() {
  // 選択中インデックス（0〜3）
  const [faceIndex, setFaceIndex] = useState(0);
  const [hairIndex, setHairIndex] = useState(0);
  const [bodyColorIndex, setBodyColorIndex] = useState(0);

  // カテゴリタブ
  const [activeTab, setActiveTab] = useState<"face" | "hair" | "bodyColor">(
    "face",
  );

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1e293b] p-2 font-mono selection:bg-[#e11d48] selection:text-white">
      <div className="relative flex min-h-[750px] w-full max-w-[420px] flex-col justify-between overflow-hidden rounded-2xl border-4 border-[#0f172a] bg-[#fef08a] p-4 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        {/* ヘッダーエリア */}
        <div className="mb-3 flex items-center justify-between rounded-lg border-2 border-black bg-[#0f172a] p-2 text-white">
          <Link
            href="/start"
            className="rounded border border-white/40 bg-[#334155] px-2 py-1 text-xs hover:bg-[#475569]"
          >
            ◀ もどる
          </Link>
          <h1 className="text-sm font-bold tracking-wider text-[#facc15]">
            アバターをつくる
          </h1>
          <div className="w-12"></div>
        </div>

        {/* ==========================================
                1. 画像風ドット絵アバター プレビュー表示
            ========================================== */}
        <div className="relative mb-4 flex flex-col items-center justify-center rounded-xl border-4 border-[#0f172a] bg-[#7dd3fc] p-4 shadow-inner">
          <div className="mb-2 rounded-full bg-[#0f172a] px-3 py-0.5 text-xs font-bold text-white">
            PREVIEW
          </div>

          {/* ドット絵キャンバス */}
          <div className="relative flex h-48 w-44 items-center justify-center overflow-hidden rounded-lg border-4 border-[#0f172a] bg-sky-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            {/* ★ 画像再現ドットアバター本体 ★ */}
            <div className="relative flex scale-110 flex-col items-center justify-center">
              {/* 頭部（髪の毛 ＋ 顔） */}
              <div
                className={`relative h-12 w-16 ${HAIR_STYLES[hairIndex].color} flex flex-col justify-end border-2 border-black p-1`}
              >
                {/* 髪の前髪部分カット */}
                <div className="absolute top-0 right-0 left-0 h-3 bg-black/10"></div>

                {/* 肌部分（顔） */}
                <div className="relative z-10 flex h-8 w-full items-center justify-around border-2 border-black bg-[#f8c39d] px-1">
                  {/* 目のタイプ切り替え */}
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

              {/* 胴体 ＋ 腕 ＋ 剣 */}
              <div className="relative flex items-center">
                {/* 左腕/手 */}
                <div className="h-8 w-2.5 border-y-2 border-l-2 border-black bg-[#2b1e1a]"></div>

                {/* 服（ボディカラー ＋ インナーホワイト） */}
                <div
                  className={`h-10 w-12 ${BODY_COLORS[bodyColorIndex].bg} flex justify-center border-2 border-black`}
                >
                  <div className="h-full w-4 border-x-2 border-black/20 bg-white"></div>
                </div>

                {/* 右腕/手 ＋ 剣 */}
                <div className="relative flex items-center">
                  <div className="h-8 w-2.5 border-y-2 border-r-2 border-black bg-[#2b1e1a]"></div>

                  {/* 剣 (グラフィック再現) */}
                  <div className="absolute -top-3 left-1.5 flex flex-col items-center">
                    <div className="h-7 w-2 border border-black bg-slate-300"></div>
                    <div className="h-1.5 w-5 border border-black bg-slate-500"></div>
                  </div>
                </div>
              </div>

              {/* 脚（パンツ＆靴） */}
              <div className="flex w-12 justify-around gap-2">
                <div className="h-5 w-3 border-x-2 border-b-2 border-black bg-[#18181b]"></div>
                <div className="h-5 w-3 border-x-2 border-b-2 border-black bg-[#18181b]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
                2. パーツ選択 タブ & コントローラー
            ========================================== */}
        <div className="mb-4 rounded-xl border-4 border-[#0f172a] bg-white p-3 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          {/* カテゴリタブ */}
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

          {/* 左右切り替えボタン */}
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

        {/* ==========================================
                3. プロフィール表示（固定データ）
            ========================================== */}
        <div className="mb-3 space-y-2 rounded-xl border-4 border-[#0f172a] bg-[#1e293b] p-3 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center justify-between rounded border border-slate-700 bg-slate-800/80 px-3 py-1.5">
            <span className="text-[11px] font-bold text-[#facc15]">なまえ</span>
            <span className="text-xs font-bold tracking-wide text-white">
              {initialName}
            </span>
          </div>

          <div className="flex items-center justify-between rounded border border-slate-700 bg-slate-800/80 px-3 py-1.5">
            <span className="text-[11px] font-bold text-[#facc15]">
              しゅっしんち
            </span>
            <span className="text-xs font-bold tracking-wide text-white">
              {initialLocation}
            </span>
          </div>
        </div>

        {/* 決定ボタン */}
        <button
          type="button"
          className="w-full cursor-pointer rounded-xl border-4 border-[#0f172a] bg-[#ef4444] py-3 text-sm font-black tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-[#dc2626] active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
        >
          このすがたで決定！
        </button>
      </div>
    </main>
  );
}
