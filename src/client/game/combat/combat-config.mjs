// Central balance data for the local prototype. Values are provisional (GDD v0.3 leaves numbers open
// until playtests) and must stay here so they can be tuned without touching gameplay code.
// Units: pixels for distances, milliseconds for timers, seconds are never used.

export const PLAYER_COMBAT = Object.freeze({
  maxHp: 100,
  maxQi: 80,
  attack: 18,
  defense: 2,
  moveSpeed: 150,
  swordRangePx: 64,
  swordArcDegrees: 120,
  swordCooldownMs: 500,
  swordHitDelayMs: 150,
  respawnDelayMs: 3000,
  startLevel: 1,
  xpBase: 100,
});

/** Progress rule: XP needed to leave level N is xpBase * N. */
export const PROGRESSION = Object.freeze({
  xpBase: PLAYER_COMBAT.xpBase,
});

export const WOLF_LEVEL_1 = Object.freeze({
  id: "wolf",
  name: "Lobo Feroz",
  level: 1,
  maxHp: 40,
  attack: 6,
  defense: 1,
  chaseSpeed: 110,
  wanderSpeed: 40,
  aggroRangePx: 150,
  leashRangePx: 260,
  attackRangePx: 34,
  attackCooldownMs: 1200,
  wanderRadiusPx: 72,
  wanderIntervalMs: 2600,
  respawnDelayMs: 8000,
  xpReward: 12,
  drops: Object.freeze([Object.freeze({ itemId: "wolf-pelt", quantity: 1 })]),
});

/** Spawn points for wolves in the hunting ground (outside the village core).
 * tests/world/hunt-spawns.test.mjs verifies each point is walkable and reachable from the arrival spawn. */
export const HUNT_SPAWNS = Object.freeze([
  { id: "west-field", x: 180, y: 400 },
  { id: "west-south", x: 320, y: 860 },
  { id: "south-field", x: 680, y: 980 },
  { id: "south-east", x: 1100, y: 1000 },
  { id: "east-field", x: 1480, y: 800 },
  { id: "north-east", x: 1260, y: 340 },
]);

/** Where a defeated player reappears: the bundle's `arrival` spawn in the plaza (no shrine interaction yet). */
export const RESPAWN_POINT = Object.freeze({ regionId: "qinghe-valley", spawnId: "arrival", x: 896, y: 640 });

export const WOLVES_PER_SPAWN = 1;
