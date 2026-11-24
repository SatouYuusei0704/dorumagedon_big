// Web Audio API でファミコン風の音をその場で合成して鳴らす（音声ファイルは使わない）
//
// ブラウザは「ユーザーが画面に触れるまで」音を出させてくれないので、
// 最初のタップで unlockSound() を呼んでから BGM を鳴らし始める。

import {
  BGM_TRACKS,
  JINGLES,
  noteToFreq,
  trackSeconds,
  type BgmName,
  type JingleName,
  type SeName,
  type Track,
  type Wave,
} from "./music";

const MUTED_KEY = "sound-muted";
const MASTER_VOLUME = 0.5;
const BGM_VOLUME = 0.3;
const SE_VOLUME = 0.55;
/** BGM を何秒先まで予約しておくか */
const LOOKAHEAD_SEC = 0.25;
const SCHEDULE_INTERVAL_MS = 60;

type Engine = {
  ctx: AudioContext;
  master: GainNode;
  bgmBus: GainNode;
  seBus: GainNode;
  waves: Map<Wave, PeriodicWave>;
  noise: AudioBuffer;
};

type Sequence = { name: string; stop: () => void };

let engine: Engine | null = null;
/** 今の画面で流したい BGM */
let desiredBgm: BgmName | null = null;
let bgm: Sequence | null = null;
let jingle: Sequence | null = null;
let jingleTimer: number | undefined;

// ---- ミュート（画面のボタンから切り替える。localStorage に覚える） ----

let muted = readMuted();
const listeners = new Set<() => void>();

function readMuted(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      window.localStorage.getItem(MUTED_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function isMuted() {
  return muted;
}

export function subscribeMuted(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    window.localStorage.setItem(MUTED_KEY, value ? "1" : "0");
  } catch {
    // 保存できなくても、この画面の間は切り替わる
  }
  listeners.forEach((l) => l());
  if (value) {
    stopJingle();
    stopBgm();
  } else {
    unlockSound();
    syncBgm();
  }
}

// ---- 初期化 ----

/** ユーザー操作（タップ・キー入力）のたびに呼ぶ。音を出せる状態にする */
export function unlockSound() {
  if (typeof window === "undefined") return;
  if (!engine) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    engine = createEngine(new Ctor());
  }
  if (engine.ctx.state === "suspended") {
    engine.ctx.resume().then(syncBgm, () => {});
  } else {
    syncBgm();
  }
}

/** タブが隠れている間は止めて、戻ったら再開する */
export function setSoundSuspended(suspended: boolean) {
  if (!engine) return;
  if (suspended) engine.ctx.suspend().catch(() => {});
  else engine.ctx.resume().catch(() => {});
}

function createEngine(ctx: AudioContext): Engine {
  const master = ctx.createGain();
  master.gain.value = MASTER_VOLUME;
  master.connect(ctx.destination);
  const bgmBus = ctx.createGain();
  bgmBus.gain.value = BGM_VOLUME;
  bgmBus.connect(master);
  const seBus = ctx.createGain();
  seBus.gain.value = SE_VOLUME;
  seBus.connect(master);

  const waves = new Map<Wave, PeriodicWave>([
    ["pulse12", pulseWave(ctx, 0.125)],
    ["pulse25", pulseWave(ctx, 0.25)],
    ["pulse50", pulseWave(ctx, 0.5)],
  ]);

  // 1 秒分のホワイトノイズ（ドラムや打撃音に使う）
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  return { ctx, master, bgmBus, seBus, waves, noise };
}

/** デューティ比 duty の矩形波（フーリエ級数で作る） */
function pulseWave(ctx: AudioContext, duty: number): PeriodicWave {
  const size = 64;
  const real = new Float32Array(size);
  const imag = new Float32Array(size);
  for (let n = 1; n < size; n++) {
    real[n] = (2 * Math.sin(Math.PI * n * duty)) / (Math.PI * n);
  }
  return ctx.createPeriodicWave(real, imag);
}

// ---- 1 音を鳴らす ----

