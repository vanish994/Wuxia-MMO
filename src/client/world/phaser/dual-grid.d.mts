export interface WangTile { index: number; variant: number; wang: number[]; wangid?: number[] }
export interface WangManifest {
  id: string;
  kind: "wang_corner";
  materials: string[];
  variants: number;
  tiles: WangTile[];
}
export interface PairCoverage {
  materials: [string, string];
  statesPerVariant: number;
  variants: number;
  complete: boolean;
}
export const CORNER_ORDER: readonly ["top-left", "top-right", "bottom-left", "bottom-right"];
export function cellCorners(vertexGrid: number[][], x: number, y: number): [number, number, number, number];
export function createWangLookup(manifest: WangManifest): Map<string, number>;
export function selectWangTile(manifest: WangManifest, corners: [number, number, number, number], variant?: number): number;
export function selectCellTile(manifest: WangManifest, vertexGrid: number[][], x: number, y: number, variant?: number): number;
export function pairCoverage(manifest: WangManifest): PairCoverage[];
