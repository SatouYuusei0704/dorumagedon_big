// BGM・ジングルの譜面と、効果音の選び方（ブラウザに依存しない部分。npm test でテストする）

/** 音色。pulse12 / pulse25 / pulse50 はファミコン風の矩形波（数字はデューティ比 %） */
export type Wave = "pulse12" | "pulse25" | "pulse50" | "triangle" | "noise";

/** [音名, 長さ（ステップ数）]。音名が null なら休符。音名は "C5" "F#4" "Bb3" の形 */
export type Note = readonly [string | null, number];

export type Part = {
  wave: Wave;
  /** 0〜1 */
  volume: number;
  notes: readonly Note[];
};

export type Track = {
  /** 1 分あたりの 4 分音符の数 */
  bpm: number;
  /** 4 分音符 1 つを何ステップに分けるか（2 なら 1 ステップ = 8 分音符） */
  stepsPerBeat: number;
  /** 最後まで行ったら最初に戻るか（BGM は true、ジングルは false） */
  loop: boolean;
  parts: readonly Part[];
};

const NOTE_INDEX: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

/** 音名を周波数（Hz）にする。A4 = 440Hz。読めない音名は null */
export function noteToFreq(name: string): number | null {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) return null;
  const [, letter, accidental, octave] = m;
  const semitone =
    NOTE_INDEX[letter] +
    (accidental === "#" ? 1 : accidental === "b" ? -1 : 0) +
    (Number(octave) + 1) * 12;
  // MIDI 番号 69 = A4
  return 440 * 2 ** ((semitone - 69) / 12);
}

/** パートの長さ（ステップ数） */
export function partLength(part: Part): number {
  return part.notes.reduce((sum, [, len]) => sum + len, 0);
}

/** トラックの長さ（秒） */
export function trackSeconds(track: Track): number {
  const steps = Math.max(...track.parts.map(partLength));
  return (steps * 60) / (track.bpm * track.stepsPerBeat);
}

/** ルート音と 5 度を 1 ステップずつ交互に鳴らすベース（1 小節 = 8 ステップ） */
function bounceBass(roots: readonly [string, string][]): Note[] {
  return roots.flatMap(([root, fifth]) =>
    Array.from({ length: 8 }, (_, i): Note => [i % 2 === 0 ? root : fifth, 1]),
  );
}

/** ドラム（ノイズ）。x = 強い音、o = 弱い音、- = 休み。1 文字 = 1 ステップ */
function drumPattern(pattern: string, bars: number): Note[] {
  const notes: Note[] = [];
  for (let b = 0; b < bars; b++) {
    for (const ch of pattern) {
      notes.push([ch === "x" ? "C6" : ch === "o" ? "C7" : null, 1]);
    }
  }
  return notes;
}

/** タイトル画面: ゆったりした曲 */
// prettier-ignore
const TITLE: Track = {
  bpm: 96,
  stepsPerBeat: 2,
  loop: true,
  parts: [
    {
      wave: "pulse25",
      volume: 0.5,
      notes: [
        ["C5", 2], ["E5", 2], ["G5", 4],
        ["A5", 2], ["G5", 2], ["E5", 4],
        ["F5", 2], ["E5", 2], ["D5", 2], ["E5", 2],
        ["C5", 6], [null, 2],
        ["C5", 2], ["E5", 2], ["G5", 4],
        ["C6", 2], ["B5", 2], ["A5", 4],
        ["G5", 2], ["F5", 2], ["D5", 2], ["B4", 2],
        ["C5", 6], [null, 2],
      ],
    },
    {
      wave: "triangle",
      volume: 0.7,
      notes: [
        ["C3", 8], ["A2", 8], ["G2", 8], ["C3", 8],
        ["C3", 8], ["F2", 8], ["G2", 8], ["C3", 8],
      ],
    },
  ],
};

