// Combat paths (Rucoy-style "classes" in the GDD sense). The player switches path freely with one button.
// Each path has its own basic attack, its own active skill and its own mastery. Mastery only affects its path.
// All tuning lives here; the scene never inlines these numbers.

export const PATH_SWORD = "sword";
export const PATH_QI = "qi";

export const PATHS = Object.freeze({
  [PATH_SWORD]: Object.freeze({
    id: PATH_SWORD,
    name: "Caminho da Espada",
    basicAttack: Object.freeze({
      kind: "melee", // resolved by the existing sword arc (resolveSwordHits)
      cooldownMs: 500,
      damageMultiplier: 1,
    }),
    skillId: "moon-slash",
  }),
  [PATH_QI]: Object.freeze({
    id: PATH_QI,
    name: "Caminho do Cultivo",
    basicAttack: Object.freeze({
      kind: "projectile", // Qi projectile that homes on the nearest wolf inside maxRangePx
      maxRangePx: 220,
      projectileSpeedPxPerS: 460,
      cooldownMs: 700,
      damageMultiplier: 0.9,
      qiCost: 0,
      visualScale: 0.5, // presentation only: the 44px orb shrunk to a projectile
    }),
    skillId: "onda-de-qi",
  }),
});

/** Mastery gained per event, for the path that produced it. */
export const MASTERY = Object.freeze({
  pointsPerBasicHit: 1,
  pointsPerSkillHit: 3,
  // Cumulative points needed to reach level 1, 2, 3, ...; level 0 starts at 0 points.
  thresholds: Object.freeze([10, 25, 50, 90, 140]),
  // Each mastery level adds this fraction to damage of that path only.
  damagePerLevel: 0.05,
});
