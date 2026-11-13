// battle 機能のエントリポイント。公開するものをここから export する。
export {
  BATTLE_RULES,
  ITEM_TRAITS,
  canUse,
  chooseEnemyAction,
  createBattle,
  resolveTurn,
  traitOf,
} from "./engine";
export type {
  BattleAction,
  BattleNames,
  BattleSide,
  BattleState,
  FighterState,
  ItemTrait,
  Rng,
  TurnResult,
} from "./engine";
