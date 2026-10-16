import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  preloadRegion,
  regionAssetKeys,
  resolveInteractionObjects,
  resolvePropInstances,
} from "../../src/client/world/phaser/wuxia-region-loader.mjs";
import { cellCorners, pairCoverage, selectCellTile, selectWangTile } from "../../src/client/world/phaser/dual-grid.mjs";
import { applySeasonTint, applyTimeOfDay, startWeather } from "../../src/client/world/phaser/wuxia-world-state.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const worldIndex = JSON.parse(readFileSync(join(ROOT, "assets/world/maps/biomes/biome-index.json"), "utf8"));
const byId = new Map(worldIndex.regions.map((region) => [region.id, region]));

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), "utf8"));
}

function tilesetManifests() {
  const dir = join(ROOT, "assets/tilesets/generated-core-v1");
  return readdirSync(dir).filter((file) => file.endsWith(".tileset.json"))
    .map((file) => readJson(join("assets/tilesets/generated-core-v1", file)));
}

test("world index declares 20 regions, native 32px tiles, and 62 directed connections", () => {
  assert.equal(worldIndex.regions.length, 20);
  assert.equal(worldIndex.connections.length, 62);
  assert.ok(worldIndex.regions.every((region) => region.tile_size === 32));
});

test("every TMJ and referenced Phaser image exists and matches the region tileset", () => {
  for (const region of worldIndex.regions) {
    assert.ok(existsSync(join(ROOT, region.tiled_map)), `${region.id}: missing TMJ`);
    assert.ok(existsSync(join(ROOT, region.ground_image)), `${region.id}: missing ground image`);
    assert.ok(region.prop_images.length > 0, `${region.id}: empty prop image list`);
    for (const image of region.prop_images) assert.ok(existsSync(join(ROOT, image)), `${region.id}: missing ${image}`);
    const tmj = readJson(region.tiled_map);
    assert.equal(tmj.tilewidth, 32, `${region.id}: tile width`);
    assert.equal(tmj.tileheight, 32, `${region.id}: tile height`);
    assert.ok(tmj.tilesets.some((tileset) => tileset.name === region.tileset), `${region.id}: tileset mismatch`);
    assert.ok(tmj.layers.some((layer) => layer.name === "ground"), `${region.id}: ground layer missing`);
  }
});

test("every map portal resolves to a named spawn in the destination bundle", () => {
  for (const region of worldIndex.regions) {
    const bundle = readJson(region.bundle);
    for (const portal of bundle.portals ?? []) {
      const [destinationId, spawnId] = String(portal.to).split(":");
      const destination = byId.get(destinationId);
      assert.ok(destination, `${region.id}/${portal.id}: unknown destination ${destinationId}`);
      const destinationBundle = readJson(destination.bundle);
      assert.ok(destinationBundle.spawns.some((spawn) => spawn.id === spawnId),
        `${region.id}/${portal.id}: ${destinationId} has no spawn ${spawnId}`);
    }
  }
});

test("Qinghe image-collection props and interactions resolve from the actual TMJ", () => {
  const region = byId.get("qinghe-valley");
  const tmj = readJson(region.tiled_map);
  const props = resolvePropInstances(tmj, region.id);
  assert.ok(props.length >= 20, `expected many props, got ${props.length}`);
  assert.ok(props.every((prop) => prop.textureKey.startsWith("wuxia:qinghe-valley:prop:")));
  const interactions = resolveInteractionObjects(tmj);
  assert.ok(interactions.some((object) => object.type === "portal"));
  assert.ok(interactions.some((object) => object.type === "interaction"));
  assert.ok(interactions.every((object) => object.width > 0 && object.height > 0));
});

test("preloadRegion queues the TMJ, ground atlas, and all prop images with stable keys", () => {
  const region = byId.get("qinghe-valley");
  const calls = [];
  const scene = { load: {
    tilemapTiledJSON: (...args) => calls.push(["tmj", ...args]),
    image: (...args) => calls.push(["image", ...args]),
  } };
  const result = preloadRegion(scene, worldIndex, region.id, { assetRoot: "/game" });
  const keys = regionAssetKeys(region.id);
  assert.equal(calls[0][1], keys.tilemap);
  assert.equal(calls[0][2], `/game/${region.tiled_map}`);
  assert.equal(calls.filter((call) => call[0] === "image").length, region.prop_images.length + 1);
  assert.ok(calls.some((call) => call[1] === keys.ground && call[2] === `/game/${region.ground_image}`));
  assert.equal(result.region.id, region.id);
});

