    'use client';

    import React, { useState } from 'react';
    import { useRouter } from 'next/navigation';

    const PREFECTURES = [
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

    export default function LoginPage() {
    const router = useRouter();
    const [name, setName] = useState('ゆうしゃ');
    const [location, setLocation] = useState('石川県');

    const handleStart = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        // 名前と出身地をURLのクエリパラメータに載せてアバター作成画面へ遷移
        router.push(`/new_character?name=${encodeURIComponent(name)}&location=${encodeURIComponent(location)}`);
    };

    return (
        <main className="min-h-screen bg-[#1e293b] flex justify-center items-center p-2 font-mono selection:bg-[#e11d48] selection:text-white">
        <div className="w-full max-w-[420px] bg-[#fef08a] border-4 border-[#0f172a] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-2xl overflow-hidden relative min-h-[600px] flex flex-col justify-between p-6">
            
            {/* ヘッダー */}
            <div className="bg-[#0f172a] text-white p-3 rounded-lg border-2 border-black mb-6 text-center">
            <h1 className="text-sm font-bold tracking-wider text-[#facc15]">ぼうけんのしょ を つくる</h1>
            </div>

            {/* 入力フォーム */}
            <form onSubmit={handleStart} className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="bg-[#1e293b] text-white border-4 border-[#0f172a] rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
                <div>
                <label className="block text-xs text-[#facc15] font-bold mb-2">なまえを おしえてね</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={8}
                    placeholder="ゆうしゃ"
                    className="w-full bg-slate-800 border-2 border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#facc15]"
                    required
                />
                </div>
                <div>
                <label className="block text-xs text-[#facc15] font-bold mb-2">しゅっしんち（都道府県）</label>
                <select 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-slate-600 rounded px-3 py-2 text-sm text-[#facc15] font-bold focus:outline-none focus:border-[#facc15] cursor-pointer"
                >
                    {PREFECTURES.map((pref) => (
                    <option key={pref} value={pref}>
                        {pref}
                    </option>
                    ))}
                </select>
                </div>
            </div>

            <button 
                type="submit"
                className="w-full bg-[#ef4444] text-white font-black py-4 rounded-xl border-4 border-[#0f172a] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-[#dc2626] active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all text-sm tracking-widest cursor-pointer"
            >
                つぎへすすむ ➔
            </button>
            </form>

            <div className="text-center text-[10px] text-slate-700 font-bold mt-4">
            Street-Pass Retro RPG
            </div>

        </div>
        </main>
    );
    }