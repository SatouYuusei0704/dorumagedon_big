"use client";

import React from "react";

export default function TitleScreen() {
  const handleTap = () => {
    // タップ時の画面遷移や音出しなどの処理
    console.log("Tap! 画面をタップしました");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-2 font-mono select-none">
      {/* スマホ画面コンテナ */}
      <div className="relative flex h-[844px] w-full max-w-[390px] flex-col items-center justify-between overflow-hidden rounded-[40px] border-8 border-slate-800 bg-[#87CEEB] shadow-2xl">
        {/* レトロ走査線（CRTフィルター効果） */}
        <div
          className="pointer-events-none absolute inset-0 z-30 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 3px)",
          }}
        />

        {/* 1. タイトルヘッダーエリア */}
        <div className="z-10 mt-6 flex flex-col items-center">
          <p className="mb-1 text-[11px] font-bold tracking-widest text-slate-800 drop-shadow-sm">
            すれ違うほど、強くなる。
          </p>
          <h1 className="text-3xl font-black tracking-wider text-[#FF3E00] drop-shadow-[2px_2px_0px_#FFFFFF] [text-shadow:_3px_3px_0_#8B0000]">
            ご当地
            <span className="-mt-1 block text-4xl text-[#FFCC00] drop-shadow-[2px_2px_0px_#FFFFFF] [text-shadow:_3px_3px_0_#B8860B]">
              バトラーズ
            </span>
          </h1>
          <div className="mt-1 flex items-center gap-2 border-y-2 border-slate-900 bg-sky-200/50 px-3 py-0.5">
            <span className="h-0.5 w-3 bg-red-600"></span>
            <span className="text-[9px] font-bold tracking-widest text-slate-900">
              MEET : BATTLE : COLLECT
            </span>
            <span className="h-0.5 w-3 bg-blue-600"></span>
          </div>
        </div>

        {/* 2. 背景イラスト（太陽・富士山・街並み） */}
        <div className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-end">
          {/* 太陽 */}
          <div className="absolute top-28 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#FFF8DC] opacity-80 blur-[1px]" />

          {/* 富士山 */}
          <div className="relative mb-36 flex h-64 w-full items-end justify-center">
            <svg viewBox="0 0 200 120" className="h-full w-full">
              {/* 奥の山 */}
              <polygon points="10,120 70,50 130,120" fill="#4B7B8B" />
              <polygon points="110,120 160,60 200,120" fill="#3B6B7B" />
              {/* 手前のメイン山 */}
              <polygon points="20,120 100,20 180,120" fill="#3B7A57" />
              {/* 山頂の雪 */}
              <polygon
                points="80,45 100,20 120,45 110,50 100,42 90,50"
                fill="#FFFFFF"
              />
            </svg>
            {/* 街のシルエット */}
            <div className="absolute bottom-0 flex h-6 w-full items-end justify-around bg-[#1C3144] opacity-90">
              <div className="h-5 w-4 bg-[#122230]"></div>
              <div className="h-8 w-6 bg-[#122230]"></div>
              <div className="h-4 w-3 bg-[#122230]"></div>
              <div className="h-7 w-7 bg-[#122230]"></div>
              <div className="h-5 w-5 bg-[#122230]"></div>
            </div>
          </div>
        </div>

        {/* 3. 対戦キャラクター（赤 vs 青） */}
        <div className="z-10 -mt-6 flex w-full items-center justify-around px-4">
          {/* 赤ファイター (ドット絵SVG) */}
          <div className="flex flex-col items-center">
            <svg
              width="70"
              height="90"
              viewBox="0 0 14 18"
              className="drop-shadow-md"
            >
              {/* 髪 */}
              <rect x="3" y="1" width="8" height="5" fill="#2D1810" />
              {/* 顔 */}
              <rect x="4" y="3" width="6" height="4" fill="#FFCC99" />
              <rect x="5" y="4" width="1" height="1" fill="#000" />
              <rect x="8" y="4" width="1" height="1" fill="#000" />
              {/* 服 (赤) */}
              <rect x="3" y="7" width="8" height="6" fill="#D9383A" />
              <rect x="6" y="7" width="2" height="6" fill="#FFF" />
              {/* 手脚 */}
              <rect x="2" y="7" width="1" height="4" fill="#2D1810" />
              <rect x="11" y="7" width="1" height="4" fill="#2D1810" />
              <rect x="4" y="13" width="2" height="3" fill="#1A1A1A" />
              <rect x="8" y="13" width="2" height="3" fill="#1A1A1A" />
              {/* 剣 */}
              <rect x="11" y="2" width="1" height="7" fill="#CCCCCC" />
              <rect x="10" y="8" width="3" height="1" fill="#888888" />
            </svg>
          </div>

          {/* VSアイコン */}
          <div className="relative flex items-center justify-center">
            <div className="flex h-10 w-10 rotate-45 animate-pulse items-center justify-center border-2 border-slate-900 bg-yellow-400 shadow-md">
              <span className="-rotate-45 text-xs font-black tracking-tighter text-red-600">
                VS
              </span>
            </div>
          </div>

          {/* 青ファイター (ドット絵SVG) */}
          <div className="flex flex-col items-center">
            <svg
              width="70"
              height="90"
              viewBox="0 0 14 18"
              className="drop-shadow-md"
            >
              {/* 髪 */}
              <rect x="3" y="1" width="8" height="5" fill="#2D1810" />
              {/* 顔 */}
              <rect x="4" y="3" width="6" height="4" fill="#FFCC99" />
              <rect x="5" y="4" width="1" height="1" fill="#000" />
              <rect x="8" y="4" width="1" height="1" fill="#000" />
              {/* 服 (青) */}
              <rect x="3" y="7" width="8" height="6" fill="#2B59C3" />
              <rect x="6" y="7" width="2" height="6" fill="#FFF" />
              {/* 手脚 */}
              <rect x="2" y="7" width="1" height="4" fill="#2D1810" />
              <rect x="11" y="7" width="1" height="4" fill="#2D1810" />
              <rect x="4" y="13" width="2" height="3" fill="#1A1A1A" />
              <rect x="8" y="13" width="2" height="3" fill="#1A1A1A" />
              {/* 剣 */}
              <rect x="2" y="2" width="1" height="7" fill="#CCCCCC" />
              <rect x="1" y="8" width="3" height="1" fill="#888888" />
            </svg>
          </div>
        </div>

        {/* 4. TAPボタン & キャッチコピー */}
        <div className="z-20 -mt-2 flex w-full flex-col items-center px-6">
          <button
            onClick={handleTap}
            className="group w-full cursor-pointer rounded-lg border-4 border-slate-900 bg-white/90 p-3 shadow-[0_6px_0_#1E293B] transition-all active:translate-y-1 active:shadow-[0_2px_0_#1E293B]"
          >
            <div className="text-4xl font-black tracking-widest text-[#E63946] drop-shadow-[2px_2px_0_#000] transition-transform group-hover:scale-105">
              Tap !
            </div>
            <div className="mt-1 inline-block rounded bg-[#1D2D44] px-4 py-1 text-[10px] font-bold text-white">
              画面をタップして出発
            </div>
          </button>

          <p className="mt-3 rounded border border-slate-800/30 bg-white/60 px-2 py-0.5 text-[10px] font-extrabold text-slate-900">
            すれ違い通信でご当地の猛者と勝負！
          </p>
        </div>

        {/* 5. 下部のご当地チーム・メンバー一覧（木目背景風） */}
        <div
          className="relative z-10 flex w-full flex-col items-center border-t-4 border-slate-900 bg-[#8B5A2B] p-3"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #8B5A2B, #8B5A2B 20px, #7A4E24 20px, #7A4E24 40px)",
          }}
        >
          {/* 5人のドット絵ミニキャラ */}
          <div className="mb-2 flex w-full justify-between px-2">
            {/* キャラ1: 緑 (りんご持参) */}
            <div className="flex flex-col items-center">
              <div className="relative flex h-10 w-8 items-center justify-center rounded-sm border-2 border-slate-900 bg-[#38B000]">
                <div className="absolute top-1 h-3 w-4 rounded-sm bg-[#FFCC99]"></div>
                <div className="absolute right-0 bottom-1 h-2 w-2 rounded-full border border-black bg-red-600"></div>
              </div>
            </div>
            {/* キャラ2: 紫 (牛乳持参) */}
            <div className="flex flex-col items-center">
              <div className="relative flex h-10 w-8 items-center justify-center rounded-sm border-2 border-slate-900 bg-[#7209B7]">
                <div className="absolute top-1 h-3 w-4 rounded-sm bg-[#FFCC99]"></div>
                <div className="absolute bottom-1 left-0 h-3 w-2 border border-black bg-white"></div>
              </div>
            </div>
            {/* キャラ3: 黄 (魚持参) */}
            <div className="flex flex-col items-center">
              <div className="relative flex h-10 w-8 items-center justify-center rounded-sm border-2 border-slate-900 bg-[#FFB703]">
                <div className="absolute top-1 h-3 w-4 rounded-sm bg-[#FFCC99]"></div>
                <div className="absolute right-0 bottom-1 h-2 w-3 rounded-sm border border-black bg-sky-400"></div>
              </div>
            </div>
            {/* キャラ4: 赤 (鳥居持参) */}
            <div className="flex flex-col items-center">
              <div className="relative flex h-10 w-8 items-center justify-center rounded-sm border-2 border-slate-900 bg-[#D9383A]">
                <div className="absolute top-1 h-3 w-4 rounded-sm bg-[#FFCC99]"></div>
                <div className="absolute bottom-1 left-1 h-3 w-1 bg-red-700"></div>
              </div>
            </div>
            {/* キャラ5: 青 (ラーメン持参) */}
            <div className="flex flex-col items-center">
              <div className="relative flex h-10 w-8 items-center justify-center rounded-sm border-2 border-slate-900 bg-[#2B59C3]">
                <div className="absolute top-1 h-3 w-4 rounded-sm bg-[#FFCC99]"></div>
                <div className="absolute right-0 bottom-1 h-2 w-3 rounded-sm border border-black bg-amber-200"></div>
              </div>
            </div>
          </div>

          {/* フッター帯 */}
          <div className="flex w-full items-center justify-center gap-2 rounded border-2 border-slate-900 bg-[#FFB703] px-2 py-1 shadow-inner">
            <span className="rounded bg-[#D9383A] px-1 text-[8px] font-bold text-white">
              47都道府県
            </span>
            <span className="text-[10px] font-black tracking-tight text-slate-900">
              キミだけのご当地チームをつくろう！
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
