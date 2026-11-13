// すれちがいNPCバトルのルール（UI から切り離した純粋関数）。
// 数値を変えるときは BATTLE_RULES / ITEM_TRAITS / BATTLE_ITEMS だけ触ればよい。

import type { ItemCategory } from "@/types/database";

export const BATTLE_RULES = {
  maxHp: 100,
  maxEnergy: 100,
  /** こうげき: ダメージとたまるエネルギー */
  attack: { min: 8, max: 12, energy: 25 },
  /** ご当地わざ: 消費エネルギーとダメージ */
  special: { cost: 50, min: 25, max: 35 },
  /** ガード: 1 バトルで使える回数と、たまるエネルギー */
  guard: { uses: 2, energy: 10 },
  /** ガード中にご当地わざを受けたときのダメージ */
  guardedSpecialDamage: 1,
  /** ガード中に通常こうげきを受けたときの倍率 */
  guardedAttackRate: 0.5,
  /** 1 バトルで使えるどうぐの数 */
  itemUses: 2,
} as const;

/** ショップで買えるどうぐ（DB の shop_items.id と同じ） */
export type BattleItemId = "potion" | "power" | "tough";

/**
 * どうぐをバトルで使ったときの効果。
 * 名前・値段は DB の shop_items にもある（値段はサーバー側で決めるため）。
 */
export type BattleItem = {
  name: string;
  /** かいふくする HP */
  heal: number;
  /** このバトルのあいだ、あたえるダメージに足す値 */
  attack: number;
  /** このバトルのあいだ、さいだいHPに足す値（同じだけ HP も増える） */
  maxHp: number;
};

export const BATTLE_ITEMS: Record<BattleItemId, BattleItem> = {
  potion: { name: "かいふくドリンク", heal: 30, attack: 0, maxHp: 0 },
  power: { name: "パワーだんご", heal: 0, attack: 3, maxHp: 0 },
  tough: { name: "タフネスもち", heal: 0, attack: 0, maxHp: 15 },
};

export function isBattleItemId(value: unknown): value is BattleItemId {
  return typeof value === "string" && Object.hasOwn(BATTLE_ITEMS, value);
}

/** そうびしたアイテムのタイプごとの効果 */
export type ItemTrait = {
  /** タイプの名前 */
  label: string;
  /** 効果の説明（画面に出す） */
  effect: string;
  /** ご当地わざのダメージに足す値 */
  specialDamage: number;
  /** ガード回数に足す値 */
  guards: number;
  /** さいだいHPに足す値 */
  maxHp: number;
  /** バトル開始時のエネルギー */
  startEnergy: number;
};

export const ITEM_TRAITS: Record<ItemCategory, ItemTrait> = {
  basic: {
    label: "きほん",
    effect: "とくべつな こうかは ない",
    specialDamage: 0,
    guards: 0,
    maxHp: 0,
    startEnergy: 0,
  },
  sword: {
    label: "つるぎ",
    effect: "ご当地わざの ダメージ +6",
    specialDamage: 6,
    guards: 0,
    maxHp: 0,
    startEnergy: 0,
  },
  shield: {
    label: "たて",
    effect: "ガードの かいすう +1",
    specialDamage: 0,
    guards: 1,
    maxHp: 0,
    startEnergy: 0,
  },
  helmet: {
    label: "かぶと",
    effect: "さいだいHP +15",
    specialDamage: 0,
    guards: 0,
    maxHp: 15,
    startEnergy: 0,
  },
  charm: {
    label: "おまもり",
    effect: "エネルギー 25で スタート",
    specialDamage: 0,
    guards: 0,
    maxHp: 0,
    startEnergy: 25,
  },
};

/** タイプの効果を返す（DB に未知の値が入っていても「きほん」として扱う） */
export function traitOf(category: ItemCategory | null | undefined): ItemTrait {
  return (category && ITEM_TRAITS[category]) || ITEM_TRAITS.basic;
}

export type BattleAction = "attack" | "special" | "guard";

/** プレイヤーの行動（コマンド、またはどうぐを使う） */
export type PlayerAction = BattleAction | { item: BattleItemId };

