export interface MoonSlashConfig {
  readonly id: "moon-slash";
  readonly name: string;
  readonly guideName: string;
  readonly cooldownMs: number;
  readonly qiCost: number;
  readonly travelPx: number;
  readonly speedPxPerS: number;
  readonly hitRadiusPx: number;
  readonly damageMultiplier: number;
  readonly visualScale: number;
}

export interface OndaDeQiConfig {
  readonly id: "onda-de-qi";
  readonly name: string;
  readonly guideName: string;
  readonly cooldownMs: number;
  readonly qiCost: number;
  readonly castRangePx: number;
  readonly radiusPx: number;
  readonly damageMultiplier: number;
  readonly hitDelayMs: number;
  readonly visualScale: number;
  readonly effectMs: number;
}

export declare const MOON_SLASH: MoonSlashConfig;
export declare const ONDA_DE_QI: OndaDeQiConfig;
export declare const QI_REGEN_PER_SECOND: number;
