    'use client';

    import React, { useState } from 'react';
    import Link from 'next/link';

    interface NewCharacterPageProps {
    initialName?: string;
    initialLocation?: string;
    }

    // ==========================================
    // 画像のデザインに合わせたパーツデータ定義
    // ==========================================
    const BODY_COLORS = [
    { name: 'レッド', bg: 'bg-[#e63946]' },   // 赤服
    { name: 'ブルー', bg: 'bg-[#1d3557]' },   // 青服
    { name: 'グリーン', bg: 'bg-[#2a9d8f]' }, // 緑服
    { name: 'イエロー', bg: 'bg-[#e9c46a]' }, // 黄服
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

    export default function NewCharacterPage({
    initialName = 'ゆうしゃ',
    initialLocation = '石川県',
    }: NewCharacterPageProps) {
    // 選択中インデックス（0〜3）
    const [faceIndex, setFaceIndex] = useState(0);
    const [hairIndex, setHairIndex] = useState(0);
    const [bodyColorIndex, setBodyColorIndex] = useState(0);

    // カテゴリタブ
    const [activeTab, setActiveTab] = useState<'face' | 'hair' | 'bodyColor'>('face');

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

    return (
        <main className="min-h-screen bg-[#1e293b] flex justify-center items-center p-2 font-mono selection:bg-[#e11d48] selection:text-white">
        <div className="w-full max-w-[420px] bg-[#fef08a] border-4 border-[#0f172a] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-2xl overflow-hidden relative min-h-[750px] flex flex-col justify-between p-4">
            
            {/* ヘッダーエリア */}
            <div className="flex justify-between items-center bg-[#0f172a] text-white p-2 rounded-lg border-2 border-black mb-3">
            <Link href="/start" className="text-xs bg-[#334155] hover:bg-[#475569] px-2 py-1 rounded border border-white/40">
                ◀ もどる
            </Link>
            <h1 className="text-sm font-bold tracking-wider text-[#facc15]">アバターをつくる</h1>
            <div className="w-12"></div>
            </div>

            {/* ==========================================
                1. 画像風ドット絵アバター プレビュー表示
            ========================================== */}
            <div className="bg-[#7dd3fc] border-4 border-[#0f172a] rounded-xl p-4 flex flex-col items-center justify-center relative shadow-inner mb-4">
            <div className="text-xs font-bold bg-[#0f172a] text-white px-3 py-0.5 rounded-full mb-2">
                PREVIEW
            </div>
            
            {/* ドット絵キャンバス */}
            <div className="w-44 h-48 bg-sky-200 border-4 border-[#0f172a] rounded-lg flex items-center justify-center relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] overflow-hidden">
                
                {/* ★ 画像再現ドットアバター本体 ★ */}
                <div className="relative flex flex-col items-center justify-center scale-110">
                
                {/* 頭部（髪の毛 ＋ 顔） */}
                <div className={`relative w-16 h-12 ${HAIR_STYLES[hairIndex].color} border-2 border-black flex flex-col justify-end p-1`}>
                    {/* 髪の前髪部分カット */}
                    <div className="absolute top-0 left-0 right-0 h-3 bg-black/10"></div>
                    
                    {/* 肌部分（顔） */}
                    <div className="w-full h-8 bg-[#f8c39d] border-2 border-black flex items-center justify-around px-1 relative z-10">
                    {/* 目のタイプ切り替え */}
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

                {/* 胴体 ＋ 腕 ＋ 剣 */}
                <div className="relative flex items-center">
                    {/* 左腕/手 */}
                    <div className="w-2.5 h-8 bg-[#2b1e1a] border-y-2 border-l-2 border-black"></div>

                    {/* 服（ボディカラー ＋ インナーホワイト） */}
                    <div className={`w-12 h-10 ${BODY_COLORS[bodyColorIndex].bg} border-2 border-black flex justify-center`}>
                    <div className="w-4 h-full bg-white border-x-2 border-black/20"></div>
                    </div>

                    {/* 右腕/手 ＋ 剣 */}
                    <div className="relative flex items-center">
                    <div className="w-2.5 h-8 bg-[#2b1e1a] border-y-2 border-r-2 border-black"></div>
                    
                    {/* 剣 (グラフィック再現) */}
                    <div className="absolute left-1.5 -top-3 flex flex-col items-center">
                        <div className="w-2 h-7 bg-slate-300 border border-black"></div>
                        <div className="w-5 h-1.5 bg-slate-500 border border-black"></div>
                    </div>
                    </div>
                </div>

                {/* 脚（パンツ＆靴） */}
                <div className="flex gap-2 w-12 justify-around">
                    <div className="w-3 h-5 bg-[#18181b] border-x-2 border-b-2 border-black"></div>
                    <div className="w-3 h-5 bg-[#18181b] border-x-2 border-b-2 border-black"></div>
                </div>

                </div>

            </div>
            </div>

            {/* ==========================================
                2. パーツ選択 タブ & コントローラー
            ========================================== */}
            <div className="bg-white border-4 border-[#0f172a] rounded-xl p-3 mb-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            {/* カテゴリタブ */}
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
                className={`flex-1 py-1 text-[#0f172a] text-[10px] sm:text-xs font-bold rounded border-2 border-[#0f172a] transition-all ${
                    activeTab === 'bodyColor' ? 'bg-[#facc15]' : 'bg-slate-100 hover:bg-slate-200'
                }`}
                >
                ボディカラー
                </button>
            </div>

            {/* 左右切り替えボタン */}
            <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg border-2 border-[#0f172a]">
                <button 
                type="button"
                onClick={handlePrev}
                className="bg-[#0f172a] text-white px-3 py-1 rounded font-bold hover:bg-slate-700 active:translate-y-0.5 cursor-pointer"
                >
                ◀
                </button>

                <span className="text-xs font-bold text-[#0f172a]">
                {activeTab === 'face' && `かお: ${FACE_TYPES[faceIndex].name}`}
                {activeTab === 'hair' && `かみ色: ${HAIR_STYLES[hairIndex].name}`}
                {activeTab === 'bodyColor' && `ふく色: ${BODY_COLORS[bodyColorIndex].name}`}
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

            {/* ==========================================
                3. プロフィール表示（固定データ）
            ========================================== */}
            <div className="bg-[#1e293b] text-white border-4 border-[#0f172a] rounded-xl p-3 mb-3 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-2">
            <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
                <span className="text-[11px] text-[#facc15] font-bold">なまえ</span>
                <span className="text-xs font-bold text-white tracking-wide">{initialName}</span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
                <span className="text-[11px] text-[#facc15] font-bold">しゅっしんち</span>
                <span className="text-xs font-bold text-white tracking-wide">{initialLocation}</span>
            </div>
            </div>

            {/* 決定ボタン */}
            <button 
            type="button"
            className="w-full bg-[#ef4444] text-white font-black py-3 rounded-xl border-4 border-[#0f172a] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-[#dc2626] active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all text-sm tracking-widest cursor-pointer"
            >
            このすがたで決定！
            </button>

        </div>
        </main>
    );
    }