export type FighterState = {
  hp: number;
  maxHp: number;
  energy: number;
  guardsLeft: number;
  /** ご当地わざのダメージに足す値（そうびの効果） */
  specialBonus: number;
  /** あたえるダメージに足す値（どうぐの効果） */
  attackBonus: number;
  /** このバトルであと何回どうぐを使えるか */
  itemsLeft: number;
};

export type BattleSide = "player" | "enemy";

export type BattleState = {
  player: FighterState;
  enemy: FighterState;
  turn: number;
  /** 決着がついたら勝った側 */
  winner: BattleSide | null;
};

/** 画面に出す名前（ログの文章に使う） */
export type BattleNames = {
  player: string;
  enemy: string;
  /** ご当地わざの名前（装備・出身地のアイテム名） */
  playerMove: string;
  enemyMove: string;
};

/** 0 以上 1 未満の乱数を返す関数（テスト時は固定値を渡せる） */
export type Rng = () => number;

export type TurnResult = {
  state: BattleState;
  /** このターンのできごと（表示順） */
  log: string[];
  /** 演出用: このターンにダメージを受けた側 */
  hit: { player: number; enemy: number };
};

function newFighter(category?: ItemCategory | null): FighterState {
  const trait = traitOf(category);
  const maxHp = BATTLE_RULES.maxHp + trait.maxHp;
  return {
    hp: maxHp,
    maxHp,
    energy: trait.startEnergy,
    guardsLeft: BATTLE_RULES.guard.uses + trait.guards,
    specialBonus: trait.specialDamage,
    attackBonus: 0,
    itemsLeft: BATTLE_RULES.itemUses,
  };
}

/** バトルを始める。引数は両者がそうびしているアイテムのタイプ */
export function createBattle(
  playerCategory?: ItemCategory | null,
  enemyCategory?: ItemCategory | null,
): BattleState {
  return {
    player: newFighter(playerCategory),
    enemy: newFighter(enemyCategory),
    turn: 1,
    winner: null,
  };
}

/** その行動を今選べるか */
export function canUse(fighter: FighterState, action: BattleAction) {
  if (action === "special") return fighter.energy >= BATTLE_RULES.special.cost;
  if (action === "guard") return fighter.guardsLeft > 0;
  return true;
}

/** どうぐを今使えるか（1 バトルの回数制限） */
export function canUseItem(fighter: FighterState) {
  return fighter.itemsLeft > 0;
}

function roll(rng: Rng, min: number, max: number) {
  return min + Math.floor(rng() * (max - min + 1));
}

/**
 * 敵NPCの行動を決める。
 * - ご当地わざが撃てるなら高確率で撃つ
 * - プレイヤーがご当地わざを撃てそうならガードを考える
 * - それ以外は通常こうげき
 */
export function chooseEnemyAction(state: BattleState, rng: Rng): BattleAction {
  const { enemy, player } = state;
  if (canUse(enemy, "special") && rng() < 0.75) return "special";
  if (
    canUse(enemy, "guard") &&
    player.energy >= BATTLE_RULES.special.cost &&
    rng() < 0.5
  ) {
    return "guard";
  }
  return "attack";
}

/**
 * 1 ターン進める。両者の行動は同時に決まり、
 * どうぐ・ガード → プレイヤーの攻撃 → （敵が倒れていなければ）敵の攻撃 の順に解決する。
 * どうぐを使ったターンは攻撃できない（敵は行動する）。
 * 選べない行動を渡された場合は通常こうげきとして扱う。
 */
