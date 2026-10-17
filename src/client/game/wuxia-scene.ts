import Phaser from "phaser";
import {
  WuxiaWorldLoader,
  type InteractionRequest,
  type PortalRequest,
} from "../world/phaser/wuxia-world-loader.js";
import { VirtualJoystick } from "../input/virtual-joystick";

const DIRECTIONS = ["down", "down-left", "down-right", "left", "right", "up", "up-left", "up-right"] as const;
type Direction = (typeof DIRECTIONS)[number];
const assetPath = (path: string): string => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
const VILLAGE_ASSET_KEYS: Record<string, string> = {
  "/assets/external/pixellab-wuxia-objects/cabanas/cabana-1.png": "qinghe-cabin-1",
  "/assets/external/pixellab-wuxia-objects/cabanas/cabana-2.png": "qinghe-cabin-2",
  "/assets/external/pixellab-wuxia-objects/cabanas/cabana-3.png": "qinghe-cabin-3",
  "/assets/external/pixellab-wuxia-objects/cabanas/cabana-4.png": "qinghe-cabin-4",
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

export class WuxiaScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private world!: WuxiaWorldLoader;
  private joystick!: VirtualJoystick;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private facing: Direction = "down";
  private hudRegion!: Phaser.GameObjects.Text;
  private hudStatus!: Phaser.GameObjects.Text;
  private hudHint!: Phaser.GameObjects.Text;
  private hpBar!: HudBar;
  private qiBar!: HudBar;
  private actionButton!: Phaser.GameObjects.Container;
  private hudTopLeft!: Phaser.GameObjects.Container;
  private hudCompass!: Phaser.GameObjects.Container;
  private hudSkills!: Phaser.GameObjects.Container;
  private villageKitImages: Phaser.GameObjects.Image[] = [];
  private villageKitColliders: Phaser.GameObjects.Zone[] = [];
  private loading = true;
  private localTransition = false;

  constructor() {
    super("wuxia-world");
  }

  preload(): void {
    for (const direction of DIRECTIONS) {
      for (let frame = 1; frame <= 4; frame += 1) {
        this.load.image(
          `player-walk-${direction}-${frame}`,
          assetPath(`/assets/characters/samurai/runtime/walk/${direction}-${frame}.png`),
        );
      }
    }
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
    this.physics.world.setBounds(0, 0, 1280, 800);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D",
    }) as Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.createAnimations();
    this.player = this.physics.add.sprite(576, 480, "player-walk-down-1")
      .setDepth(488)
      .setScale(1)
      .setCollideWorldBounds(true);
    this.player.setSize(22, 22).setOffset(21, 34);
    this.player.play("player-walk-down");
    this.player.anims.pause();

    this.createHud();
    this.joystick = new VirtualJoystick(this);
    this.world = new WuxiaWorldLoader(this, {
          assetRoot: import.meta.env.BASE_URL,
      callbacks: {
        onPortalRequest: (request) => this.handleLocalPortal(request),
        onInteractionRequest: (request) => this.handleLocalInteraction(request),
        onRegionLoaded: (region) => {
          this.clearVillageKit();
          const map = region.tilemap as { widthInPixels?: number; heightInPixels?: number };
          this.physics.world.setBounds(0, 0, map.widthInPixels ?? 1280, map.heightInPixels ?? 800);
          if (region.id === "qinghe-valley") this.mountVillageKit();
          const title = region.region.title ?? region.id;
          this.hudRegion.setText(title.toUpperCase());
          this.setStatus(`Explorando ${title}.`);
        },
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
      this.setStatus("Qinghe Valley pronta para exploração.");
      this.hudHint.setText("WASD/setas ou joystick · E / Interagir nos portais");
    }).catch((error: unknown) => {
      this.loading = false;
      const message = error instanceof Error ? error.message : String(error);
      this.setStatus(`Falha ao carregar o mundo: ${message}`);
      console.error(error);
    });
  }

  update(): void {
    if (!this.player || this.loading) return;
    const movement = this.getMovementVector();
    const speed = 150;
    this.player.setVelocity(movement.x * speed, movement.y * speed);
    this.player.setDepth(this.player.y + 12);

    if (movement.x !== 0 || movement.y !== 0) {
      this.facing = directionFor(movement.x, movement.y);
      this.player.anims.play(`player-walk-${this.facing}`, true);
    } else {
      this.player.anims.pause();
    }

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      void this.requestNearbyPortal();
    }
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
    }
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

  private createHud(): void {
    this.hudTopLeft = this.add.container(18, 18).setScrollFactor(0).setDepth(2100);
    const panel = this.add.nineslice(0, 0, "gui-panel", undefined, 372, 154, 32, 32, 32, 32).setOrigin(0, 0);
    const header = this.add.nineslice(82, 10, "gui-header", undefined, 270, 32, 30, 30, 8, 8).setOrigin(0, 0);
    const portraitFrame = this.add.image(30, 42, "gui-portrait-frame").setOrigin(0, 0);
    const portrait = this.add.image(54, 82, "player-walk-down-1").setScale(0.62);
    const brand = this.add.text(98, 19, "WUXIA MMO", { color: "#5b3261", fontFamily: "Trebuchet MS, sans-serif", fontSize: "12px", fontStyle: "bold", letterSpacing: 2 });
    this.hudRegion = this.add.text(98, 45, "QINGHE VALLEY", { color: "#fff4d9", fontFamily: "Trebuchet MS, sans-serif", fontSize: "18px", fontStyle: "bold" });
    const level = this.add.text(98, 70, "JIANGHU WANDERER  ·  LV. 1", { color: "#d6b66f", fontFamily: "Trebuchet MS, sans-serif", fontSize: "9px", fontStyle: "bold", letterSpacing: 1 });
    const role = this.add.text(98, 87, "Caminho da espada  ·  Primavera", { color: "#a9bdc5", fontFamily: "Trebuchet MS, sans-serif", fontSize: "10px" });
    this.hpBar = this.createBar(98, 105, "HP", 0x89d852, "100 / 100", this.hudTopLeft);
    this.qiBar = this.createBar(98, 130, "QI", 0x4e9be8, "80 / 80", this.hudTopLeft);
    this.hudTopLeft.add([panel, header, portraitFrame, portrait, brand, this.hudRegion, level, role, this.hpBar.fill, this.hpBar.value]);
    this.hudTopLeft.sendToBack(panel).bringToTop(header).bringToTop(portraitFrame).bringToTop(portrait);

    this.hudStatus = this.add.text(18, 184, "Carregando mundo…", { color: "#fff4d9", backgroundColor: "#241d39dd", padding: { left: 10, right: 10, top: 7, bottom: 7 }, fontFamily: "Trebuchet MS, sans-serif", fontSize: "12px" }).setScrollFactor(0).setDepth(2101);
    this.hudHint = this.add.text(18, 0, "WASD / setas  ·  joystick  ·  E interagir", { color: "#f8e5bd", backgroundColor: "#241d39dd", padding: { left: 10, right: 10, top: 7, bottom: 7 }, fontFamily: "Trebuchet MS, sans-serif", fontSize: "11px" }).setScrollFactor(0).setDepth(2101);

    this.hudCompass = this.add.container(0, 18).setScrollFactor(0).setDepth(2100);
    this.hudCompass.add(this.add.image(0, 0, "gui-compass").setOrigin(0, 0));
    this.hudCompass.add(this.add.text(38, 28, "QINGHE", { color: "#f8e5bd", fontFamily: "Trebuchet MS, sans-serif", fontSize: "8px", fontStyle: "bold" }).setOrigin(0.5));

    this.hudSkills = this.add.container(0, 0).setScrollFactor(0).setDepth(2101);
    const skills = ["1  CORTE", "2  ONDA QI", "3  POÇÃO", "4  MAPA"];
    skills.forEach((label, index) => {
      const slot = this.add.image(index * 56, 0, "gui-slot", index % 4).setOrigin(0, 0);
      const key = this.add.text(index * 56 + 16, 5, String(index + 1), { color: "#fff4d9", fontFamily: "Trebuchet MS, sans-serif", fontSize: "11px", fontStyle: "bold" }).setOrigin(0.5);
      const caption = this.add.text(index * 56 + 16, 36, label.split("  ")[1], { color: "#f8e5bd", fontFamily: "Trebuchet MS, sans-serif", fontSize: "8px", fontStyle: "bold" }).setOrigin(0.5, 0);
      this.hudSkills.add([slot, key, caption]);
    });

    const actionBackground = this.add.image(0, 0, "gui-action", 1).setOrigin(0.5).setScale(1.5).setInteractive({ useHandCursor: true });
    const actionLabel = this.add.text(0, 0, "INTERAGIR", { color: "#fff4d9", fontFamily: "Trebuchet MS, sans-serif", fontSize: "11px", fontStyle: "bold", letterSpacing: 1 }).setOrigin(0.5);
    this.actionButton = this.add.container(0, 0, [actionBackground, actionLabel]).setScrollFactor(0).setDepth(2101);
    actionBackground.on("pointerup", () => { void this.requestNearbyPortal(); });
    this.scale.on("resize", this.layoutHud, this);
    this.layoutHud();
  }

  private createBar(x: number, y: number, label: string, color: number, value: string, parent: Phaser.GameObjects.Container): HudBar {
    const labelText = this.add.text(x, y, label, { color: "#f8e5bd", fontFamily: "Trebuchet MS, sans-serif", fontSize: "9px", fontStyle: "bold" });
    const background = this.add.rectangle(x + 27, y + 8, 88, 7, 0x251d3c).setOrigin(0, 0.5);
    const fill = this.add.rectangle(x + 27, y + 8, 84, 7, color).setOrigin(0, 0.5);
    const frame = this.add.image(x + 24, y + 8, "gui-bar-frame").setOrigin(0, 0.5);
    const text = this.add.text(x + 29, y + 14, value, { color: "#fff4d9", fontFamily: "Trebuchet MS, sans-serif", fontSize: "8px" });
    parent.add([labelText, background, fill, frame, text]);
    parent.bringToTop(frame).bringToTop(text);
    return { fill, value: text };
  }

  private layoutHud(): void {
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    this.hudCompass?.setPosition(width - 94, 18);
    this.hudSkills?.setPosition(Math.max(18, (width - 224) / 2), height - 76);
    this.hudHint?.setPosition(18, height - 30);
    this.actionButton?.setPosition(width - 84, height - 56);
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
    this.clearVillageKit();
    this.world?.destroy();
  }
}

function directionFor(x: number, y: number): Direction {
  if (Math.abs(x) > Math.abs(y) * 1.8) return x > 0 ? "right" : "left";
  if (Math.abs(y) > Math.abs(x) * 1.8) return y > 0 ? "down" : "up";
  if (x >= 0 && y >= 0) return "down-right";
  if (x < 0 && y >= 0) return "down-left";
  if (x >= 0 && y < 0) return "up-right";
  return "up-left";
}
