// Pure combat rules: no Phaser imports, so they can be validated in Node and later moved to a server.
// The client uses these functions to present feedback; an authoritative server must re-run them.

import { normalizeVector } from "../../input/movement.mjs";

export const DIRECTION_VECTORS = Object.freeze({
  "down": { x: 0, y: 1 },
  "down-right": { x: Math.SQRT1_2, y: Math.SQRT1_2 },
  "right": { x: 1, y: 0 },
  "up-right": { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
  "up": { x: 0, y: -1 },
  "up-left": { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
  "left": { x: -1, y: 0 },
  "down-left": { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
});

export function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Minimum damage is 1 so a hit is always visible; defense is subtracted from raw attack. */
export function damageFor(attack, defense) {
  return Math.max(1, Math.round(attack - defense));
}

export function applyDamage(hp, amount) {
  return Math.max(0, hp - Math.max(0, amount));
}

export function isDead(hp) {
  return hp <= 0;
}

/** Sword arc test: target must be within range and inside the arc centred on the facing direction. */
export function isInMeleeArc(attacker, target, facing, { rangePx, arcDegrees }) {
  const dx = target.x - attacker.x;
  const dy = target.y - attacker.y;
  const d = Math.hypot(dx, dy);
  if (d > rangePx) return false;
  if (d === 0) return true;
  const f = normalizeVector(facing.x, facing.y);
  if (!f.x && !f.y) return false;
  const cos = (dx * f.x + dy * f.y) / d;
  return cos >= Math.cos((arcDegrees * Math.PI) / 360);
}

export function isCooldownReady(now, lastUsedAt, cooldownMs) {
  return now - lastUsedAt >= cooldownMs;
}

/**
 * Wolf brain for one tick. Returns the mode, the point to walk toward (or null) and whether it attacks now.
 * Wolves are passive until the player enters aggroRange; they leash back to their home when chasing too far.
 */
export function decideWolfAction(wolf, player, now, config) {
  if (isDead(wolf.hp)) return { mode: "dead", moveTo: null, attack: false };
  const home = { x: wolf.homeX, y: wolf.homeY };
  const toHome = distance(wolf, home);
  const canSeePlayer = Boolean(player?.alive) && distance(wolf, player) <= config.aggroRangePx;
  if (!canSeePlayer) {
    if (toHome > 4) return { mode: "return", moveTo: home, attack: false };
    return { mode: "idle", moveTo: null, attack: false };
  }
  if (distance(home, player) > config.leashRangePx) {
    return { mode: "return", moveTo: home, attack: false };
  }
  const gap = distance(wolf, player);
  if (gap <= config.attackRangePx) {
    const ready = isCooldownReady(now, wolf.lastAttackAt ?? -Infinity, config.attackCooldownMs);
    return { mode: "attack", moveTo: null, attack: ready };
  }
  return { mode: "chase", moveTo: { x: player.x, y: player.y }, attack: false };
}

/** Result of the wolf's attack on the player: applies defense and reports whether the player died. */
export function resolveMobAttack(attacker, defender) {
  const amount = damageFor(attacker.attack, defender.defense);
  const hp = applyDamage(defender.hp, amount);
  return { amount, hp, defeated: isDead(hp) };
}

export function xpToNextLevel(level, xpBase) {
  return xpBase * level;
}

/** Adds XP and resolves any number of level-ups. Pure: returns a new progress object. */
export function grantXp(progress, amount, xpBase) {
  let { level, xp } = progress;
  let levelsGained = 0;
  xp += Math.max(0, amount);
  while (xp >= xpToNextLevel(level, xpBase)) {
    xp -= xpToNextLevel(level, xpBase);
    level += 1;
    levelsGained += 1;
  }
  return { level, xp, levelsGained };
}

export function isRespawnDue(diedAt, now, delayMs) {
  return now - diedAt >= delayMs;
}
