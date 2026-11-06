"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFooter } from "@/components/ui/AppFooter";
import { useAuth } from "@/features/auth";
import { AvatarSprite } from "@/features/avatar";
import type { EncounterHistoryEntry, PublicProfile } from "@/types/database";

/** 広場に表示する最大人数（立ち位置の数） */
const MAX_VISITORS = 8;

/** キャラクターの立ち位置（広場の中の % 位置。噴水と重ならないように配置） */
const VISITOR_SPOTS = [
  { top: 30, left: 18 },
  { top: 30, left: 82 },
  { top: 47, left: 22 },
  { top: 47, left: 78 },
  { top: 66, left: 14 },
  { top: 66, left: 86 },
  { top: 56, left: 50 },
  { top: 74, left: 50 },
];

export default function ParkPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [history, setHistory] = useState<EncounterHistoryEntry[] | null>(null);
  const [selected, setSelected] = useState<PublicProfile | null>(null);

  // 未ログインならログイン画面へ。ログイン済みならすれ違い履歴を読み込む
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    fetch("/api/encounters?limit=100")
      .then((res) => (res.ok ? res.json() : []))
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [loading, user, router]);

  // すれ違った人（重複なし・新しい順）。退会したユーザーは除く
  const partners = useMemo(() => {
    const seen = new Map<string, PublicProfile>();
    for (const entry of history ?? []) {
      if (entry.partner && !seen.has(entry.partner.id)) {
        seen.set(entry.partner.id, entry.partner);
      }
    }
    return [...seen.values()];
  }, [history]);

  const visitors = partners.slice(0, MAX_VISITORS);

  const startBattle = (partner: PublicProfile) => {
    router.push(`/battle?opponent=${encodeURIComponent(partner.id)}`);
  };

  return (
    <main className="park-shell">
      <section className="park-screen" aria-label="すれちがい広場">
        <header className="game-header">
          <div className="player-emblem" aria-hidden="true">
            勇
          </div>
          <div className="header-player">
            <p>ご当地ハンター</p>
            <span>RANK 12</span>
          </div>
        </header>

        <section className="plaza-title">
          <p>CROSSING PLAZA</p>
          <div>
            <h1>すれちがい広場</h1>
            <span>
              <strong>{history === null ? "-" : partners.length}</strong>
              人とすれちがいました
            </span>
          </div>
        </section>

        <section className="park-scene" aria-label="広場のようす">
          <div className="scene-sky" />
          <div className="sun" aria-hidden="true" />
          <svg
            className="mountains"
            viewBox="0 0 390 155"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 106 76 8l47 67 34-28 75 108H0Z" fill="#467e83" />
            <path d="m76 8 20 32 19 35-39-22-17 8Z" fill="#789f9a" />
            <path d="m157 47 20 29-34-12-19 11Z" fill="#a2c6a0" />
            <path
              d="M0 119 83 90l49 19 54-22 70 33 54-23 80 22v36H0Z"
              fill="#347477"
            />
            <path d="M0 127h390v28H0z" fill="#78a88a" />
          </svg>
          <div className="distant-trees" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="grass-pattern" aria-hidden="true" />
          <div className="cross-path" aria-hidden="true" />
          <div className="main-path" aria-hidden="true" />
          <div className="fountain" aria-label="広場の噴水">
            <span className="fountain-water" />
            <span className="fountain-spray" />
          </div>

          {/* すれ違った人のキャラクター（styled-jsx のスコープを効かせるためこのコンポーネント内に書く） */}
          {visitors.map((partner, index) => {
            const spot = VISITOR_SPOTS[index];
            return (
              <button
                key={partner.id}
                type="button"
                className="visitor"
                style={{ top: `${spot.top}%`, left: `${spot.left}%` }}
                onClick={() => setSelected(partner)}
                aria-label={`${partner.nickname}さん`}
              >
                {/* キャラクター作成で作ったアバター（未作成の人はデフォルトの見た目） */}
                <span className="visitor-sprite">
                  <AvatarSprite avatar={partner.avatar} scale={0.55} />
                </span>
                <span className="visitor-message">
                  {partner.home_area ?? "出身地ふめい"}
                </span>
                <span className="visitor-name">{partner.nickname}</span>
              </button>
            );
          })}

          {history !== null && partners.length === 0 && (
            <p className="empty-message">
              まだ だれとも すれちがっていません
              <br />
              まちに でかけて すれちがおう！
            </p>
          )}
        </section>

        {/* 画面切り替えは共通フッターを使う */}
        <AppFooter className="shrink-0" />

        {/* 戦闘の確認ポップアップ */}
        {selected && (
          <div
            className="battle-confirm-backdrop"
            onClick={() => setSelected(null)}
          >
            <div
              className="battle-confirm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="battle-confirm-title"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="battle-confirm-area">
                {selected.home_area ?? "出身地ふめい"}
              </p>
              <p id="battle-confirm-title" className="battle-confirm-title">
                {selected.nickname}さんと
                <br />
                戦闘しますか？
              </p>
              <div className="battle-confirm-actions">
                <button
                  type="button"
                  className="confirm-yes"
                  onClick={() => startBattle(selected)}
                >
                  はい
                </button>
                <button
                  type="button"
                  className="confirm-no"
                  onClick={() => setSelected(null)}
                >
                  いいえ
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <style jsx>{`
        .park-shell {
          display: flex;
          min-height: 100dvh;
          justify-content: center;
          background: #101b2c;
        }

        .park-screen {
          position: relative;
          display: flex;
          width: min(100%, 430px);
          min-height: 100dvh;
          flex-direction: column;
          overflow: hidden;
          background: #f5d992;
          color: #17283b;
          box-shadow: 0 0 40px #070d18aa;
        }

        .game-header {
          z-index: 2;
          display: flex;
          height: 66px;
          flex: 0 0 66px;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-bottom: 4px solid #e24c42;
          background: #192b43;
          color: #fff3cc;
          box-shadow: inset 0 -3px #101c30;
        }

        .player-emblem {
          display: grid;
          flex: 0 0 auto;
          place-items: center;
          border: 3px solid #fff1b1;
          background: #e85a49;
          color: #fff5cd;
          box-shadow: 2px 2px 0 #111c2c;
          font-size: 19px;
          font-weight: 900;
        }

        .player-emblem {
          width: 40px;
          height: 40px;
        }

        .header-player {
          min-width: 0;
          flex: 1;
          font-size: 11px;
          font-weight: 700;
        }

        .header-player p {
          overflow: hidden;
          margin: 0 0 4px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .header-player span {
          padding: 1px 5px;
          background: #e7b749;
          color: #342d23;
          font-size: 8px;
        }

        .plaza-title {
          height: 54px;
          flex: 0 0 54px;
          padding: 5px 13px 6px;
          border-bottom: 4px solid #1b2c42;
          background-color: #f8e6b3;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 9px,
            #e6cc91 10px,
            transparent 11px
          );
        }

        .plaza-title > p {
          margin: 0 0 1px;
          color: #cb5141;
          font-family: monospace;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .plaza-title > div {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 6px;
        }

        .plaza-title h1 {
          margin: 0;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .plaza-title > div > span {
          font-size: 8px;
          white-space: nowrap;
        }

        .plaza-title strong {
          color: #e64e42;
          font-size: 15px;
        }

        .park-scene {
          position: relative;
          min-height: 340px;
          flex: 1 1 0;
          overflow: hidden;
          border-bottom: 4px solid #22374a;
          background: #b7dc8b;
          isolation: isolate;
        }

        .scene-sky {
          position: absolute;
          inset: 0 0 auto;
          height: 37%;
          background-color: #c5e79c;
          background-image:
            linear-gradient(
              30deg,
              transparent 48%,
              #89c782 49%,
              #89c782 50%,
              transparent 51%
            ),
            linear-gradient(
              -30deg,
              transparent 48%,
              #89c782 49%,
              #89c782 50%,
              transparent 51%
            );
          background-size: 28px 17px;
        }

        .sun {
          position: absolute;
          top: 5%;
          right: 10%;
          width: 58px;
          height: 58px;
          background: #fff0a1;
          box-shadow:
            0 -7px #fff0a1,
            0 7px #fff0a1,
            7px 0 #fff0a1,
            -7px 0 #fff0a1;
          clip-path: polygon(
            20% 0,
            80% 0,
            80% 10%,
            100% 10%,
            100% 80%,
            90% 80%,
            90% 100%,
            10% 100%,
            10% 90%,
            0 90%,
            0 20%,
            20% 20%
          );
        }

        .mountains {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 39%;
        }

        .distant-trees {
          position: absolute;
          top: 29%;
          left: 0;
          display: flex;
          width: 100%;
          height: 9%;
          align-items: end;
          justify-content: space-around;
        }

        .distant-trees i {
          width: 8%;
          height: 64%;
          background: #477a69;
          box-shadow:
            7px -7px 0 -1px #477a69,
            -6px -4px 0 -2px #477a69;
        }

        .distant-trees i:nth-child(2n) {
          height: 40%;
          background: #62916f;
        }

        .grass-pattern {
          position: absolute;
          z-index: -1;
          inset: 34% 0 0;
          background-color: #b8df8e;
          background-image:
            linear-gradient(
              30deg,
              transparent 48%,
              #89c782 49%,
              #89c782 50%,
              transparent 51%
            ),
            linear-gradient(
              -30deg,
              transparent 48%,
              #89c782 49%,
              #89c782 50%,
              transparent 51%
            );
          background-size: 28px 17px;
        }

        .cross-path {
          position: absolute;
          z-index: -1;
          top: 59%;
          right: -2%;
          left: -2%;
          height: 17%;
          border-top: 3px solid #c6944f;
          border-bottom: 3px solid #c6944f;
          background: repeating-linear-gradient(
            to bottom,
            #f1d290 0,
            #f1d290 8px,
            #eac57c 9px,
            #f1d290 10px
          );
        }

        .main-path {
          position: absolute;
          z-index: -1;
          top: 45%;
          bottom: 0;
          left: 42%;
          width: 17%;
          border-right: 3px solid #c6944f;
          border-left: 3px solid #c6944f;
          background: repeating-linear-gradient(
            to bottom,
            #f2d594 0,
            #f2d594 9px,
            #eac77f 10px,
            #f2d594 11px
          );
        }

        .fountain {
          position: absolute;
          z-index: 1;
          top: 41%;
          left: 50%;
          width: 66px;
          height: 43px;
          transform: translate(-50%, -50%);
          border: 4px solid #805b37;
          border-radius: 50%;
          background: #397c88;
          box-shadow:
            inset 0 -7px #e0b766,
            0 4px 0 #422f29,
            0 7px 0 #b99250;
        }

        .fountain-water {
          position: absolute;
          inset: 4px;
          border: 5px solid #b5eef0;
          border-radius: 50%;
          background: #61bbd0;
          box-shadow: inset 0 -4px #34899c;
        }

        .fountain-spray {
          position: absolute;
          top: -21px;
          left: 25px;
          width: 12px;
          height: 24px;
          background: #d4f4eb;
          box-shadow:
            -7px 7px 0 -2px #d4f4eb,
            7px 7px 0 -2px #d4f4eb,
            0 -3px 0 #fff;
        }

        .visitor {
          position: absolute;
          z-index: 2;
          display: flex;
          width: 82px;
          flex-direction: column;
          align-items: center;
          padding: 0;
          border: 0;
          background: transparent;
          font: inherit;
          cursor: pointer;
          transform: translateX(-50%);
        }

        .visitor:hover .visitor-sprite,
        .visitor:focus-visible .visitor-sprite {
          transform: translateY(-3px);
        }

        .visitor:focus-visible {
          outline: 2px dashed #e64e48;
          outline-offset: 2px;
        }

        /* AvatarSprite（幅約80px×高さ約110px）を 0.55 倍にして中央に置く */
        .visitor-sprite {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.1s;
          width: 46px;
          height: 62px;
          filter: drop-shadow(2px 2px 0 #29424955);
        }

        .visitor-message,
        .visitor-name {
          position: relative;
          z-index: 1;
          display: block;
          max-width: 82px;
          overflow: hidden;
          text-align: center;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .visitor-message {
          margin-top: 1px;
          padding: 2px 4px;
          border: 2px solid #61777a;
          background: #fff5d5;
          color: #33464b;
          font-size: 7px;
          font-weight: 700;
        }

        .visitor-name {
          margin-top: 3px;
          color: #263d43;
          font-size: 7px;
          font-weight: 700;
        }

        .empty-message {
          position: absolute;
          z-index: 3;
          top: 50%;
          left: 50%;
          width: 80%;
          margin: 0;
          padding: 10px;
          transform: translate(-50%, -50%);
          border: 3px solid #1b2c42;
          background: #fff5d5;
          box-shadow: 3px 3px 0 #1b2c42;
          color: #17283b;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.7;
          text-align: center;
        }

        .battle-confirm-backdrop {
          position: absolute;
          z-index: 10;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 24px;
          background: #070d18b3;
        }

        .battle-confirm {
          width: 100%;
          max-width: 300px;
          padding: 16px;
          border: 4px solid #fff1b1;
          border-top-width: 6px;
          border-top-color: #e24c42;
          background: #192b43;
          box-shadow: 4px 4px 0 #070d18;
          color: #fff3cc;
          text-align: center;
        }

        .battle-confirm-area {
          display: inline-block;
          margin: 0 0 10px;
          padding: 1px 8px;
          background: #e7b749;
          color: #342d23;
          font-size: 10px;
          font-weight: 700;
        }

        .battle-confirm-title {
          margin: 0 0 16px;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.6;
        }

        .battle-confirm-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .battle-confirm-actions button {
          height: 42px;
          border: 3px solid #fff0c4;
          color: #fff6d8;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 2px;
          box-shadow: 2px 3px 0 #0e1c2d;
        }

        .battle-confirm-actions button:active {
          transform: translate(2px, 2px);
          box-shadow: none;
        }

        .confirm-yes {
          background: #e95749;
        }

        .confirm-no {
          background: #40536a;
        }

        @media (max-height: 650px) {
          .park-screen {
            min-height: 650px;
          }

          .park-shell {
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}
