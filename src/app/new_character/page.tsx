'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// 都道府県ごとのご当地アイテムデータ
const REGIONAL_ITEMS: Record<string, { name: string; icon: string; desc: string }> = {
  青森県: { name: 'りんごのつるぎ', icon: '🍎🗡️', desc: '甘酸っぱい魔力を秘めた真っ赤な剣' },
  滋賀県: { name: '琵琶湖の大ナマズ剣', icon: '🐟🗡️', desc: '琵琶湖の主の力が宿った巨大な剣' },
  石川県: { name: '金箔のつるぎ', icon: '✨🗡️', desc: '金沢の輝きを秘めた煌びやかな剣' },
  群馬県: { name: '上州ダルマのかぶと', icon: '🔴🪖', desc: '七転び八起き！絶対に倒れない兜' },
  静岡県: { name: '茶摘みのやいば', icon: '🍃🗡️', desc: '富士山の風と茶葉の香りが漂う刀' },
  長野県: { name: '信州そばの盾', icon: '🍜🛡️', desc: 'コシの強さで攻撃を跳ね返す盾' },
  京都府: { name: '八ツ橋のかぶと', icon: '🍡🪖', desc: 'ほんのりニッキが香る歴史ある防具' },
  福井県: { name: '恐竜の化石ブレード', icon: '🦖🗡️', desc: '太古のロマン溢れる巨大な骨の剣' },
  島根県: { name: '勾玉のおまもり', icon: '☯️✨', desc: '出雲の神々の良縁と加護をもたらす宝玉' },
  東京都: { name: 'タワーのたて', icon: '🗼🛡️', desc: '大都会の電波を守る強固な盾' },
  大阪府: { name: 'なにわのハリセン', icon: '🪭', desc: 'ツッコミのキレが倍増する伝説の道具' },
  北海道: { name: '木彫りのくま', icon: '🐻', desc: '鮭を咥えた強力なご当地お守り' },
};

const DEFAULT_ITEM = { name: '旅人のつるぎ', icon: '🗡️', desc: '全国を旅する者に与えられる基本の剣' };

const PREFECTURES = [
  '青森県',
  '石川県',
  '滋賀県',
  '群馬県',
  '静岡県',
  '長野県',
  '京都府',
  '福井県',
  '島根県',
  '東京都',
  '大阪府',
  '北海道',
];

const BODY_COLORS = [
  { name: 'レッド', bg: 'bg-[#e63946]' },
  { name: 'ブルー', bg: 'bg-[#1d3557]' },
  { name: 'グリーン', bg: 'bg-[#2a9d8f]' },
  { name: 'イエロー', bg: 'bg-[#e9c46a]' },
];

const HAIR_STYLES = [
  { name: 'ダークブラウン', color: 'bg-[#2b1e1a]' },
  { name: 'ブラック', color: 'bg-[#18181b]' },
  { name: 'ゴールド', color: 'bg-[#d97706]' },
  { name: 'シルバー', color: 'bg-[#94a3b8]' },
];

const FACE_TYPES = [
  { name: 'ノーマル', eyeType: 'normal' },
  { name: 'キリッ', eyeType: 'sharp' },
  { name: 'にっこり', eyeType: 'happy' },
  { name: 'ロボ/メガネ', eyeType: 'glasses' },
];

