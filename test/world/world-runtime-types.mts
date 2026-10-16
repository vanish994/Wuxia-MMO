import { createRegion, preloadRegion, type WuxiaWorldIndex } from "../../src/client/world/phaser/wuxia-region-loader.mjs";
import { selectCellTile, type WangManifest } from "../../src/client/world/phaser/dual-grid.mjs";
import { worldAppearance } from "../../src/client/world/phaser/wuxia-world-state.mjs";

declare const scene: any;
declare const worldIndex: WuxiaWorldIndex;
declare const wang: WangManifest;
declare const vertexGrid: number[][];

const queued = preloadRegion(scene, worldIndex, "qinghe-valley");
const region = createRegion(scene, worldIndex, queued.region.id);
const atlasIndex: number = selectCellTile(wang, vertexGrid, 0, 0, 1);
const appearance = worldAppearance(scene, region.groundLayer, { season: "spring", hour: 17, weather: "petals" });
void atlasIndex;
void appearance;
