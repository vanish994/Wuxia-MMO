import Phaser from "phaser";
import { WOLF_LEVEL_1, type SpawnPoint } from "../combat/combat-config.mjs";
import { decideWolfAction, distance, applyDamage, isDead, isRespawnDue } from "../combat/combat-rules.mjs";
import { directionFor, WOLF_FRAME_BY_DIRECTION, type Direction } from "../character/directions";

export const WOLF_SHEET_KEY = "wolf-idle-sheet";
const BAR_WIDTH = 34;

export interface WolfTarget {
  x: number;
  y: number;
  alive: boolean;
}

export interface WolfTickResult {
  attacked: boolean;
}

/**
 * Presentation + body for one wolf. Decisions come from combat-rules.mjs; this class only applies
 * movement, animation cues and the HP bar. Death and respawn are driven by timestamps owned by the scene.
 */
export class Wolf {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly id: string;
  readonly spawnId: string;
  readonly homeX: number;
  readonly homeY: number;
  hp: number = WOLF_LEVEL_1.maxHp;
  facing: Direction = "down";
  private lastAttackAt = -Infinity;
  private diedAt = 0;
  private wanderTarget: { x: number; y: number } | null = null;
  private nextWanderAt = 0;
  private readonly bar: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, spawn: SpawnPoint, index: number) {
    this.id = `${spawn.id}-${index}`;
    this.spawnId = spawn.id;
    this.homeX = spawn.x;
    this.homeY = spawn.y;
    this.sprite = scene.physics.add.sprite(spawn.x, spawn.y, WOLF_SHEET_KEY, WOLF_FRAME_BY_DIRECTION.down);
    this.sprite.setSize(26, 18).setOffset(19, 40).setCollideWorldBounds(true);
    this.bar = scene.add.graphics().setDepth(5000);
    this.label = scene.add.text(spawn.x, spawn.y - 46, `${WOLF_LEVEL_1.name} Lv.${WOLF_LEVEL_1.level}`, {
      color: "#fff4d9", fontFamily: "Trebuchet MS, sans-serif", fontSize: "9px", fontStyle: "bold",
      backgroundColor: "#0c1624aa", padding: { left: 3, right: 3, top: 1, bottom: 1 },
    }).setOrigin(0.5, 1).setDepth(5000);
  }

  get alive(): boolean {
    return !isDead(this.hp);
  }

  /** Advances AI one frame. Reports whether the wolf struck, so the scene resolves damage against the player. */
  tick(now: number, target: WolfTarget): WolfTickResult {
    if (!this.alive) return { attacked: false };
    const decision = decideWolfAction(
      { x: this.sprite.x, y: this.sprite.y, homeX: this.homeX, homeY: this.homeY, hp: this.hp, lastAttackAt: this.lastAttackAt },
      target,
      now,
      WOLF_LEVEL_1,
    );
    let attacked = false;

    if (decision.mode === "attack") {
      this.sprite.setVelocity(0, 0);
      this.faceToward(target.x, target.y);
      if (decision.attack) {
        this.lastAttackAt = now;
        attacked = true;
        this.lunge(target.x, target.y);
      }
    } else if (decision.moveTo) {
      this.wanderTarget = null;
      this.moveToward(decision.moveTo, WOLF_LEVEL_1.chaseSpeed);
    } else {
      this.wander(now);
    }

    this.syncOverlays();
    return { attacked };
  }

  /** Applies already-computed damage (see resolveMobAttack/damageFor). Returns true when the wolf dies. */
  takeDamage(amount: number, now: number): boolean {
    if (!this.alive) return false;
    this.hp = applyDamage(this.hp, amount);
    this.sprite.setTint(0xff6b6b);
    this.sprite.scene.time.delayedCall(120, () => { if (this.alive && this.sprite.active) this.sprite.clearTint(); });
    if (isDead(this.hp)) {
      this.diedAt = now;
      this.sprite.setVelocity(0, 0);
      this.sprite.disableBody(true, true);
      this.bar.setVisible(false);
      this.label.setVisible(false);
      return true;
    }
    this.syncOverlays();
    return false;
  }

  /** Scene calls this every frame; re-enables the body once the configured respawn delay has elapsed. */
  maybeRespawn(now: number): boolean {
    if (this.alive || !isRespawnDue(this.diedAt, now, WOLF_LEVEL_1.respawnDelayMs)) return false;
    this.hp = WOLF_LEVEL_1.maxHp;
    this.sprite.enableBody(true, this.homeX, this.homeY, true, true);
    this.sprite.setVelocity(0, 0);
    this.sprite.setFrame(WOLF_FRAME_BY_DIRECTION.down);
    this.sprite.clearTint();
    this.bar.setVisible(true);
    this.label.setVisible(true);
    this.syncOverlays();
    return true;
  }

  destroy(): void {
    this.bar.destroy();
    this.label.destroy();
    this.sprite.destroy();
  }

  private moveToward(point: { x: number; y: number }, speed: number): void {
    const dx = point.x - this.sprite.x;
    const dy = point.y - this.sprite.y;
    const length = Math.hypot(dx, dy);
    if (length < 2) {
      this.sprite.setVelocity(0, 0);
      return;
    }
    this.sprite.setVelocity((dx / length) * speed, (dy / length) * speed);
    this.facing = directionFor(dx, dy);
    this.sprite.setFrame(WOLF_FRAME_BY_DIRECTION[this.facing]);
  }

  private wander(now: number): void {
    if (!this.wanderTarget || now >= this.nextWanderAt) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * WOLF_LEVEL_1.wanderRadiusPx;
      this.wanderTarget = { x: this.homeX + Math.cos(angle) * radius, y: this.homeY + Math.sin(angle) * radius };
      this.nextWanderAt = now + WOLF_LEVEL_1.wanderIntervalMs;
    }
    if (distance({ x: this.sprite.x, y: this.sprite.y }, this.wanderTarget) < 4) {
      this.sprite.setVelocity(0, 0);
      return;
    }
    this.moveToward(this.wanderTarget, WOLF_LEVEL_1.wanderSpeed);
  }

  private faceToward(x: number, y: number): void {
    this.facing = directionFor(x - this.sprite.x, y - this.sprite.y);
    this.sprite.setFrame(WOLF_FRAME_BY_DIRECTION[this.facing]);
  }

  /** The wolf sheet has no attack frames, so the strike is shown as a short forward lunge tween. */
  private lunge(x: number, y: number): void {
    const dx = x - this.sprite.x;
    const dy = y - this.sprite.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    this.sprite.scene.tweens.add({
      targets: this.sprite,
      x: this.sprite.x + (dx / length) * 8,
      y: this.sprite.y + (dy / length) * 8,
      yoyo: true,
      duration: 90,
      ease: "Quad.easeOut",
    });
  }

  private syncOverlays(): void {
    const x = this.sprite.x;
    const y = this.sprite.y;
    this.label.setPosition(x, y - 46);
    this.bar.clear();
    const ratio = Math.max(0, this.hp / WOLF_LEVEL_1.maxHp);
    this.bar.fillStyle(0x0c1624, 0.9).fillRect(x - BAR_WIDTH / 2 - 1, y - 40, BAR_WIDTH + 2, 6);
    this.bar.fillStyle(0xd65a4a, 1).fillRect(x - BAR_WIDTH / 2, y - 39, BAR_WIDTH * ratio, 4);
  }
}
