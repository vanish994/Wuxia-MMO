import test from "node:test";
import assert from "node:assert/strict";
import { normalizeVector } from "../../src/client/input/movement.mjs";

test("normaliza diagonais sem ultrapassar magnitude unitária", () => {
  const vector = normalizeVector(1, 1);
  assert.ok(Math.abs(vector.x - Math.SQRT1_2) < 1e-9);
  assert.ok(Math.abs(vector.y - Math.SQRT1_2) < 1e-9);
});

test("limita o vetor analógico ao raio unitário", () => {
  const vector = normalizeVector(3, 4);
  assert.ok(Math.abs(vector.x - 0.6) < 1e-9);
  assert.ok(Math.abs(vector.y - 0.8) < 1e-9);
});

test("mantém o vetor parado quando não há entrada", () => {
  assert.deepEqual(normalizeVector(0, 0), { x: 0, y: 0 });
});
