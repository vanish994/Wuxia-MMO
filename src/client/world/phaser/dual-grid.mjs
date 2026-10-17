const CORNER_ORDER = Object.freeze(["top-left", "top-right", "bottom-left", "bottom-right"]);

function tileKey(corners, variant) {
  return `${corners.join(",")}|${variant}`;
}

export function cellCorners(vertexGrid, x, y) {
  if (!Array.isArray(vertexGrid) || !vertexGrid.length) throw new Error("Vertex grid is empty");
  if (!Array.isArray(vertexGrid[y]) || !Array.isArray(vertexGrid[y + 1])) throw new Error(`Missing vertex row for cell ${x},${y}`);
  if (x < 0 || x + 1 >= vertexGrid[y].length || x + 1 >= vertexGrid[y + 1].length) {
    throw new Error(`Missing corner vertex for cell ${x},${y}`);
  }
  // Wang corner order in the generated manifest: TL, TR, BL, BR.
  return [vertexGrid[y][x], vertexGrid[y][x + 1], vertexGrid[y + 1][x], vertexGrid[y + 1][x + 1]];
}

export function createWangLookup(manifest) {
  if (manifest?.kind !== "wang_corner") throw new Error(`Expected wang_corner manifest, received ${manifest?.kind}`);
  const lookup = new Map();
  for (const tile of manifest.tiles ?? []) {
    if (!Array.isArray(tile.wang) || tile.wang.length !== 4) continue;
    lookup.set(tileKey(tile.wang, tile.variant), tile.index);
  }
  return lookup;
}

export function selectWangTile(manifest, corners, variant = 0) {
  if (!Array.isArray(corners) || corners.length !== 4) throw new Error("A Wang corner tile requires four material indices");
  const materialCount = manifest.materials?.length ?? 0;
  if (corners.some((value) => !Number.isInteger(value) || value < 0 || value >= materialCount)) {
    throw new Error(`Corner material indices must be in [0, ${materialCount - 1}]`);
  }
  const lookup = createWangLookup(manifest);
  const index = lookup.get(tileKey(corners, variant));
  if (index === undefined) throw new Error(`No Wang tile for corners ${corners.join(",")} variant ${variant}`);
  return index;
}

export function selectCellTile(manifest, vertexGrid, x, y, variant = 0) {
  return selectWangTile(manifest, cellCorners(vertexGrid, x, y), variant);
}

export function pairCoverage(manifest) {
  if (manifest?.kind !== "wang_corner") throw new Error("Pair coverage applies to wang_corner sets only");
  const materials = manifest.materials ?? [];
  const variants = manifest.variants ?? 1;
  const keys = new Set((manifest.tiles ?? []).filter((tile) => Array.isArray(tile.wang))
    .map((tile) => `${tile.wang.join(",")}|${tile.variant}`));
  const pairs = [];
  for (let a = 0; a < materials.length; a += 1) {
    for (let b = a + 1; b < materials.length; b += 1) {
      let statesPerVariant = Infinity;
      for (let variant = 0; variant < variants; variant += 1) {
        let states = 0;
        for (let mask = 0; mask < 16; mask += 1) {
          const corners = [0, 1, 2, 3].map((bit) => ((mask >> bit) & 1) ? b : a);
          if (keys.has(`${corners.join(",")}|${variant}`)) states += 1;
        }
        statesPerVariant = Math.min(statesPerVariant, states);
      }
      pairs.push({ materials: [materials[a], materials[b]], statesPerVariant, variants, complete: statesPerVariant === 16 });
    }
  }
  return pairs;
}

export { CORNER_ORDER };
