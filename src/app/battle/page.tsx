"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AvatarSprite } from "@/features/avatar";
import {
  BATTLE_RULES,
  canUse,
  chooseEnemyAction,
  createBattle,
  resolveTurn,
  type BattleAction,
  type BattleNames,
  type BattleState,
  type FighterState,
} from "@/features/battle";
import type {
  BattleFighter,
  BattleResultResponse,
  BattleSetupResponse,
} from "@/types/database";

/** ログを 1 行ずつ出す間隔 */
const LOG_STEP_MS = 450;
/** ログ欄に残す行数 */
const LOG_LINES = 4;

type SaveState =
  | { status: "idle" | "saving" }
  | { status: "saved"; result: BattleResultResponse }
  | { status: "error" };

export default function BattlePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#1e293b] text-white">
          よみこみ中...
        </div>
      }
    >
      <BattleContent />
    </Suspense>
  );
}

function BattleContent() {
  const router = useRouter();
  const opponentId = useSearchParams().get("opponent") ?? "";

  const [setup, setSetup] = useState<BattleSetupResponse | null>(null);
  const [loadError, setLoadError] = useState("");
  const [battle, setBattle] = useState<BattleState>(createBattle);
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  /** ダメージ演出をやり直すためのカウンター */
  const [hits, setHits] = useState({ player: 0, enemy: 0 });
  const [save, setSave] = useState<SaveState>({ status: "idle" });
  const timers = useRef<number[]>([]);

  // 自分と敵（すれ違った相手）のデータを読み込む
  useEffect(() => {
    if (!opponentId) {
      setLoadError("たたかう あいてが えらばれていません");
      return;
    }
    let cancelled = false;
    fetch(`/api/battles/setup?opponent=${encodeURIComponent(opponentId)}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.status === 403) {
          throw new Error("すれちがった ことのない あいてとは たたかえません");
        }
        if (!res.ok) throw new Error("データを よみこめませんでした");
        const data = (await res.json()) as BattleSetupResponse;
        if (cancelled) return;
        setSetup(data);
        setLogs([
          `${data.enemy.profile.home_area ?? "なぞの ちいき"}の ${data.enemy.profile.nickname} が あらわれた！`,
          "コマンドを えらんでね！",
        ]);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "通信に失敗しました");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [opponentId, router]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  // 決着したら結果をサーバーに記録する（1 バトル 1 回）
  useEffect(() => {
    if (!battle.winner || !setup || save.status !== "idle") return;
    setSave({ status: "saving" });
    fetch("/api/battles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opponentId: setup.enemy.profile.id,
        won: battle.winner === "player",
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const result = (await res.json()) as BattleResultResponse;
        setSave({ status: "saved", result });
      })
      .catch(() => setSave({ status: "error" }));
  }, [battle.winner, setup, save.status]);

  const act = useCallback(
    (action: BattleAction) => {
      if (!setup || busy || battle.winner) return;
      const names: BattleNames = {
        player: setup.player.profile.nickname,
        enemy: setup.enemy.profile.nickname,
        playerMove: setup.player.move.name,
        enemyMove: setup.enemy.move.name,
      };
      const enemyAction = chooseEnemyAction(battle, Math.random);
      const turn = resolveTurn(battle, action, enemyAction, names, Math.random);

      // ログを 1 行ずつ流し、流し終わってから HP などを反映する
      setBusy(true);
      turn.log.forEach((line, i) => {
        timers.current.push(
          window.setTimeout(
            () => setLogs((prev) => [...prev, line].slice(-LOG_LINES)),
            i * LOG_STEP_MS,
          ),
        );
      });
      timers.current.push(
        window.setTimeout(
          () => {
            setBattle(turn.state);
            setHits((prev) => ({
              player: prev.player + (turn.hit.player > 0 ? 1 : 0),
              enemy: prev.enemy + (turn.hit.enemy > 0 ? 1 : 0),
            }));
            setBusy(false);
          },
          Math.max(0, turn.log.length - 1) * LOG_STEP_MS,
        ),
      );
    },
    [setup, busy, battle],
  );

  const restart = () => {
    if (!setup) return;
    setBattle(createBattle());
    setSave({ status: "idle" });
    setLogs([`${setup.enemy.profile.nickname} が また あらわれた！`]);
  };

  if (loadError) {
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm font-bold text-[#0f172a]">{loadError}</p>
          <Link
            href="/park"
            className="rounded-xl border-4 border-[#0f172a] bg-[#3b82f6] px-6 py-3 text-xs font-black text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
          >
            ひろばへ もどる
          </Link>
        </div>
      </Shell>
    );
  }

  if (!setup) {
    return (
      <Shell>
        <p className="flex flex-1 items-center justify-center text-sm font-bold text-[#0f172a]">
          あいてを さがしています…
        </p>
      </Shell>
    );
  }

  const { player, enemy } = battle;

  return (
    <Shell>
      {/* 対戦ステージ */}
      <div className="relative mb-3 flex min-h-[360px] flex-1 flex-col justify-between rounded-xl border-4 border-[#0f172a] bg-[#7dd3fc] p-3 shadow-inner">
        <div className="flex items-start justify-between gap-2">
          <StatusPanel fighter={setup.enemy} state={enemy} />
          <FighterSprite
            fighter={setup.enemy}
            hitKey={hits.enemy}
            mirrored
            down={battle.winner === "player"}
          />
        </div>

        <div className="my-2 self-center rounded-lg border-[3px] border-black bg-[#facc15] px-4 py-1 text-sm font-black tracking-widest text-[#0f172a] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          TURN {battle.turn}
        </div>

        <div className="flex items-end justify-between gap-2">
          <FighterSprite
            fighter={setup.player}
            hitKey={hits.player}
            down={battle.winner === "enemy"}
          />
          <StatusPanel fighter={setup.player} state={player} />
        </div>
      </div>

      {/* ログ */}
      <div
        className="mb-3 flex h-24 flex-col justify-end overflow-hidden rounded-xl border-4 border-[#0f172a] bg-[#1e293b] p-3 text-xs leading-relaxed text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
        aria-live="polite"
      >
        {logs.map((log, index) => (
          <p key={`${index}-${log}`}>▶ {log}</p>
        ))}
      </div>

      {/* コマンド / 結果 */}
      {battle.winner ? (
        <ResultPanel
          won={battle.winner === "player"}
          enemyName={setup.enemy.profile.nickname}
          save={save}
          onRestart={restart}
        />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <CommandButton
            color="bg-[#ef4444] hover:bg-[#dc2626]"
            disabled={busy}
            onClick={() => act("attack")}
            title="⚔️ こうげき"
            sub={`エネルギー+${BATTLE_RULES.attack.energy}`}
          />
          <CommandButton
            color="bg-[#f59e0b] hover:bg-[#d97706]"
            disabled={busy || !canUse(player, "special")}
            onClick={() => act("special")}
            title={`${setup.player.move.icon} ご当地わざ`}
            sub={
              canUse(player, "special")
                ? setup.player.move.name
                : `エネルギー${BATTLE_RULES.special.cost}ひつよう`
            }
          />
          <CommandButton
            color="bg-[#2563eb] hover:bg-[#1d4ed8]"
            disabled={busy || !canUse(player, "guard")}
            onClick={() => act("guard")}
            title="🛡️ ガード"
            sub={`のこり ${player.guardsLeft}かい`}
          />
        </div>
      )}
    </Shell>
  );
}

/** 画面の外枠とヘッダー */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#1e293b] p-2 font-mono">
      <div className="relative flex min-h-[720px] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border-4 border-[#0f172a] bg-[#fef08a] p-3 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <div className="mb-3 flex items-center justify-between rounded-lg border-2 border-black bg-[#0f172a] p-2 text-white">
          <Link
            href="/park"
            className="rounded border border-white/40 bg-[#334155] px-2 py-1 text-xs hover:bg-[#475569]"
          >
            ◀ にげる
          </Link>
          <h1 className="text-sm font-bold tracking-wider text-[#ef4444]">
            ⚔️ すれちがいバトル
          </h1>
          <div className="w-12" />
        </div>
        {children}
      </div>
      <style jsx global>{`
        @keyframes battle-hit {
          0%,
          100% {
            transform: translateX(0);
            opacity: 1;
          }
          20% {
            transform: translateX(-6px);
            opacity: 0.3;
          }
          40% {
            transform: translateX(6px);
            opacity: 1;
          }
          60% {
            transform: translateX(-4px);
            opacity: 0.3;
          }
          80% {
            transform: translateX(4px);
          }
        }
        .battle-hit {
          animation: battle-hit 0.4s steps(5);
        }
      `}</style>
    </main>
  );
}

/** 名前・HP・エネルギー・ガード回数 */
function StatusPanel({
  fighter,
  state,
}: {
  fighter: BattleFighter;
  state: FighterState;
}) {
  const hpRate = state.hp / BATTLE_RULES.maxHp;
  const energyRate = state.energy / BATTLE_RULES.maxEnergy;
  const specialReady = state.energy >= BATTLE_RULES.special.cost;
  return (
    <div className="w-44 shrink-0 rounded-lg border-2 border-black bg-[#0f172a] p-2 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between gap-1 text-[11px] font-bold text-[#facc15]">
        <span className="truncate">{fighter.profile.nickname}</span>
        <span className="shrink-0">{fighter.profile.home_area ?? "？"}</span>
      </div>
      <Bar
        rate={hpRate}
        color={
          hpRate > 0.5
            ? "bg-emerald-400"
            : hpRate > 0.2
              ? "bg-yellow-400"
              : "bg-red-500"
        }
        label={`HP ${state.hp}/${BATTLE_RULES.maxHp}`}
      />
      <Bar
        rate={energyRate}
        color={specialReady ? "bg-orange-400" : "bg-sky-400"}
        label={`EN ${state.energy}`}
        thin
      />
      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-300">
        <span>
          {"🛡️".repeat(state.guardsLeft)}
          {state.guardsLeft === 0 && "ガードなし"}
        </span>
        {specialReady && (
          <span className="font-bold text-orange-300">わざOK!</span>
        )}
      </div>
    </div>
  );
}

function Bar({
  rate,
  color,
  label,
  thin = false,
}: {
  rate: number;
  color: string;
  label: string;
  thin?: boolean;
}) {
  return (
    <div className="mt-1">
      <div
        className={`relative w-full overflow-hidden rounded-full border border-black bg-slate-700 ${thin ? "h-2" : "h-3"}`}
      >
        <div
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${Math.max(0, Math.min(1, rate)) * 100}%` }}
        />
      </div>
      <div className="text-right text-[9px] font-bold text-slate-300">
        {label}
      </div>
    </div>
  );
}

