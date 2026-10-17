// Active skills of the two launch paths (GDD v0.3, Fase 3). All tuning lives here.
// Values are provisional: adjust after playtests, never inline them in the scene.

/** Caminho da Espada: Moon Slash (Corte da Meia-Lua). A wide crescent in front of the player. */
export const MOON_SLASH = Object.freeze({
  id: "moon-slash",
  name: "Moon Slash",
  guideName: "Corte da Meia-Lua",
  cooldownMs: 2200,
  qiCost: 0,
  rangePx: 120,
  arcDegrees: 170,
  damageMultiplier: 1.8,
  hitDelayMs: 140,
  visualScale: 2, // presentation only: integer scale of the 53px slash arc
});

/** Caminho do Cultivo: Onda de Qi. Targets a point ahead and damages everything inside its area. */
export const ONDA_DE_QI = Object.freeze({
  id: "onda-de-qi",
  name: "Onda de Qi",
  guideName: "Onda de Qi",
  cooldownMs: 6000,
  qiCost: 30,
  castRangePx: 170,
  radiusPx: 90,
  damageMultiplier: 1.4,
  hitDelayMs: 260,
  visualScale: 4, // presentation only: 44px orb x4 ~= the 90px radius
  effectMs: 600, // presentation only: how long the orb stays on the ground
});

/** Qi recovered per second while not casting. */
export const QI_REGEN_PER_SECOND = 4;
