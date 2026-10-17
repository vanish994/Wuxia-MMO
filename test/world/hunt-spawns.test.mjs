// Validates hunting-ground spawns against the real Qinghe TMJ collisions and village-kit colliders.
// The player body is 22×22 px (see wuxia-scene.ts); a point is walkable only if that box is clear.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { HUNT_SPAWNS, RESPAWN_POINT, WOLF_LEVEL_1 } from "../../src/client/game/combat/combat-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const tmj = JSON.parse(readFileSync(join(ROOT, "assets/world/maps/biomes/regions/qinghe-valley-v1/tiled/map.embedded.tmj"), "utf8"));
const kit = JSON.parse(readFileSync(join(ROOT, "assets/world/maps/biomes/qinghe-valley-village-kit.json"), "utf8"));
const WORLD_W = tmj.width * tmj.tilewidth;
const WORLD_H = tmj.height * tmj.tileheight;
const HALF = 11;
const ARRIVAL = { x: 576, y: 480 };

const rects = [];
for (const layer of tmj.layers) if (layer.name === "collision") for (const o of layer.objects) rects.push([o.x, o.y, o.width, o.height]);
for (const o of kit.objects) if (o.collision) rects.push([o.collision.x, o.collision.y, o.collision.width, o.collision.height]);

function blocked(x, y) {
  if (x - HALF < 0 || y - HALF < 0 || x + HALF > WORLD_W || y + HALF > WORLD_H) return true;
  return rects.some(([rx, ry, rw, rh]) => x + HALF > rx && x - HALF < rx + rw && y + HALF > ry && y - HALF < ry + rh);
}

const S = 8;
const cols = Math.ceil(WORLD_W / S);
const rows = Math.ceil(WORLD_H / S);
const free = new Uint8Array(cols * rows);
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) free[r * cols + c] = blocked(c * S + S / 2, r * S + S / 2) ? 0 : 1;

const reachable = new Uint8Array(cols * rows);
const start = Math.floor(ARRIVAL.y / S) * cols + Math.floor(ARRIVAL.x / S);
assert.equal(free[start], 1, "arrival spawn must be walkable");
const queue = [start];
reachable[start] = 1;
for (let i = 0; i < queue.length; i++) {
  const idx = queue[i];
  const r = Math.floor(idx / cols);
  const c = idx % cols;
  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
    const n = nr * cols + nc;
    if (!reachable[n] && free[n]) {
      reachable[n] = 1;
      queue.push(n);
    }
  }
}

test("every hunt spawn is walkable for the player body and reachable from arrival", () => {
  for (const spawn of HUNT_SPAWNS) {
    assert.equal(blocked(spawn.x, spawn.y), false, `${spawn.id} overlaps a collider`);
    const idx = Math.floor(spawn.y / S) * cols + Math.floor(spawn.x / S);
    assert.equal(reachable[idx], 1, `${spawn.id} is not reachable from arrival`);
  }
});

test("hunt spawns sit outside the village plaza, so the player must leave the core to reach them", () => {
  for (const spawn of HUNT_SPAWNS) {
    const d = Math.hypot(spawn.x - ARRIVAL.x, spawn.y - ARRIVAL.y);
    assert.ok(d >= 300, `${spawn.id} is only ${Math.round(d)}px from arrival`);
  }
});

test("wolf body and aggro envelope fit inside the hunting spawn spacing", () => {
  for (let i = 0; i < HUNT_SPAWNS.length; i++) {
    for (let j = i + 1; j < HUNT_SPAWNS.length; j++) {
      const d = Math.hypot(HUNT_SPAWNS[i].x - HUNT_SPAWNS[j].x, HUNT_SPAWNS[i].y - HUNT_SPAWNS[j].y);
      assert.ok(d > WOLF_LEVEL_1.leashRangePx / 2, `${HUNT_SPAWNS[i].id}/${HUNT_SPAWNS[j].id} too close`);
    }
  }
});

test("the respawn point is a declared walkable spawn of the bundle", () => {
  assert.equal(RESPAWN_POINT.regionId, "qinghe-valley");
  assert.equal(blocked(RESPAWN_POINT.x, RESPAWN_POINT.y), false);
  const bundle = JSON.parse(readFileSync(join(ROOT, "assets/world/maps/biomes/regions/qinghe-valley-v1/map-bundle.json"), "utf8"));
  const spawn = bundle.spawns.find((item) => item.id === RESPAWN_POINT.spawnId);
  assert.ok(spawn, "respawn spawn exists in bundle");
  assert.deepEqual([spawn.x, spawn.y], [RESPAWN_POINT.x, RESPAWN_POINT.y]);
});
