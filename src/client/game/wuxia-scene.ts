import Phaser from "phaser";
import {
  WuxiaWorldLoader,
  type InteractionRequest,
  type PortalRequest,
} from "../world/phaser/wuxia-world-loader.js";
import type { RegionRuntime } from "../world/phaser/wuxia-region-loader.mjs";
import { VirtualJoystick } from "../input/virtual-joystick";
import { DIRECTIONS, directionFor, type Direction } from "./character/directions";
import { PLAYER_COMBAT, PROGRESSION, RESPAWN_POINT, HUNT_SPAWNS, WOLF_LEVEL_1, WOLVES_PER_SPAWN } from "./combat/combat-config.mjs";
import {
  DIRECTION_VECTORS, distance, damageFor, grantXp, isCooldownReady, isInMeleeArc, resolveMobAttack,
} from "./combat/combat-rules.mjs";
import { Wolf, WOLF_SHEET_KEY, type WolfTarget } from "./entities/wolf";
import { MOON_SLASH, ONDA_DE_QI, QI_REGEN_PER_SECOND } from "./combat/skills-config.mjs";
import { canCastSkill, moonSlashHits, ondaHits, ondaTargetPoint, regenQi, spendQi } from "./combat/skills-rules.mjs";
import { createPixellabVfxAnimations, playCharacterVfx, playGroundVfx, preloadPixellabVfx } from "./vfx/pixellab-vfx";
import { MASTERY, PATHS, PATH_QI, PATH_SWORD, type PathId } from "./combat/paths-config.mjs";
import { AUTO_ATTACK, type ProjectileBasicAttack } from "./combat/paths-config.mjs";
import { addMasteryPoints, masteryDamageMultiplier, masteryLevel, nearestTargetIndex, projectileTravelMs } from "./combat/paths-rules.mjs";
import { aimVector, ondaAimPoint, chooseAutoTarget, autoAttackStep } from "./combat/targeting-rules.mjs";
import { advanceProjectile } from "./combat/skills-rules.mjs";

const assetPath = (path: string): string => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
const REGION_TITLES: Record<string, string> = { "qinghe-valley": "Vale da Lua Serena" };
const HUD_FONT = "Trebuchet MS, sans-serif";
const BAR_FILL_WIDTH = 84;
/** A queued key press older than this is discarded instead of firing late (e.g. after a stalled frame). */
const INPUT_QUEUE_WINDOW_MS = 300;
const SAMURAI_RUNTIME = "/assets/characters/samurai/runtime";
const VILLAGE_ASSET_KEYS: Record<string, string> = {
  "/assets/external/pixellab-wuxia-objects/cabanas/cabana-1.png": "qinghe-cabin-1",
  "/assets/external/pixellab-wuxia-objects/cabanas/cabana-2.png": "qinghe-cabin-2",
  "/assets/external/pixellab-wuxia-objects/cabanas/cabana-3.png": "qinghe-cabin-3",
  "/assets/external/pixellab-wuxia-objects/cabanas/cabana-4.png": "qinghe-cabin-4",
  "/assets/world/maps/biomes/regions/qinghe-valley-v1/tiled/images/sect_gate.png": "qinghe-torii",
  "/assets/world/maps/biomes/regions/qinghe-valley-v1/tiled/images/ambient_lantern.png": "qinghe-stone-lantern",
  "/assets/external/pixellab-wuxia-objects/barracas/barraca-1.png": "qinghe-market-stall-1",
  "/assets/external/pixellab-wuxia-objects/barracas/barraca-2.png": "qinghe-market-stall-2",
  "/assets/external/pixellab-wuxia-objects/barracas/barraca-3.png": "qinghe-market-stall-3",
  "/assets/external/opp4-village/environment/tiles/village/tile_village_fountain.png": "qinghe-fountain",
  "/assets/external/feudal-japan-nature/PNG/01_cherry_blossom_tree_32x32.png": "qinghe-sakura",
  "/assets/external/feudal-japan-nature/PNG/05_autumn_maple_tree_32x32.png": "qinghe-maple",
  "/assets/external/feudal-japan-nature/PNG/02_koi_pond_tile_32x32.png": "qinghe-koi",
  "/assets/external/feudal-japan-nature/PNG/03_rock_cluster_32x32.png": "qinghe-rock",
  "/assets/external/feudal-japan-nature/PNG/04_bamboo_grove_32x32.png": "qinghe-bamboo",
  "/assets/external/feudal-japan-nature/PNG/06_lotus_lily_pad_32x32.png": "qinghe-lotus",
  "/assets/external/feudal-japan-nature/PNG/07_mossy_stone_path_32x32.png": "qinghe-stone-path",
  "/assets/external/feudal-japan-nature/PNG/08_fallen_log_32x32.png": "qinghe-log",
};

type HudBar = {
  fill: Phaser.GameObjects.Rectangle;
  value: Phaser.GameObjects.Text;
};

type VillageKit = {
  objects: Array<{
    id: string;
    asset: string;
    x: number;
    y: number;
    depth: number;
    collision?: { x: number; y: number; width: number; height: number };
  }>;
};

/** Zoom of the world camera. 1 = native pixel art; higher reads better on phones. */
const WORLD_ZOOM = 1.6;

