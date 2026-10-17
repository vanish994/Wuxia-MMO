export interface PlayerCombatConfig {
  readonly maxHp: number; readonly maxQi: number; readonly attack: number; readonly defense: number;
  readonly moveSpeed: number; readonly swordRangePx: number; readonly swordArcDegrees: number;
  readonly swordCooldownMs: number; readonly swordHitDelayMs: number; readonly respawnDelayMs: number;
  readonly startLevel: number; readonly xpBase: number;
}
export interface WolfDrop { readonly itemId: string; readonly quantity: number }
export interface MobConfig {
  readonly id: string; readonly name: string; readonly level: number; readonly maxHp: number;
  readonly attack: number; readonly defense: number; readonly chaseSpeed: number; readonly wanderSpeed: number;
  readonly aggroRangePx: number; readonly leashRangePx: number; readonly attackRangePx: number;
  readonly attackCooldownMs: number; readonly wanderRadiusPx: number; readonly wanderIntervalMs: number;
  readonly respawnDelayMs: number; readonly xpReward: number; readonly drops: readonly WolfDrop[];
}
export interface SpawnPoint { readonly id: string; readonly x: number; readonly y: number }
export const PLAYER_COMBAT: PlayerCombatConfig;
export const PROGRESSION: { readonly xpBase: number };
export const WOLF_LEVEL_1: MobConfig;
export const HUNT_SPAWNS: readonly SpawnPoint[];
export const RESPAWN_POINT: { readonly regionId: string; readonly spawnId: string; readonly x: number; readonly y: number };
export const WOLVES_PER_SPAWN: number;
