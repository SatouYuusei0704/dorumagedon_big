// 譜面と効果音の選び方のテスト（npm test で実行）
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BGM_TRACKS,
  JINGLES,
  bgmForPath,
  noteToFreq,
  partLength,
  seForBattleLog,
  trackSeconds,
} from "./music.ts";

describe("noteToFreq", () => {
  it("A4 は 440Hz", () => {
    assert.equal(noteToFreq("A4"), 440);
  });

  it("1 オクターブ上で 2 倍、半音のシャープ・フラットも読める", () => {
    assert.equal(noteToFreq("A5"), 880);
    assert.ok(Math.abs(noteToFreq("C4")! - 261.63) < 0.01);
    assert.equal(noteToFreq("C#4"), noteToFreq("Db4"));
  });

  it("読めない音名は null", () => {
    assert.equal(noteToFreq("H4"), null);
    assert.equal(noteToFreq("C"), null);
  });
});

describe("譜面", () => {
  const all = { ...BGM_TRACKS, ...JINGLES };

  for (const [name, track] of Object.entries(all)) {
    it(`${name}: 音名がすべて読めて、長さが正`, () => {
      for (const part of track.parts) {
        for (const [note, len] of part.notes) {
          if (note !== null) assert.notEqual(noteToFreq(note), null, note);
          assert.ok(len > 0);
        }
      }
      assert.ok(trackSeconds(track) > 0);
    });
  }

  for (const [name, track] of Object.entries(BGM_TRACKS)) {
    it(`${name}: ループする BGM は全パートの長さがそろっている`, () => {
      assert.equal(track.loop, true);
      const lengths = new Set(track.parts.map(partLength));
      assert.equal(lengths.size, 1, [...lengths].join(","));
    });
  }

  it("ジングルはループしない", () => {
    for (const track of Object.values(JINGLES)) assert.equal(track.loop, false);
  });
});

describe("bgmForPath", () => {
  it("画面ごとに BGM を選ぶ", () => {
    assert.equal(bgmForPath("/start"), "title");
    assert.equal(bgmForPath("/login"), "title");
    assert.equal(bgmForPath("/park"), "park");
    assert.equal(bgmForPath("/shop"), "park");
    assert.equal(bgmForPath("/battle"), "battle");
    assert.equal(bgmForPath("/api/health"), null);
  });
});

describe("seForBattleLog", () => {
  it("バトルのログに合う効果音を選ぶ", () => {
    assert.equal(seForBattleLog("じぶん の こうげき！"), "attack");
    assert.equal(seForBattleLog("じぶん の ご当地わざ【金箔】！"), "special");
    assert.equal(seForBattleLog("あいて に 5 の ダメージ！"), "hit");
    assert.equal(seForBattleLog("あいて は ガードで ふせいだ！"), "guard");
    assert.equal(seForBattleLog("じぶん は みをまもっている！"), "guard");
    assert.equal(seForBattleLog("HPが 30 かいふくした！"), "heal");
    assert.equal(seForBattleLog("あたえるダメージが 3 あがった！"), "powerup");
    assert.equal(seForBattleLog("あいて を たおした！"), null);
  });
});
