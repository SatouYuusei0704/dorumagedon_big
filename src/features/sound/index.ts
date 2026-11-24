// sound 機能のエントリポイント。公開するものをここから export する。
export { SoundController, useSoundMuted } from "./SoundController";
export { playBgm, playJingle, playSe } from "./synth";
export {
  BGM_TRACKS,
  JINGLES,
  SE_NAMES,
  bgmForPath,
  noteToFreq,
  seForBattleLog,
} from "./music";
export type { BgmName, JingleName, SeName } from "./music";