function NewCharacterContent() {
  const searchParams = useSearchParams();
  
  const [name, setName] = useState('ゆうしゃ');
  const [selectedLocation, setSelectedLocation] = useState('青森県');

  useEffect(() => {
    const queryName = searchParams.get('name');
    const queryLocation = searchParams.get('location');
    if (queryName) setName(queryName);
    if (queryLocation) setSelectedLocation(queryLocation);
  }, [searchParams]);

  const [faceIndex, setFaceIndex] = useState(0);
  const [hairIndex, setHairIndex] = useState(0);
  const [bodyColorIndex, setBodyColorIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'face' | 'hair' | 'bodyColor'>('face');
  const [showItemModal, setShowItemModal] = useState(false);

  const MAX_PATTERNS = 4;

  const handlePrev = () => {
    if (activeTab === 'face') setFaceIndex((prev) => (prev - 1 + MAX_PATTERNS) % MAX_PATTERNS);
    if (activeTab === 'hair') setHairIndex((prev) => (prev - 1 + MAX_PATTERNS) % MAX_PATTERNS);
    if (activeTab === 'bodyColor') setBodyColorIndex((prev) => (prev - 1 + MAX_PATTERNS) % MAX_PATTERNS);
  };

  const handleNext = () => {
    if (activeTab === 'face') setFaceIndex((prev) => (prev + 1) % MAX_PATTERNS);
    if (activeTab === 'hair') setHairIndex((prev) => (prev + 1) % MAX_PATTERNS);
    if (activeTab === 'bodyColor') setBodyColorIndex((prev) => (prev + 1) % MAX_PATTERNS);
  };

  const obtainedItem = REGIONAL_ITEMS[selectedLocation] || DEFAULT_ITEM;

  // 開発テスト用：自分の作成したアバター情報を持ったままバトルへ行くURL
  const devBattleUrl = `/battle?name=${encodeURIComponent(name)}&location=${encodeURIComponent(selectedLocation)}&hair=${hairIndex}&body=${bodyColorIndex}`;

  return (
    <main className="min-h-screen bg-[#1e293b] flex justify-center items-center p-2 font-mono selection:bg-[#e11d48] selection:text-white">
      <div className="w-full max-w-[420px] bg-[#fef08a] border-4 border-[#0f172a] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-2xl overflow-hidden relative min-h-[750px] flex flex-col justify-between p-4">
        
        {/* ヘッダー */}
        <div className="flex justify-between items-center bg-[#0f172a] text-white p-2 rounded-lg border-2 border-black mb-3">
          <Link href="/login" className="text-xs bg-[#334155] hover:bg-[#475569] px-2 py-1 rounded border border-white/40">
            ◀ もどる
          </Link>
          <h1 className="text-sm font-bold tracking-wider text-[#facc15]">アバターをつくる</h1>
          <div className="w-12"></div>
        </div>

        {/* 1. プレビュー表示 */}
        <div className="bg-[#7dd3fc] border-4 border-[#0f172a] rounded-xl p-4 flex flex-col items-center justify-center relative shadow-inner mb-4">
          <div className="text-xs font-bold bg-[#0f172a] text-white px-3 py-0.5 rounded-full mb-2">
            PREVIEW
          </div>
          <div className="w-44 h-48 bg-sky-200 border-4 border-[#0f172a] rounded-lg flex items-center justify-center relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] overflow-hidden">
            <div className="relative flex flex-col items-center justify-center scale-110">
              <div className={`relative w-16 h-12 ${HAIR_STYLES[hairIndex].color} border-2 border-black flex flex-col justify-end p-1`}>
                <div className="absolute top-0 left-0 right-0 h-3 bg-black/10"></div>
                <div className="w-full h-8 bg-[#f8c39d] border-2 border-black flex items-center justify-around px-1 relative z-10">
                  {FACE_TYPES[faceIndex].eyeType === 'normal' && (
                    <>
                      <div className="w-2.5 h-2.5 bg-black"></div>
                      <div className="w-2.5 h-2.5 bg-black"></div>
                    </>
                  )}
                  {FACE_TYPES[faceIndex].eyeType === 'sharp' && (
                    <>
                      <div className="w-2.5 h-1.5 bg-black rotate-12"></div>
                      <div className="w-2.5 h-1.5 bg-black -rotate-12"></div>
                    </>
                  )}
                  {FACE_TYPES[faceIndex].eyeType === 'happy' && (
                    <>
                      <div className="w-2.5 h-1 bg-black -translate-y-0.5"></div>
                      <div className="w-2.5 h-1 bg-black -translate-y-0.5"></div>
                    </>
                  )}
                  {FACE_TYPES[faceIndex].eyeType === 'glasses' && (
                    <div className="w-full h-2 bg-black/80 border border-white flex justify-around items-center">
                      <div className="w-1.5 h-1.5 bg-cyan-300"></div>
                      <div className="w-1.5 h-1.5 bg-cyan-300"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative flex items-center">
                <div className="w-2.5 h-8 bg-[#2b1e1a] border-y-2 border-l-2 border-black"></div>
                <div className={`w-12 h-10 ${BODY_COLORS[bodyColorIndex].bg} border-2 border-black flex justify-center`}>
                  <div className="w-4 h-full bg-white border-x-2 border-black/20"></div>
                </div>
                <div className="relative flex items-center">
                  <div className="w-2.5 h-8 bg-[#2b1e1a] border-y-2 border-r-2 border-black"></div>
                  <div className="absolute left-1.5 -top-3 flex flex-col items-center">
                    <div className="w-2 h-7 bg-slate-300 border border-black"></div>
                    <div className="w-5 h-1.5 bg-slate-500 border border-black"></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-12 justify-around">
                <div className="w-3 h-5 bg-[#18181b] border-x-2 border-b-2 border-black"></div>
                <div className="w-3 h-5 bg-[#18181b] border-x-2 border-b-2 border-black"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. パーツ選択タブ & コントローラー */}
        <div className="bg-white border-4 border-[#0f172a] rounded-xl p-3 mb-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex gap-1 mb-3 border-b-2 border-[#0f172a] pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('face')}
              className={`flex-1 py-1 text-xs font-bold rounded border-2 border-[#0f172a] transition-all ${
                activeTab === 'face' ? 'bg-[#facc15]' : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              かお
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hair')}
              className={`flex-1 py-1 text-xs font-bold rounded border-2 border-[#0f172a] transition-all ${
                activeTab === 'hair' ? 'bg-[#facc15]' : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              かみがた
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bodyColor')}
              className={`flex-1 py-1 text-[#0f172a] text-[10px] sm:text-xs font-bold rounded border-2 border-[#0f172a] transition-all ${ activeTab === 'bodyColor' ? 'bg-[#facc15]' : 'bg-slate-100 hover:bg-slate-200' }`} > ボディカラー </button> </div>  <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg border-2 border-[#0f172a]"> <button type="button" onClick={handlePrev} className="bg-[#0f172a] text-white px-3 py-1 rounded font-bold hover:bg-slate-700 active:translate-y-0.5 cursor-pointer" > ◀ </button> <span className="text-xs font-bold text-[#0f172a]"> {activeTab === 'face' && `かお: ${FACE_TYPES[faceIndex].name}`}
              {activeTab === 'hair' && `かみ色: ${HAIR_STYLES[hairIndex].name}`} {activeTab === 'bodyColor' && `ふく色: ${BODY_COLORS[bodyColorIndex].name}`}
            </span>
            <button 
              type="button"
              onClick={handleNext}
              className="bg-[#0f172a] text-white px-3 py-1 rounded font-bold hover:bg-slate-700 active:translate-y-0.5 cursor-pointer"
            >
              ▶
            </button>
          </div>
        </div>

        {/* 3. プロフィール & 出身地変更 */}
        <div className="bg-[#1e293b] text-white border-4 border-[#0f172a] rounded-xl p-3 mb-3 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-2">
          <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
            <span className="text-[11px] text-[#facc15] font-bold">なまえ</span>
            <span className="text-xs font-bold text-white tracking-wide">{name}</span>
          </div>

          <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
            <span className="text-[11px] text-[#facc15] font-bold">しゅっしんち</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-0.5 text-xs text-[#facc15] font-bold focus:outline-none focus:border-[#facc15] cursor-pointer"
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
          className="w-full bg-[#ef4444] text-white font-black py-3 rounded-xl border-4 border-[#0f172a] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-[#dc2626] active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all text-sm tracking-widest cursor-pointer"
        >
          このすがたで決定！
        </button>

        {/* 4. モーダル表示 */}
        {showItemModal && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#fef08a] border-4 border-[#0f172a] rounded-2xl p-4 w-full text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <div className="text-xs font-bold bg-[#0f172a] text-[#facc15] px-3 py-1 rounded-full inline-block">
                ITEM GET!
              </div>

              <h2 className="text-sm font-bold text-[#0f172a]">
                {selectedLocation}のパワーを かんじる…！
              </h2>

              <div className="bg-white border-4 border-[#0f172a] rounded-xl p-3 shadow-inner">
                <div className="text-4xl mb-1 animate-bounce">{obtainedItem.icon}</div>
                <div className="text-sm font-black text-[#ef4444] mb-1">
                  【 {obtainedItem.name} 】
                </div>
                <div className="text-[11px] text-slate-600 font-bold">
                  {obtainedItem.desc}
                </div>
              </div>

              <p className="text-[11px] text-[#0f172a] font-bold">
                ご当地そうび を てにいれた！
              </p>

              {/* 本番用の広場へ向かうボタン */}
              <Link 
                href="/start" 
                className="block w-full bg-[#3b82f6] text-white font-black py-2.5 rounded-xl border-4 border-[#0f172a] shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-[#2563eb] active:translate-y-0.5 transition-all text-xs"
              >
                ひろばへ むかう ➔
              </Link>

              {/* 開発テスト用のバトル検証ボタン */}
              <Link 
                href={devBattleUrl} 
                className="block w-full bg-[#f59e0b] text-[#0f172a] font-black py-2 rounded-xl border-2 border-[#0f172a] shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-[#d97706] active:translate-y-0.5 transition-all text-[11px]"
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
    <Suspense fallback={<div className="min-h-screen bg-[#1e293b] text-white flex justify-center items-center">Loading...</div>}>
      <NewCharacterContent />
    </Suspense>
  );
}