type ToneOptions = {
  wave: Wave;
  freq: number;
  /** 音の終わりの周波数（指定するとスライドする） */
  toFreq?: number;
  start: number;
  duration: number;
  volume: number;
  dest: AudioNode;
};

function tone(e: Engine, opt: ToneOptions) {
  const { ctx } = e;
  const { start, duration, volume } = opt;
  const gain = ctx.createGain();
  gain.connect(opt.dest);

  if (opt.wave === "noise") {
    const src = ctx.createBufferSource();
    src.buffer = e.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = opt.freq;
    src.connect(filter).connect(gain);
    const len = Math.min(duration, 0.3);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + len);
    src.start(start, Math.random() * 0.5);
    src.stop(start + len);
    src.onended = () => gain.disconnect();
    return;
  }

  const osc = ctx.createOscillator();
  const periodic = e.waves.get(opt.wave);
  if (periodic) osc.setPeriodicWave(periodic);
  else osc.type = "triangle";
  osc.frequency.setValueAtTime(opt.freq, start);
  if (opt.toFreq) {
    osc.frequency.exponentialRampToValueAtTime(opt.toFreq, start + duration);
  }
  osc.connect(gain);

  // 音の切れ目がわかるように、最後を少しだけ短く切る
  const end = start + duration * 0.92;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.005);
  gain.gain.setValueAtTime(volume, Math.max(start + 0.005, end - 0.02));
  gain.gain.linearRampToValueAtTime(0, end);
  osc.start(start);
  osc.stop(end + 0.01);
  osc.onended = () => gain.disconnect();
}

// ---- BGM・ジングル（譜面を少し先まで予約しながら鳴らす） ----

function startSequence(
  e: Engine,
  name: string,
  track: Track,
  dest: AudioNode,
): Sequence {
  const { ctx } = e;
  const out = ctx.createGain();
  out.connect(dest);
  const stepSec = 60 / (track.bpm * track.stepsPerBeat);
  const begin = ctx.currentTime + 0.05;
  const cursors = track.parts.map(() => ({ index: 0, time: begin }));

  const schedule = () => {
    const horizon = ctx.currentTime + LOOKAHEAD_SEC;
    track.parts.forEach((part, p) => {
      const cur = cursors[p];
      // タブが止まっていた等で大きく遅れたら、今の時刻まで飛ばす
      if (cur.time < ctx.currentTime - 0.5) cur.time = ctx.currentTime;
      while (cur.time < horizon && cur.index < part.notes.length) {
        const [note, len] = part.notes[cur.index];
        const freq = note ? noteToFreq(note) : null;
        if (freq) {
          tone(e, {
            wave: part.wave,
            freq,
            start: cur.time,
            duration: len * stepSec,
            volume: part.volume * 0.3,
            dest: out,
          });
        }
        cur.time += len * stepSec;
        cur.index++;
        if (cur.index >= part.notes.length && track.loop) cur.index = 0;
      }
    });
  };
  schedule();
  const timer = window.setInterval(schedule, SCHEDULE_INTERVAL_MS);

  return {
    name,
    stop: () => {
      window.clearInterval(timer);
      out.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
      window.setTimeout(() => out.disconnect(), 300);
    },
  };
}

function stopBgm() {
  bgm?.stop();
  bgm = null;
}

function stopJingle() {
  window.clearTimeout(jingleTimer);
  jingle?.stop();
  jingle = null;
}

/** 流したい BGM と実際に流れている BGM をそろえる */
function syncBgm() {
  if (!engine || muted || jingle || engine.ctx.state !== "running") return;
  if (bgm?.name === desiredBgm) return;
  stopBgm();
  if (desiredBgm) {
    bgm = startSequence(
      engine,
      desiredBgm,
      BGM_TRACKS[desiredBgm],
      engine.bgmBus,
    );
  }
}

/** BGM を切り替える（null で止める）。同じ曲なら最初からやり直さない */
export function playBgm(name: BgmName | null) {
  desiredBgm = name;
  if (!name) stopBgm();
  syncBgm();
}

