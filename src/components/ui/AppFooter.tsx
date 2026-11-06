"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** アイコン（ゲームUI風のシンプルな図形） */
const ICONS = {
  /** ひし形 */
  plaza: (
    <span className="block h-3.5 w-3.5 rotate-45 bg-[#e9b949]" aria-hidden />
  ),
  /** 横線（図鑑のページ） */
  collection: (
    <span
      className="flex h-4 w-4 flex-col justify-between border-2 border-[#e9b949] p-[2px]"
      aria-hidden
    >
      <span className="block h-[2px] bg-[#e9b949]" />
      <span className="block h-[2px] bg-[#e9b949]" />
    </span>
  ),
  /** 四角の中に四角 */
  debug: (
    <span
      className="flex h-4 w-4 items-center justify-center border-2 border-[#e9b949]"
      aria-hidden
    >
      <span className="block h-1.5 w-1.5 bg-[#e9b949]" />
    </span>
  ),
} as const;

/** フッターから移動できる画面 */
const NAV_ITEMS = [
  { href: "/plaza", label: "ひろば", icon: ICONS.plaza },
  { href: "/collection", label: "コレクション", icon: ICONS.collection },
  // すれ違いテスト（仮）。本番画面ができたら削除する
  { href: "/debug", label: "テスト", icon: ICONS.debug },
];

type Props = {
  className?: string;
};

/** 画面下部の共通タブバー（画面切り替えボタン） */
export function AppFooter({ className = "" }: Props) {
  const pathname = usePathname();

  return (
    <footer
      className={`border-t-4 border-[#e53935] bg-[#1b2a41] text-white ${className}`}
    >
      <nav className="flex divide-x divide-white/10">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1.5 pt-3 pb-2 text-[10px] font-bold tracking-wider transition-colors ${
                active
                  ? "bg-[#2a3d5c] text-white"
                  : "text-slate-400 hover:bg-[#22344f] hover:text-slate-200"
              }`}
            >
              {active && (
                <>
                  {/* 選択中の印（上部のバー + ひし形） */}
                  <span className="absolute inset-x-0 top-0 h-1 bg-[#e9b949]" />
                  <span className="absolute -top-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#e9b949]" />
                </>
              )}
              <span className="flex h-5 items-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
