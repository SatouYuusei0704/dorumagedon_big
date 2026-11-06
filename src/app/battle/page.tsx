"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// 都道府県ごとのご当地アイテムデータ（右手：武器 / 左手：盾・サブアイテム）
const REGIONAL_ITEMS: Record<
  string,
  { name: string; rightIcon: string; leftIcon: string }
> = {
  青森県: { name: "りんごのつるぎ", rightIcon: "🍎🗡️", leftIcon: "🍎" },
  滋賀県: { name: "琵琶湖の大ナマズ剣", rightIcon: "🐟🗡️", leftIcon: "🛡️" },
  石川県: { name: "金箔のつるぎ", rightIcon: "✨🗡️", leftIcon: "✨🛡️" },
  群馬県: { name: "上州ダルマのかぶと", rightIcon: "🗡️", leftIcon: "🔴" },
  静岡県: { name: "茶摘みのやいば", rightIcon: "🍃🗡️", leftIcon: "🍃" },
  長野県: { name: "信州そばの盾", rightIcon: "🗡️", leftIcon: "🍜🛡️" },
  京都府: { name: "八ツ橋のかぶと", rightIcon: "🗡️", leftIcon: "🍡" },
  福井県: { name: "恐竜の化石ブレード", rightIcon: "🦖🗡️", leftIcon: "🦴🛡️" },
  島根県: { name: "勾玉のおまもり", rightIcon: "🗡️", leftIcon: "☯️✨" },
  東京都: { name: "タワーのたて", rightIcon: "🗡️", leftIcon: "🗼🛡️" },
  大阪府: { name: "なにわのハリセン", rightIcon: "🪭", leftIcon: "🛡️" },
  北海道: { name: "木彫りのくま", rightIcon: "🐻🗡️", leftIcon: "🐟" },
};

const DEFAULT_ITEM = { name: "旅人のつるぎ", rightIcon: "🗡️", leftIcon: "🛡️" };

const BODY_COLORS = [
  "bg-[#e63946]",
  "bg-[#1d3557]",
  "bg-[#2a9d8f]",
  "bg-[#e9c46a]",
];
const HAIR_STYLES = [
  "bg-[#2b1e1a]",
  "bg-[#18181b]",
  "bg-[#d97706]",
  "bg-[#94a3b8]",
];

interface Fighter {
  name: string;
  location: string;
  hp: number;
  maxHp: number;
  itemName: string;
  rightItemIcon: string;
  leftItemIcon: string;
  bodyColor: string;
  hairColor: string;
}

