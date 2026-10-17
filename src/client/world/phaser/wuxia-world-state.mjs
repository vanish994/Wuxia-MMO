const SEASON_TINTS = Object.freeze({
  spring: 0xc8e9c1,
  summer: 0xffffff,
  autumn: 0xf2c59a,
  winter: 0xc5daf0,
});

function timePalette(hour) {
  const h = ((Number(hour) % 24) + 24) % 24;
  if (h < 5 || h >= 21) return { color: 0x18264f, alpha: 0.42, label: "night" };
  if (h < 8) return { color: 0xffc28e, alpha: 0.15, label: "dawn" };
  if (h < 17) return { color: 0xfff4d9, alpha: 0.035, label: "day" };
  if (h < 19) return { color: 0xf3a16f, alpha: 0.19, label: "dusk" };
  return { color: 0x55426f, alpha: 0.27, label: "nightfall" };
}

export function applySeasonTint(groundLayer, season = "summer") {
  const tint = SEASON_TINTS[season];
  if (tint === undefined) throw new Error(`Unsupported season: ${season}`);
  groundLayer.setTint(tint);
  return tint;
}

export function applyTimeOfDay(scene, hour, { depth = 100000, alphaScale = 1 } = {}) {
  const palette = timePalette(hour);
  const camera = scene.cameras.main;
  const overlay = scene.add.rectangle(0, 0, camera.width, camera.height, palette.color, palette.alpha * alphaScale)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(depth);
  return { ...palette, overlay };
}

function drawWeatherTexture(scene, key, kind) {
  if (scene.textures.exists(key)) return key;
  const texture = scene.textures.createCanvas(key, 16, 16);
  const ctx = texture.getContext();
  ctx.clearRect(0, 0, 16, 16);
  if (kind === "rain") {
    ctx.fillStyle = "rgba(157,207,255,0.85)";
    ctx.fillRect(7, 1, 1, 9);
    ctx.fillRect(12, 5, 1, 8);
  } else if (kind === "snow") {
    ctx.fillStyle = "rgba(236,248,255,0.95)";
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillRect(7, 4, 2, 8);
    ctx.fillRect(4, 7, 8, 2);
  } else if (kind === "petals") {
    ctx.fillStyle = "rgba(255,177,198,0.92)";
    ctx.fillRect(5, 5, 5, 3);
    ctx.fillRect(7, 3, 2, 7);
  } else if (kind === "ash") {
    ctx.fillStyle = "rgba(255,130,72,0.9)";
    ctx.fillRect(6, 5, 3, 3);
    ctx.fillRect(11, 10, 2, 2);
  } else {
    ctx.fillStyle = "rgba(204,218,231,0.28)";
    ctx.fillRect(2, 6, 12, 4);
    ctx.fillRect(5, 4, 8, 8);
  }
  texture.refresh();
  return key;
}

const WEATHER = Object.freeze({
  rain: { frequency: 18, lifespan: 950, speedX: -35, speedY: 430, alpha: { start: 0.75, end: 0.12 }, scale: { start: 0.8, end: 0.5 } },
  snow: { frequency: 70, lifespan: 6500, speedX: { min: -18, max: 18 }, speedY: { min: 24, max: 62 }, alpha: { start: 0.9, end: 0.25 }, scale: { start: 0.85, end: 0.35 } },
  petals: { frequency: 95, lifespan: 5000, speedX: { min: -42, max: 35 }, speedY: { min: 18, max: 72 }, alpha: { start: 0.92, end: 0.1 }, scale: { start: 0.9, end: 0.35 } },
  ash: { frequency: 65, lifespan: 4200, speedX: { min: -16, max: 16 }, speedY: { min: -28, max: 22 }, alpha: { start: 0.85, end: 0.15 }, scale: { start: 0.8, end: 0.25 } },
  fog: { frequency: 320, lifespan: 9000, speedX: { min: -10, max: 10 }, speedY: { min: -2, max: 2 }, alpha: { start: 0.25, end: 0.03 }, scale: { start: 1.2, end: 2.3 } },
});

export function startWeather(scene, kind, { width, height, depth = 90000, quantity = 2 } = {}) {
  const settings = WEATHER[kind];
  if (!settings) throw new Error(`Unsupported weather effect: ${kind}`);
  const texture = drawWeatherTexture(scene, `wuxia-weather-${kind}`, kind);
  const camera = scene.cameras.main;
  const w = width ?? camera.width;
  const h = height ?? camera.height;
  const emitter = scene.add.particles(0, 0, texture, {
    ...settings,
    x: { min: 0, max: w },
    y: { min: 0, max: h },
    quantity,
    emitting: true,
  });
  emitter.setScrollFactor?.(0);
  emitter.setDepth?.(depth);
  return emitter;
}

export function stopWeather(emitter) {
  emitter?.stop?.();
  emitter?.destroy?.();
}

export function worldAppearance(scene, groundLayer, { season = "summer", hour = 12, weather, weatherOptions = {} } = {}) {
  applySeasonTint(groundLayer, season);
  const time = applyTimeOfDay(scene, hour);
  const particles = weather ? startWeather(scene, weather, weatherOptions) : null;
  return {
    time,
    particles,
    destroy() {
      time.overlay.destroy?.();
      stopWeather(particles);
      groundLayer.clearTint?.();
    },
  };
}

export { SEASON_TINTS, WEATHER };
