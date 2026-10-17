import {
  assetUrl,
  basename,
  createRegion,
  preloadRegion,
  regionAssetKeys,
  regionById,
  type RegionContact,
  type RegionRuntime,
  type WuxiaWorldIndex,
} from "./wuxia-region-loader.mjs";
import { worldAppearance, type Season, type Weather } from "./wuxia-world-state.mjs";

export interface WuxiaPlayerLike {
  x: number;
  y: number;
  width?: number;
  height?: number;
  body?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    velocity?: { x: number; y: number };
    reset?: (x: number, y: number) => void;
  } | null;
  setPosition?: (x: number, y: number) => unknown;
}

export interface PortalRequest {
  regionId: string;
  portalId: number;
  portalName?: string;
  destinationRegionId: string;
  destinationSpawnId: string;
  clientSeq: number;
}

export interface InteractionRequest {
  regionId: string;
  objectId: number;
  objectName?: string;
  clientSeq: number;
}

export interface WuxiaWorldLoaderCallbacks {
  /** Send this intent to the authoritative server; do not transition on the client. */
  onPortalRequest: (request: PortalRequest) => unknown | Promise<unknown>;
  onInteractionRequest?: (request: InteractionRequest) => unknown | Promise<unknown>;
  onRegionLoaded?: (region: RegionRuntime, spawnId?: string) => void;
  getMovementVector?: (player: WuxiaPlayerLike) => { x: number; y: number };
}

export interface WuxiaWorldLoaderOptions {
  /** Public URL prefix before repository-relative paths; typically "/" or "/game/". */
  assetRoot?: string;
  fetcher?: typeof fetch;
  callbacks: WuxiaWorldLoaderCallbacks;
  /** Minimum velocity projected onto the portal's travel direction, in px/s. */
  portalMovementThreshold?: number;
}

export interface EnterRegionOptions {
  player?: WuxiaPlayerLike;
  /** Apply a spawn only after the server accepts a transition. */
  spawnId?: string;
  season?: Season;
  hour?: number;
  weather?: Weather;
  weatherOptions?: { width?: number; height?: number; depth?: number; quantity?: number };
}

interface WorldBundle {
  id: string;
  spawns: Array<{ id: string; x: number; y: number; facing?: string }>;
}

type LoaderLike = {
  start: () => unknown;
  once: (event: string, callback: (...args: any[]) => void) => unknown;
  on: (event: string, callback: (...args: any[]) => void) => unknown;
  off?: (event: string, callback: (...args: any[]) => void) => unknown;
  isLoading?: boolean | (() => boolean);
};

type SceneLike = Parameters<typeof preloadRegion>[0] & {
  load: LoaderLike & Parameters<typeof preloadRegion>[0]["load"];
  cache?: { tilemap?: { exists?: (key: string) => boolean } };
  textures?: { exists?: (key: string) => boolean };
  cameras?: { main?: { setBounds?: (x: number, y: number, width: number, height: number) => unknown; startFollow?: (target: unknown) => unknown } };
};

function isLoading(loader: LoaderLike): boolean {
  return typeof loader.isLoading === "function" ? loader.isLoading() : Boolean(loader.isLoading);
}

function isPlayerInside(player: WuxiaPlayerLike, contact: RegionContact): boolean {
  const body = player.body;
  const x = Number(body?.x ?? player.x);
  const y = Number(body?.y ?? player.y);
  const width = Math.max(1, Number(body?.width ?? player.width ?? 1));
  const height = Math.max(1, Number(body?.height ?? player.height ?? 1));
  return x + width >= contact.x && x <= contact.x + contact.width
    && y + height >= contact.y && y <= contact.y + contact.height;
}

function portalDirection(contact: RegionContact): { x: number; y: number } {
  const props = contact.properties;
  const raw = props.travelDirection;
  const fromArray = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",").map(Number) : [];
  return {
    x: Number(props.travelDirectionX ?? fromArray[0] ?? 0),
    y: Number(props.travelDirectionY ?? fromArray[1] ?? 0),
  };
}

function portalDestination(contact: RegionContact): { regionId: string; spawnId: string } {
  const target = String(contact.properties.to ?? "");
  const separator = target.indexOf(":");
  if (separator <= 0 || separator === target.length - 1) {
    throw new Error(`Portal '${contact.name ?? contact.id}' has invalid 'to': ${target}`);
  }
  return { regionId: target.slice(0, separator), spawnId: target.slice(separator + 1) };
}

/**
 * Phaser client adapter for the Wuxia world bundle.
 * Instantiate inside a Scene, then call enterRegion from create() or after a server-approved transition.
 */