function BattleContent() {
  const searchParams = useSearchParams();

  // 1. プレイヤー状態（クエリパラメータから取得して動的更新）
  const [player, setPlayer] = useState<Fighter>({
    name: "ゆうしゃ",
    location: "石川県",
    hp: 100,
    maxHp: 100,
    itemName: "金箔のつるぎ",
    rightItemIcon: "✨🗡️",
    leftItemIcon: "✨🛡️",
    bodyColor: "bg-[#e63946]",
    hairColor: "bg-[#2b1e1a]",
  });

  // 2. 敵状態（指定通り固定）
  const [enemy, setEnemy] = useState<Fighter>({
    name: "たろう",
    location: "青森県",
    hp: 100,
    maxHp: 100,
    itemName: "りんごのつるぎ",
    rightItemIcon: "🍎🗡️",
    leftItemIcon: "🍎",
    bodyColor: "bg-[#1d3557]",
    hairColor: "bg-[#d97706]",
  });

  // URLからプレイヤーの情報を取得して反映
  useEffect(() => {
    const queryName = searchParams.get("name") || "ゆうしゃ";
    const queryLocation = searchParams.get("location") || "石川県";
    const hairIdx = parseInt(searchParams.get("hair") || "0", 10);
    const bodyIdx = parseInt(searchParams.get("body") || "0", 10);

    const item = REGIONAL_ITEMS[queryLocation] || DEFAULT_ITEM;

    setPlayer({
      name: queryName,
      location: queryLocation,
      hp: 100,
      maxHp: 100,
      itemName: item.name,
      rightItemIcon: item.rightIcon,
      leftItemIcon: item.leftIcon,
      bodyColor: BODY_COLORS[bodyIdx] || BODY_COLORS[0],
      hairColor: HAIR_STYLES[hairIdx] || HAIR_STYLES[0],
    });
  }, [searchParams]);

  const [logs, setLogs] = useState<string[]>([
    `${enemy.location}の ${enemy.name} が あらわれた！`,
    `コマンドを えらんでね！`,
  ]);
  const [isBattleEnd, setIsBattleEnd] = useState(false);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-3), msg]);
  };

  const handleAttack = () => {
    if (isBattleEnd) return;

    const damage = Math.floor(Math.random() * 15) + 15;
    const newEnemyHp = Math.max(0, enemy.hp - damage);
    setEnemy((prev) => ({ ...prev, hp: newEnemyHp }));
    addLog(
      `${player.name} の こうげき！ ${enemy.name} に ${damage} のダメージ！`,
    );

    if (newEnemyHp === 0) {
      addLog(`かんぜんしょうり！ ${enemy.name} を たおした！`);
      setIsBattleEnd(true);
      return;
    }

    setTimeout(() => {
      const enemyDamage = Math.floor(Math.random() * 12) + 10;
      setPlayer((prev) => {
        const newPlayerHp = Math.max(0, prev.hp - enemyDamage);
        if (newPlayerHp === 0) {
          addLog(`${player.name} は たおれてしまった…`);
          setIsBattleEnd(true);
        }
        return { ...prev, hp: newPlayerHp };
      });
      addLog(
        `${enemy.name} の はんげき！ ${player.name} は ${enemyDamage} のダメージ！`,
      );
    }, 800);
  };

  const handleSpecialSkill = () => {
    if (isBattleEnd) return;

    const damage = Math.floor(Math.random() * 20) + 25;
    const newEnemyHp = Math.max(0, enemy.hp - damage);
    setEnemy((prev) => ({ ...prev, hp: newEnemyHp }));
    addLog(`${player.name} は 【${player.itemName}】 のひっさつわざ！`);
    addLog(`${enemy.name} に ${damage} の だいだめーじ！`);

    if (newEnemyHp === 0) {
      addLog(`かんぜんしょうり！ ${enemy.name} を たおした！`);
      setIsBattleEnd(true);
      return;
    }

    setTimeout(() => {
      const enemyDamage = Math.floor(Math.random() * 12) + 10;
      setPlayer((prev) => {
        const newPlayerHp = Math.max(0, prev.hp - enemyDamage);
        if (newPlayerHp === 0) {
          addLog(`${player.name} は たおれてしまった…`);
          setIsBattleEnd(true);
        }
        return { ...prev, hp: newPlayerHp };
      });
      addLog(
        `${enemy.name} の こうげき！ ${player.name} は ${enemyDamage} のダメージ！`,
      );
    }, 800);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1e293b] p-2 font-mono selection:bg-[#e11d48] selection:text-white">
      <div className="relative flex min-h-[750px] w-full max-w-[420px] flex-col justify-between overflow-hidden rounded-2xl border-4 border-[#0f172a] bg-[#fef08a] p-4 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        {/* ヘッダー */}
        <div className="mb-3 flex items-center justify-between rounded-lg border-2 border-black bg-[#0f172a] p-2 text-white">
          <Link
            href="/start"
            className="rounded border border-white/40 bg-[#334155] px-2 py-1 text-xs hover:bg-[#475569]"
          >
            ◀ にげる
          </Link>
          <h1 className="text-sm font-bold tracking-wider text-[#ef4444]">
            ⚔️ すれちがいバトル
          </h1>
          <div className="w-12"></div>
        </div>

        {/* 1. 対戦ステージ */}
        <div className="relative mb-4 flex min-h-[360px] flex-1 flex-col justify-between rounded-xl border-4 border-[#0f172a] bg-[#7dd3fc] p-4 shadow-inner">
          {/* ライバル（敵） */}
          <div className="flex items-start justify-between">
            <div className="w-48 rounded-lg border-2 border-black bg-[#0f172a] p-2.5 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
              <div className="flex justify-between text-[11px] font-bold text-[#facc15]">
                <span>{enemy.name}</span>
                <span>{enemy.location}</span>
              </div>
              <div className="relative mt-1.5 h-3.5 w-full overflow-hidden rounded-full border border-black bg-slate-700">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                ></div>
              </div>
              <div className="mt-1 text-right text-[10px] font-bold text-slate-300">
                HP {enemy.hp}/{enemy.maxHp}
              </div>
            </div>

            <div className="mt-2 mr-2 origin-top-right scale-110">
              <AvatarGraphic fighter={enemy} isEnemy={true} />
            </div>
          </div>

          {/* 中央 VS ロゴ */}
          <div className="my-3 self-center rounded-lg border-3 border-black bg-[#facc15] px-4 py-1 text-sm font-black tracking-widest text-[#0f172a] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            VS
          </div>

          {/* プレイヤー（自分） */}
          <div className="flex items-end justify-between">
            <div className="mb-2 ml-2 origin-bottom-left scale-110">
              <AvatarGraphic fighter={player} isEnemy={false} />
            </div>

            <div className="w-48 rounded-lg border-2 border-black bg-[#0f172a] p-2.5 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
              <div className="flex justify-between text-[11px] font-bold text-[#facc15]">
                <span>{player.name}</span>
                <span>{player.location}</span>
              </div>
              <div className="relative mt-1.5 h-3.5 w-full overflow-hidden rounded-full border border-black bg-slate-700">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                ></div>
              </div>
              <div className="mt-1 text-right text-[10px] font-bold text-slate-300">
                HP {player.hp}/{player.maxHp}
              </div>
            </div>
          </div>
        </div>

        {/* 2. ログ */}
        <div className="mb-3 flex h-24 flex-col justify-end overflow-hidden rounded-xl border-4 border-[#0f172a] bg-[#1e293b] p-3 text-xs leading-relaxed text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          {logs.map((log, index) => (
            <p key={index}>▶ {log}</p>
          ))}
        </div>

        {/* 3. コマンド */}
        {!isBattleEnd ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAttack}
              className="cursor-pointer rounded-xl border-4 border-[#0f172a] bg-[#ef4444] py-3.5 text-xs font-black text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-[#dc2626] active:translate-y-0.5"
            >
              ⚔️ こうげき
            </button>
            <button
              onClick={handleSpecialSkill}
              className="flex cursor-pointer items-center justify-center gap-1 rounded-xl border-4 border-[#0f172a] bg-[#f59e0b] py-3.5 text-xs font-black text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-[#d97706] active:translate-y-0.5"
            >
              <span>{player.rightItemIcon}</span> ご当地わざ
            </button>
          </div>
        ) : (
          <Link
            href="/start"
            className="block w-full rounded-xl border-4 border-[#0f172a] bg-[#3b82f6] py-3.5 text-center text-xs font-black tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-[#2563eb] active:translate-y-0.5"
          >
            ひろばへ もどる ➔
          </Link>
        )}
      </div>
    </main>
  );
}

