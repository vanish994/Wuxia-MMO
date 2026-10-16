export interface WuxiaRegionRecord {
  id: string;
  title?: string;
  tileset: string;
  tile_size: 32;
  tiled_map: string;
  ground_image: string;
  prop_images: string[];
  bundle: string;
  materials?: string[];
}
export interface WuxiaWorldIndex {
  regions: WuxiaRegionRecord[];
  connections: Array<{ from: string; to: string; edge: string; reciprocal: boolean }>;
}
export interface RegionContact {
  id: number;
  name: string;
  type: "portal" | "interaction";
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, unknown>;
  zone?: unknown;
}
export interface RegionRuntime {
  id: string;
  region: WuxiaRegionRecord;
  tilemap: unknown;
  groundLayer: { setTint(value: number): unknown; clearTint?(): unknown; destroy?(): unknown };
  props: Array<Record<string, unknown>>;
  colliders: Array<{ object: Record<string, unknown>; collider: unknown }>;
  interactions: RegionContact[];
  attachPlayer(player: unknown, handlers?: { onPortal?: (contact: RegionContact) => void; onInteraction?: (contact: RegionContact) => void }): void;
  destroy(): void;
}
export function regionById(index: WuxiaWorldIndex, id: string): WuxiaRegionRecord;
export function regionAssetKeys(regionId: string): { tilemap: string; ground: string; prop(name: string): string };
export function preloadRegion(scene: any, index: WuxiaWorldIndex, regionId: string, options?: { assetRoot?: string }): { region: WuxiaRegionRecord; keys: ReturnType<typeof regionAssetKeys> };
export function resolvePropInstances(mapJson: any, regionId: string): Array<Record<string, unknown>>;
export function resolveInteractionObjects(mapJson: any): RegionContact[];
export function createRegion(scene: any, index: WuxiaWorldIndex, regionId: string): RegionRuntime;
export function assetUrl(path: string, root?: string): string;
export function basename(path: string): string;
export function propertyMap(properties?: any): Record<string, unknown>;
export function propertyValue(properties: any, key: string, fallback?: unknown): unknown;
