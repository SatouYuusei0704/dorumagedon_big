"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { bgmForPath, isSeName } from "./music";
import {
  isMuted,
  playBgm,
  playSe,
  setMuted,
  setSoundSuspended,
  subscribeMuted,
  unlockSound,
} from "./synth";

/** ミュートの状態を読む */
export function useSoundMuted() {
  return useSyncExternalStore(subscribeMuted, isMuted, () => false);
}

/**
 * アプリ全体の音を管理する（layout に 1 つだけ置く）。
 * - 画面に合わせて BGM を切り替える
 * - ボタン・リンクを押したら効果音を鳴らす。
 *   要素に data-sound="confirm" などを付けると音を変えられる（"none" で鳴らさない）
 * - 右上に音のオン・オフボタンを出す
 */
export function SoundController() {
  const pathname = usePathname();
  const muted = useSoundMuted();

  useEffect(() => {
    playBgm(bgmForPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const unlock = () => unlockSound();
    const onClick = (event: MouseEvent) => {
      unlockSound();
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest("button, a, [role='button']");
      if (!el || el.matches(":disabled")) return;
      const sound =
        el.closest("[data-sound]")?.getAttribute("data-sound") ?? "cursor";
      if (isSeName(sound)) playSe(sound);
    };
    const onVisibility = () => setSoundSuspended(document.hidden);

    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    window.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      window.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      data-sound="none"
      onClick={() => {
        setMuted(!muted);
        if (muted) playSe("confirm");
      }}
      aria-label={muted ? "おとを ならす" : "おとを けす"}
      aria-pressed={!muted}
      className="fixed top-2 right-2 z-[90] rounded border-2 border-black bg-[#0f172a]/85 px-1.5 py-0.5 text-[10px] font-bold text-[#facc15] shadow-[2px_2px_0_#000] active:translate-y-0.5"
    >
      {muted ? "♪ OFF" : "♪ ON"}
    </button>
  );
}
