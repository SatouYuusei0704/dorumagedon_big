"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type SignUpInput = {
  email: string;
  password: string;
  nickname: string;
  homeArea: string;
};

/** ログイン状態の取得とメール認証（新規登録・ログイン・ログアウト）を提供する */
export function useAuth() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  /**
   * 新規登録。冒険者名・出身地はトリガーで profiles に保存される。
   * メール確認が ON の場合はセッションが返らないので needsConfirmation が true になる。
   */
  const signUp = useCallback(
    async ({ email, password, nickname, homeArea }: SignUpInput) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname, home_area: homeArea } },
      });
      if (error) throw error;
      return { needsConfirmation: !data.session };
    },
    [supabase],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [supabase]);

  return { user, loading, signUp, signIn, signOut };
}

/** Supabase Auth のエラーを画面に出す日本語メッセージに変換する */
export function toAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: string }).code
      : undefined;
  switch (code) {
    case "user_already_exists":
    case "email_exists":
      return "このメールアドレスはすでに登録されています";
    case "invalid_credentials":
      return "メールアドレスかパスワードがちがいます";
    case "email_not_confirmed":
      return "メールアドレスの確認がまだです。届いたメールのリンクを開いてください";
    case "weak_password":
      return "パスワードが弱すぎます（8文字以上にしてください）";
    case "email_address_invalid":
      return "メールアドレスの形式が正しくありません";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "しばらく時間をおいてから試してください";
    default:
      return "通信に失敗しました。もう一度試してください";
  }
}
