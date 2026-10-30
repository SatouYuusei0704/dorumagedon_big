'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// 都道府県の選択肢リスト
const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export default function LoginPage() {
  // 'register'（冒険者登録）か 'login'（ログイン）の切り替え
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // フォーム入力の状態管理
  const [formData, setFormData] = useState({
    playerName: '',
    homeArea: '',
    email: '',
    password: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && !formData.agreeTerms) {
      alert('利用規約に同意してください');
      return;
    }
    console.log(mode === 'register' ? '新規登録データ:' : 'ログインデータ:', formData);
    // TODO: Supabase等の認証処理をここに記述
  };

  return (
    <main className="min-h-screen bg-[#1e293b] flex justify-center items-center p-2 font-mono selection:bg-[#e11d48] selection:text-white">
      {/* スマホ画面枠風コンテナ */}
      <div 
        className="w-full max-w-[420px] bg-[#fef08a] border-4 border-[#0f172a] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-2xl overflow-hidden relative min-h-[750px] flex flex-col p-4 select-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)',
          backgroundSize: '100% 20px'
        }}
      >
        {/* 上部ヘッダー（もどるボタン & STEP表示） */}
        <div className="flex justify-between items-center mb-3">
          <Link
            href="/start"
            className="bg-[#0f172a] text-white border-2 border-black px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-800 transition-colors flex items-center"
          >
            ◀ もどる
          </Link>
          {mode === 'register' && (
            <div className="bg-[#dc2626] text-white border-2 border-black px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-right">
              <div className="text-[9px] opacity-80 leading-none">STEP</div>
              <div className="text-sm leading-none font-extrabold mt-0.5">01</div>
            </div>
          )}
        </div>

        {/* バナーヘッダー */}
        <div className="bg-[#1e3a8a] text-white border-4 border-[#0f172a] p-3 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center mb-5">
          <div className="w-12 h-12 bg-[#fef08a] border-2 border-black flex-shrink-0 mr-3 flex items-center justify-center relative">
            <div className="w-6 h-6 bg-[#f87171] border border-black relative">
              <div className="w-1 h-1 bg-black absolute top-1 left-1"></div>
              <div className="w-1 h-1 bg-black absolute top-1 right-1"></div>
            </div>
          </div>
          <div>
            {mode === 'register' ? (
              <>
                <div className="text-[10px] text-[#facc15] font-bold tracking-widest">WELCOME, NEW PLAYER!</div>
                <h2 className="text-xl font-extrabold tracking-wide">冒険者登録</h2>
                <p className="text-[11px] text-slate-200">キミのプロフィールをつくろう</p>
              </>
            ) : (
              <>
                <div className="text-[10px] text-[#facc15] font-bold tracking-widest">WELCOME BACK!</div>
                <h2 className="text-xl font-extrabold tracking-wide">おかえりなさい</h2>
                <p className="text-[11px] text-slate-200">登録したアカウントでログイン</p>
              </>
            )}
          </div>
        </div>

        {/* フォーム部分 */}
        <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* 新規登録時のみ：冒険者名 */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#0f172a] mb-1">
                  冒険者名 <span className="text-[10px] text-[#dc2626]">PLAYER NAME</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2 w-5 h-5 bg-[#dc2626] border border-black rotate-45 flex items-center justify-center z-10"></div>
                  <input
                    type="text"
                    name="playerName"
                    maxLength={12}
                    placeholder="例：ご当地ハンター"
                    value={formData.playerName}
                    onChange={handleChange}
                    required={mode === 'register'}
                    className="w-full bg-white border-2 border-[#0f172a] pl-9 pr-16 py-2 text-sm text-[#0f172a] focus:outline-none shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                  />
                  <span className="absolute right-2 text-[10px] text-gray-500 font-bold">12文字まで</span>
                </div>
              </div>
            )}

            {/* 新規登録時のみ：出身地 */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#0f172a] mb-1">
                  出身地 <span className="text-[10px] text-[#dc2626]">HOME AREA</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2 w-5 h-5 bg-[#facc15] border border-black rounded-full z-10"></div>
                  <select
                    name="homeArea"
                    value={formData.homeArea}
                    onChange={handleChange}
                    required={mode === 'register'}
                    className="w-full bg-white border-2 border-[#0f172a] pl-9 pr-8 py-2 text-sm text-[#0f172a] focus:outline-none shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] appearance-none cursor-pointer"
                  >
                    <option value="">都道府県を選択</option>
                    {PREFECTURES.map((pref) => (
                      <option key={pref} value={pref}>{pref}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 pointer-events-none text-xs text-[#0f172a]">▼</div>
                </div>
              </div>
            )}

            {/* メールアドレス */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1">
                メールアドレス <span className="text-[10px] text-[#dc2626]">EMAIL</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-2 w-5 h-5 bg-[#dc2626] border border-black text-white text-[10px] font-bold flex items-center justify-center z-10">
                  @
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="player@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border-2 border-[#0f172a] pl-9 pr-3 py-2 text-sm text-[#0f172a] focus:outline-none shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] mb-1">
                パスワード <span className="text-[10px] text-[#dc2626]">PASSWORD</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-2 w-5 h-5 bg-[#dc2626] border border-black rotate-45 flex items-center justify-center z-10"></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  minLength={8}
                  placeholder={mode === 'register' ? '8文字以上' : 'パスワードを入力'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border-2 border-[#0f172a] pl-9 pr-14 py-2 text-sm text-[#0f172a] focus:outline-none shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 bg-[#fef08a] border border-black px-2 py-0.5 text-[10px] font-bold hover:bg-yellow-300"
                >
                  {showPassword ? 'かくす' : 'みる'}
                </button>
              </div>
            </div>

            {/* 新規登録時のみ：利用規約同意 */}
            {mode === 'register' && (
              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-4 h-4 border-2 border-black rounded-none text-[#dc2626] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="ml-2 text-xs font-bold text-[#0f172a] cursor-pointer">
                  <span className="underline">利用規約</span> と <span className="underline">プライバシーポリシー</span> に同意する
                </label>
              </div>
            )}
          </div>

          {/* 送信ボタン & モード切り替えリンク */}
          <div className="pt-4 space-y-3">
            {mode === 'register' ? (
              <>
                <button
                  type="submit"
                  className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-extrabold text-lg py-3 border-4 border-[#0f172a] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center justify-center cursor-pointer"
                >
                  冒険をはじめる <span className="ml-2 text-yellow-300">▶</span>
                </button>

                <div className="text-center text-xs font-bold text-[#0f172a]">
                  すでにアカウントをお持ちの方{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[#dc2626] underline hover:text-red-700 ml-1 cursor-pointer"
                  >
                    ログイン
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-lg py-3 border-4 border-[#0f172a] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center justify-center cursor-pointer"
                >
                  ログインして再開 <span className="ml-2 text-yellow-300">▶</span>
                </button>

                <div className="text-center text-xs font-bold text-[#0f172a]">
                  新規作成はこちら{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-[#dc2626] underline hover:text-red-700 ml-1 cursor-pointer"
                  >
                    新規冒険者登録
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}