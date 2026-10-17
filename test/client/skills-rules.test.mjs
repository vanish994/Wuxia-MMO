// Rules of the active skills: cooldown and Qi gating, Moon Slash crescent and Onda de Qi area.
import test from "node:test";
import assert from "node:assert/strict";
import { MOON_SLASH, ONDA_DE_QI, QI_REGEN_PER_SECOND } from "../../src/client/game/combat/skills-config.mjs";
import {
  canCastSkill,
  spendQi,
  regenQi,
  moonSlashHits,
  ondaTargetPoint,
  ondaHits,
} from "../../src/client/game/combat/skills-rules.mjs";

const RIGHT = { x: 1, y: 0 };
const origin = { x: 0, y: 0 };

test("a skill needs its cooldown elapsed and enough Qi", () => {
  assert.equal(canCastSkill(10_000, -Infinity, ONDA_DE_QI.cooldownMs, 80, ONDA_DE_QI.qiCost), true);
  assert.equal(canCastSkill(10_000, 9_000, ONDA_DE_QI.cooldownMs, 80, ONDA_DE_QI.qiCost), false, "cooldown running");
  assert.equal(canCastSkill(20_000, 9_000, ONDA_DE_QI.cooldownMs, ONDA_DE_QI.qiCost - 1, ONDA_DE_QI.qiCost), false, "not enough qi");
  assert.equal(canCastSkill(10_000, 9_000, MOON_SLASH.cooldownMs, 0, MOON_SLASH.qiCost), false, "moon slash cooldown");
});

test("Qi is spent without going negative and regenerates up to the cap", () => {
  assert.equal(spendQi(50, ONDA_DE_QI.qiCost), 20);
  assert.equal(spendQi(10, ONDA_DE_QI.qiCost), 0);
  assert.equal(regenQi(70, 80, 1000, QI_REGEN_PER_SECOND), 74);
  assert.equal(regenQi(79, 80, 10_000, QI_REGEN_PER_SECOND), 80);
});

test("Moon Slash hits targets in front and in range, ignoring dead and rear targets", () => {
  const targets = [
    { x: 80, y: 0, alive: true }, // in front, in range
    { x: 300, y: 0, alive: true }, // in front but out of range
    { x: 60, y: 0, alive: false }, // dead
    { x: -60, y: 0, alive: true }, // behind
  ];
  const hits = moonSlashHits(origin, RIGHT, targets, MOON_SLASH);
  assert.deepEqual(hits, [0]);
});

test("Onda de Qi lands ahead of the caster and hits everything inside its radius", () => {
  const center = ondaTargetPoint(origin, RIGHT, ONDA_DE_QI.castRangePx);
  assert.deepEqual(center, { x: ONDA_DE_QI.castRangePx, y: 0 });
  const targets = [
    { x: center.x + ONDA_DE_QI.radiusPx - 1, y: 0, alive: true },
    { x: center.x + ONDA_DE_QI.radiusPx + 10, y: 0, alive: true },
    { x: center.x, y: 5, alive: false },
    { x: origin.x, y: origin.y, alive: true },
  ];
  assert.deepEqual(ondaHits(center, targets, ONDA_DE_QI.radiusPx), [0]);
});