export function resolveTurn(
  state: BattleState,
  playerAction: PlayerAction,
  enemyAction: BattleAction,
  names: BattleNames,
  rng: Rng,
): TurnResult {
  if (state.winner) return { state, log: [], hit: { player: 0, enemy: 0 } };

  const player = { ...state.player };
  const enemy = { ...state.enemy };
  const log: string[] = [];
  const hit = { player: 0, enemy: 0 };

  const usedItem =
    typeof playerAction === "object" && canUseItem(player)
      ? playerAction.item
      : null;
  // どうぐを使ったターンは攻撃もガードもしない（null）
  const pAction: BattleAction | null = usedItem
    ? null
    : typeof playerAction === "string" && canUse(player, playerAction)
      ? playerAction
      : "attack";
  const eAction = canUse(enemy, enemyAction) ? enemyAction : "attack";

  // 0. どうぐ
  if (usedItem) {
    const item = BATTLE_ITEMS[usedItem];
    player.itemsLeft -= 1;
    log.push(`${names.player} は ${item.name} を つかった！`);
    if (item.maxHp > 0) {
      player.maxHp += item.maxHp;
      player.hp += item.maxHp;
      log.push(`さいだいHPが ${item.maxHp} あがった！`);
    }
    if (item.heal > 0) {
      const healed = Math.min(item.heal, player.maxHp - player.hp);
      player.hp += healed;
      log.push(`HPが ${healed} かいふくした！`);
    }
    if (item.attack > 0) {
      player.attackBonus += item.attack;
      log.push(`あたえるダメージが ${item.attack} あがった！`);
    }
  }

  // 1. ガード（このターンだけ有効）
  const playerGuarding = pAction === "guard";
  const enemyGuarding = eAction === "guard";
  if (playerGuarding) {
    player.guardsLeft -= 1;
    player.energy = Math.min(
      BATTLE_RULES.maxEnergy,
      player.energy + BATTLE_RULES.guard.energy,
    );
    log.push(`${names.player} は みをまもっている！`);
  }
  if (enemyGuarding) {
    enemy.guardsLeft -= 1;
    enemy.energy = Math.min(
      BATTLE_RULES.maxEnergy,
      enemy.energy + BATTLE_RULES.guard.energy,
    );
    log.push(`${names.enemy} は みをまもっている！`);
  }

  // 2. 攻撃の解決
  const strike = (
    action: BattleAction | null,
    attacker: FighterState,
    defender: FighterState,
    attackerName: string,
    defenderName: string,
    moveName: string,
    defenderGuarding: boolean,
  ) => {
    if (action === null || action === "guard") return 0;
    let damage: number;
    if (action === "special") {
      attacker.energy -= BATTLE_RULES.special.cost;
      log.push(`${attackerName} の ご当地わざ【${moveName}】！`);
      damage =
        roll(rng, BATTLE_RULES.special.min, BATTLE_RULES.special.max) +
        attacker.specialBonus +
        attacker.attackBonus;
      if (defenderGuarding) {
        damage = BATTLE_RULES.guardedSpecialDamage;
        log.push(`${defenderName} は ガードで ふせいだ！`);
      }
    } else {
      attacker.energy = Math.min(
        BATTLE_RULES.maxEnergy,
        attacker.energy + BATTLE_RULES.attack.energy,
      );
      log.push(`${attackerName} の こうげき！`);
      damage =
        roll(rng, BATTLE_RULES.attack.min, BATTLE_RULES.attack.max) +
        attacker.attackBonus;
      if (defenderGuarding) {
        damage = Math.ceil(damage * BATTLE_RULES.guardedAttackRate);
        log.push(`${defenderName} は ガードで うけとめた！`);
      }
    }
    defender.hp = Math.max(0, defender.hp - damage);
    log.push(`${defenderName} に ${damage} の ダメージ！`);
    return damage;
  };

  hit.enemy = strike(
    pAction,
    player,
    enemy,
    names.player,
    names.enemy,
    names.playerMove,
    enemyGuarding,
  );

  let winner: BattleSide | null = null;
  if (enemy.hp === 0) {
    winner = "player";
    log.push(`${names.enemy} を たおした！`);
  } else {
    hit.player = strike(
      eAction,
      enemy,
      player,
      names.enemy,
      names.player,
      names.enemyMove,
      playerGuarding,
    );
    if (player.hp === 0) {
      winner = "enemy";
      log.push(`${names.player} は たおれてしまった…`);
    }
  }

  return {
    state: { player, enemy, turn: state.turn + 1, winner },
    log,
    hit,
  };
}
