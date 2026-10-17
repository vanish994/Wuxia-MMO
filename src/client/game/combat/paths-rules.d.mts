export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface TargetPoint extends Point {
  readonly alive: boolean;
}

export declare function masteryLevel(points: number, thresholds: readonly number[]): number;
export declare function masteryDamageMultiplier(level: number, damagePerLevel: number): number;
export declare function nearestTargetIndex(origin: Point, targets: readonly TargetPoint[], rangePx: number): number;
export declare function projectileTravelMs(distancePx: number, speedPxPerS: number): number;
export declare function addMasteryPoints(points: number, pointsGained: number): number;