/** アバターとご当地わざのアイテム */
function FighterSprite({
  fighter,
  hitKey,
  mirrored = false,
  down = false,
}: {
  fighter: BattleFighter;
  hitKey: number;
  mirrored?: boolean;
  down?: boolean;
}) {
  return (
    <div className="relative flex h-32 w-24 items-center justify-center">
      {/* 向き・倒れた表示と、ダメージ演出（transform を使う）は別の要素に分ける */}
      <div
        style={{
          transform: mirrored ? "scaleX(-1)" : undefined,
          opacity: down ? 0.35 : 1,
          filter: down ? "grayscale(1)" : undefined,
        }}
      >
        <div key={hitKey} className={hitKey > 0 ? "battle-hit" : ""}>
          <AvatarSprite avatar={fighter.profile.avatar} scale={1} />
        </div>
      </div>
      <span
        className="absolute -top-1 rounded border-2 border-black bg-white px-1 text-sm"
        style={mirrored ? { left: 0 } : { right: 0 }}
        title={fighter.move.name}
      >
        {fighter.move.icon}
      </span>
    </div>
  );
}

function CommandButton({
  title,
  sub,
  color,
  disabled,
  onClick,
}: {
  title: string;
  sub: string;
  color: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border-4 border-[#0f172a] px-1 py-2.5 text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none ${color}`}
    >
      <span className="text-xs font-black">{title}</span>
      <span className="w-full truncate text-[9px] font-bold opacity-90">
        {sub}
      </span>
    </button>
  );
}

function ResultPanel({
  won,
  enemyName,
  save,
  onRestart,
}: {
  won: boolean;
  enemyName: string;
  save: SaveState;
  onRestart: () => void;
}) {
  return (
    <div className="space-y-2">
      <div
        className={`rounded-xl border-4 border-[#0f172a] p-3 text-center ${won ? "bg-[#fde68a]" : "bg-slate-200"}`}
      >
        <p
          className={`text-lg font-black tracking-widest ${won ? "text-[#e11d48]" : "text-slate-700"}`}
        >
          {won ? "★ WIN! ★" : "LOSE…"}
        </p>
        {save.status === "saving" && (
          <p className="text-[11px] font-bold">きろく中…</p>
        )}
        {save.status === "error" && (
          <p className="text-[11px] font-bold text-red-700">
            けっかを きろくできませんでした
          </p>
        )}
        {save.status === "saved" &&
          (save.result.reward ? (
            <p className="text-xs font-bold">
              {enemyName}から
              <span className="mx-1 text-xl">{save.result.reward.icon}</span>
              <span className="text-[#ef4444]">{save.result.reward.name}</span>
              を てにいれた！
            </p>
          ) : (
            <p className="text-[11px] font-bold">
              {won
                ? `きょうは もう ${enemyName}から アイテムを もらっています`
                : "つぎは まけないぞ！"}
            </p>
          ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onRestart}
          disabled={save.status === "saving"}
          className="rounded-xl border-4 border-[#0f172a] bg-[#f59e0b] py-3 text-xs font-black text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 disabled:opacity-60"
        >
          もういちど
        </button>
        <Link
          href="/park"
          className="block rounded-xl border-4 border-[#0f172a] bg-[#3b82f6] py-3 text-center text-xs font-black text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5"
        >
          ひろばへ もどる
        </Link>
      </div>
    </div>
  );
}
