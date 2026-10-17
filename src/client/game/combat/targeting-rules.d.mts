export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface TargetPoint extends Point {
  readonly alive: boolean;
}

export declare function aimVector(origin: Point, point: Point | null | undefined, fallback: Point): Point;
export declare function ondaAimPoint(origin: Point, targetPoint: Point | null | undefined, castRangePx: number, fallback: Point): Point;
export declare function chooseAutoTarget(origin: Point, targets: readonly TargetPoint[], selectedIndex: number, acquireRangePx: number): number;
export declare function autoAttackStep(origin: Point, targetPoint: Point, rangePx: number): "attack" | "chase";