export class WuxiaScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private world!: WuxiaWorldLoader;
  private joystick!: VirtualJoystick;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
  // Presses are queued from keydown events instead of Phaser's JustDown(), because JustDown() is cleared by
  // keyup and a tap shorter than one game frame would otherwise be lost.
  private interactQueuedAt = -Infinity;
  private attackQueuedAt = -Infinity;
  private facing: Direction = "down";
  private hudRegion!: Phaser.GameObjects.Text;
  private hudLevel!: Phaser.GameObjects.Text;
  private hudStatus!: Phaser.GameObjects.Text;
  private hudHint!: Phaser.GameObjects.Text;
  private hpBar!: HudBar;
  private qiBar!: HudBar;
  private actionButton!: Phaser.GameObjects.Container;
  private attackButton!: Phaser.GameObjects.Container;
  private hudTopLeft!: Phaser.GameObjects.Container;
  private hudCompass!: Phaser.GameObjects.Container;
  private hudSkills!: Phaser.GameObjects.Container;
  private villageKitImages: Phaser.GameObjects.Image[] = [];
  private worldCamera?: Phaser.Cameras.Scene2D.Camera;
  private hudCamera?: Phaser.Cameras.Scene2D.Camera;
  private cameraAssigned = new WeakSet<object>();
  private villageKitColliders: Phaser.GameObjects.Zone[] = [];
  private wolves: Wolf[] = [];
  private wolfColliders: Phaser.Physics.Arcade.Collider[] = [];
  private loading = true;
  private localTransition = false;
  // Player combat state (local prototype; authoritative rules will move to the server).
  private playerHp: number = PLAYER_COMBAT.maxHp;
  private playerDead = false;
  private respawnAt = 0;
  private attacking = false;
  private lastSwordAt = -Infinity;
  private qi: number = PLAYER_COMBAT.maxQi;
  private lastMoonSlashAt = -Infinity;
  private lastOndaAt = -Infinity;
  private shownQi = -1;
  private activePath: PathId = PATH_SWORD;
  private masteryPoints: Record<PathId, number> = { [PATH_SWORD]: 0, [PATH_QI]: 0 };
  private lastQiBasicAt = -Infinity;
  private roleText?: Phaser.GameObjects.Text;
  private selectedWolf: Wolf | null = null;
  private skillButton?: Phaser.GameObjects.Container;
  private skillText?: Phaser.GameObjects.Text;
  private pathButton?: Phaser.GameObjects.Container;
  private pathBase?: Phaser.GameObjects.Arc;
  private moonSlashes: { sprite?: Phaser.GameObjects.Sprite; origin: { x: number; y: number }; dir: { x: number; y: number }; traveledPx: number; hit: Set<Wolf> }[] = [];
  private skillCooldown?: Phaser.GameObjects.Graphics;
  private ondaAiming = false;
  private aimGraphics?: Phaser.GameObjects.Graphics;
  private autoAttack = false;
  private targetRing?: Phaser.GameObjects.Graphics;
  private level: number = PLAYER_COMBAT.startLevel;
  private xp = 0;
  private pelts = 0;

  constructor() {
    super("wuxia-world");
  }

  preload(): void {
    for (const direction of DIRECTIONS) {
      for (let frame = 1; frame <= 4; frame += 1) {
        this.load.image(`player-walk-${direction}-${frame}`, assetPath(`/assets/characters/samurai/runtime/walk/${direction}-${frame}.png`));
        this.load.image(`player-idle-${direction}-${frame}`, assetPath(`${SAMURAI_RUNTIME}/idle/${direction}-${frame}.png`));
        this.load.image(`player-sword-${direction}-${frame}`, assetPath(`${SAMURAI_RUNTIME}/sword-attack/${direction}-${frame}.png`));
      }
    }
    this.load.spritesheet(WOLF_SHEET_KEY, assetPath("/assets/characters/wolf/runtime/Lobo_Feroz_estilo_wuxia-Idle.png"), { frameWidth: 64, frameHeight: 64 });
    preloadPixellabVfx(this, assetPath);
    this.load.json("qinghe-village-kit", assetPath("/assets/world/maps/biomes/qinghe-valley-village-kit.json"));
    for (const [path, key] of Object.entries(VILLAGE_ASSET_KEYS)) this.load.image(key, assetPath(path));
    this.load.image("gui-panel", assetPath("/assets/external/tiny-rpg-mana-soul-gui/20250420manaSoul9SlicesA-Sheet.png"));
    this.load.image("gui-header", assetPath("/assets/external/tiny-rpg-mana-soul-gui/20250420manaSoulHeaderA-Sheet.png"));
    this.load.image("gui-bar-frame", assetPath("/assets/external/tiny-rpg-mana-soul-gui/20250421barA-Sheet.png"));
    this.load.spritesheet("gui-fill-bars", assetPath("/assets/external/tiny-rpg-mana-soul-gui/20250421manaSoulButtonA-Sheet.png"), { frameWidth: 96, frameHeight: 22 });
    this.load.spritesheet("gui-slot", assetPath("/assets/external/tiny-rpg-mana-soul-gui/20250423emptyFrame-Sheet.png"), { frameWidth: 32, frameHeight: 32 });
    this.load.image("gui-portrait-frame", assetPath("/assets/external/tiny-rpg-mana-soul-gui/20250425portraitFrame-Sheet.png"));
    this.load.image("gui-compass", assetPath("/assets/external/tiny-rpg-mana-soul-gui/20250425compass-Sheet.png"));
    this.load.spritesheet("gui-action", assetPath("/assets/external/tiny-rpg-mana-soul-gui/20250421manaSoulButtonB-Sheet.png"), { frameWidth: 96, frameHeight: 22 });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x101925);
    this.setupCameras();
    this.physics.world.setBounds(0, 0, 1280, 800);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D",
    }) as Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.on("keydown-E", () => { this.interactQueuedAt = this.time.now; });
    this.input.keyboard!.on("keydown-J", () => { this.attackQueuedAt = this.time.now; });
    this.input.keyboard!.on("keydown-SPACE", () => { this.attackQueuedAt = this.time.now; });
    this.input.keyboard!.on("keydown-ONE", () => this.activeSkillPressed());
    this.input.keyboard!.on("keydown-Q", () => this.togglePath());
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => this.handleWorldTap(pointer, over));
    this.targetRing = this.add.graphics().setDepth(5);
    this.aimGraphics = this.add.graphics().setDepth(6);

    this.createAnimations();
    createPixellabVfxAnimations(this);
    this.player = this.physics.add.sprite(RESPAWN_POINT.x, RESPAWN_POINT.y, "player-idle-down-1")
      .setDepth(488)
      .setScale(1)
      .setCollideWorldBounds(true);
    this.player.setSize(22, 22).setOffset(21, 34);
    this.player.play("player-idle-down");
    this.player.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation: Phaser.Animations.Animation) => {
      if (animation.key.startsWith("player-sword-attack")) this.attacking = false;
    });

    this.createHud();
    this.joystick = new VirtualJoystick(this);
    this.world = new WuxiaWorldLoader(this, {
      assetRoot: import.meta.env.BASE_URL,
      callbacks: {
        onPortalRequest: (request) => this.handleLocalPortal(request),
        onInteractionRequest: (request) => this.handleLocalInteraction(request),
        onRegionLoaded: (region) => this.handleRegionLoaded(region),
        getMovementVector: () => this.getMovementVector(),
      },
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.world.enterRegion("qinghe-valley", {
      player: this.player,
      spawnId: "arrival",
      season: "spring",
      hour: 17,
      weather: "petals",
      weatherOptions: { quantity: 1 },
    }).then(() => {
      this.loading = false;
      this.setStatus("Vale da Lua Serena pronto. Siga o caminho sul ou oeste para a caçada.");
      this.hudHint.setText("WASD/setas ou joystick · J/Espaço ou ATACAR · E interagir");
    }).catch((error: unknown) => {
      this.loading = false;
      const message = error instanceof Error ? error.message : String(error);
      this.setStatus(`Falha ao carregar o mundo: ${message}`);
      console.error(error);
    });
  }

  /**
   * The world camera zooms in so the samurai and the districts read at phone size.
   * HUD objects (scroll factor 0) are drawn by a second 1:1 camera so the interface keeps its size.
   */
  private setupCameras(): void {
    this.worldCamera = this.cameras.main;
    this.worldCamera.setZoom(WORLD_ZOOM);
    this.hudCamera = this.cameras.add(0, 0, 1280, 720, false, "hud");
    this.hudCamera.setZoom(1);
  }

  private syncCameraLayers(): void {
    if (!this.worldCamera || !this.hudCamera) return;
    for (const child of this.children.list) {
      if (this.cameraAssigned.has(child)) continue;
      this.cameraAssigned.add(child);
      const isHud = (child as Phaser.GameObjects.GameObject & { scrollFactorX?: number }).scrollFactorX === 0;
      if (isHud) this.worldCamera.ignore(child);
      else this.hudCamera.ignore(child);
    }
  }

  update(time: number, delta: number): void {
    this.syncCameraLayers();
    if (!this.player || this.loading) return;
    this.updateWolves(time);
    this.updateTargetRing();
    this.updateCooldowns(time);
    this.updateAimReticle();
    this.updateMoonSlashes(delta);

    if (this.playerDead) {
      const remaining = Math.ceil(Math.max(0, this.respawnAt - time) / 1000);
      if (time >= this.respawnAt) this.respawnPlayer();
      else this.setStatus(`Você caiu. Retornando à praça em ${remaining}s…`);
      this.updateActionButtonState();
      return;
    }

    const input = this.getMovementVector();
    // Walking with the joystick or keys cancels auto-attack; attacking never moves the character by itself.
    if (input.x !== 0 || input.y !== 0) this.autoAttack = false;
    const movement = this.autoAttack ? this.runAutoAttack(time) : input;
    const speed = PLAYER_COMBAT.moveSpeed * (this.attacking ? 0.5 : 1);
    this.player.setVelocity(movement.x * speed, movement.y * speed);
    this.player.setDepth(this.player.y + 12);

    if (movement.x !== 0 || movement.y !== 0) {
      this.facing = directionFor(movement.x, movement.y);
      if (!this.attacking) this.player.anims.play(`player-walk-${this.facing}`, true);
    } else if (!this.attacking) {
      this.player.anims.play(`player-idle-${this.facing}`, true);
    }

    if (time - this.interactQueuedAt <= INPUT_QUEUE_WINDOW_MS) {
      this.interactQueuedAt = -Infinity;
      void this.requestNearbyPortal();
    }
    if (time - this.attackQueuedAt <= INPUT_QUEUE_WINDOW_MS) {
      this.attackQueuedAt = -Infinity;
      this.engageAutoAttack();
    }
    if (!this.playerDead && this.qi < PLAYER_COMBAT.maxQi) {
      this.qi = regenQi(this.qi, PLAYER_COMBAT.maxQi, delta, QI_REGEN_PER_SECOND);
    }
    if (Math.floor(this.qi) !== this.shownQi) this.updateBars();
    this.updateActionButtonState();
  }

  private createAnimations(): void {
    for (const direction of DIRECTIONS) {
      this.anims.create({
        key: `player-walk-${direction}`,
        frames: [1, 2, 3, 4].map((frame) => ({ key: `player-walk-${direction}-${frame}` })),
        frameRate: 9,
        repeat: -1,
      });
      this.anims.create({
        key: `player-idle-${direction}`,
        frames: [1, 2, 3, 4].map((frame) => ({ key: `player-idle-${direction}-${frame}` })),
        frameRate: 5,
        repeat: -1,
      });
      this.anims.create({
        key: `player-sword-attack-${direction}`,
        frames: [1, 2, 3, 4].map((frame) => ({ key: `player-sword-${direction}-${frame}` })),
        frameRate: 8,
        repeat: 0,
      });
    }
  }

  private handleRegionLoaded(region: RegionRuntime): void {
    this.clearVillageKit();
    this.clearWolves();
    const map = region.tilemap as { widthInPixels?: number; heightInPixels?: number };
    this.physics.world.setBounds(0, 0, map.widthInPixels ?? 1280, map.heightInPixels ?? 800);
    if (region.id === "qinghe-valley") {
      this.mountVillageKit();
      this.spawnHuntingWolves(region);
    }
    const title = REGION_TITLES[region.id] ?? region.region.title ?? region.id;
    this.hudRegion.setText(title.toUpperCase());
    this.setStatus(`Explorando ${title}.`);
  }

  private mountVillageKit(): void {
    const kit = this.cache.json.get("qinghe-village-kit") as VillageKit | undefined;
    if (!kit?.objects) return;
    for (const object of kit.objects) {
      const texture = VILLAGE_ASSET_KEYS[object.asset];
      if (!texture) continue;
      const image = this.add.image(object.x, object.y, texture)
        .setOrigin(0.5, 1)
        .setDepth(object.depth);
      this.villageKitImages.push(image);
      if (object.collision) {
        const { x, y, width, height } = object.collision;
        const zone = this.add.zone(x, y, width, height).setVisible(false);
        this.physics.add.existing(zone, true);
        this.physics.add.collider(this.player, zone);
        this.villageKitColliders.push(zone);
      }
    }
  }

  private clearVillageKit(): void {
    for (const image of this.villageKitImages) image.destroy();
    for (const collider of this.villageKitColliders) collider.destroy();
    this.villageKitImages = [];
    this.villageKitColliders = [];
  }

  private spawnHuntingWolves(region: RegionRuntime): void {
    const zones = [
      ...region.colliders.map((item) => item.collider as Phaser.GameObjects.Zone),
      ...this.villageKitColliders,
    ];
    for (const spawn of HUNT_SPAWNS) {
      for (let index = 0; index < WOLVES_PER_SPAWN; index += 1) {
        const wolf = new Wolf(this, spawn, index);
        this.wolves.push(wolf);
        for (const zone of zones) this.wolfColliders.push(this.physics.add.collider(wolf.sprite, zone));
      }
    }
  }

  private clearWolves(): void {
    for (const collider of this.wolfColliders) collider.destroy();
    for (const wolf of this.wolves) wolf.destroy();
    this.wolfColliders = [];
    this.wolves = [];
    this.selectedWolf = null;
  }

  private updateWolves(time: number): void {
    const target: WolfTarget = { x: this.player.x, y: this.player.y, alive: !this.playerDead };
    for (const wolf of this.wolves) {
      wolf.maybeRespawn(time);
      const result = wolf.tick(time, target);
      if (result.attacked && !this.playerDead) this.receiveWolfAttack();
    }
  }

  private receiveWolfAttack(): void {
    const hit = resolveMobAttack({ attack: WOLF_LEVEL_1.attack }, { hp: this.playerHp, defense: PLAYER_COMBAT.defense });
    this.playerHp = hit.hp;
    this.player.setTint(0xff7a7a);
    this.time.delayedCall(120, () => { if (!this.playerDead && this.player.active) this.player.clearTint(); });
    this.showFloatingText(this.player.x, this.player.y - 40, `-${hit.amount}`, "#ff8a7a");
    this.updateBars();
    this.setStatus(`${WOLF_LEVEL_1.name} atacou você: -${hit.amount} HP.`);
    if (hit.defeated) this.killPlayer();
  }

  private tryAttack(time: number): void {
    if (this.activePath === PATH_QI) {
      this.castQiBasic(time);
      return;
    }
    if (this.playerDead || this.attacking || this.loading) return;
    if (!isCooldownReady(time, this.lastSwordAt, PLAYER_COMBAT.swordCooldownMs)) return;
    this.attacking = true;
    this.lastSwordAt = time;
    this.player.anims.play(`player-sword-attack-${this.facing}`, true);
    this.time.delayedCall(PLAYER_COMBAT.swordHitDelayMs, () => this.resolveSwordHits());
  }

  private resolveSwordHits(): void {
    if (this.playerDead) return;
    const facing = DIRECTION_VECTORS[this.facing];
    const origin = { x: this.player.x, y: this.player.y };
    let hits = 0;
    for (const wolf of this.wolves) {
      if (!wolf.alive) continue;
      const inArc = isInMeleeArc(origin, { x: wolf.sprite.x, y: wolf.sprite.y }, facing, {
        rangePx: PLAYER_COMBAT.swordRangePx,
        arcDegrees: PLAYER_COMBAT.swordArcDegrees,
      });
      if (!inArc) continue;
      hits += 1;
      const amount = this.pathDamage(PATH_SWORD, PATHS[PATH_SWORD].basicAttack.damageMultiplier);
      this.showFloatingText(wolf.sprite.x, wolf.sprite.y - 52, `-${amount}`, "#ffe27a");
      if (wolf.takeDamage(amount, this.time.now)) this.onWolfDefeated();
    }
    if (hits > 0) this.gainMastery(PATH_SWORD, MASTERY.pointsPerBasicHit * hits);
    if (hits === 0) this.setStatus("Golpe no vazio — aproxime-se do alvo na direção do golpe.");
    this.updateBars();
  }

  /** Feet of the character in world space, used as the VFX anchor. */
  private feetPoint(): { x: number; y: number } {
    return { x: this.player.x, y: this.player.y + 11 };
  }

  private castMoonSlash(time: number): void {
    if (this.playerDead || this.loading) return;
    if (this.activePath !== PATH_SWORD) {
      this.setStatus("Moon Slash é do Caminho da Espada — troque com o caminho (Q).");
      return;
    }
    if (!canCastSkill(time, this.lastMoonSlashAt, MOON_SLASH.cooldownMs, this.qi, MOON_SLASH.qiCost)) return;
    this.lastMoonSlashAt = time;
    this.qi = spendQi(this.qi, MOON_SLASH.qiCost);
    const origin = { x: this.player.x, y: this.player.y };
    // Aimed at the selected wolf; without one, along the facing direction.
    const dir = aimVector(origin, this.selectedPoint(), DIRECTION_VECTORS[this.facing]);
    this.facing = directionFor(dir.x, dir.y);
    const sprite = playGroundVfx(this, "slash-arc-8-directions", this.facing, "whole", origin, origin.y + 8, MOON_SLASH.visualScale, true);
    this.moonSlashes.push({ sprite, origin, dir, traveledPx: 0, hit: new Set() });
    this.updateBars();
  }

  /** Moves each crescent and damages every wolf it passes within the blade's hit radius (each wolf once). */
  private updateMoonSlashes(dtMs: number): void {
    if (this.moonSlashes.length === 0) return;
    this.moonSlashes = this.moonSlashes.filter((slash) => {
      const step = advanceProjectile(slash.traveledPx, MOON_SLASH.speedPxPerS, dtMs, MOON_SLASH.travelPx);
      slash.traveledPx = step.traveledPx;
      const center = {
        x: slash.origin.x + slash.dir.x * slash.traveledPx,
        y: slash.origin.y + slash.dir.y * slash.traveledPx,
      };
      for (const wolf of this.wolves) {
        if (!wolf.alive || slash.hit.has(wolf)) continue;
        if (distance(center, { x: wolf.sprite.x, y: wolf.sprite.y }) > MOON_SLASH.hitRadiusPx) continue;
        slash.hit.add(wolf);
        const amount = this.pathDamage(PATH_SWORD, MOON_SLASH.damageMultiplier);
        this.showFloatingText(wolf.sprite.x, wolf.sprite.y - 52, `-${amount}`, "#9fe8ff");
        this.gainMastery(PATH_SWORD, MASTERY.pointsPerSkillHit);
        if (wolf.takeDamage(amount, this.time.now)) this.onWolfDefeated();
      }
      if (slash.sprite?.active) {
        slash.sprite.setPosition(center.x - slash.sprite.displayWidth / 2, center.y - slash.sprite.displayHeight / 2);
      }
      if (step.done) {
        slash.sprite?.destroy();
        return false;
      }
      return true;
    });
    this.updateBars();
  }

  private castOndaDeQi(time: number, tapPoint: { x: number; y: number }): void {
    this.ondaAiming = false;
    if (this.playerDead || this.loading) return;
    if (this.activePath !== PATH_QI) {
      this.setStatus("Onda de Qi é do Caminho do Cultivo — troque com o caminho (Q).");
      return;
    }
    if (!canCastSkill(time, this.lastOndaAt, ONDA_DE_QI.cooldownMs, this.qi, ONDA_DE_QI.qiCost)) return;
    this.lastOndaAt = time;
    this.qi = spendQi(this.qi, ONDA_DE_QI.qiCost);
    const origin = { x: this.player.x, y: this.player.y };
    // The landing point is the tapped spot, clamped to the skill's range along the same line.
    const center = ondaAimPoint(origin, tapPoint, ONDA_DE_QI.castRangePx, DIRECTION_VECTORS[this.facing]);
    const dir = aimVector(origin, center, DIRECTION_VECTORS[this.facing]);
    this.facing = directionFor(dir.x, dir.y);
    const orb = playGroundVfx(this, "energy-orb-8-directions", this.facing, "whole", center, center.y + 1, ONDA_DE_QI.visualScale);
    if (orb) this.time.delayedCall(ONDA_DE_QI.effectMs, () => orb.destroy());
    this.time.delayedCall(ONDA_DE_QI.hitDelayMs, () => this.resolveOndaHits(center));
    this.updateBars();
  }

  private resolveOndaHits(center: { x: number; y: number }): void {
    if (this.playerDead) return;
    const targets = this.wolves.map((wolf) => ({ x: wolf.sprite.x, y: wolf.sprite.y, alive: wolf.alive }));
    const hits = ondaHits(center, targets, ONDA_DE_QI.radiusPx);
    const amount = this.pathDamage(PATH_QI, ONDA_DE_QI.damageMultiplier);
    for (const index of hits) {
      const wolf = this.wolves[index];
      this.showFloatingText(wolf.sprite.x, wolf.sprite.y - 52, `-${amount}`, "#9fe8ff");
      if (wolf.takeDamage(amount, this.time.now)) this.onWolfDefeated();
    }
    if (hits.length > 0) this.gainMastery(PATH_QI, MASTERY.pointsPerSkillHit * hits.length);
    if (hits.length === 0) this.setStatus("Onda de Qi sem alvo — nenhum lobo na área.");
    this.updateBars();
  }

  /** Basic Qi attack: a projectile that homes on the nearest wolf inside its range. */
  private castQiBasic(time: number, forcedIndex = -1): void {
    if (this.playerDead || this.loading) return;
    const cfg = PATHS[PATH_QI].basicAttack as ProjectileBasicAttack;
    if (!isCooldownReady(time, this.lastQiBasicAt, cfg.cooldownMs)) return;
    const origin = { x: this.player.x, y: this.player.y };
    const targets = this.wolves.map((wolf) => ({ x: wolf.sprite.x, y: wolf.sprite.y, alive: wolf.alive }));
    const index = forcedIndex >= 0 ? forcedIndex : nearestTargetIndex(origin, targets, cfg.maxRangePx);
    if (index < 0) {
      this.setStatus("Nenhum lobo ao alcance do Qi.");
      return;
    }
    this.lastQiBasicAt = time;
    const wolf = this.wolves[index];
    const travelMs = projectileTravelMs(distance(origin, { x: wolf.sprite.x, y: wolf.sprite.y }), cfg.projectileSpeedPxPerS);
    const orb = playGroundVfx(this, "energy-orb-8-directions", this.facing, "whole", origin, origin.y + 5, cfg.visualScale);
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: travelMs,
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 1;
        const x = origin.x + (wolf.sprite.x - origin.x) * t;
        const y = origin.y + (wolf.sprite.y - origin.y) * t;
        orb?.setPosition(x - (orb.displayWidth ?? 0) / 2, y - (orb.displayHeight ?? 0) / 2);
      },
      onComplete: () => {
        orb?.destroy();
        this.resolveQiBasicHit(wolf);
      },
    });
  }

  private resolveQiBasicHit(wolf: Wolf): void {
    if (!wolf.alive) return;
    const amount = this.pathDamage(PATH_QI, (PATHS[PATH_QI].basicAttack as ProjectileBasicAttack).damageMultiplier);
    this.showFloatingText(wolf.sprite.x, wolf.sprite.y - 52, `-${amount}`, "#9fe8ff");
    this.gainMastery(PATH_QI, MASTERY.pointsPerBasicHit);
    if (wolf.takeDamage(amount, this.time.now)) this.onWolfDefeated();
    this.updateBars();
  }

  /** Damage for a path: base multiplier times that path's own mastery. Mastery of one path never affects another. */
  private pathDamage(path: PathId, baseMultiplier: number): number {
    const level = masteryLevel(this.masteryPoints[path], MASTERY.thresholds);
    const multiplier = baseMultiplier * masteryDamageMultiplier(level, MASTERY.damagePerLevel);
    return damageFor(Math.round(PLAYER_COMBAT.attack * multiplier), WOLF_LEVEL_1.defense);
  }

  private gainMastery(path: PathId, points: number): void {
    const before = masteryLevel(this.masteryPoints[path], MASTERY.thresholds);
    this.masteryPoints[path] = addMasteryPoints(this.masteryPoints[path], points);
    const after = masteryLevel(this.masteryPoints[path], MASTERY.thresholds);
    if (after > before) this.setStatus(`Maestria do ${PATHS[path].name} subiu para o nível ${after}!`);
    if (path === this.activePath) this.refreshPathUi();
  }

  private togglePath(): void {
    this.ondaAiming = false;
    this.activePath = this.activePath === PATH_SWORD ? PATH_QI : PATH_SWORD;
    this.refreshPathUi();
    const kind = PATHS[this.activePath].basicAttack.kind === "melee" ? "corpo a corpo" : "à distância";
    this.setStatus(`${PATHS[this.activePath].name} ativo — ataque básico ${kind}.`);
  }

  private refreshPathUi(): void {
    const level = masteryLevel(this.masteryPoints[this.activePath], MASTERY.thresholds);
    this.roleText?.setText(`${PATHS[this.activePath].name}  ·  Maestria ${level}  (trocar)`);
    this.skillText?.setText(this.activePath === PATH_SWORD ? "MOON\nSLASH" : "ONDA\nDE QI");
    this.pathBase?.setStrokeStyle(3, this.activePath === PATH_SWORD ? 0xf2d28a : 0x93d7c5, 0.8);
  }


  private createRoundButton(radius: number, label: string, accent: number): {
    container: Phaser.GameObjects.Container;
    base: Phaser.GameObjects.Arc;
    cooldown: Phaser.GameObjects.Graphics;
    text: Phaser.GameObjects.Text;
  } {
    const base = this.add.circle(0, 0, radius, 0x0c1624, 0.78).setStrokeStyle(3, accent, 0.7).setInteractive({ useHandCursor: true });
    const cooldown = this.add.graphics();
    const text = this.add.text(0, 0, label, { color: "#fff4d9", fontFamily: HUD_FONT, fontSize: "11px", fontStyle: "bold", align: "center" }).setOrigin(0.5);
    const container = this.add.container(0, 0, [base, cooldown, text]).setScrollFactor(0).setDepth(2101);
    return { container, base, cooldown, text };
  }

  /** The single active-skill button: Moon Slash on the sword path, Onda de Qi on the cultivation path. */
  private activeSkillPressed(): void {
    if (this.playerDead || this.loading) return;
    if (this.activePath === PATH_SWORD) {
      this.castMoonSlash(this.time.now);
      return;
    }
    if (this.ondaAiming) {
      this.ondaAiming = false;
      this.setStatus("Mira da Onda de Qi cancelada.");
      return;
    }
    this.startOndaAim();
  }

  /** Onda de Qi is aimed on the ground: the next tap on the map is where it lands. */
  private startOndaAim(): void {
    if (!isCooldownReady(this.time.now, this.lastOndaAt, ONDA_DE_QI.cooldownMs)) {
      this.setStatus("Onda de Qi em recarga.");
      return;
    }
    if (this.qi < ONDA_DE_QI.qiCost) {
      this.setStatus("Qi insuficiente para a Onda de Qi.");
      return;
    }
    this.ondaAiming = true;
    this.setStatus("Toque no chão onde a Onda de Qi deve cair. Toque no botão de novo para cancelar.");
  }

  /** Target circle and range ring shown while aiming. */
  private updateAimReticle(): void {
    const g = this.aimGraphics;
    if (!g) return;
    g.clear();
    if (!this.ondaAiming || this.playerDead) return;
    const origin = { x: this.player.x, y: this.player.y };
    const pointer = this.input.activePointer;
    const point = ondaAimPoint(origin, { x: pointer.worldX, y: pointer.worldY }, ONDA_DE_QI.castRangePx, DIRECTION_VECTORS[this.facing]);
    g.lineStyle(1, 0x93d7c5, 0.5).strokeCircle(origin.x, origin.y, ONDA_DE_QI.castRangePx);
    g.fillStyle(0x4e9be8, 0.25).fillCircle(point.x, point.y, ONDA_DE_QI.radiusPx);
    g.lineStyle(2, 0x9fe8ff, 0.9).strokeCircle(point.x, point.y, ONDA_DE_QI.radiusPx);
  }

  /** Dark sweep over the skill button showing how much of its cooldown is left. */
  private updateCooldowns(time: number): void {
    const g = this.skillCooldown;
    if (!g) return;
    g.clear();
    const isSword = this.activePath === PATH_SWORD;
    const last = isSword ? this.lastMoonSlashAt : this.lastOndaAt;
    const cooldownMs = isSword ? MOON_SLASH.cooldownMs : ONDA_DE_QI.cooldownMs;
    const remaining = Math.max(0, last + cooldownMs - time);
    if (remaining <= 0) return;
    const fraction = remaining / cooldownMs;
    g.fillStyle(0x000000, 0.55);
    g.beginPath();
    g.moveTo(0, 0);
    g.arc(0, 0, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction, false);
    g.closePath();
    g.fillPath();
  }

  /** Pressing the attack button arms auto-attack; the update loop then chases and strikes the target. */
  private engageAutoAttack(): void {
    if (this.playerDead || this.loading) return;
    this.autoAttack = true;
  }

  /** One frame of auto-attack. Returns the movement to apply (chase direction or standing still). */
  private runAutoAttack(time: number): { x: number; y: number } {
    const basic = PATHS[this.activePath].basicAttack;
    const rangePx = basic.kind === "melee" ? PLAYER_COMBAT.swordRangePx : basic.maxRangePx;
    const origin = { x: this.player.x, y: this.player.y };
    const targets = this.wolves.map((wolf) => ({ x: wolf.sprite.x, y: wolf.sprite.y, alive: wolf.alive }));
    const index = chooseAutoTarget(origin, targets, this.selectedIndex(), AUTO_ATTACK.acquireRangePx);
    if (index < 0) {
      this.autoAttack = false;
      this.setStatus("Sem alvo válido para o ataque automático.");
      return { x: 0, y: 0 };
    }
    const point = { x: targets[index].x, y: targets[index].y };
    const dir = aimVector(origin, point, DIRECTION_VECTORS[this.facing]);
    this.facing = directionFor(dir.x, dir.y);
    if (autoAttackStep(origin, point, rangePx) === "chase") {
      if (!this.attacking) this.player.anims.play(`player-walk-${this.facing}`, true);
      return dir;
    }
    if (basic.kind === "melee") this.tryAttack(time);
    else this.castQiBasic(time, index);
    return { x: 0, y: 0 };
  }

  /** Tap on the world selects the nearest living wolf within reach; tapping empty ground clears the target. */
  private handleWorldTap(pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]): void {
    if (this.ondaAiming) {
      if (over.length === 0) this.castOndaDeQi(this.time.now, { x: pointer.worldX, y: pointer.worldY });
      return;
    }
    if (over.length > 0 || this.playerDead || this.loading) return;
    let best: Wolf | null = null;
    let bestDistance = 44;
    for (const wolf of this.wolves) {
      if (!wolf.alive) continue;
      const d = Math.hypot(wolf.sprite.x - pointer.worldX, wolf.sprite.y - pointer.worldY);
      if (d <= bestDistance) {
        best = wolf;
        bestDistance = d;
      }
    }
    this.selectedWolf = best;
    if (best) this.setStatus(`${WOLF_LEVEL_1.name} selecionado.`);
  }

  private selectedIndex(): number {
    return this.selectedWolf ? this.wolves.indexOf(this.selectedWolf) : -1;
  }

  private selectedPoint(): { x: number; y: number } | null {
    if (!this.selectedWolf || !this.selectedWolf.alive) return null;
    return { x: this.selectedWolf.sprite.x, y: this.selectedWolf.sprite.y };
  }

  /** Turns the character toward the selected target so directional skills aim at it. */
  private faceSelectedTarget(): void {
    const point = this.selectedPoint();
    if (!point) return;
    const dir = aimVector({ x: this.player.x, y: this.player.y }, point, DIRECTION_VECTORS[this.facing]);
    this.facing = directionFor(dir.x, dir.y);
  }

  private updateTargetRing(): void {
    this.targetRing?.clear();
    if (this.selectedWolf && !this.selectedWolf.alive) this.selectedWolf = null;
    if (!this.selectedWolf || !this.targetRing) return;
    this.targetRing.lineStyle(2, 0xffe27a, 0.9).strokeEllipse(this.selectedWolf.sprite.x, this.selectedWolf.sprite.y + 14, 40, 18);
  }

  private onWolfDefeated(): void {
    const progress = grantXp({ level: this.level, xp: this.xp }, WOLF_LEVEL_1.xpReward, PROGRESSION.xpBase);
    this.level = progress.level;
    this.xp = progress.xp;
    for (const drop of WOLF_LEVEL_1.drops) if (drop.itemId === "wolf-pelt") this.pelts += drop.quantity;
    this.updateHudLevel();
    const levelUp = progress.levelsGained > 0 ? ` Nível ${this.level}!` : "";
    this.setStatus(`${WOLF_LEVEL_1.name} derrotado: +${WOLF_LEVEL_1.xpReward} XP, +1 Pele de Lobo.${levelUp}`);
  }

  private killPlayer(): void {
    this.playerDead = true;
    this.autoAttack = false;
    this.ondaAiming = false;
    this.attacking = false;
    this.respawnAt = this.time.now + PLAYER_COMBAT.respawnDelayMs;
    this.player.setVelocity(0, 0);
    this.player.setTint(0x6b7280);
    this.player.setAlpha(0.6);
    this.player.anims.stop();
  }

  private respawnPlayer(): void {
    this.playerDead = false;
    this.playerHp = PLAYER_COMBAT.maxHp;
    this.qi = PLAYER_COMBAT.maxQi;
    this.player.setPosition(RESPAWN_POINT.x, RESPAWN_POINT.y);
    this.player.body?.reset(RESPAWN_POINT.x, RESPAWN_POINT.y);
    this.player.clearTint();
    this.player.setAlpha(1);
    this.updateBars();
    this.setStatus("Você voltou à praça. Os lobos recuam para a caçada.");
  }

  private showFloatingText(x: number, y: number, text: string, color: string): void {
    const label = this.add.text(x, y, text, {
      color, fontFamily: HUD_FONT, fontSize: "12px", fontStyle: "bold", stroke: "#0c1624", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(6000);
    this.tweens.add({
      targets: label,
      y: y - 26,
      alpha: 0,
      duration: 700,
      ease: "Quad.easeOut",
      onComplete: () => label.destroy(),
    });
  }

  private createHud(): void {
    this.hudTopLeft = this.add.container(18, 18).setScrollFactor(0).setDepth(2100);
    const panel = this.add.nineslice(0, 0, "gui-panel", undefined, 372, 154, 32, 32, 32, 32).setOrigin(0, 0);
    const header = this.add.nineslice(82, 10, "gui-header", undefined, 270, 32, 30, 30, 8, 8).setOrigin(0, 0);
    const portraitFrame = this.add.image(30, 42, "gui-portrait-frame").setOrigin(0, 0);
    const portrait = this.add.image(54, 82, "player-idle-down-1").setScale(0.62);
    const brand = this.add.text(98, 19, "WUXIA MMO", { color: "#5b3261", fontFamily: HUD_FONT, fontSize: "12px", fontStyle: "bold", letterSpacing: 2 });
    this.hudRegion = this.add.text(98, 45, "VALE DA LUA SERENA", { color: "#fff4d9", fontFamily: HUD_FONT, fontSize: "18px", fontStyle: "bold" });
    this.hudLevel = this.add.text(98, 70, "", { color: "#d6b66f", fontFamily: HUD_FONT, fontSize: "9px", fontStyle: "bold", letterSpacing: 1 });
    const role = this.add.text(98, 87, "", { color: "#a9bdc5", fontFamily: HUD_FONT, fontSize: "10px" });
    this.roleText = role;
    role.setInteractive({ useHandCursor: true }).on("pointerdown", () => this.togglePath());
    this.hpBar = this.createBar(98, 105, "HP", 0x89d852, "", this.hudTopLeft);
    this.qiBar = this.createBar(98, 130, "QI", 0x4e9be8, "", this.hudTopLeft);
    this.hudTopLeft.add([panel, header, portraitFrame, portrait, brand, this.hudRegion, this.hudLevel, role, this.hpBar.fill, this.hpBar.value]);
    this.hudTopLeft.sendToBack(panel).bringToTop(header).bringToTop(portraitFrame).bringToTop(portrait);
    this.updateBars();
    this.updateHudLevel();

    this.hudStatus = this.add.text(18, 184, "Carregando mundo…", { color: "#fff4d9", backgroundColor: "#241d39dd", padding: { left: 10, right: 10, top: 7, bottom: 7 }, fontFamily: HUD_FONT, fontSize: "12px" }).setScrollFactor(0).setDepth(2101);
    this.hudHint = this.add.text(18, 0, "WASD / setas  ·  joystick  ·  1 habilidade  ·  Q caminho  ·  E interagir", { color: "#f8e5bd", backgroundColor: "#241d39dd", padding: { left: 10, right: 10, top: 7, bottom: 7 }, fontFamily: HUD_FONT, fontSize: "11px" }).setScrollFactor(0).setDepth(2101);

    this.hudCompass = this.add.container(0, 18).setScrollFactor(0).setDepth(2100);
    this.hudCompass.add(this.add.image(0, 0, "gui-compass").setOrigin(0, 0));
    this.hudCompass.add(this.add.text(38, 28, "QINGHE", { color: "#f8e5bd", fontFamily: HUD_FONT, fontSize: "8px", fontStyle: "bold" }).setOrigin(0.5));

    this.hudSkills = this.add.container(0, 0).setScrollFactor(0).setDepth(2101);
    const skills = ["1  MOON SLASH", "2  ONDA DE QI", "3  POÇÃO", "4  MAPA"];
    skills.forEach((label, index) => {
      if (index < 2) return; // combat skills live in the right-hand cluster
      // POÇÃO and MAPA have no behaviour yet; they stay in the bottom row until they do.
      const slot = this.add.image(index * 72 - 144, 0, "gui-slot", index % 4).setOrigin(0, 0);
      const key = this.add.text(index * 72 - 144 + 16, 5, String(index + 1), { color: "#fff4d9", fontFamily: HUD_FONT, fontSize: "11px", fontStyle: "bold" }).setOrigin(0.5);
      const caption = this.add.text(index * 72 - 144 + 16, 36, label.split("  ")[1], { color: "#f8e5bd", fontFamily: HUD_FONT, fontSize: "8px", fontStyle: "bold" }).setOrigin(0.5, 0);
      this.hudSkills.add([slot, key, caption]);
    });

    const attack = this.createRoundButton(66, "ATACAR", 0xf2d28a);
    this.attackButton = attack.container;
    attack.base.on("pointerdown", () => this.engageAutoAttack());

    const skill = this.createRoundButton(44, "", 0xf2d28a);
    this.skillButton = skill.container;
    this.skillText = skill.text;
    this.skillCooldown = skill.cooldown;
    skill.base.on("pointerdown", () => this.activeSkillPressed());

    const path = this.createRoundButton(44, "TROCAR\nCAMINHO", 0xf2d28a);
    this.pathButton = path.container;
    this.pathBase = path.base;
    path.base.on("pointerdown", () => this.togglePath());

    // INTERAGIR only appears while a portal is close enough to use.
    const actionBackground = this.add.image(0, 0, "gui-action", 1).setOrigin(0.5).setScale(1.2).setInteractive({ useHandCursor: true });
    const actionLabel = this.add.text(0, 0, "INTERAGIR", { color: "#fff4d9", fontFamily: HUD_FONT, fontSize: "11px", fontStyle: "bold", letterSpacing: 1 }).setOrigin(0.5);
    this.actionButton = this.add.container(0, 0, [actionBackground, actionLabel]).setScrollFactor(0).setDepth(2101).setVisible(false);
    actionBackground.on("pointerup", () => { void this.requestNearbyPortal(); });
    this.refreshPathUi();

    this.scale.on("resize", this.layoutHud, this);
    this.layoutHud();
  }

  private updateBars(): void {
    const hpRatio = Math.max(0, this.playerHp / PLAYER_COMBAT.maxHp);
    this.hpBar.fill.setSize(BAR_FILL_WIDTH * hpRatio, 7);
    this.hpBar.value.setText(`${this.playerHp} / ${PLAYER_COMBAT.maxHp}`);
    const qi = Math.floor(this.qi);
    this.shownQi = qi;
    this.qiBar.fill.setSize(BAR_FILL_WIDTH * (this.qi / PLAYER_COMBAT.maxQi), 7);
    this.qiBar.value.setText(`${qi} / ${PLAYER_COMBAT.maxQi}`);
  }

  private updateHudLevel(): void {
    const need = PROGRESSION.xpBase * this.level;
    this.hudLevel.setText(`JIANGHU WANDERER  ·  LV. ${this.level}  ·  XP ${this.xp}/${need}`);
  }

  private createBar(x: number, y: number, label: string, color: number, value: string, parent: Phaser.GameObjects.Container): HudBar {
    const labelText = this.add.text(x, y, label, { color: "#f8e5bd", fontFamily: HUD_FONT, fontSize: "9px", fontStyle: "bold" });
    const background = this.add.rectangle(x + 27, y + 8, 88, 7, 0x251d3c).setOrigin(0, 0.5);
    const fill = this.add.rectangle(x + 27, y + 8, BAR_FILL_WIDTH, 7, color).setOrigin(0, 0.5);
    const frame = this.add.image(x + 24, y + 8, "gui-bar-frame").setOrigin(0, 0.5);
    const text = this.add.text(x + 29, y + 14, value, { color: "#fff4d9", fontFamily: HUD_FONT, fontSize: "8px" });
    parent.add([labelText, background, fill, frame, text]);
    parent.bringToTop(frame).bringToTop(text);
    return { fill, value: text };
  }

  private layoutHud(): void {
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    this.hudCompass?.setPosition(width - 94, 18);
    this.hudSkills?.setPosition(Math.max(18, (width - 288) / 2), height - 76);
    this.hudHint?.setPosition(18, height - 30);
    // Right-hand cluster: round attack the same size as the joystick, one active skill beside it.
    const cx = width - 100;
    const cy = height - 100;
    this.attackButton?.setPosition(cx, cy);
    this.skillButton?.setPosition(cx - 100, cy - 70);
    this.pathButton?.setPosition(cx - 185, cy - 20);
    this.actionButton?.setPosition(cx, cy - 150);
  }

  private getMovementVector(): { x: number; y: number } {
    const joystick = this.joystick?.getVector() ?? { x: 0, y: 0 };
    const keyboard = {
      x: Number(this.cursors?.right.isDown || this.wasd?.right.isDown) - Number(this.cursors?.left.isDown || this.wasd?.left.isDown),
      y: Number(this.cursors?.down.isDown || this.wasd?.down.isDown) - Number(this.cursors?.up.isDown || this.wasd?.up.isDown),
    };
    const x = joystick.x !== 0 || joystick.y !== 0 ? joystick.x : keyboard.x;
    const y = joystick.x !== 0 || joystick.y !== 0 ? joystick.y : keyboard.y;
    const length = Math.hypot(x, y);
    return length ? { x: x / Math.max(1, length), y: y / Math.max(1, length) } : { x: 0, y: 0 };
  }

  private updateActionButtonState(): void {
    const nearbyPortal = this.findNearbyPortal();
    this.actionButton?.setVisible(Boolean(nearbyPortal));
    const background = this.actionButton?.list[0] as Phaser.GameObjects.Image | undefined;
    if (!background) return;
    if (nearbyPortal) background.setTint(0xd9f28a);
    else background.clearTint();
  }

  private findNearbyPortal(): { id: number; name: string } | undefined {
    const interactions = this.world?.currentRegion?.interactions ?? [];
    const playerBody = this.player?.body as Phaser.Physics.Arcade.Body | undefined;
    if (!playerBody) return undefined;
    return interactions.find((item) => item.type === "portal"
      && playerBody.x + playerBody.width >= item.x
      && playerBody.x <= item.x + item.width
      && playerBody.y + playerBody.height >= item.y
      && playerBody.y <= item.y + item.height);
  }

  private async requestNearbyPortal(): Promise<void> {
    if (this.localTransition) return;
    const portal = this.findNearbyPortal();
    if (!portal) {
      this.setStatus("Aproxime-se de uma saída para viajar.");
      return;
    }
    try {
      await this.world.requestPortal(portal.id, this.player);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.setStatus(`Portal indisponível: ${message}`);
    }
  }

  private async handleLocalPortal(request: PortalRequest): Promise<void> {
    if (this.localTransition) return;
    this.localTransition = true;
    this.setStatus(`Viajando para ${request.destinationRegionId}…`);
    try {
      await this.world.enterRegion(request.destinationRegionId, {
        player: this.player,
        spawnId: request.destinationSpawnId,
        season: "spring",
        hour: 17,
        weather: "petals",
        weatherOptions: { quantity: 1 },
      });
      this.world.clearPortalLatch();
    } finally {
      this.localTransition = false;
    }
  }

  private handleLocalInteraction(request: InteractionRequest): void {
    this.setStatus(`Interação local registrada: ${request.objectName ?? request.objectId}.`);
    this.world.clearInteractionLatch(request.objectId);
  }

  private setStatus(message: string): void {
    this.hudStatus?.setText(message);
  }

  private shutdown(): void {
    this.scale.off("resize", this.layoutHud, this);
    this.joystick?.destroy();
    this.clearWolves();
    this.clearVillageKit();
    this.world?.destroy();
  }
}
