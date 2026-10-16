const GID_MASK = 0x0fffffff;

function basename(path) {
  return String(path).split(/[\\/]/).pop().replace(/\.[^.]+$/, "");
}

function propertyMap(properties = []) {
  if (!Array.isArray(properties)) return properties ?? {};
  return Object.fromEntries(properties.map((p) => [p.name, p.value]));
}

function propertyValue(properties, key, fallback = undefined) {
  const values = propertyMap(properties);
  return Object.hasOwn(values, key) ? values[key] : fallback;
}

function assetUrl(path, root = "/") {
  const prefix = String(root).replace(/\/+$/, "");
  return `${prefix}/${String(path).replace(/^\/+/, "")}`;
}

export function regionById(index, id) {
  const region = index?.regions?.find((item) => item.id === id);
  if (!region) throw new Error(`Unknown Wuxia region: ${id}`);
  return region;
}

export function regionAssetKeys(regionId) {
  return {
    tilemap: `wuxia:${regionId}:tmj`,
    ground: `wuxia:${regionId}:ground`,
    prop: (name) => `wuxia:${regionId}:prop:${name}`,
  };
}

export function preloadRegion(scene, index, regionId, { assetRoot = "/" } = {}) {
  const region = regionById(index, regionId);
  if (!region.tiled_map || !region.ground_image) {
    throw new Error(`Region ${regionId} is missing its Tiled map or ground atlas path`);
  }
  const keys = regionAssetKeys(regionId);
  const tilemapCached = scene.cache?.tilemap?.exists?.(keys.tilemap) ?? false;
  const textureCached = (key) => scene.textures?.exists?.(key) ?? false;
  if (!tilemapCached) scene.load.tilemapTiledJSON(keys.tilemap, assetUrl(region.tiled_map, assetRoot));
  if (!textureCached(keys.ground)) scene.load.image(keys.ground, assetUrl(region.ground_image, assetRoot));
  for (const imagePath of region.prop_images ?? []) {
    const key = keys.prop(basename(imagePath));
    if (!textureCached(key)) scene.load.image(key, assetUrl(imagePath, assetRoot));
  }
  return { region, keys };
}

export function resolvePropInstances(mapJson, regionId) {
  const layer = mapJson.layers?.find((item) => item.name === "props");
  if (!layer) return [];
  const imageSet = (mapJson.tilesets ?? []).find((item) => item.name === "props" && !item.image);
  if (!imageSet) return [];
  const tileById = new Map((imageSet.tiles ?? []).map((item) => [item.id, item]));
  const instances = [];
  for (const object of layer.objects ?? []) {
    if (!object.gid) continue;
    const gid = (object.gid >>> 0) & GID_MASK;
    const tile = tileById.get(gid - imageSet.firstgid);
    if (!tile?.image) continue;
    const props = propertyMap(object.properties);
    const imageName = basename(tile.image);
    instances.push({
      id: object.id,
      name: object.name,
      textureKey: regionAssetKeys(regionId).prop(imageName),
      x: props.anchorWorldX ?? object.x + object.width / 2,
      y: props.anchorWorldY ?? object.y,
      depth: props.sortY ?? props.anchorWorldY ?? object.y,
      scale: props.scale ?? 1,
      solid: props.solid ?? false,
      occlusion: props.occlusion ?? "low",
      flipX: Boolean(object.flipX),
      flipY: Boolean(object.flipY),
    });
  }
  return instances;
}

export function resolveInteractionObjects(mapJson) {
  const layer = mapJson.layers?.find((item) => item.name === "interactions");
  return (layer?.objects ?? [])
    .filter((object) => object.type === "portal" || object.type === "interaction")
    .map((object) => {
      const properties = propertyMap(object.properties);
      const reach = Number(properties.reach ?? properties.radius ?? 0);
      const width = object.width || reach * 2;
      const height = object.height || reach * 2;
      return {
        id: object.id,
        name: object.name,
        type: object.type,
        x: object.x,
        y: object.y,
        width,
        height,
        properties,
      };
    });
}

function addInvisibleZone(scene, object, staticBody = true) {
  const zone = scene.add.zone(
    object.x + object.width / 2,
    object.y + object.height / 2,
    Math.max(1, object.width),
    Math.max(1, object.height),
  );
  zone.setVisible?.(false);
  if (scene.physics?.add?.existing) scene.physics.add.existing(zone, staticBody);
  return zone;
}

export function createRegion(scene, index, regionId) {
  const region = regionById(index, regionId);
  const keys = regionAssetKeys(regionId);
  const tilemap = scene.make.tilemap({ key: keys.tilemap });
  const groundTileset = tilemap.addTilesetImage(region.tileset, keys.ground);
  if (!groundTileset) throw new Error(`Missing ground tileset '${region.tileset}' for ${regionId}`);
  const groundLayer = tilemap.createLayer("ground", groundTileset, 0, 0);
  if (!groundLayer) throw new Error(`TMJ ground layer missing for ${regionId}`);

  const rawMap = scene.cache.tilemap.get(keys.tilemap).data;
  const props = resolvePropInstances(rawMap, regionId).map((item) => {
    const image = scene.add.image(item.x, item.y, item.textureKey)
      .setOrigin(0.5, 1)
      .setDepth(item.depth)
      .setScale(item.scale)
      .setFlip(item.flipX, item.flipY);
    return { ...item, image };
  });

  const collisionLayer = rawMap.layers?.find((item) => item.name === "collision");
  const colliders = (collisionLayer?.objects ?? []).map((object) => {
    const collider = addInvisibleZone(scene, object, true);
    return { object, collider };
  });

  const interactions = resolveInteractionObjects(rawMap).map((object) => {
    const zone = addInvisibleZone(scene, object, true);
    return { ...object, zone };
  });

  return {
    id: regionId,
    region,
    tilemap,
    groundLayer,
    props,
    colliders,
    interactions,
    attachPlayer(player, handlers = {}) {
      for (const item of colliders) scene.physics?.add?.collider?.(player, item.collider);
      for (const item of interactions) {
        const callback = item.type === "portal" ? handlers.onPortal : handlers.onInteraction;
        if (callback) scene.physics?.add?.overlap?.(player, item.zone, () => callback(item));
      }
    },
    destroy() {
      for (const item of props) item.image.destroy?.();
      for (const item of colliders) item.collider.destroy?.();
      for (const item of interactions) item.zone.destroy?.();
      groundLayer.destroy?.();
    },
  };
}

export { assetUrl, basename, propertyMap, propertyValue };
