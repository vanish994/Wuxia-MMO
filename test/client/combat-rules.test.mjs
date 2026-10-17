import test from "node:test";
import assert from "node:assert/strict";
import {
  applyDamage, damageFor, decideWolfAction, grantXp, isInMeleeArc, isRespawnDue, resolveMobAttack,
  DIRECTION_VECTORS,
} from "../../src/client/game/combat/combat-rules.mjs";
import { PLAYER_COMBAT, PROGRESSION, WOLF_LEVEL_1, HUNT_SPAWNS } from "../../src/client/game/combat/combat-config.mjs";

const wolfCfg = WOLF_LEVEL_1;
const wolfAt = (x, y, extra = {}) => ({ x, y, homeX: 500, homeY: 500, hp: wolfCfg.maxHp, ...extra });

test("damage subtracts defense, never drops below 1 and clamps HP at zero", () => {
  assert.equal(damageFor(18, 1), 17);
  assert.equal(damageFor(3, 10), 1);
  assert.equal(applyDamage(10, 4), 6);
  assert.equal(applyDamage(10, 99), 0);
  assert.equal(applyDamage(10, -5), 10);
});

test("sword arc hits only targets within range and inside the facing arc", () => {
  const opts = { rangePx: PLAYER_COMBAT.swordRangePx, arcDegrees: PLAYER_COMBAT.swordArcDegrees };
  const me = { x: 0, y: 0 };
  assert.equal(isInMeleeArc(me, { x: 50, y: 0 }, DIRECTION_VECTORS.right, opts), true);
  assert.equal(isInMeleeArc(me, { x: 80, y: 0 }, DIRECTION_VECTORS.right, opts), false, "out of range");
  assert.equal(isInMeleeArc(me, { x: -50, y: 0 }, DIRECTION_VECTORS.right, opts), false, "behind");
  assert.equal(isInMeleeArc(me, { x: 0, y: 40 }, DIRECTION_VECTORS.right, opts), false, "90° side is outside 120° arc");
  assert.equal(isInMeleeArc(me, { x: 40, y: 40 }, DIRECTION_VECTORS["down-right"], opts), true);
  assert.equal(isInMeleeArc(me, { x: 1, y: 0 }, { x: 0, y: 0 }, opts), false, "no facing");
});

test("wolf stays idle when the player is outside aggro range", () => {
  const d = decideWolfAction(wolfAt(500, 500), { x: 900, y: 900, alive: true }, 0, wolfCfg);
  assert.equal(d.mode, "idle");
  assert.equal(d.attack, false);
});

test("wolf chases an aggroed player and attacks only when in range and off cooldown", () => {
  const close = decideWolfAction(wolfAt(500, 500), { x: 530, y: 500, alive: true }, 0, wolfCfg);
  assert.equal(close.mode, "attack");
  assert.equal(close.attack, true);

  const cooling = decideWolfAction(wolfAt(500, 500, { lastAttackAt: 1000 }), { x: 530, y: 500, alive: true }, 1500, wolfCfg);
  assert.equal(cooling.attack, false, "cooldown is 1200ms");
  const ready = decideWolfAction(wolfAt(500, 500, { lastAttackAt: 1000 }), { x: 530, y: 500, alive: true }, 2200, wolfCfg);
  assert.equal(ready.attack, true);

  const chasing = decideWolfAction(wolfAt(500, 500), { x: 620, y: 500, alive: true }, 0, wolfCfg);
  assert.equal(chasing.mode, "chase");
  assert.deepEqual(chasing.moveTo, { x: 620, y: 500 });
});

test("wolf leashes home when the player kites it too far from its spawn", () => {
  const d = decideWolfAction(wolfAt(700, 500), { x: 800, y: 500, alive: true }, 0, wolfCfg);
  assert.equal(d.mode, "return");
  assert.deepEqual(d.moveTo, { x: 500, y: 500 });
});

test("dead wolves and dead players do not generate chase or attack intent", () => {
  assert.equal(decideWolfAction(wolfAt(500, 500, { hp: 0 }), { x: 510, y: 500, alive: true }, 0, wolfCfg).mode, "dead");
  const d = decideWolfAction(wolfAt(500, 500), { x: 510, y: 500, alive: false }, 0, wolfCfg);
  assert.notEqual(d.mode, "attack");
  assert.equal(d.attack, false);
});

test("mob attack applies defense and reports defeat", () => {
  const r = resolveMobAttack({ attack: wolfCfg.attack }, { hp: 5, defense: PLAYER_COMBAT.defense });
  assert.equal(r.amount, 4);
  assert.equal(r.hp, 1);
  assert.equal(r.defeated, false);
  assert.equal(resolveMobAttack({ attack: 99 }, { hp: 3, defense: 0 }).defeated, true);
});

test("XP accumulates, carries over and resolves multiple level-ups", () => {
  const base = PROGRESSION.xpBase;
  assert.deepEqual(grantXp({ level: 1, xp: 0 }, wolfCfg.xpReward, base), { level: 1, xp: 12, levelsGained: 0 });
  assert.deepEqual(grantXp({ level: 1, xp: 95 }, 12, base), { level: 2, xp: 7, levelsGained: 1 });
  // level 1 needs 100, level 2 needs 200: 320 XP from zero crosses two thresholds.
  assert.deepEqual(grantXp({ level: 1, xp: 0 }, 320, base), { level: 3, xp: 20, levelsGained: 2 });
  assert.equal(grantXp({ level: 2, xp: 10 }, -50, base).xp, 10, "negative rewards are ignored");
});

test("respawn is due only after the configured delay", () => {
  assert.equal(isRespawnDue(1000, 8999, wolfCfg.respawnDelayMs), false);
  assert.equal(isRespawnDue(1000, 9000, wolfCfg.respawnDelayMs), true);
});

test("configuration is complete and hunt spawns are declared", () => {
  assert.ok(HUNT_SPAWNS.length >= 4);
  assert.equal(new Set(HUNT_SPAWNS.map((s) => s.id)).size, HUNT_SPAWNS.length, "unique spawn ids");
  for (const key of ["maxHp", "attackRangePx", "attackCooldownMs", "respawnDelayMs", "xpReward"]) {
    assert.equal(typeof wolfCfg[key], "number", key);
  }
  assert.ok(wolfCfg.attackRangePx < wolfCfg.aggroRangePx);
  assert.ok(wolfCfg.aggroRangePx < wolfCfg.leashRangePx);
});