/** ひろば・図鑑・ショップ・キャラクター画面: 明るい曲 */
// prettier-ignore
const PARK: Track = {
  bpm: 126,
  stepsPerBeat: 2,
  loop: true,
  parts: [
    {
      wave: "pulse50",
      volume: 0.38,
      notes: [
        ["E5", 2], ["G5", 2], ["C6", 2], ["G5", 2],
        ["A5", 2], ["G5", 2], ["E5", 4],
        ["F5", 2], ["A5", 2], ["D6", 2], ["A5", 2],
        ["G5", 6], [null, 2],
        ["E5", 2], ["G5", 2], ["C6", 2], ["E6", 2],
        ["D6", 2], ["C6", 2], ["A5", 4],
        ["B5", 2], ["G5", 2], ["A5", 2], ["B5", 2],
        ["C6", 6], [null, 2],
      ],
    },
    {
      wave: "triangle",
      volume: 0.7,
      notes: bounceBass([
        ["C3", "G3"], ["A2", "E3"], ["F2", "C3"], ["G2", "D3"],
        ["C3", "G3"], ["F2", "C3"], ["G2", "D3"], ["C3", "G3"],
      ]),
    },
    {
      wave: "noise",
      volume: 0.12,
      notes: drumPattern("x-o-x-o-", 8),
    },
  ],
};

/** バトル画面: 速くて緊張感のある曲 */
// prettier-ignore
const BATTLE: Track = {
  bpm: 160,
  stepsPerBeat: 2,
  loop: true,
  parts: [
    {
      wave: "pulse25",
      volume: 0.42,
      notes: [
        ["A5", 1], ["A5", 1], [null, 1], ["A5", 1], ["G5", 1], ["A5", 1], ["C6", 2],
        ["B5", 2], ["G5", 2], ["E5", 4],
        ["F5", 1], ["F5", 1], [null, 1], ["F5", 1], ["E5", 1], ["F5", 1], ["A5", 2],
        ["G#5", 2], ["E5", 2], ["B4", 4],
        ["A5", 1], ["A5", 1], [null, 1], ["A5", 1], ["G5", 1], ["A5", 1], ["C6", 2],
        ["D6", 2], ["C6", 2], ["B5", 2], ["A5", 2],
        ["F5", 2], ["G5", 2], ["A5", 2], ["B5", 2],
        ["G#5", 4], ["E5", 4],
      ],
    },
    {
      wave: "triangle",
      volume: 0.75,
      notes: bounceBass([
        ["A2", "A3"], ["E2", "E3"], ["F2", "F3"], ["E2", "E3"],
        ["A2", "A3"], ["D2", "D3"], ["F2", "F3"], ["E2", "E3"],
      ]),
    },
    {
      wave: "noise",
      volume: 0.14,
      notes: drumPattern("x-oox-oo", 8),
    },
  ],
};

/** 「すれちがい成功！」 */
// prettier-ignore
const ENCOUNTER: Track = {
  bpm: 150,
  stepsPerBeat: 4,
  loop: false,
  parts: [
    {
      wave: "pulse25",
      volume: 0.5,
      notes: [
        ["G5", 1], ["C6", 1], ["E6", 1], ["G6", 1],
        [null, 1], ["E6", 1], ["G6", 6],
      ],
    },
    {
      wave: "pulse12",
      volume: 0.3,
      notes: [
        ["E5", 1], ["G5", 1], ["C6", 1], ["E6", 1],
        [null, 1], ["C6", 1], ["E6", 6],
      ],
    },
    {
      wave: "triangle",
      volume: 0.7,
      notes: [["C3", 4], [null, 1], ["G2", 1], ["C3", 6]],
    },
  ],
};

