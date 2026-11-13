// battle 機能のエントリポイント。公開するものをここから export する。
export {
  BATTLE_RULES,
  canUse,
  chooseEnemyAction,
  createBattle,
  resolveTurn,
} from "./engine";
export type {
  BattleAction,
  BattleNames,
  BattleSide,
  BattleState,
  FighterState,
  Rng,
  TurnResult,
} from "./engine";
