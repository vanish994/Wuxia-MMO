// Pure rules for the active skills. The scene owns timers, sprites and damage application.
import { distance, isCooldownReady, isInMeleeArc } from "./combat-rules.mjs";

/** True when the skill is off cooldown and the player has enough Qi. */
export function canCastSkill(now, lastUsedAt, cooldownMs, qi, qiCost) {
  return isCooldownReady(now, lastUsedAt, cooldownMs) && qi >= qiCost;
}

/** Qi after paying a cost, never below zero. */
export function spendQi(qi, cost) {
  return Math.max(0, qi - cost);
}

/** Qi after regeneration over `dtMs`, capped at `max`. */
export function regenQi(qi, max, dtMs, perSecond) {
  return Math.min(max, qi + (perSecond * Math.max(0, dtMs)) / 1000);
}

/** Indices of alive targets inside the crescent of Moon Slash. */
export function moonSlashHits(origin, facing, targets, config) {
  const hits = [];
  targets.forEach((target, index) => {
    if (!target.alive) return;
    const inArc = isInMeleeArc(origin, target, facing, {
      rangePx: config.rangePx,
      arcDegrees: config.arcDegrees,
    });
    if (inArc) hits.push(index);
  });
  return hits;
}

/** Point where Onda de Qi lands: `castRangePx` ahead of the caster along `facing`. */
export function ondaTargetPoint(origin, facing, castRangePx) {
  return { x: origin.x + facing.x * castRangePx, y: origin.y + facing.y * castRangePx };
}

/** Indices of alive targets inside the circle of Onda de Qi. */
export function ondaHits(center, targets, radiusPx) {
  const hits = [];
  targets.forEach((target, index) => {
    if (target.alive && distance(center, target) <= radiusPx) hits.push(index);
  });
  return hits;
}
