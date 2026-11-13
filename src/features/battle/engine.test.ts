// バトルのルールのテスト（npm test で実行。Node の標準テストランナーを使う）
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BATTLE_RULES,
  ITEM_TRAITS,
  canUse,
  chooseEnemyAction,
  createBattle,
  resolveTurn,
  traitOf,
  type BattleNames,
  type BattleState,
} from "./engine.ts";

const names: BattleNames = {
  player: "じぶん",
  enemy: "あいて",
  playerMove: "金箔のつるぎ",
  enemyMove: "りんごのつるぎ",
};

/** いつも同じ値を返す乱数（0 なら最小ダメージ、0.999 なら最大ダメージ） */
const fixed = (value: number) => () => value;

/** 一部だけ書き換えた状態を作る */
function battleWith(
  player: Partial<BattleState["player"]>,
  enemy: Partial<BattleState["enemy"]> = {},
): BattleState {
  const base = createBattle();
  return {
    ...base,
    player: { ...base.player, ...player },
    enemy: { ...base.enemy, ...enemy },
  };
}

describe("createBattle", () => {
  it("そうびなしは基本の値で始まる", () => {
    const { player, enemy, turn, winner } = createBattle();
    for (const f of [player, enemy]) {
      assert.equal(f.hp, BATTLE_RULES.maxHp);
      assert.equal(f.maxHp, BATTLE_RULES.maxHp);
      assert.equal(f.energy, 0);
      assert.equal(f.guardsLeft, BATTLE_RULES.guard.uses);
      assert.equal(f.specialBonus, 0);
    }
    assert.equal(turn, 1);
    assert.equal(winner, null);
  });

  it("そうびのタイプで初期値が変わる", () => {
    const a = createBattle("shield", "helmet");
    assert.equal(
      a.player.guardsLeft,
      BATTLE_RULES.guard.uses + ITEM_TRAITS.shield.guards,
    );
    assert.equal(a.enemy.maxHp, BATTLE_RULES.maxHp + ITEM_TRAITS.helmet.maxHp);
    assert.equal(a.enemy.hp, a.enemy.maxHp);

    const b = createBattle("charm", "sword");
    assert.equal(b.player.energy, ITEM_TRAITS.charm.startEnergy);
    assert.equal(b.enemy.specialBonus, ITEM_TRAITS.sword.specialDamage);
  });

  it("未知のタイプは「きほん」として扱う", () => {
    assert.equal(traitOf(undefined), ITEM_TRAITS.basic);
    assert.equal(traitOf(null), ITEM_TRAITS.basic);
    // @ts-expect-error DB に想定外の値が入っていた場合
    assert.equal(traitOf("unknown"), ITEM_TRAITS.basic);
  });
});

describe("canUse", () => {
  it("ご当地わざはエネルギーが足りるときだけ", () => {
    const cost = BATTLE_RULES.special.cost;
    assert.equal(
      canUse(battleWith({ energy: cost - 1 }).player, "special"),
      false,
    );
    assert.equal(canUse(battleWith({ energy: cost }).player, "special"), true);
  });

  it("ガードは回数が残っているときだけ", () => {
    assert.equal(canUse(battleWith({ guardsLeft: 1 }).player, "guard"), true);
    assert.equal(canUse(battleWith({ guardsLeft: 0 }).player, "guard"), false);
  });
});

