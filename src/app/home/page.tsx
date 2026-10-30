"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelWindow } from "@/components/ui/PixelWindow";
import { useAuth } from "@/features/auth";
import type { Profile } from "@/types/database";

// ログイン後の仮ホーム画面（フロント担当が作り直す想定）
export default function HomePage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then(setProfile);
  }, [loading, user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/start");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-mono">
      <div className="w-full max-w-[390px] space-y-4">
        <PixelWindow title="ホーム（仮）">
          {profile ? (
            <dl className="space-y-1 text-sm">
              <div>
                <dt className="inline font-bold">冒険者名：</dt>
                <dd className="inline">{profile.nickname}</dd>
              </div>
              <div>
                <dt className="inline font-bold">出身地：</dt>
                <dd className="inline">{profile.home_area ?? "未設定"}</dd>
              </div>
              <div>
                <dt className="inline font-bold">メール：</dt>
                <dd className="inline">{user?.email}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm">よみこみ中...</p>
          )}
        </PixelWindow>
        <PixelButton onClick={handleSignOut} className="w-full">
          ログアウト
        </PixelButton>
      </div>
    </main>
  );
}
