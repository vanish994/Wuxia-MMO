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
    const villageAssets: Record<string, string> = {
      "qinghe-cabin-1": assetPath("/assets/external/pixellab-wuxia-objects/cabanas/cabana-1.png"),
      "qinghe-cabin-2": assetPath("/assets/external/pixellab-wuxia-objects/cabanas/cabana-2.png"),
      "qinghe-cabin-3": assetPath("/assets/external/pixellab-wuxia-objects/cabanas/cabana-3.png"),
      "qinghe-market-stall-1": assetPath("/assets/external/pixellab-wuxia-objects/barracas/barraca-1.png"),
      "qinghe-market-stall-2": assetPath("/assets/external/pixellab-wuxia-objects/barracas/barraca-2.png"),
      "qinghe-market-stall-3": assetPath("/assets/external/pixellab-wuxia-objects/barracas/barraca-3.png"),
      "qinghe-blossom-tree": assetPath("/assets/external/feudal-japan-nature/PNG/01_cherry_blossom_tree_32x32.png"),
      "qinghe-koi-pond": assetPath("/assets/external/feudal-japan-nature/PNG/02_koi_pond_tile_32x32.png"),
      "qinghe-rocks": assetPath("/assets/external/feudal-japan-nature/PNG/03_rock_cluster_32x32.png"),
      "qinghe-bamboo": assetPath("/assets/external/feudal-japan-nature/PNG/04_bamboo_grove_32x32.png"),
      "qinghe-maple": assetPath("/assets/external/feudal-japan-nature/PNG/05_autumn_maple_tree_32x32.png"),
      "qinghe-stone-path": assetPath("/assets/external/feudal-japan-nature/PNG/07_mossy_stone_path_32x32.png"),
      "qinghe-fallen-log": assetPath("/assets/external/feudal-japan-nature/PNG/08_fallen_log_32x32.png"),
    };
    for (const [key, path] of Object.entries(villageAssets)) this.load.image(key, path);
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
    const textureKeyByAsset: Record<string, string> = {
      "/assets/external/pixellab-wuxia-objects/cabanas/cabana-1.png": "qinghe-cabin-1",
      "/assets/external/pixellab-wuxia-objects/cabanas/cabana-2.png": "qinghe-cabin-2",
      "/assets/external/pixellab-wuxia-objects/cabanas/cabana-3.png": "qinghe-cabin-3",
      "/assets/external/pixellab-wuxia-objects/barracas/barraca-1.png": "qinghe-market-stall-1",
      "/assets/external/pixellab-wuxia-objects/barracas/barraca-2.png": "qinghe-market-stall-2",
      "/assets/external/pixellab-wuxia-objects/barracas/barraca-3.png": "qinghe-market-stall-3",
      "/assets/external/feudal-japan-nature/PNG/01_cherry_blossom_tree_32x32.png": "qinghe-blossom-tree",
      "/assets/external/feudal-japan-nature/PNG/02_koi_pond_tile_32x32.png": "qinghe-koi-pond",
      "/assets/external/feudal-japan-nature/PNG/03_rock_cluster_32x32.png": "qinghe-rocks",
      "/assets/external/feudal-japan-nature/PNG/04_bamboo_grove_32x32.png": "qinghe-bamboo",
      "/assets/external/feudal-japan-nature/PNG/05_autumn_maple_tree_32x32.png": "qinghe-maple",
      "/assets/external/feudal-japan-nature/PNG/07_mossy_stone_path_32x32.png": "qinghe-stone-path",
      "/assets/external/feudal-japan-nature/PNG/08_fallen_log_32x32.png": "qinghe-fallen-log",
    };
    for (const object of kit.objects) {
      const texture = textureKeyByAsset[object.asset];
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
    const panel = this.add.rectangle(18, 18, 320, 116, 0x0b1420, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x75cdb8, 0.7)
      .setScrollFactor(0)
      .setDepth(2100);
    this.add.text(34, 30, "WUXIA MMO", {
      color: "#93d7c5",
      fontFamily: "Trebuchet MS, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
      letterSpacing: 2,
    }).setScrollFactor(0).setDepth(2101);
    this.hudRegion = this.add.text(34, 50, "QINGHE VALLEY", {
      color: "#fff4d9",
      fontFamily: "Trebuchet MS, sans-serif",
      fontSize: "20px",
      fontStyle: "bold",
    }).setScrollFactor(0).setDepth(2101);
    this.add.text(34, 78, "PROTÓTIPO LOCAL · FASE 1", {
      color: "#91a7b8",
      fontFamily: "Trebuchet MS, sans-serif",
      fontSize: "10px",
      letterSpacing: 1,
    }).setScrollFactor(0).setDepth(2101);

    this.hpBar = this.createBar(34, 101, "HP", 0x9de2a6, "100 / 100");
    this.qiBar = this.createBar(178, 101, "QI", 0x8bc6ff, "80 / 80");
    void panel;

    this.hudStatus = this.add.text(18, 146, "Carregando mundo…", {
      color: "#fff4d9",
      backgroundColor: "#0b1420cc",
      padding: { left: 10, right: 10, top: 7, bottom: 7 },
      fontFamily: "Trebuchet MS, sans-serif",
      fontSize: "13px",
    }).setScrollFactor(0).setDepth(2101);
    this.hudHint = this.add.text(18, 0, "Carregando controles…", {
      color: "#d2e6e1",
      backgroundColor: "#0b1420cc",
      padding: { left: 10, right: 10, top: 7, bottom: 7 },
      fontFamily: "Trebuchet MS, sans-serif",
      fontSize: "12px",
    }).setScrollFactor(0).setDepth(2101);

    const actionBackground = this.add.rectangle(0, 0, 164, 56, 0x122536, 0.92)
      .setStrokeStyle(2, 0x75cdb8, 0.85)
      .setInteractive({ useHandCursor: true });
    const actionLabel = this.add.text(0, 0, "INTERAGIR", {
      color: "#fff4d9",
      fontFamily: "Trebuchet MS, sans-serif",
      fontSize: "14px",
      fontStyle: "bold",
      letterSpacing: 1,
    }).setOrigin(0.5);
    this.actionButton = this.add.container(0, 0, [actionBackground, actionLabel])
      .setScrollFactor(0)
      .setDepth(2101);
    actionBackground.on("pointerup", () => { void this.requestNearbyPortal(); });
    this.scale.on("resize", this.layoutHud, this);
    this.layoutHud();
  }

  private createBar(x: number, y: number, label: string, color: number, value: string): HudBar {
    this.add.text(x, y, label, {
      color: "#a8bec6",
      fontFamily: "Trebuchet MS, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
    }).setScrollFactor(0).setDepth(2101);
    this.add.rectangle(x + 24, y + 7, 92, 8, 0x243747)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(2101);
    const fill = this.add.rectangle(x + 24, y + 7, 92, 8, color)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(2102);
    const text = this.add.text(x + 24, y + 14, value, {
      color: "#bdd4d6",
      fontFamily: "Trebuchet MS, sans-serif",
      fontSize: "9px",
    }).setScrollFactor(0).setDepth(2101);
    return { fill, value: text };
  }

  private layoutHud(): void {
    const height = this.scale.gameSize.height;
    this.hudHint?.setPosition(18, height - 30);
    this.actionButton?.setPosition(this.scale.gameSize.width - 102, height - 74);
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
    const background = this.actionButton?.list[0] as Phaser.GameObjects.Rectangle | undefined;
    if (!background) return;
    background.setFillStyle(nearbyPortal ? 0x1b5a55 : 0x122536, nearbyPortal ? 0.98 : 0.92);
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
