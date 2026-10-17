// Pure rules for target selection, aiming and auto-attack. The scene owns sprites, input and timers.
import { distance } from "./combat-rules.mjs";

/** Unit vector from origin to point, or `fallback` when the point is on top of the origin or missing. */
export function aimVector(origin, point, fallback) {
  if (!point) return fallback;
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return fallback;
  return { x: dx / length, y: dy / length };
}

/**
 * Onda de Qi landing point: the selected target's position, clamped to castRangePx along the aim line.
 * Without a target it lands castRangePx ahead along `fallback`.
 */
export function ondaAimPoint(origin, targetPoint, castRangePx, fallback) {
  if (!targetPoint) {
    return { x: origin.x + fallback.x * castRangePx, y: origin.y + fallback.y * castRangePx };
  }
  const reach = Math.min(castRangePx, distance(origin, targetPoint));
  const dir = aimVector(origin, targetPoint, fallback);
  return { x: origin.x + dir.x * reach, y: origin.y + dir.y * reach };
}

/**
 * Target for auto-attack: the selected wolf when it is alive, otherwise the nearest alive wolf
 * within acquireRangePx. Returns -1 when there is no valid target.
 */
export function chooseAutoTarget(origin, targets, selectedIndex, acquireRangePx) {
  if (selectedIndex >= 0 && targets[selectedIndex]?.alive) return selectedIndex;
  let best = -1;
  let bestDistance = Infinity;
  targets.forEach((target, index) => {
    if (!target.alive) return;
    const d = distance(origin, target);
    if (d <= acquireRangePx && d < bestDistance) {
      best = index;
      bestDistance = d;
    }
  });
  return best;
}

/** 'attack' when the target is inside the attack range, otherwise 'chase'. */
export function autoAttackStep(origin, targetPoint, rangePx) {
  return distance(origin, targetPoint) <= rangePx ? "attack" : "chase";
}