test("all region layouts and Tiled TMJ exports pass structural and pixel rerender checks", () => {
  for (const region of worldIndex.regions) {
    const regionRoot = dirname(join(ROOT, region.bundle));
    const layout = JSON.parse(readFileSync(join(regionRoot, "layout-qa.json"), "utf8"));
    const report = JSON.parse(readFileSync(join(regionRoot, "tiled/export-report.json"), "utf8"));
    assert.equal(layout.status, "pass", `${region.id}: layout QA`);
    assert.equal(report.status, "pass", `${region.id}: Tiled export`);
    for (const id of ["rerender_map_tmj", "rerender_map_embedded_tmj"]) {
      const check = report.checks.find((item) => item.id === id);
      assert.ok(check, `${region.id}: missing ${id}`);
      assert.equal(check.status, "pass", `${region.id}: ${id}`);
      assert.equal(check.value, 0, `${region.id}: ${id} pixel mismatch`);
    }
  }
});

test("all Wang atlases expose complete 16-state two-material pairs for every variant", () => {
  const manifests = tilesetManifests();
  const wang = manifests.filter((manifest) => manifest.kind === "wang_corner");
  assert.ok(wang.length >= 10, `only ${wang.length} Wang atlases found`);
  for (const manifest of wang) {
    assert.equal(manifest.seamless_verified, true, `${manifest.id}: seam proof missing`);
    assert.equal(manifest.seam_proof?.mismatches, 0, `${manifest.id}: seam mismatch`);
    assert.ok((manifest.tiles ?? []).every((tile) => Number.isInteger(tile.index)));
    assert.ok(pairCoverage(manifest).every((pair) => pair.complete && pair.statesPerVariant === 16), manifest.id);
  }
});

test("required terrain transitions are present in the material-pair catalog", () => {
  const pairs = new Set(tilesetManifests().filter((manifest) => manifest.kind === "wang_corner")
    .flatMap((manifest) => pairCoverage(manifest))
    .map((pair) => [...pair.materials].sort().join("|")));
  const required = [
    "dirt|grass", "grass|sand", "dirt|natural_stone", "grass|water", "dirt|water", "sand|water",
    "dirt_path|grass", "built_stone|natural_stone", "grass|snow", "dirt|snow", "corruption|grass",
    "corruption|natural_stone", "lava|natural_stone",
  ];
  for (const pair of required) assert.ok(pairs.has(pair), `missing required transition ${pair}`);
});

test("cell sampling uses the documented TL, TR, BL, BR vertex order and manifest indexes", () => {
  const manifest = tilesetManifests().find((item) => item.id === "grass-dirt-wang16");
  assert.ok(manifest);
  const grid = [[0, 1], [1, 0]];
  assert.deepEqual(cellCorners(grid, 0, 0), [0, 1, 1, 0]);
  const selected = selectCellTile(manifest, grid, 0, 0, 2);
  assert.equal(selected, selectWangTile(manifest, [0, 1, 1, 0], 2));
  assert.throws(() => selectWangTile(manifest, [0, 1, 2, 0], 0), /indices/);
});

test("season, time-of-day, and weather effects expose supported Phaser runtime calls", () => {
  let tint;
  assert.equal(applySeasonTint({ setTint: (value) => { tint = value; } }, "winter"), 0xc5daf0);
  assert.equal(tint, 0xc5daf0);
  const overlay = { setOrigin() { return this; }, setScrollFactor() { return this; }, setDepth() { return this; } };
  const time = applyTimeOfDay({ cameras: { main: { width: 800, height: 600 } }, add: { rectangle: () => overlay } }, 23);
  assert.equal(time.label, "night");
  assert.equal(time.overlay, overlay);
  let particleConfig;
  const texture = { getContext: () => ({ clearRect() {}, fillRect() {} }), refresh() {} };
  const emitter = { setScrollFactor() { return this; }, setDepth() { return this; } };
  const scene = {
    cameras: { main: { width: 800, height: 600 } },
    textures: { exists: () => false, createCanvas: () => texture },
    add: { particles: (...args) => { particleConfig = args[3]; return emitter; } },
  };
  assert.equal(startWeather(scene, "snow"), emitter);
  assert.equal(particleConfig.speedY.min, 24);
  assert.throws(() => startWeather(scene, "monsoon"), /Unsupported weather/);
});
