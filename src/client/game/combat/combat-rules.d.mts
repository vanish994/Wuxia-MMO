export interface Point { x: number; y: number }
export const DIRECTION_VECTORS: Record<string, Point>;
export function distance(a: Point, b: Point): number;
export function damageFor(attack: number, defense: number): number;
export function applyDamage(hp: number, amount: number): number;
export function isDead(hp: number): boolean;
export function isInMeleeArc(attacker: Point, target: Point, facing: Point, options: { rangePx: number; arcDegrees: number }): boolean;
export function isCooldownReady(now: number, lastUsedAt: number, cooldownMs: number): boolean;
export type WolfMode = "dead" | "return" | "idle" | "attack" | "chase";
export interface WolfState extends Point { homeX: number; homeY: number; hp: number; lastAttackAt?: number }
export interface WolfDecision { mode: WolfMode; moveTo: Point | null; attack: boolean }
export function decideWolfAction(wolf: WolfState, player: (Point & { alive: boolean }) | null | undefined, now: number, config: {
  aggroRangePx: number; leashRangePx: number; attackRangePx: number; attackCooldownMs: number;
}): WolfDecision;
export function resolveMobAttack(attacker: { attack: number }, defender: { hp: number; defense: number }): { amount: number; hp: number; defeated: boolean };
export function xpToNextLevel(level: number, xpBase: number): number;
export interface Progress { level: number; xp: number }
export function grantXp(progress: Progress, amount: number, xpBase: number): Progress & { levelsGained: number };
export function isRespawnDue(diedAt: number, now: number, delayMs: number): boolean;
