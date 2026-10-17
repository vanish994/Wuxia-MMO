/** Eight-direction vocabulary shared by the samurai atlases and the wolf sheet. */
export const DIRECTIONS = ["down", "down-left", "down-right", "left", "right", "up", "up-left", "up-right"] as const;
export type Direction = (typeof DIRECTIONS)[number];

/**
 * Frame order of the wolf sheet (Lobo_Feroz_estilo_wuxia-Idle.json): south, south-east, east, north-east,
 * north, north-west, west, south-west. Index = frame number in the 1×8 spritesheet.
 */
export const WOLF_FRAME_BY_DIRECTION: Readonly<Record<Direction, number>> = {
  down: 0,
  "down-right": 1,
  right: 2,
  "up-right": 3,
  up: 4,
  "up-left": 5,
  left: 6,
  "down-left": 7,
};

/** Maps a movement vector to one of eight directions, preferring cardinals when one axis dominates. */
export function directionFor(x: number, y: number): Direction {
  if (Math.abs(x) > Math.abs(y) * 1.8) return x > 0 ? "right" : "left";
  if (Math.abs(y) > Math.abs(x) * 1.8) return y > 0 ? "down" : "up";
  if (x >= 0 && y >= 0) return "down-right";
  if (x < 0 && y >= 0) return "down-left";
  if (x >= 0 && y < 0) return "up-right";
  return "up-left";
}