/** 短い曲を鳴らす。その間 BGM は止め、終わったら元の BGM に戻る */
export function playJingle(name: JingleName) {
  if (!engine || muted || engine.ctx.state !== "running") return;
  stopJingle();
  stopBgm();
  const track = JINGLES[name];
  jingle = startSequence(engine, name, track, engine.bgmBus);
  jingleTimer = window.setTimeout(
    () => {
      jingle?.stop();
      jingle = null;
      syncBgm();
    },
    trackSeconds(track) * 1000 + 400,
  );
}

// ---- 効果音 ----

type Blip = [wave: Wave, freq: number, delay: number, duration: number];

function blips(e: Engine, t: number, list: Blip[], volume = 0.3) {
  for (const [wave, freq, delay, duration] of list) {
    tone(e, { wave, freq, start: t + delay, duration, volume, dest: e.seBus });
  }
}

function sweep(
  e: Engine,
  wave: Wave,
  from: number,
  to: number,
  start: number,
  duration: number,
  volume = 0.3,
) {
  tone(e, {
    wave,
    freq: from,
    toFreq: to,
    start,
    duration,
    volume,
    dest: e.seBus,
  });
}

/** 和音の上昇アルペジオ */
function arpeggio(wave: Wave, notes: number[], step: number): Blip[] {
  return notes.map((freq, i) => [wave, freq, i * step, step * 1.5]);
}

const SE: Record<SeName, (e: Engine, t: number) => void> = {
  cursor: (e, t) => blips(e, t, [["pulse50", 1320, 0, 0.035]], 0.18),
  confirm: (e, t) =>
    blips(e, t, [
      ["pulse25", 988, 0, 0.05],
      ["pulse25", 1480, 0.05, 0.09],
    ]),
  cancel: (e, t) =>
    blips(e, t, [
      ["pulse25", 784, 0, 0.05],
      ["pulse25", 523, 0.05, 0.09],
    ]),
  attack: (e, t) => {
    sweep(e, "pulse50", 1000, 180, t, 0.13, 0.25);
    tone(e, {
      wave: "noise",
      freq: 2500,
      start: t,
      duration: 0.1,
      volume: 0.3,
      dest: e.seBus,
    });
  },
  special: (e, t) => {
    blips(
      e,
      t,
      arpeggio("pulse25", [523, 659, 784, 1047, 1319, 1568], 0.035),
      0.25,
    );
    sweep(e, "pulse12", 220, 1760, t + 0.2, 0.25, 0.25);
    tone(e, {
      wave: "noise",
      freq: 600,
      start: t + 0.2,
      duration: 0.3,
      volume: 0.35,
      dest: e.seBus,
    });
  },
  hit: (e, t) => {
    sweep(e, "pulse50", 320, 50, t, 0.16, 0.3);
    tone(e, {
      wave: "noise",
      freq: 400,
      start: t,
      duration: 0.16,
      volume: 0.5,
      dest: e.seBus,
    });
  },
  guard: (e, t) =>
    blips(e, t, [
      ["triangle", 1760, 0, 0.08],
      ["pulse12", 2637, 0.03, 0.14],
      ["pulse12", 2637, 0.12, 0.1],
    ]),
  heal: (e, t) =>
    blips(
      e,
      t,
      arpeggio("pulse12", [523, 659, 784, 1047, 784, 1047, 1319, 1568], 0.06),
      0.25,
    ),
  powerup: (e, t) => {
    sweep(e, "pulse25", 262, 1047, t, 0.25, 0.25);
    sweep(e, "pulse25", 392, 1568, t + 0.12, 0.25, 0.2);
  },
  coin: (e, t) =>
    blips(e, t, [
      ["pulse25", 1319, 0, 0.04],
      ["pulse25", 1568, 0.04, 0.04],
      ["pulse25", 2093, 0.08, 0.2],
    ]),
  error: (e, t) =>
    blips(e, t, [
      ["pulse50", 175, 0, 0.08],
      ["pulse50", 165, 0.11, 0.14],
    ]),
};

/** 効果音を鳴らす */
export function playSe(name: SeName) {
  if (!engine || muted || engine.ctx.state !== "running") return;
  SE[name](engine, engine.ctx.currentTime + 0.01);
}