export class WuxiaWorldLoader {
  private readonly scene: SceneLike;
  private readonly assetRoot: string;
  private readonly fetcher: typeof fetch;
  private readonly callbacks: WuxiaWorldLoaderCallbacks;
  private readonly portalMovementThreshold: number;
  private indexPromise?: Promise<WuxiaWorldIndex>;
  private readonly bundlePromises = new Map<string, Promise<WorldBundle>>();
  private activeRegion?: RegionRuntime;
  private activeAppearance?: ReturnType<typeof worldAppearance>;
  private player?: WuxiaPlayerLike;
  private transitionInFlight = false;
  private portalLatched = false;
  private interactionLatch = new Set<number>();
  private clientSeq = 0;

  constructor(scene: SceneLike, options: WuxiaWorldLoaderOptions) {
    if (!options?.callbacks?.onPortalRequest) {
      throw new Error("WuxiaWorldLoader requires callbacks.onPortalRequest for server-authoritative travel");
    }
    this.scene = scene;
    this.assetRoot = options.assetRoot ?? "/";
    const fetcher = options.fetcher ?? globalThis.fetch;
    this.fetcher = fetcher.bind(globalThis);
    this.callbacks = options.callbacks;
    this.portalMovementThreshold = options.portalMovementThreshold ?? 0.5;
  }

  get currentRegion(): RegionRuntime | undefined {
    return this.activeRegion;
  }

  async loadIndex(): Promise<WuxiaWorldIndex> {
    if (!this.indexPromise) {
      const url = assetUrl("assets/world/maps/biomes/biome-index.json", this.assetRoot);
      this.indexPromise = this.fetchJson<WuxiaWorldIndex>(url).then((index) => {
        if (!Array.isArray(index.regions) || !Array.isArray(index.connections)) {
          throw new Error("Invalid Wuxia biome-index.json: expected regions and connections arrays");
        }
        return index;
      }).catch((error) => {
        this.indexPromise = undefined;
        throw error;
      });
    }
    return this.indexPromise;
  }

  /** Load assets and create a region. Call only after the server approves any requested transition. */
  async enterRegion(regionId: string, options: EnterRegionOptions = {}): Promise<RegionRuntime> {
    if (this.transitionInFlight) throw new Error("A Wuxia region transition is already in progress");
    this.transitionInFlight = true;
    let nextRegion: RegionRuntime | undefined;
    let nextAppearance: ReturnType<typeof worldAppearance> | undefined;
    let committed = false;
    try {
      const index = await this.loadIndex();
      const regionRecord = regionById(index, regionId);
      const player = options.player ?? this.player;
      const bundle = options.spawnId ? await this.loadBundle(regionRecord.bundle, regionId) : undefined;
      const spawn = options.spawnId
        ? bundle?.spawns.find((item) => item.id === options.spawnId)
        : undefined;
      if (options.spawnId && !spawn) {
        throw new Error(`Spawn '${options.spawnId}' not found in region '${regionId}'`);
      }

      const keys = regionAssetKeys(regionId);
      const allAssetsCached = Boolean(
        this.scene.cache?.tilemap?.exists?.(keys.tilemap)
        && this.scene.textures?.exists?.(keys.ground)
        && regionRecord.prop_images.every((path) => this.scene.textures?.exists?.(keys.prop(basename(path)))),
      );
      if (!allAssetsCached) {
        preloadRegion(this.scene, index, regionId, { assetRoot: this.assetRoot });
        await this.waitForSceneLoader();
      }

      nextRegion = createRegion(this.scene, index, regionId);
      if (player) {
        nextRegion.attachPlayer(player);
        if (spawn) this.positionAtSpawn(player, spawn);
      }
      nextAppearance = worldAppearance(this.scene, nextRegion.groundLayer, {
        season: options.season ?? "summer",
        hour: options.hour ?? 12,
        weather: options.weather,
        weatherOptions: options.weatherOptions,
      });

      const previousRegion = this.activeRegion;
      const previousAppearance = this.activeAppearance;
      this.activeRegion = nextRegion;
      this.activeAppearance = nextAppearance;
      this.player = player;
      committed = true;
      this.portalLatched = false;
      this.interactionLatch.clear();
      previousAppearance?.destroy();
      previousRegion?.destroy();

      const map = nextRegion.tilemap as { widthInPixels?: number; heightInPixels?: number };
      this.scene.cameras?.main?.setBounds?.(0, 0, map.widthInPixels ?? 0, map.heightInPixels ?? 0);
      if (player) this.scene.cameras?.main?.startFollow?.(player);
      this.callbacks.onRegionLoaded?.(nextRegion, options.spawnId);
      return nextRegion;
    } catch (error) {
      if (!committed) {
        nextAppearance?.destroy();
        nextRegion?.destroy();
      }
      throw error;
    } finally {
      this.transitionInFlight = false;
    }
  }

