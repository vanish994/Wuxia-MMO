export type Season = "spring" | "summer" | "autumn" | "winter";
export type Weather = "rain" | "snow" | "petals" | "ash" | "fog";
export const SEASON_TINTS: Readonly<Record<Season, number>>;
export const WEATHER: Readonly<Record<Weather, Record<string, unknown>>>;
export function applySeasonTint(groundLayer: { setTint(value: number): unknown }, season?: Season): number;
export function applyTimeOfDay(scene: any, hour: number, options?: { depth?: number; alphaScale?: number }): { color: number; alpha: number; label: string; overlay: unknown };
export function startWeather(scene: any, kind: Weather, options?: { width?: number; height?: number; depth?: number; quantity?: number }): any;
export function stopWeather(emitter: any): void;
export function worldAppearance(scene: any, groundLayer: any, options?: { season?: Season; hour?: number; weather?: Weather; weatherOptions?: Record<string, unknown> }): { time: any; particles: any; destroy(): void };
