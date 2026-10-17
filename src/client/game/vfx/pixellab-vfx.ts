import Phaser from "phaser";
import clipTable from "./pixellab-vfx-clips.json";
import type { Direction } from "../character/directions";

/**
 * PixelLab VFX packs (one folder per facing). A clip is a spritesheet whose frames are drawn at
 * anchor + offset, where the anchor is the character's feet. Layers:
 *   - behind: draw before the character;
 *   - front: draw after the character;
 *   - whole: the full effect with no character (used for ground effects).
 * See assets/external/pixellab-vfx/<pack>/<direction>/manifest.json.
 */
export type VfxPack = "slash-arc-8-directions" | "energy-orb-8-directions";
export type VfxLayer = "whole" | "behind" | "front";

interface ClipEntry {
  file: string;
  frames: number;
  frameWidth: number;
  frameHeight: number;
  offsetX: number;
  offsetY: number;
  fps: number;
  loop: boolean;
}

interface DirectionEntry {
  anchorX: number;
  anchorY: number;
  /** Only the layers the artist exported exist for a given facing (manifest.json). */
  clips: Partial<Record<VfxLayer, ClipEntry>>;
}

const TABLE = clipTable as unknown as Record<VfxPack, Record<Direction, DirectionEntry>>;

export const VFX_PACKS: readonly VfxPack[] = ["slash-arc-8-directions", "energy-orb-8-directions"];

function textureKey(pack: VfxPack, direction: Direction, layer: VfxLayer): string {
  return `vfx:${pack}:${direction}:${layer}`;
}

function animationKey(pack: VfxPack, direction: Direction, layer: VfxLayer): string {
  return `${textureKey(pack, direction, layer)}:anim`;
}

/** Loads every clip sheet of both packs. Call from preload(). */
export function preloadPixellabVfx(scene: Phaser.Scene, assetPath: (path: string) => string): void {
  for (const pack of VFX_PACKS) {
    for (const direction of Object.keys(TABLE[pack]) as Direction[]) {
      const entry = TABLE[pack][direction];
      for (const [layer, clip] of Object.entries(entry.clips) as [VfxLayer, ClipEntry][]) {
        const key = textureKey(pack, direction, layer);
        if (!scene.textures.exists(key)) {
          scene.load.spritesheet(key, assetPath(clip.file), {
            frameWidth: clip.frameWidth,
            frameHeight: clip.frameHeight,
          });
        }
      }
    }
  }
}

/** Creates the looping or one-shot animations for every loaded clip. Call from create(). */
export function createPixellabVfxAnimations(scene: Phaser.Scene): void {
  for (const pack of VFX_PACKS) {
    for (const direction of Object.keys(TABLE[pack]) as Direction[]) {
      const entry = TABLE[pack][direction];
      for (const [layer, clip] of Object.entries(entry.clips) as [VfxLayer, ClipEntry][]) {
        const key = animationKey(pack, direction, layer);
        if (scene.anims.exists(key)) continue;
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(textureKey(pack, direction, layer), { start: 0, end: clip.frames - 1 }),
          frameRate: clip.fps,
          repeat: clip.loop ? -1 : 0,
        });
      }
    }
  }
}

/**
 * Plays one layer of an effect with the character's feet at (feetX, feetY).
 * One-shot clips destroy themselves when they finish.
 */
export function playPixellabVfx(
  scene: Phaser.Scene,
  pack: VfxPack,
  direction: Direction,
  layer: VfxLayer,
  feet: { x: number; y: number },
  depth: number,
  scale = 1,
): Phaser.GameObjects.Sprite | undefined {
  const entry = TABLE[pack][direction];
  const clip = entry.clips[layer];
  if (!clip) return undefined;
  const x = feet.x - entry.anchorX * scale + clip.offsetX * scale;
  const y = feet.y - entry.anchorY * scale + clip.offsetY * scale;
  const sprite = scene.add.sprite(x, y, textureKey(pack, direction, layer), 0).setOrigin(0, 0).setDepth(depth).setScale(scale);
  sprite.play(animationKey(pack, direction, layer));
  if (!clip.loop) sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => sprite.destroy());
  return sprite;
}

/**
 * Plays a ground effect (no character) centred on `center`. The manifest anchor only matters
 * for layers aligned with a character, so the frame is centred on the target point instead.
 */
export function playGroundVfx(
  scene: Phaser.Scene,
  pack: VfxPack,
  direction: Direction,
  layer: VfxLayer,
  center: { x: number; y: number },
  depth: number,
  scale = 1,
): Phaser.GameObjects.Sprite | undefined {
  const clip = TABLE[pack][direction].clips[layer];
  if (!clip) return undefined;
  const x = center.x - (clip.frameWidth * scale) / 2;
  const y = center.y - (clip.frameHeight * scale) / 2;
  const sprite = scene.add.sprite(x, y, textureKey(pack, direction, layer), 0).setOrigin(0, 0).setDepth(depth).setScale(scale);
  sprite.play(animationKey(pack, direction, layer));
  if (!clip.loop) sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => sprite.destroy());
  return sprite;
}

/** Plays behind/front layers around a character: behind goes under it, front goes over it. */
export function playCharacterVfx(
  scene: Phaser.Scene,
  pack: VfxPack,
  direction: Direction,
  feet: { x: number; y: number },
  characterDepth: number,
  scale = 1,
): void {
  // Some facings export only one of the two layers; a missing layer is simply not drawn.
  playPixellabVfx(scene, pack, direction, "behind", feet, characterDepth - 1, scale);
  playPixellabVfx(scene, pack, direction, "front", feet, characterDepth + 1, scale);
}