export default function BattlePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#1e293b] text-white">
          Loading...
        </div>
      }
    >
      <BattleContent />
    </Suspense>
  );
}

// ドットアバター描画コンポーネント
function AvatarGraphic({
  fighter,
  isEnemy,
}: {
  fighter: Fighter;
  isEnemy: boolean;
}) {
  return (
    <div
      className={`relative flex scale-125 flex-col items-center justify-center ${isEnemy ? "-scale-x-125" : ""}`}
    >
      <div
        className={`relative h-12 w-16 ${fighter.hairColor} flex flex-col justify-end border-2 border-black p-0.5`}
      >
        <div className="relative z-10 flex h-8 w-full items-center justify-around border-2 border-black bg-[#f8c39d] px-1">
          <div className="h-2.5 w-2.5 bg-black"></div>
          <div className="h-2.5 w-2.5 bg-black"></div>
        </div>
      </div>

      <div className="relative flex items-center">
        {/* 左手 ＋ アイテム */}
        <div className="relative flex items-center">
          <div className="h-8 w-2.5 border-y-2 border-l-2 border-black bg-[#2b1e1a]"></div>
          <div className="absolute -top-3 -left-3 z-25 flex items-center justify-center">
            <span className="text-sm drop-shadow-[1px_1px_0px_#000]">
              {fighter.leftItemIcon}
            </span>
          </div>
        </div>

        {/* 胴体 */}
        <div
          className={`h-10 w-12 ${fighter.bodyColor} flex justify-center border-2 border-black`}
        >
          <div className="h-full w-4 border-x-2 border-black/20 bg-white"></div>
        </div>

        {/* 右手 ＋ アイテム */}
        <div className="relative flex items-center">
          <div className="h-8 w-2.5 border-y-2 border-r-2 border-black bg-[#2b1e1a]"></div>
          <div className="absolute -top-4 -left-1 z-20 flex items-center justify-center">
            <span className="text-base drop-shadow-[1px_1px_0px_#000]">
              {fighter.rightItemIcon}
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-12 justify-around gap-2">
        <div className="h-5 w-3 border-x-2 border-b-2 border-black bg-[#18181b]"></div>
        <div className="h-5 w-3 border-x-2 border-b-2 border-black bg-[#18181b]"></div>
      </div>
    </div>
  );
}
