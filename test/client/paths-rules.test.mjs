import { test } from "node:test";
import assert from "node:assert/strict";
import { MASTERY, PATHS, PATH_QI, PATH_SWORD } from "../../src/client/game/combat/paths-config.mjs";
import {
  addMasteryPoints, masteryDamageMultiplier, masteryLevel, nearestTargetIndex, projectileTravelMs,
} from "../../src/client/game/combat/paths-rules.mjs";

test("mastery level counts thresholds reached", () => {
  assert.equal(masteryLevel(0, MASTERY.thresholds), 0);
  assert.equal(masteryLevel(9, MASTERY.thresholds), 0);
  assert.equal(masteryLevel(10, MASTERY.thresholds), 1);
  assert.equal(masteryLevel(25, MASTERY.thresholds), 2);
  assert.equal(masteryLevel(10_000, MASTERY.thresholds), MASTERY.thresholds.length);
});

test("mastery multiplier grows per level and is neutral at level 0", () => {
  assert.equal(masteryDamageMultiplier(0, 0.05), 1);
  assert.ok(Math.abs(masteryDamageMultiplier(3, 0.05) - 1.15) < 1e-9);
});

test("nearest target ignores dead wolves and wolves out of range", () => {
  const origin = { x: 0, y: 0 };
  const targets = [
    { x: 10, y: 0, alive: false },
    { x: 100, y: 0, alive: true },
    { x: 50, y: 0, alive: true },
    { x: 400, y: 0, alive: true },
  ];
  assert.equal(nearestTargetIndex(origin, targets, 220), 2);
  assert.equal(nearestTargetIndex(origin, targets, 20), -1);
});

test("projectile travel time scales with distance and is at least 1 ms", () => {
  assert.equal(projectileTravelMs(460, 460), 1000);
  assert.equal(projectileTravelMs(0, 460), 1);
});

test("mastery points never go below zero", () => {
  assert.equal(addMasteryPoints(5, 3), 8);
  assert.equal(addMasteryPoints(2, -10), 0);
});

test("each path owns exactly one basic attack kind and one skill", () => {
  assert.equal(PATHS[PATH_SWORD].basicAttack.kind, "melee");
  assert.equal(PATHS[PATH_SWORD].skillId, "moon-slash");
  assert.equal(PATHS[PATH_QI].basicAttack.kind, "projectile");
  assert.equal(PATHS[PATH_QI].skillId, "onda-de-qi");
});