/** バトルに勝った */
// prettier-ignore
const WIN: Track = {
  bpm: 150,
  stepsPerBeat: 2,
  loop: false,
  parts: [
    {
      wave: "pulse25",
      volume: 0.5,
      notes: [
        ["C5", 1], ["C5", 1], ["C5", 1], ["C5", 3],
        ["Ab4", 2], ["Bb4", 2], ["C5", 1], [null, 1], ["Bb4", 1], ["C5", 5],
      ],
    },
    {
      wave: "pulse12",
      volume: 0.3,
      notes: [
        ["G4", 1], ["G4", 1], ["G4", 1], ["G4", 3],
        ["Eb4", 2], ["F4", 2], ["G4", 1], [null, 1], ["F4", 1], ["E4", 5],
      ],
    },
    {
      wave: "triangle",
      volume: 0.7,
      notes: [
        ["C3", 6],
        ["Ab2", 2], ["Bb2", 2], ["C3", 8],
      ],
    },
  ],
};

/** バトルに負けた */
// prettier-ignore
const LOSE: Track = {
  bpm: 100,
  stepsPerBeat: 2,
  loop: false,
  parts: [
    {
      wave: "pulse25",
      volume: 0.45,
      notes: [["G4", 2], ["F#4", 2], ["F4", 2], ["E4", 6]],
    },
    {
      wave: "triangle",
      volume: 0.7,
      notes: [["C3", 2], ["B2", 2], ["Bb2", 2], ["A2", 6]],
    },
  ],
};

/** アイテムを てにいれた */
// prettier-ignore
const ITEM_GET: Track = {
  bpm: 140,
  stepsPerBeat: 4,
  loop: false,
  parts: [
    {
      wave: "pulse25",
      volume: 0.5,
      notes: [
        ["C5", 1], ["E5", 1], ["G5", 1], ["C6", 1],
        ["D5", 1], ["F#5", 1], ["A5", 1], ["D6", 1],
        ["G6", 6],
      ],
    },
    {
      wave: "triangle",
      volume: 0.7,
      notes: [["C3", 4], ["D3", 4], ["G2", 6]],
    },
  ],
};

export const BGM_TRACKS = { title: TITLE, park: PARK, battle: BATTLE } as const;
export const JINGLES = {
  encounter: ENCOUNTER,
  win: WIN,
  lose: LOSE,
  itemGet: ITEM_GET,
} as const;

export type BgmName = keyof typeof BGM_TRACKS;
export type JingleName = keyof typeof JINGLES;

/** 短い効果音の種類 */
export const SE_NAMES = [
  "cursor",
  "confirm",
  "cancel",
  "attack",
  "special",
  "hit",
  "guard",
  "heal",
  "powerup",
  "coin",
  "error",
] as const;
export type SeName = (typeof SE_NAMES)[number];

export function isSeName(value: unknown): value is SeName {
  return SE_NAMES.includes(value as SeName);
}

/** 画面ごとの BGM（null なら鳴らさない） */
export function bgmForPath(pathname: string): BgmName | null {
  if (pathname.startsWith("/battle")) return "battle";
  if (
    ["/park", "/collection", "/shop", "/status"].some((p) =>
      pathname.startsWith(p),
    )
  ) {
    return "park";
  }
  if (
    pathname === "/" ||
    ["/start", "/login", "/new_character"].some((p) => pathname.startsWith(p))
  ) {
    return "title";
  }
  return null;
}

/**
 * バトルのログ 1 行に合わせる効果音。ログの文言は engine.ts の resolveTurn が作る。
 * 決着の行は勝ち負けのジングルを鳴らすので null。
 */
export function seForBattleLog(line: string): SeName | null {
  if (line.includes("たおした") || line.includes("たおれて")) return null;
  if (line.includes("ご当地わざ【")) return "special";
  if (line.includes("ガードで") || line.includes("みをまもっている")) {
    return "guard";
  }
  // 「あたえるダメージが 3 あがった！」があるので、ダメージより先に見る
  if (line.includes("かいふく")) return "heal";
  if (line.includes("あがった")) return "powerup";
  if (line.includes("ダメージ")) return "hit";
  if (line.includes("の こうげき")) return "attack";
  if (line.includes("を つかった")) return "confirm";
  return null;
}
