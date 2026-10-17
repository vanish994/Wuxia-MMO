import type { MoonSlashConfig } from "./skills-config.mjs";

export interface Point {
  x: number;
  y: number;
}

export interface SkillTarget extends Point {
  alive: boolean;
}

export declare function canCastSkill(now: number, lastUsedAt: number, cooldownMs: number, qi: number, qiCost: number): boolean;
export declare function spendQi(qi: number, cost: number): number;
export declare function regenQi(qi: number, max: number, dtMs: number, perSecond: number): number;
export declare function moonSlashHits(origin: Point, facing: Point, targets: readonly SkillTarget[], config: MoonSlashConfig): number[];
export declare function ondaTargetPoint(origin: Point, facing: Point, castRangePx: number): Point;
export declare function ondaHits(center: Point, targets: readonly SkillTarget[], radiusPx: number): number[];
