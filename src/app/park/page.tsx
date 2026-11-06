"use client";

import { useState } from "react";

const navigationItems = [
  { id: "home", label: "ホーム", icon: "◆" },
  { id: "items", label: "アイテム", icon: "▣" },
  { id: "history", label: "すれ違い", icon: "▤" },
  { id: "settings", label: "設定", icon: "●" },
  { id: "character", label: "キャラ", icon: "♟" },
] as const;

function PixelVisitor({
  className,
  name,
  message,
  color,
  hasSword = true,
}: {
  className: string;
  name: string;
  message: string;
  color: string;
  hasSword?: boolean;
}) {
  return (
    <div className={`visitor ${className}`}>
      <div className="visitor-sprite" aria-hidden="true">
        <div className="sprite-hair" />
        <div className="sprite-face" />
        <div className="sprite-body" style={{ backgroundColor: color }} />
        {hasSword && (
          <svg
            className="sprite-sword"
            viewBox="0 0 24 48"
            aria-hidden="true"
          >
            <path d="M16 2h6v27h-6z" fill="#f3f5e8" />
            <path d="M16 2h2v27h-2z" fill="#93b9bd" />
            <path d="M13 28h12v5H13z" fill="#57402d" />
            <path d="M17 33h4v13h-4z" fill="#d2a851" />
          </svg>
        )}
      </div>
      <span className="visitor-message">{message}</span>
      <span className="visitor-name">{name}</span>
    </div>
  );
}

