"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toAuthErrorMessage, useAuth } from "@/features/auth";
import { PREFECTURES } from "@/lib/prefectures";

export default function LoginPage() {
  // 'register'（冒険者登録）か 'login'（ログイン）の切り替え
  const [mode, setMode] = useState<"register" | "login">("register");

  // フォーム入力の状態管理
  const [formData, setFormData] = useState({
    playerName: "",
    homeArea: "",
    email: "",
    password: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const { user, loading, signUp, signIn } = useAuth();

  // ログイン済みならホームへ
  useEffect(() => {
    if (!loading && user) router.replace("/home");
  }, [loading, user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register" && !formData.agreeTerms) {
      alert("利用規約に同意してください");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      if (mode === "register") {
        const { needsConfirmation } = await signUp({
          email: formData.email,
          password: formData.password,
          nickname: formData.playerName,
          homeArea: formData.homeArea,
        });
        if (needsConfirmation) {
          setMessage("確認メールを送りました。メールのリンクを開いてください");
          return;
        }
      } else {
        await signIn(formData.email, formData.password);
      }
      router.push("/home");
    } catch (error) {
      setMessage(toAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1e293b] p-2 font-mono selection:bg-[#e11d48] selection:text-white">
      {/* スマホ画面枠風コンテナ */}
      <div
        className="relative flex min-h-[750px] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border-4 border-[#0f172a] bg-[#fef08a] p-4 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] select-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "100% 20px",
        }}
      >
        {/* 上部ヘッダー（もどるボタン & STEP表示） */}
        <div className="mb-3 flex items-center justify-between">
          <Link
            href="/start"
            className="flex items-center border-2 border-black bg-[#0f172a] px-3 py-1 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-slate-800"
          >
            ◀ もどる
          </Link>
          {mode === "register" && (
            <div className="border-2 border-black bg-[#dc2626] px-3 py-1 text-right text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[9px] leading-none opacity-80">STEP</div>
              <div className="mt-0.5 text-sm leading-none font-extrabold">
                01
              </div>
            </div>
          )}
        </div>

        {/* バナーヘッダー */}
        <div className="mb-5 flex items-center border-4 border-[#0f172a] bg-[#1e3a8a] p-3 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="relative mr-3 flex h-12 w-12 flex-shrink-0 items-center justify-center border-2 border-black bg-[#fef08a]">
            <div className="relative h-6 w-6 border border-black bg-[#f87171]">
              <div className="absolute top-1 left-1 h-1 w-1 bg-black"></div>
              <div className="absolute top-1 right-1 h-1 w-1 bg-black"></div>
            </div>
          </div>
          <div>
            {mode === "register" ? (
              <>
                <div className="text-[10px] font-bold tracking-widest text-[#facc15]">
                  WELCOME, NEW PLAYER!
                </div>
                <h2 className="text-xl font-extrabold tracking-wide">
                  冒険者登録
                </h2>
                <p className="text-[11px] text-slate-200">
                  キミのプロフィールをつくろう
                </p>
              </>
            ) : (
              <>
                <div className="text-[10px] font-bold tracking-widest text-[#facc15]">
                  WELCOME BACK!
                </div>
                <h2 className="text-xl font-extrabold tracking-wide">
                  おかえりなさい
                </h2>
                <p className="text-[11px] text-slate-200">
                  登録したアカウントでログイン
                </p>
              </>
            )}
          </div>
        </div>

        {/* フォーム部分 */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col justify-between space-y-3"
        >
          <div className="space-y-3">
            {/* 新規登録時のみ：冒険者名 */}
            {mode === "register" && (
              <div>
                <label className="mb-1 block text-xs font-bold text-[#0f172a]">
                  冒険者名{" "}
                  <span className="text-[10px] text-[#dc2626]">
                    PLAYER NAME
                  </span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2 z-10 flex h-5 w-5 rotate-45 items-center justify-center border border-black bg-[#dc2626]"></div>
                  <input
                    type="text"
                    name="playerName"
                    maxLength={12}
                    placeholder="例：ご当地ハンター"
                    value={formData.playerName}
                    onChange={handleChange}
                    required={mode === "register"}
                    className="w-full border-2 border-[#0f172a] bg-white py-2 pr-16 pl-9 text-sm text-[#0f172a] shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                  />
                  <span className="absolute right-2 text-[10px] font-bold text-gray-500">
                    12文字まで
                  </span>
                </div>
              </div>
            )}

            {/* 新規登録時のみ：出身地 */}
            {mode === "register" && (
              <div>
                <label className="mb-1 block text-xs font-bold text-[#0f172a]">
                  出身地{" "}
                  <span className="text-[10px] text-[#dc2626]">HOME AREA</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2 z-10 h-5 w-5 rounded-full border border-black bg-[#facc15]"></div>
                  <select
                    name="homeArea"
                    value={formData.homeArea}
                    onChange={handleChange}
                    required={mode === "register"}
                    className="w-full cursor-pointer appearance-none border-2 border-[#0f172a] bg-white py-2 pr-8 pl-9 text-sm text-[#0f172a] shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                  >
                    <option value="">都道府県を選択</option>
                    {PREFECTURES.map((pref) => (
                      <option key={pref} value={pref}>
                        {pref}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 text-xs text-[#0f172a]">
                    ▼
                  </div>
                </div>
              </div>
            )}

            {/* メールアドレス */}
            <div>
              <label className="mb-1 block text-xs font-bold text-[#0f172a]">
                メールアドレス{" "}
                <span className="text-[10px] text-[#dc2626]">EMAIL</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-2 z-10 flex h-5 w-5 items-center justify-center border border-black bg-[#dc2626] text-[10px] font-bold text-white">
                  @
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="player@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-[#0f172a] bg-white py-2 pr-3 pl-9 text-sm text-[#0f172a] shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label className="mb-1 block text-xs font-bold text-[#0f172a]">
                パスワード{" "}
                <span className="text-[10px] text-[#dc2626]">PASSWORD</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-2 z-10 flex h-5 w-5 rotate-45 items-center justify-center border border-black bg-[#dc2626]"></div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  minLength={8}
                  placeholder={
                    mode === "register" ? "8文字以上" : "パスワードを入力"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-[#0f172a] bg-white py-2 pr-14 pl-9 text-sm text-[#0f172a] shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 border border-black bg-[#fef08a] px-2 py-0.5 text-[10px] font-bold hover:bg-yellow-300"
                >
                  {showPassword ? "かくす" : "みる"}
                </button>
              </div>
            </div>

            {/* 新規登録時のみ：利用規約同意 */}
            {mode === "register" && (
              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="h-4 w-4 cursor-pointer rounded-none border-2 border-black text-[#dc2626] focus:ring-0"
                />
                <label
                  htmlFor="agreeTerms"
                  className="ml-2 cursor-pointer text-xs font-bold text-[#0f172a]"
                >
                  <span className="underline">利用規約</span> と{" "}
                  <span className="underline">プライバシーポリシー</span>{" "}
                  に同意する
                </label>
              </div>
            )}
          </div>

          {/* 送信ボタン & モード切り替えリンク */}
          <div className="space-y-3 pt-4">
            {message && (
              <p className="border-2 border-[#0f172a] bg-white px-3 py-2 text-xs font-bold text-[#dc2626]">
                {message}
              </p>
            )}
            {mode === "register" ? (
              <>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full cursor-pointer items-center justify-center border-4 border-[#0f172a] bg-[#dc2626] py-3 text-lg font-extrabold text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-[#b91c1c] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] disabled:cursor-wait disabled:opacity-60"
                >
                  冒険をはじめる <span className="ml-2 text-yellow-300">▶</span>
                </button>

                <div className="text-center text-xs font-bold text-[#0f172a]">
                  すでにアカウントをお持ちの方{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="ml-1 cursor-pointer text-[#dc2626] underline hover:text-red-700"
                  >
                    ログイン
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full cursor-pointer items-center justify-center border-4 border-[#0f172a] bg-[#2563eb] py-3 text-lg font-extrabold text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-[#1d4ed8] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] disabled:cursor-wait disabled:opacity-60"
                >
                  ログインして再開{" "}
                  <span className="ml-2 text-yellow-300">▶</span>
                </button>

                <div className="text-center text-xs font-bold text-[#0f172a]">
                  新規作成はこちら{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="ml-1 cursor-pointer text-[#dc2626] underline hover:text-red-700"
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