  /** Call from the interact/confirm input handler while the player overlaps the named portal. */
  async requestPortal(portalId: string | number, player = this.player): Promise<boolean> {
    if (!this.activeRegion || !player || this.portalLatched) return false;
    const contact = this.findContact(portalId, "portal");
    if (!contact || !isPlayerInside(player, contact)) return false;
    if (contact.properties.requiresMovement === true && !this.movingTowardPortal(player, contact)) return false;

    const target = portalDestination(contact);
    const request: PortalRequest = {
      regionId: this.activeRegion.id,
      portalId: contact.id,
      portalName: contact.name,
      destinationRegionId: target.regionId,
      destinationSpawnId: target.spawnId,
      clientSeq: ++this.clientSeq,
    };
    if (contact.properties.latch !== false) this.portalLatched = true;
    try {
      await this.callbacks.onPortalRequest(request);
      return true;
    } catch (error) {
      this.portalLatched = false;
      throw error;
    }
  }

  /** Call after a server rejection/acceptance to permit another portal intent. */
  clearPortalLatch(): void {
    this.portalLatched = false;
  }

  /** Call from the interact input handler while the player overlaps an interaction object. */
  async requestInteraction(objectId: string | number, player = this.player): Promise<boolean> {
    if (!this.activeRegion || !player || !this.callbacks.onInteractionRequest) return false;
    const contact = this.findContact(objectId, "interaction");
    if (!contact || !isPlayerInside(player, contact) || this.interactionLatch.has(contact.id)) return false;
    const request: InteractionRequest = {
      regionId: this.activeRegion.id,
      objectId: contact.id,
      objectName: contact.name,
      clientSeq: ++this.clientSeq,
    };
    this.interactionLatch.add(contact.id);
    try {
      await this.callbacks.onInteractionRequest(request);
      return true;
    } catch (error) {
      this.interactionLatch.delete(contact.id);
      throw error;
    }
  }

  clearInteractionLatch(objectId?: number): void {
    if (objectId === undefined) this.interactionLatch.clear();
    else this.interactionLatch.delete(objectId);
  }

  destroy(): void {
    this.activeAppearance?.destroy();
    this.activeRegion?.destroy();
    this.activeAppearance = undefined;
    this.activeRegion = undefined;
    this.player = undefined;
    this.portalLatched = false;
    this.interactionLatch.clear();
  }

  private findContact(id: string | number, type: RegionContact["type"]): RegionContact | undefined {
    const key = String(id);
    return this.activeRegion?.interactions.find((item) => item.type === type
      && (String(item.id) === key || item.name === key));
  }

  private movingTowardPortal(player: WuxiaPlayerLike, contact: RegionContact): boolean {
    const direction = portalDirection(contact);
    const length = Math.hypot(direction.x, direction.y);
    if (!length) return false;
    const movement = this.callbacks.getMovementVector?.(player) ?? player.body?.velocity;
    if (!movement) return false;
    const projectedSpeed = (movement.x * direction.x + movement.y * direction.y) / length;
    return projectedSpeed > this.portalMovementThreshold;
  }

  private positionAtSpawn(player: WuxiaPlayerLike, spawn: NonNullable<WorldBundle["spawns"][number]>): void {
    if (typeof player.setPosition === "function") player.setPosition(spawn.x, spawn.y);
    else {
      player.x = spawn.x;
      player.y = spawn.y;
    }
    player.body?.reset?.(spawn.x, spawn.y);
  }

  private async loadBundle(path: string, expectedRegionId: string): Promise<WorldBundle> {
    let promise = this.bundlePromises.get(path);
    if (!promise) {
      promise = this.fetchJson<WorldBundle>(assetUrl(path, this.assetRoot)).then((bundle) => {
        if (bundle.id !== expectedRegionId || !Array.isArray(bundle.spawns)) {
          throw new Error(`Invalid map bundle for region '${expectedRegionId}'`);
        }
        return bundle;
      }).catch((error) => {
        this.bundlePromises.delete(path);
        throw error;
      });
      this.bundlePromises.set(path, promise);
    }
    return promise;
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const response = await this.fetcher(url);
    if (!response.ok) throw new Error(`Wuxia asset request failed (${response.status}): ${url}`);
    return response.json() as Promise<T>;
  }

  private waitForSceneLoader(): Promise<void> {
    const loader = this.scene.load;
    return new Promise((resolve, reject) => {
      const failures: string[] = [];
      const cleanup = () => {
        loader.off?.("loaderror", onLoadError);
        loader.off?.("complete", onComplete);
      };
      const onLoadError = (file: { key?: string; src?: string }) => {
        failures.push(file?.key ?? file?.src ?? "unknown asset");
      };
      const onComplete = () => {
        cleanup();
        if (failures.length) reject(new Error(`Failed to load Wuxia assets: ${failures.join(", ")}`));
        else resolve();
      };
      loader.on("loaderror", onLoadError);
      loader.once("complete", onComplete);
      try {
        if (!isLoading(loader)) loader.start();
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }
}
