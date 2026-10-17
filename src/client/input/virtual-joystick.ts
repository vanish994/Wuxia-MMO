import Phaser from "phaser";
import { normalizeVector } from "./movement.mjs";

export interface VirtualJoystickOptions {
  radius?: number;
  depth?: number;
}

/** Touch control kept independent from movement rules so it can be replaced by a native input later. */
export class VirtualJoystick {
  private readonly scene: Phaser.Scene;
  private readonly radius: number;
  private readonly depth: number;
  private readonly base: Phaser.GameObjects.Arc;
  private readonly thumb: Phaser.GameObjects.Arc;
  private activePointerId: number | null = null;
  private vector = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, options: VirtualJoystickOptions = {}) {
    this.scene = scene;
    this.radius = options.radius ?? 66;
    this.depth = options.depth ?? 2000;
    this.base = scene.add.circle(0, 0, this.radius, 0x0c1624, 0.78)
      .setStrokeStyle(3, 0x93d7c5, 0.58)
      .setScrollFactor(0)
      .setDepth(this.depth)
      .setInteractive();
    this.thumb = scene.add.circle(0, 0, this.radius * 0.42, 0x75cdb8, 0.88)
      .setStrokeStyle(2, 0xe4fff4, 0.75)
      .setScrollFactor(0)
      .setDepth(this.depth + 1);

    this.base.on("pointerdown", this.onPointerDown, this);
    scene.input.on("pointermove", this.onPointerMove, this);
    scene.input.on("pointerup", this.onPointerUp, this);
    scene.input.on("pointercancel", this.onPointerUp, this);
    scene.scale.on("resize", this.layout, this);
    this.layout();
  }

  getVector(): { x: number; y: number } {
    return { ...this.vector };
  }

  destroy(): void {
    this.base.off("pointerdown", this.onPointerDown, this);
    this.scene.input.off("pointermove", this.onPointerMove, this);
    this.scene.input.off("pointerup", this.onPointerUp, this);
    this.scene.input.off("pointercancel", this.onPointerUp, this);
    this.scene.scale.off("resize", this.layout, this);
    this.base.destroy();
    this.thumb.destroy();
  }

  private layout(): void {
    const width = this.scene.scale.gameSize.width;
    const height = this.scene.scale.gameSize.height;
    const x = Math.max(this.radius + 24, Math.min(width * 0.22, width - this.radius - 24));
    const y = height - this.radius - 34;
    this.base.setPosition(x, y);
    this.thumb.setPosition(x, y);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    this.activePointerId = pointer.id;
    this.updateFromPointer(pointer);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.activePointerId) this.updateFromPointer(pointer);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.activePointerId) return;
    this.activePointerId = null;
    this.vector = { x: 0, y: 0 };
    this.thumb.setPosition(this.base.x, this.base.y);
  }

  private updateFromPointer(pointer: Phaser.Input.Pointer): void {
    const dx = pointer.x - this.base.x;
    const dy = pointer.y - this.base.y;
    const length = Math.hypot(dx, dy);
    const clamped = Math.min(this.radius, length);
    const direction = normalizeVector(dx, dy);
    this.vector = direction;
    this.thumb.setPosition(
      this.base.x + direction.x * clamped,
      this.base.y + direction.y * clamped,
    );
  }
}