describe("resolveTurn", () => {
  it("こうげき同士: ダメージを与え合い、エネルギーがたまる", () => {
    const { state, hit } = resolveTurn(
      createBattle(),
      "attack",
      "attack",
      names,
      fixed(0),
    );
    assert.equal(state.enemy.hp, BATTLE_RULES.maxHp - BATTLE_RULES.attack.min);
    assert.equal(state.player.hp, BATTLE_RULES.maxHp - BATTLE_RULES.attack.min);
    assert.equal(state.player.energy, BATTLE_RULES.attack.energy);
    assert.equal(state.enemy.energy, BATTLE_RULES.attack.energy);
    assert.deepEqual(hit, {
      player: BATTLE_RULES.attack.min,
      enemy: BATTLE_RULES.attack.min,
    });
    assert.equal(state.turn, 2);
  });

  it("ダメージは決められた上限に収まる", () => {
    const special = resolveTurn(
      battleWith({ energy: 50 }),
      "special",
      "attack",
      names,
      fixed(0.999),
    );
    assert.equal(special.hit.enemy, BATTLE_RULES.special.max);
    assert.equal(special.hit.player, BATTLE_RULES.attack.max);
  });

  it("ご当地わざはエネルギーを消費する", () => {
    const { state } = resolveTurn(
      battleWith({ energy: 60 }),
      "special",
      "attack",
      names,
      fixed(0),
    );
    assert.equal(state.player.energy, 60 - BATTLE_RULES.special.cost);
    assert.equal(state.enemy.hp, BATTLE_RULES.maxHp - BATTLE_RULES.special.min);
  });

  it("エネルギー不足のご当地わざは通常こうげきになる", () => {
    const { state } = resolveTurn(
      createBattle(),
      "special",
      "attack",
      names,
      fixed(0),
    );
    assert.equal(state.enemy.hp, BATTLE_RULES.maxHp - BATTLE_RULES.attack.min);
    assert.equal(state.player.energy, BATTLE_RULES.attack.energy);
  });

  it("ガードはご当地わざを 1 ダメージにし、回数が減る", () => {
    const { state, hit } = resolveTurn(
      battleWith({}, { energy: 50 }),
      "guard",
      "special",
      names,
      fixed(0.999),
    );
    assert.equal(hit.player, BATTLE_RULES.guardedSpecialDamage);
    assert.equal(state.player.hp, BATTLE_RULES.maxHp - 1);
    assert.equal(state.player.guardsLeft, BATTLE_RULES.guard.uses - 1);
    assert.equal(state.player.energy, BATTLE_RULES.guard.energy);
    assert.equal(state.enemy.energy, 0);
  });

  it("ガードは通常こうげきを半分にする", () => {
    const { hit } = resolveTurn(
      createBattle(),
      "guard",
      "attack",
      names,
      fixed(0),
    );
    assert.equal(
      hit.player,
      Math.ceil(BATTLE_RULES.attack.min * BATTLE_RULES.guardedAttackRate),
    );
  });

  it("ガードを使い切っていたら通常こうげきになる", () => {
    const { state } = resolveTurn(
      battleWith({ guardsLeft: 0 }),
      "guard",
      "attack",
      names,
      fixed(0),
    );
    assert.equal(state.player.guardsLeft, 0);
    assert.equal(state.enemy.hp, BATTLE_RULES.maxHp - BATTLE_RULES.attack.min);
  });

  it("つるぎをそうびするとご当地わざのダメージが増える", () => {
    const start = createBattle("sword", "basic");
    start.player.energy = 50;
    const { hit } = resolveTurn(start, "special", "attack", names, fixed(0));
    assert.equal(
      hit.enemy,
      BATTLE_RULES.special.min + ITEM_TRAITS.sword.specialDamage,
    );
  });

  it("敵を倒したら敵は反撃できず、プレイヤーの勝ち", () => {
    const { state, hit } = resolveTurn(
      battleWith({}, { hp: 1, energy: 100 }),
      "attack",
      "special",
      names,
      fixed(0),
    );
    assert.equal(state.winner, "player");
    assert.equal(state.enemy.hp, 0);
    assert.equal(hit.player, 0);
    assert.equal(state.player.hp, BATTLE_RULES.maxHp);
  });

  it("HP が 0 になったら負け（HP はマイナスにならない）", () => {
    const { state } = resolveTurn(
      battleWith({ hp: 1 }),
      "attack",
      "attack",
      names,
      fixed(0),
    );
    assert.equal(state.winner, "enemy");
    assert.equal(state.player.hp, 0);
  });

  it("決着後はもう進まない", () => {
    const done = { ...createBattle(), winner: "player" as const };
    const result = resolveTurn(done, "attack", "attack", names, fixed(0));
    assert.equal(result.state, done);
    assert.deepEqual(result.log, []);
  });

  it("エネルギーは上限を超えない", () => {
    const { state } = resolveTurn(
      battleWith({ energy: 95 }),
      "attack",
      "attack",
      names,
      fixed(0),
    );
    assert.equal(state.player.energy, BATTLE_RULES.maxEnergy);
  });

  it("元の状態を書き換えない", () => {
    const start = createBattle();
    const copy = structuredClone(start);
    resolveTurn(start, "attack", "attack", names, fixed(0.5));
    assert.deepEqual(start, copy);
  });
});

describe("chooseEnemyAction", () => {
  it("エネルギーがなければ通常こうげき", () => {
    assert.equal(chooseEnemyAction(createBattle(), fixed(0)), "attack");
  });

  it("エネルギーがたまっていればご当地わざを狙う", () => {
    assert.equal(
      chooseEnemyAction(battleWith({}, { energy: 50 }), fixed(0)),
      "special",
    );
  });

  it("プレイヤーがご当地わざを撃てるときはガードすることがある", () => {
    assert.equal(
      chooseEnemyAction(battleWith({ energy: 50 }), fixed(0)),
      "guard",
    );
    assert.equal(
      chooseEnemyAction(
        battleWith({ energy: 50 }, { guardsLeft: 0 }),
        fixed(0),
      ),
      "attack",
    );
  });

  it("選べない行動は選ばない", () => {
    for (let i = 0; i < 200; i++) {
      const state = battleWith(
        { energy: Math.floor(Math.random() * 101) },
        {
          energy: Math.floor(Math.random() * 101),
          guardsLeft: Math.floor(Math.random() * 3),
        },
      );
      assert.ok(canUse(state.enemy, chooseEnemyAction(state, Math.random)));
    }
  });
});

describe("バトル全体", () => {
  it("かならず決着がつき、どのタイプでも使い分ければ勝ち越せる", () => {
    const categories = ["basic", "sword", "shield", "helmet", "charm"] as const;
    for (const category of categories) {
      let wins = 0;
      const games = 400;
      for (let i = 0; i < games; i++) {
        let state = createBattle(category, "basic");
        while (!state.winner) {
          assert.ok(state.turn < 100, "バトルが終わらない");
          const action = canUse(state.player, "special")
            ? "special"
            : state.enemy.energy >= BATTLE_RULES.special.cost &&
                canUse(state.player, "guard")
              ? "guard"
              : "attack";
          state = resolveTurn(
            state,
            action,
            chooseEnemyAction(state, Math.random),
            names,
            Math.random,
          ).state;
        }
        if (state.winner === "player") wins++;
      }
      assert.ok(wins / games > 0.5, `${category}: 勝率 ${wins / games}`);
    }
  });
});
