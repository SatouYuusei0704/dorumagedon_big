// battle 機能のエントリポイント。公開するものをここから export する。
export {
  BATTLE_ITEMS,
  BATTLE_RULES,
  ITEM_TRAITS,
  canUse,
  canUseItem,
  chooseEnemyAction,
  createBattle,
  isBattleItemId,
  resolveTurn,
  traitOf,
} from "./engine";
export type {
  BattleAction,
  BattleItem,
  BattleItemId,
  BattleNames,
  BattleSide,
  BattleState,
  FighterState,
  ItemTrait,
  PlayerAction,
  Rng,
  TurnResult,
} from "./engine";
