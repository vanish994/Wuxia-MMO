import { test } from "node:test";
import assert from "node:assert/strict";
import { aimVector, ondaAimPoint, chooseAutoTarget, autoAttackStep } from "../../src/client/game/combat/targeting-rules.mjs";

const FORWARD = { x: 0, y: 1 };

test("aim vector points at the target and falls back when there is none", () => {
  assert.deepEqual(aimVector({ x: 0, y: 0 }, { x: 30, y: 40 }, FORWARD), { x: 0.6, y: 0.8 });
  assert.deepEqual(aimVector({ x: 5, y: 5 }, null, FORWARD), FORWARD);
  assert.deepEqual(aimVector({ x: 5, y: 5 }, { x: 5, y: 5 }, FORWARD), FORWARD);
});

test("Onda de Qi lands on the target when it is in range, clamped otherwise", () => {
  const origin = { x: 0, y: 0 };
  assert.deepEqual(ondaAimPoint(origin, { x: 100, y: 0 }, 170, FORWARD), { x: 100, y: 0 });
  assert.deepEqual(ondaAimPoint(origin, { x: 0, y: 400 }, 170, FORWARD), { x: 0, y: 170 });
  assert.deepEqual(ondaAimPoint(origin, null, 170, FORWARD), { x: 0, y: 170 });
});

test("auto-attack prefers the selected wolf, then the nearest one in acquire range", () => {
  const origin = { x: 0, y: 0 };
  const targets = [
    { x: 50, y: 0, alive: true },
    { x: 20, y: 0, alive: true },
    { x: 10, y: 0, alive: false },
  ];
  assert.equal(chooseAutoTarget(origin, targets, 0, 300), 0);
  assert.equal(chooseAutoTarget(origin, targets, 2, 300), 1);
  assert.equal(chooseAutoTarget(origin, targets, -1, 300), 1);
  assert.equal(chooseAutoTarget(origin, targets, -1, 10), -1);
});

test("auto-attack chases until the target is inside range", () => {
  assert.equal(autoAttackStep({ x: 0, y: 0 }, { x: 100, y: 0 }, 120), "attack");
  assert.equal(autoAttackStep({ x: 0, y: 0 }, { x: 200, y: 0 }, 120), "chase");
});
