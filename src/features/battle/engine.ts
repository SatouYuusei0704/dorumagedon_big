// すれちがいNPCバトルのルール（UI から切り離した純粋関数）。
// 数値を変えるときは BATTLE_RULES だけ触ればよい。

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
} as const;

export type BattleAction = "attack" | "special" | "guard";

export type FighterState = {
  hp: number;
  energy: number;
  guardsLeft: number;
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

function newFighter(): FighterState {
  return {
    hp: BATTLE_RULES.maxHp,
    energy: 0,
    guardsLeft: BATTLE_RULES.guard.uses,
  };
}

export function createBattle(): BattleState {
  return { player: newFighter(), enemy: newFighter(), turn: 1, winner: null };
}

/** その行動を今選べるか */
export function canUse(fighter: FighterState, action: BattleAction) {
  if (action === "special") return fighter.energy >= BATTLE_RULES.special.cost;
  if (action === "guard") return fighter.guardsLeft > 0;
  return true;
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
 * ガード → プレイヤーの攻撃 → （敵が倒れていなければ）敵の攻撃 の順に解決する。
 * 選べない行動を渡された場合は通常こうげきとして扱う。
 */
export function resolveTurn(
  state: BattleState,
  playerAction: BattleAction,
  enemyAction: BattleAction,
  names: BattleNames,
  rng: Rng,
): TurnResult {
  if (state.winner) return { state, log: [], hit: { player: 0, enemy: 0 } };

  const player = { ...state.player };
  const enemy = { ...state.enemy };
  const log: string[] = [];
  const hit = { player: 0, enemy: 0 };

  const pAction = canUse(player, playerAction) ? playerAction : "attack";
  const eAction = canUse(enemy, enemyAction) ? enemyAction : "attack";

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
    action: BattleAction,
    attacker: FighterState,
    defender: FighterState,
    attackerName: string,
    defenderName: string,
    moveName: string,
    defenderGuarding: boolean,
  ) => {
    if (action === "guard") return 0;
    let damage: number;
    if (action === "special") {
      attacker.energy -= BATTLE_RULES.special.cost;
      log.push(`${attackerName} の ご当地わざ【${moveName}】！`);
      damage = roll(rng, BATTLE_RULES.special.min, BATTLE_RULES.special.max);
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
      damage = roll(rng, BATTLE_RULES.attack.min, BATTLE_RULES.attack.max);
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
