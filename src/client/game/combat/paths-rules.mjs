// Pure rules for combat paths and mastery. The scene owns timers, sprites and damage application.
import { distance } from "./combat-rules.mjs";

/** Mastery level reached with `points` (0 when below the first threshold). */
export function masteryLevel(points, thresholds) {
  let level = 0;
  for (const threshold of thresholds) {
    if (points >= threshold) level += 1;
    else break;
  }
  return level;
}

/** Damage multiplier granted by mastery for the path that owns it. */
export function masteryDamageMultiplier(level, damagePerLevel) {
  return 1 + level * damagePerLevel;
}

/** Index of the nearest alive target within `rangePx`, or -1. */
export function nearestTargetIndex(origin, targets, rangePx) {
  let best = -1;
  let bestDistance = Infinity;
  targets.forEach((target, index) => {
    if (!target.alive) return;
    const d = distance(origin, target);
    if (d <= rangePx && d < bestDistance) {
      best = index;
      bestDistance = d;
    }
  });
  return best;
}

/** Time for a projectile to reach a point at `distancePx`, in milliseconds (never below 1). */
export function projectileTravelMs(distancePx, speedPxPerS) {
  return Math.max(1, Math.round((distancePx / speedPxPerS) * 1000));
}

/** Mastery points after one event of `pointsGained`, never below zero. */
export function addMasteryPoints(points, pointsGained) {
  return Math.max(0, points + pointsGained);
}
