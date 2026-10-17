export declare const PATH_SWORD: "sword";
export declare const PATH_QI: "qi";

export type PathId = typeof PATH_SWORD | typeof PATH_QI;

export interface MeleeBasicAttack {
  readonly kind: "melee";
  readonly cooldownMs: number;
  readonly damageMultiplier: number;
}

export interface ProjectileBasicAttack {
  readonly kind: "projectile";
  readonly maxRangePx: number;
  readonly projectileSpeedPxPerS: number;
  readonly cooldownMs: number;
  readonly damageMultiplier: number;
  readonly qiCost: number;
  readonly visualScale: number;
}

export interface PathConfig {
  readonly id: PathId;
  readonly name: string;
  readonly basicAttack: MeleeBasicAttack | ProjectileBasicAttack;
  readonly skillId: "moon-slash" | "onda-de-qi";
}

export declare const PATHS: Readonly<Record<PathId, PathConfig>>;

export interface MasteryConfig {
  readonly pointsPerBasicHit: number;
  readonly pointsPerSkillHit: number;
  readonly thresholds: readonly number[];
  readonly damagePerLevel: number;
}

export declare const MASTERY: MasteryConfig;