export default function ParkPage() {
  const [activeTab, setActiveTab] = useState<(typeof navigationItems)[number]["id"]>(
    "home",
  );
  const [isBattling, setIsBattling] = useState(false);

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
          <div className="header-stats" aria-label="所持コインとポイント">
            <span>
              <b>G</b> 12,480
            </span>
            <span>
              <b className="blue-stat">◆</b> 24
            </span>
          </div>
        </header>

        <div className="announcement">
          <span>お知らせ</span>
          <p>東京エリアですれちがいボーナス発生中！</p>
          <b aria-hidden="true">›</b>
        </div>

        <section className="plaza-title">
          <p>CROSSING PLAZA</p>
          <div>
            <h1>すれちがい広場</h1>
            <span>
              <strong>4</strong>人とすれちがいました
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
            <path d="M0 119 83 90l49 19 54-22 70 33 54-23 80 22v36H0Z" fill="#347477" />
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

          <PixelVisitor
            className="visitor-one"
            name="なにお侍"
            message="おみやげ"
            color="#ef5f54"
          />
          <PixelVisitor
            className="visitor-two"
            name="花まるナイト"
            message="宝箱をゲット"
            color="#3487a0"
          />
          <PixelVisitor
            className="visitor-three"
            name="ぽぽた"
            message="新しい人"
            color="#dfa83e"
          />
          <PixelVisitor
            className="visitor-four"
            name="信州リンゴ"
            message="長野県"
            color="#56aa83"
          />
          <div className="you-marker" aria-label="あなたの位置">
            ▼
          </div>
        </section>

        <section className="battle-panel">
          <div className="battle-profile">
            <div className="battle-avatar" aria-hidden="true">
              大
            </div>
            <div>
              <span>大阪府・Lv.18</span>
              <strong>なにお侍</strong>
              <small>旅先で出会った冒険者</small>
            </div>
          </div>
          <button
            className={`battle-button${isBattling ? " is-battling" : ""}`}
            onClick={() => setIsBattling((current) => !current)}
            type="button"
          >
            <strong>{isBattling ? "待機中" : "戦闘"}</strong>
            <span>{isBattling ? "TAP TO CANCEL" : "START!"}</span>
          </button>
        </section>

        <div className="bottom-paper" aria-hidden="true">
          <span />
        </div>

        <nav className="bottom-nav" aria-label="メインメニュー">
          {navigationItems.map((item) => (
            <button
              aria-current={activeTab === item.id ? "page" : undefined}
              className={activeTab === item.id ? "active" : ""}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              type="button"
            >
              <span className={`nav-icon icon-${item.id}`} aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </section>

      <style jsx>{`
        .park-shell {
          display: flex;
          min-height: 100dvh;
          justify-content: center;
          background: #101b2c;
        }

        .park-screen {
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

        .player-emblem,
        .battle-avatar {
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

        .header-stats {
          display: grid;
          width: 88px;
          gap: 3px;
          font-size: 9px;
          font-weight: 700;
          text-align: right;
        }

        .header-stats span {
          display: flex;
          justify-content: space-between;
          padding: 2px 5px;
          border: 1px solid #648093;
          background: #101d31;
        }

        .header-stats b {
          color: #f4c54b;
        }

        .header-stats .blue-stat {
          color: #7bc5dc;
        }

        .announcement {
          display: flex;
          height: 27px;
          flex: 0 0 27px;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          border-bottom: 1px solid #c99c4d;
          background: #fff0c8;
          font-size: 8px;
        }

        .announcement > span {
          flex: 0 0 auto;
          color: #c7473b;
          font-weight: 900;
        }

        .announcement p {
          flex: 1;
          margin: 0;
        }

        .announcement b {
          color: #d54b3e;
          font-size: 17px;
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
            linear-gradient(30deg, transparent 48%, #89c782 49%, #89c782 50%, transparent 51%),
            linear-gradient(-30deg, transparent 48%, #89c782 49%, #89c782 50%, transparent 51%);
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
          box-shadow: 7px -7px 0 -1px #477a69, -6px -4px 0 -2px #477a69;
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
            linear-gradient(30deg, transparent 48%, #89c782 49%, #89c782 50%, transparent 51%),
            linear-gradient(-30deg, transparent 48%, #89c782 49%, #89c782 50%, transparent 51%);
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
        }

        .visitor-one {
          top: 34%;
          left: 5%;
        }

        .visitor-two {
          top: 30%;
          right: 5%;
        }

        .visitor-three {
          top: 67%;
          left: 10%;
        }

        .visitor-four {
          top: 69%;
          right: 7%;
        }

        .visitor-sprite {
          position: relative;
          width: 42px;
          height: 59px;
          filter: drop-shadow(2px 2px 0 #29424955);
        }

        .sprite-hair {
          position: absolute;
          top: 1px;
          left: 7px;
          width: 27px;
          height: 13px;
          border: 4px solid #342636;
          background: #644052;
          box-shadow: inset 0 -4px #c08b3c;
        }

        .sprite-face {
          position: absolute;
          top: 14px;
          left: 11px;
          width: 19px;
          height: 14px;
          border: 2px solid #47312d;
          background: #f2bd79;
        }

        .sprite-body {
          position: absolute;
          top: 28px;
          left: 6px;
          width: 31px;
          height: 26px;
          border: 3px solid #4a3b3a;
          box-shadow: inset 0 -5px #00000020;
        }

        .sprite-sword {
          position: absolute;
          top: 25px;
          left: 29px;
          width: 22px;
          height: 46px;
          transform: rotate(28deg);
          filter: drop-shadow(1px 1px #332c29);
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

        .visitor-one .visitor-message {
          border-color: #a44c41;
          background: #eb6453;
          color: #fff4d5;
        }

        .visitor-name {
          margin-top: 3px;
          color: #263d43;
          font-size: 7px;
          font-weight: 700;
        }

        .you-marker {
          position: absolute;
          z-index: 3;
          top: 31%;
          left: 14%;
          color: #e64e48;
          font-size: 17px;
          text-shadow: 1px 1px #f7e1a3;
        }

        .battle-panel {
          display: flex;
          min-height: 88px;
          flex: 0 0 88px;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px;
          border-top: 4px solid #e25347;
          border-bottom: 4px solid #405667;
          background: #1a2e47;
          color: #fff1c7;
        }

        .battle-profile {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 9px;
        }

        .battle-avatar {
          width: 43px;
          height: 43px;
          font-size: 22px;
        }

        .battle-profile > div:last-child {
          display: grid;
          gap: 2px;
        }

        .battle-profile span,
        .battle-profile small {
          color: #d4c79f;
          font-size: 7px;
        }

        .battle-profile strong {
          font-size: 13px;
        }

        .battle-button {
          display: grid;
          width: 78px;
          height: 48px;
          flex: 0 0 78px;
          align-content: center;
          border: 3px solid #fff0c4;
          background: #e95749;
          color: #fff6d8;
          box-shadow:
            inset 0 0 0 2px #bf3d38,
            2px 3px 0 #0e1c2d;
          cursor: pointer;
          text-align: center;
        }

        .battle-button:active {
          transform: translate(2px, 2px);
          box-shadow: inset 0 0 0 2px #bf3d38;
        }

        .battle-button strong {
          font-size: 16px;
          letter-spacing: 2px;
        }

        .battle-button span {
          font-family: monospace;
          font-size: 6px;
        }

        .battle-button.is-battling {
          border-color: #b6e0d2;
          background: #347b80;
        }

        .bottom-paper {
          position: relative;
          min-height: 32px;
          flex: 1 1 32px;
          background-color: #f4d897;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 8px,
            #e5c783 9px,
            transparent 10px
          );
        }

        .bottom-paper span {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 20%;
          height: 4px;
          background: #e8ba47;
        }

        .bottom-nav {
          z-index: 4;
          display: grid;
          height: 62px;
          flex: 0 0 62px;
          grid-template-columns: repeat(5, 1fr);
          border-top: 3px solid #394d62;
          background: #1a2e47;
          box-shadow: 0 -3px #e25347;
        }

        .bottom-nav button {
          display: flex;
          min-width: 0;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          border: 0;
          border-right: 1px solid #40536a;
          background: transparent;
          color: #d4d7ce;
          cursor: pointer;
          font-size: 8px;
        }

        .bottom-nav button.active {
          background: #29425c;
          color: #fff2c7;
        }

        .bottom-nav button.active::before {
          position: absolute;
          width: 8px;
          height: 8px;
          margin-top: -52px;
          transform: rotate(45deg);
          background: #efbd4c;
          content: "";
        }

        .nav-icon {
          color: #f0c14b;
          font-size: 15px;
          line-height: 1;
        }

        .icon-items {
          font-size: 14px;
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