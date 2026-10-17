#!/usr/bin/env python3
"""Generate the Qinghe starter village (Vale da Lua Serena) as an embedded Tiled map.

The layout is authored as a tile grid (32 px cells) below. The script:
  * paints the ground with the existing grass/dirt/water wang tileset (corner rules);
  * places props from the existing pixel-art assets (cabins, stalls, lanterns, trees);
  * derives collisions from water cells, map borders and prop footprints;
  * keeps the spawn/portal/interaction contracts used by the neighbouring regions.

Run:  python3 scripts/build_village_tmj.py   (writes map.embedded.tmj and a preview PNG)
"""
from __future__ import annotations

import copy
import math
import json
import random
import shutil
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
REGION = ROOT / "assets/world/maps/biomes/regions/qinghe-valley-v1/tiled"
TMJ_PATH = REGION / "map.embedded.tmj"
PREVIEW_PATH = REGION / "village-preview.png"
EXTERNAL = ROOT / "assets/external/pixellab-wuxia-objects"

W, H, T = 56, 36, 32

# Material indices follow the wangcolor order of grass-path-water-wang81.tsx.
WATER, GRASS, DIRT = 0, 1, 2
CHAR_TO_MAT = {"w": WATER, "g": GRASS, "d": DIRT}

# ---------------------------------------------------------------- layout ----


# Hunting spawns in tile units (px / 32), matching HUNT_SPAWNS in combat-config.mjs.
HUNT_SPAWN_TILES = [
    ("west-field", 5, 12), ("west-south", 10, 26), ("south-field", 21, 30),
    ("south-east", 34, 31), ("east-field", 46, 25), ("north-east", 44, 13),
]


def carve_hunt_trails(g) -> None:
    """Open a clearing and a two-tile dirt trail from each hunting spawn to the nearest road."""
    roads = [(x, y) for y in range(H) for x in range(W) if g[y][x] == "d"]
    for _name, sx, sy in HUNT_SPAWN_TILES:
        tx, ty = min(roads, key=lambda r: abs(r[0] - sx) + abs(r[1] - sy))
        # L-shaped trail: horizontal first, then vertical, two tiles wide.
        for x in range(min(sx, tx), max(sx, tx) + 1):
            for dy in (0, 1):
                if 0 <= sy + dy < H and 0 <= x < W:
                    g[sy + dy][x] = "d"
        for y in range(min(sy, ty), max(sy, ty) + 1):
            for dx in (0, 1):
                if 0 <= tx + dx < W and 0 <= y < H:
                    g[y][tx + dx] = "d"


def build_layout() -> list[list[str]]:
    g = [["g"] * W for _ in range(H)]

    def fill(x0, y0, x1, y1, c):
        for y in range(max(0, y0), min(H, y1 + 1)):
            for x in range(max(0, x0), min(W, x1 + 1)):
                g[y][x] = c

    # Road exits: these tile rows/columns match the spawn/portal contracts.
    fill(0, 17, 23, 18, "d")      # west road  -> bamboo coast
    fill(33, 20, 55, 21, "d")     # east road  -> river market
    fill(27, 0, 28, 16, "d")      # north road -> jade mountain / shrine
    fill(32, 25, 33, 35, "d")     # south road -> training grounds
    # Central plaza and market square.
    fill(25, 17, 31, 23, "d")
    fill(36, 13, 42, 19, "d")
    # Shrine terrace (north) and training yard (south-west).
    fill(24, 4, 32, 7, "d")
    fill(9, 25, 17, 29, "d")
    # Lake (north-east), rounded with an ellipse test.
    for y in range(0, 10):
        for x in range(40, 56):
            if ((x - 48) / 5.2) ** 2 + ((y - 5) / 3.4) ** 2 <= 1.0:
                g[y][x] = "w"
    # Footpaths linking the plaza to the botica and to the training yard.
    fill(19, 13, 24, 13, "d")
    fill(19, 13, 19, 16, "d")
    fill(17, 26, 24, 26, "d")
    # Stone path from the plaza to the tea garden.
    for i, x in enumerate(range(35, 42)):
        fill(x, 11 - i // 2, x, 12 - i // 2, "d")
    carve_hunt_trails(g)
    return g


# ----------------------------------------------------------- wang ground ----


def load_wang_table() -> dict[tuple[int, int, int, int], int]:
    """Map (tl, tr, bl, br) material tuples to tile ids of the wang tileset."""
    import re

    text = (REGION / "grass-path-water-wang81.tsx").read_text(encoding="utf8")
    table: dict[tuple[int, int, int, int], int] = {}
    for tile_id, wang in re.findall(r'<tile id="(\d+)">.*?name="wang" value="([0-9,]+)"', text, re.S):
        vals = tuple(int(v) for v in wang.split(","))
        table.setdefault(vals, int(tile_id))
    return table


def vertex_material(g, vx: int, vy: int) -> int:
    """Corner material: majority of the four cells touching the vertex (ties favour dirt, then water)."""
    votes = {WATER: 0, GRASS: 0, DIRT: 0}
    for cy in (vy - 1, vy):
        for cx in (vx - 1, vx):
            if 0 <= cx < W and 0 <= cy < H:
                votes[CHAR_TO_MAT[g[cy][cx]]] += 1
            else:
                votes[GRASS] += 1
    best = max(votes.values())
    for mat in (DIRT, WATER, GRASS):
        if votes[mat] == best:
            return mat
    return GRASS


def paint_ground(g, table) -> list[int]:
    data = []
    for y in range(H):
        for x in range(W):
            tl = vertex_material(g, x, y)
            tr = vertex_material(g, x + 1, y)
            bl = vertex_material(g, x, y + 1)
            br = vertex_material(g, x + 1, y + 1)
            tile_id = table.get((tl, tr, bl, br))
            if tile_id is None:
                raise SystemExit(f"no wang tile for corners {(tl, tr, bl, br)} at {(x, y)}")
            data.append(tile_id + 1)  # gid = tile id + firstgid(1)
    return data


# ----------------------------------------------------------------- props ----

# Village art: the Feudal Japan Mega Props pack (top-down three-quarter, bottom-center anchor)
# for buildings and props, plus the Free asset pack trees and the Harmonious Seasons trees
# already used by the forest. Every image is copied into the region's tiled/images folder
# and listed in biome-index.json, because the runtime loads only the listed prop images.
FEUDAL = ROOT / "assets/external/feudal-japan-mega-props"
FREE_TREES = ROOT / "assets/external/free-asset-pack/trees"
HARM = ROOT / "assets/external/harmonious-seasons/trees"

# name -> (source file, display scale, solid footprint fraction or None)
# Solid footprints are the building's base (scaled width x 22% of its height).
BUILD_SPEC: dict[str, tuple[Path, float, bool]] = {
    # Shrine terrace (north)
    "shrine-gate": (FEUDAL / "jpn_shrine_temple_shrine_gate_roofed_01.png", 0.62, True),
    "torii": (FEUDAL / "jpn_shrine_temple_torii_gate_vermilion_01.png", 0.55, False),
    "toro-lantern": (FEUDAL / "jpn_shrine_temple_stone_lantern_toro_01.png", 0.55, False),
    "komainu": (FEUDAL / "jpn_shrine_temple_komainu_guardian_statue_01.png", 0.5, False),
    "shrine-fence": (FEUDAL / "jpn_shrine_temple_shrine_fence_tamagaki_01.png", 0.55, False),
    "bell": (FEUDAL / "jpn_shrine_temple_temple_bell_bonsho_01.png", 0.55, True),
    # Plaza
    "koi-pond": (FEUDAL / "jpn_garden_nature_koi_pond_round_01.png", 0.6, True),
    "well": (FEUDAL / "jpn_town_shops_street_stone_well_01.png", 0.5, True),
    "chochin": (FEUDAL / "jpn_props_chochin_lantern_single_01.png", 0.36, False),
    "notice-board": (FEUDAL / "jpn_town_shops_town_notice_board_01.png", 0.55, True),
    # Town buildings
    "botica": (FEUDAL / "jpn_town_shops_machiya_shop_facade_01.png", 0.66, True),
    "inn": (FEUDAL / "jpn_town_shops_ryokan_inn_facade_01.png", 0.66, True),
    "forge": (FEUDAL / "jpn_castle_structures_dozo_storehouse_01.png", 0.66, True),
    "guard-house": (FEUDAL / "jpn_castle_structures_bansho_guardhouse_01.png", 0.66, True),
    "teahouse": (FEUDAL / "jpn_town_shops_teahouse_facade_01.png", 0.62, True),
    "bathhouse": (FEUDAL / "jpn_town_shops_bathhouse_facade_01.png", 0.66, True),
    "tower": (FEUDAL / "jpn_castle_structures_tenshu_keep_tower_01.png", 0.6, True),
    "market-shop": (FEUDAL / "jpn_town_shops_storefront_awning_crates_01.png", 0.66, True),
    # Market lane stalls
    "stall-produce": (FEUDAL / "jpn_town_shops_produce_stall_covered_01.png", 0.6, True),
    "stall-fish": (FEUDAL / "jpn_town_shops_fishmonger_stall_01.png", 0.6, True),
    "stall-ramen": (FEUDAL / "jpn_market_food_ramen_yatai_stall_01.png", 0.6, True),
    "stall-sake": (FEUDAL / "jpn_town_shops_sake_shop_barrels_01.png", 0.6, True),
    "stall-tea": (FEUDAL / "jpn_market_food_tea_stall_kettle_01.png", 0.6, True),
    "stall-fabric": (FEUDAL / "jpn_town_shops_fabric_shop_rolls_01.png", 0.6, True),
    "stall-cart": (FEUDAL / "jpn_market_food_food_cart_wheeled_01.png", 0.6, True),
    "banner": (FEUDAL / "jpn_town_shops_banner_nobori_shop_01.png", 0.6, False),
    "lantern-post": (FEUDAL / "jpn_town_shops_lantern_post_paper_01.png", 0.55, False),
    "bench": (FEUDAL / "jpn_town_shops_outdoor_bench_cushion_01.png", 0.55, False),
    # Training yard
    "straw-target": (FEUDAL / "jpn_armory_dojo_straw_target_archery_01.png", 0.6, True),
    "makiwara": (FEUDAL / "jpn_armory_dojo_makiwara_striking_post_01.png", 0.6, True),
    "dummy": (FEUDAL / "jpn_armory_dojo_training_dummy_wood_01.png", 0.6, True),
    "weapon-rack": (FEUDAL / "jpn_armory_dojo_katana_wall_rack_01.png", 0.6, True),
    "yari-row": (FEUDAL / "jpn_war_camp_yari_ground_row_01.png", 0.6, False),
    "banner-field": (FEUDAL / "jpn_war_camp_nobori_banner_field_01.png", 0.6, False),
    "gate-palisade": (FEUDAL / "jpn_defense_terrain_palisade_gate_wood_01.png", 0.6, True),
    # Tea garden and lake
    "bridge": (FEUDAL / "jpn_garden_nature_arched_bridge_red_01.png", 0.6, False),
    "stepping-stones": (FEUDAL / "jpn_garden_nature_stepping_stones_path_01.png", 0.55, False),
    "lotus": (FEUDAL / "jpn_garden_nature_lotus_pond_flowers_01.png", 0.55, False),
    "bonsai": (FEUDAL / "jpn_garden_nature_bonsai_tree_pot_01.png", 0.55, False),
    "flower-bed": (FEUDAL / "jpn_garden_nature_flower_bed_seasonal_01.png", 0.55, False),
    "rock-garden": (FEUDAL / "jpn_garden_nature_karesansui_rock_garden_01.png", 0.6, False),
}

def _source_for(name: str) -> Path:
    if name.startswith("hs-"):
        variant, index = name[3:].rsplit("-", 1)
        return HARM / f"{variant}_{index}.png"
    if name.startswith("free-tree-"):
        return FREE_TREES / f"tree_{name[-2:]}.png"
    return BUILD_SPEC[name][0]


HARM_VARIANTS = {"bigger": 0.55, "big": 0.30, "small": 0.15}

SOURCE_OF: dict[str, Path] = {}  # destination file name (under tiled/images) -> source file


def _dest_for(name: str) -> str:
    if name.startswith("hs-"):
        variant, index = name[3:].rsplit("-", 1)
        return f"hs_{variant}_{index}.png"
    if name.startswith("free-tree-"):
        return f"vila_free_tree_{name[-2:]}.png"
    return f"vila_{name}.png"


def _source_for(name: str) -> Path:
    if name.startswith("hs-"):
        variant, index = name[3:].rsplit("-", 1)
        return HARM / f"{variant}_{index}.png"
    if name.startswith("free-tree-"):
        return FREE_TREES / f"tree_{name[-2:]}.png"
    return BUILD_SPEC[name][0]


def _kinds() -> list[tuple]:
    names = list(BUILD_SPEC)
    for variant in HARM_VARIANTS:
        for i in range(1, 6):
            names.append(f"hs-{variant}-{i}")
    for i in range(1, 18):
        names.append(f"free-tree-{i:02d}")
    kinds = []
    for name in names:
        src = _source_for(name)
        dest = _dest_for(name)
        SOURCE_OF[dest] = src
        w, h = Image.open(src).size
        solid = BUILD_SPEC[name][2] if name in BUILD_SPEC else False
        kinds.append((name, dest, w // 2, h - 4, solid, int(w * 0.6), int(h * 0.22)))
    return kinds


PROP_KINDS = _kinds()
PROP_TILE_ID = {name: i for i, (name, *_rest) in enumerate(PROP_KINDS)}
PROP_FIRSTGID = 325  # unchanged: the TMJ already references the props tileset at this gid.


def external_source(file: str) -> Path:
    return SOURCE_OF[file]


def place(name: str, x: float, y: float, *, scale: float = 1.0, flip: bool = False) -> dict:
    """A prop instance anchored at its ground point (x, y) in world pixels."""
    kind = next(k for k in PROP_KINDS if k[0] == name)
    _, file, ax, ay, solid, fw, fh = kind
    props = [
        {"name": "prop", "type": "string", "value": name},
        {"name": "anchorWorldX", "type": "float", "value": float(x)},
        {"name": "anchorWorldY", "type": "float", "value": float(y)},
        {"name": "sortY", "type": "float", "value": float(y)},
        {"name": "scale", "type": "float", "value": float(scale)},
        {"name": "solid", "type": "bool", "value": solid},
        {"name": "occlusion", "type": "string", "value": "tall" if ay > 30 else "low"},
    ]
    obj = {
        "gid": PROP_FIRSTGID + PROP_TILE_ID[name],
        "height": 0.0,
        "id": 0,
        "name": name,
        "properties": props,
        "rotation": 0,
        "visible": True,
        "width": 0.0,
        "x": float(x - ax),
        "y": float(y - ay),
    }
    if flip:
        obj["flipX"] = True
    return obj


def near_dirt(g, x: int, y: int, r: int = 1) -> bool:
    for yy in range(y - r, y + r + 1):
        for xx in range(x - r, x + r + 1):
            if 0 <= xx < W and 0 <= yy < H and g[yy][xx] == "d":
                return True
    return False


def forest_ratio(x: int, y: int) -> float:
    """Elliptical distance from the village core (about 1.0 at the forest edge), with a soft wobble."""
    wobble = 0.05 * math.sin(x * 0.71) * math.cos(y * 0.93) + 0.03 * math.sin(x * 1.9 + y * 0.37)
    rx, ry = 21.0, 13.0
    r = math.hypot((x + 0.5 - 28) / rx, (y + 0.5 - 18) / ry)
    return r - wobble


def forest_positions(g, rng: random.Random) -> tuple[list[dict], list[dict]]:
    """Dense forest ring around the village, with varied tall trees.

    Returns (tree objects, trunk footprints). Trees keep off roads, trails, hunting clearings
    and the village core, so the paths and the hunting grounds stay walkable.
    """
    spawn_clear = set()
    for _name, sx, sy in HUNT_SPAWN_TILES:
        for yy in range(sy - 2, sy + 3):
            for xx in range(sx - 2, sx + 3):
                spawn_clear.add((xx, yy))
    candidates = []
    for y in range(H):
        for x in range(W):
            if g[y][x] != "g" or (x, y) in spawn_clear or near_dirt(g, x, y, 1):
                continue
            r = forest_ratio(x, y)
            if r < 1.0:
                continue
            # Denser toward the outside of the ring; a few stragglers at the inner edge.
            if rng.random() < min(1.0, 0.55 + (r - 1.0) * 1.5):
                candidates.append((x, y))
    rng.shuffle(candidates)
    names = list(HARM_VARIANTS)
    weights = list(HARM_VARIANTS.values())
    gap = {"bigger": 24, "big": 20, "small": 16}
    placed: list[tuple[float, float, int]] = []
    trees: list[dict] = []
    solids: list[dict] = []
    for x, y in candidates:
        px = x * T + rng.uniform(2, 30)
        py = y * T + rng.uniform(6, 30)
        variant = rng.choices(names, weights)[0]
        index = rng.randint(1, 5)
        base = gap[variant] + (4 if forest_ratio(x, y) > 1.15 else 0)
        if any((px - qx) ** 2 + (py - qy) ** 2 < max(base, g2) ** 2 for qx, qy, g2 in placed):
            continue
        placed.append((px, py, base))
        trees.append(place(f"hs-{variant}-{index}", px, py, flip=rng.random() < 0.5))
        solids.append({"x": px - 5, "y": py - 6, "width": 10, "height": 6})
    return trees, solids


def place_tree(name: str, x: float, y: float, rng: random.Random) -> dict:
    return place(name, x, y, flip=rng.random() < 0.5)


def footprint_scaled(x: float, y: float, kind: tuple, scale: float) -> dict:
    _, _, _ax, _ay, _solid, fw, fh = kind
    return {"x": x - fw * scale / 2, "y": y - fh * scale, "width": fw * scale, "height": fh * scale}


def village_tree_spots(g, buildings: list[tuple[float, float]], rng: random.Random) -> list[tuple[float, float, str]]:
    """Trees inside the village core: grass only, away from roads and buildings.

    Harmonious Seasons trees (the forest's own set) mixed with the Free pack trees, spaced so
    they read as groves at the edges of the village.
    """
    spots: list[tuple[float, float, str]] = []
    for ty in range(2, H - 2):
        for tx in range(2, W - 2):
            if g[ty][tx] != "g" or near_dirt(g, tx, ty, 2):
                continue
            r = forest_ratio(tx, ty)
            if r < -0.2 or r > 1.0:
                continue  # core only; the ring keeps its own trees
            if rng.random() > 0.035:
                continue
            px = tx * T + rng.uniform(4, 28)
            py = ty * T + rng.uniform(10, 26)
            if any((px - qx) ** 2 + (py - qy) ** 2 < 96 ** 2 for qx, qy, _ in spots):
                continue
            if any(abs(px - bx) < 60 and abs(py - by) < 60 for bx, by in buildings):
                continue
            if rng.random() < 0.35:
                name = f"free-tree-{rng.randint(1, 17):02d}"
            else:
                variant = rng.choices(["small", "big"], [0.7, 0.3])[0]
                name = f"hs-{variant}-{rng.randint(1, 5)}"
            spots.append((px, py, name))
    return spots


def build_props(g, rng: random.Random) -> tuple[list[dict], list[dict]]:
    """Return (prop objects, solid footprints).

    Composition, top-down: the shrine terrace to the north, the central plaza with the koi pond
    and well, the botica/forge/inn/guard-house around the core, the dojo and tea garden by the
    lake, the market lane to the east, and the training yard to the south-west. Interaction
    points keep their positions (INTERACTION_MOVES), so they stay next to their buildings.
    """
    objs: list[dict] = []
    solids: list[dict] = []
    building_spots: list[tuple[float, float]] = []

    def add(name: str, x: float, y: float, flip: bool = False) -> None:
        kind = next(k for k in PROP_KINDS if k[0] == name)
        scale = BUILD_SPEC[name][1]
        objs.append(place(name, x, y, scale=scale, flip=flip))
        if kind[4]:
            solids.append(footprint_scaled(x, y, kind, scale))
        building_spots.append((x, y))

    # Shrine terrace (north): gate, bell, guardian statues, torii over the road and stone lanterns.
    add("shrine-gate", 896, 150)
    add("bell", 790, 180)
    add("komainu", 846, 196)
    add("komainu", 946, 196, flip=True)
    add("torii", 896, 262)
    for x, y in [(842, 308), (950, 308), (842, 384), (950, 384)]:
        add("toro-lantern", x, y)

    # Central plaza: koi pond in the middle, a well and paper lanterns at the corners.
    add("koi-pond", 896, 704)
    add("well", 842, 748)
    add("notice-board", 846, 600)
    for x, y in [(816, 556), (976, 556), (816, 760), (976, 760)]:
        add("chochin", x, y)

    # Core buildings around the plaza.
    add("botica", 608, 400)
    add("forge", 416, 736)
    add("inn", 1184, 880, flip=True)
    add("guard-house", 1120, 320)
    add("tower", 1120, 176)
    add("teahouse", 1264, 352)

    # Market lane (east): shop at the back, stalls along both sides, lanterns and banners.
    add("market-shop", 1248, 400)
    stalls_north = ["stall-produce", "stall-tea", "stall-fabric"]
    stalls_south = ["stall-fish", "stall-ramen", "stall-sake"]
    for i, x in enumerate((1184, 1248, 1312)):
        add(stalls_north[i], x, 548)
        add(stalls_south[i], x, 772)
    for x, y in [(1184, 620), (1312, 620)]:
        add("lantern-post", x, y)
    for x, y in [(1152, 470), (1344, 470)]:
        add("banner", x, y)
    add("bench", 1372, 606)

    # Training yard (south-west).
    add("straw-target", 500, 812)
    add("makiwara", 540, 890)
    add("dummy", 440, 934)
    add("weapon-rack", 268, 800)
    add("yari-row", 300, 930)
    add("banner-field", 520, 840)

    # Tea garden and lake edge.
    add("lotus", 1200, 250)
    add("bonsai", 1040, 430)
    add("flower-bed", 1340, 420)
    add("rock-garden", 1400, 640)
    add("stepping-stones", 1224, 420)

    # Village trees: placed last so they keep clear of the buildings above.
    village_rng = random.Random(2026)
    for px, py, name in village_tree_spots(g, building_spots, village_rng):
        kind = next(k for k in PROP_KINDS if k[0] == name)
        objs.append(place(name, px, py, flip=village_rng.random() < 0.5))
        solids.append({"x": px - 5, "y": py - 6, "width": 10, "height": 6})

    # The forest ring keeps the exact placement it had before the village rebuild: the same
    # random stream is consumed first (27 draws, one per removed ornament), then the forest.
    for _ in range(27):
        rng.random()
    trees, tree_solids = forest_positions(g, rng)
    objs.extend(trees)
    solids.extend(tree_solids)
    return objs, solids


# ------------------------------------------------------------ collisions ----


def water_rects(g) -> list[dict]:
    rects = []
    for y in range(H):
        x = 0
        while x < W:
            if g[y][x] == "w":
                start = x
                while x < W and g[y][x] == "w":
                    x += 1
                rects.append({"x": start * T, "y": y * T, "width": (x - start) * T, "height": T})
            else:
                x += 1
    return rects


def border_rects() -> list[dict]:
    """Solid walls around the map, leaving the four road exits open."""
    t = 32
    openings_x = [(27 * T, 29 * T), (32 * T, 34 * T)]  # north and south exits
    openings_y = [(17 * T, 19 * T), (20 * T, 22 * T)]  # west and east exits
    rects = []

    def segs(total, openings):
        cuts = [(0, total)]
        for a, b in openings:
            nxt = []
            for s, e in cuts:
                if b <= s or a >= e:
                    nxt.append((s, e))
                    continue
                if a > s:
                    nxt.append((s, a))
                if b < e:
                    nxt.append((b, e))
            cuts = nxt
        return cuts

    W_PX, H_PX = W * T, H * T
    for s, e in segs(W_PX, openings_x):
        rects.append({"x": s, "y": 0, "width": e - s, "height": t})
        rects.append({"x": s, "y": H_PX - t, "width": e - s, "height": t})
    for s, e in segs(H_PX, openings_y):
        rects.append({"x": 0, "y": s, "width": t, "height": e - s})
        rects.append({"x": W_PX - t, "y": s, "width": t, "height": e - s})
    return rects


def finalize_collision(solids, g) -> list[dict]:
    rects = water_rects(g) + border_rects() + solids
    out = []
    for i, r in enumerate(rects):
        out.append({
            "id": i + 1,
            "name": f"collision.rects[{i}]",
            "type": "solid",
            "rotation": 0,
            "visible": True,
            "x": float(round(r["x"])),
            "y": float(round(r["y"])),
            "width": float(round(r["width"])),
            "height": float(round(r["height"])),
            "properties": [{"name": "source", "type": "string", "value": f"collision.rects[{i}]"}],
        })
    return out


# ------------------------------------------------------------ interactions ----

INTERACTION_MOVES = {
    "village-notice": (896, 576),
    "respawn-shrine": (896, 384),
    "market-square": (1248, 576),
    "alchemy-yard": (608, 352),
    "forge-yard": (416, 700),
    "guest-yard": (1184, 860),
    "dojo-yard": (1120, 288),
    "north-dojo.enter": (1120, 286),
    "tea-garden.enter": (1264, 380),
}


def build_interactions(old_objects: list[dict]) -> list[dict]:
    out = []
    for obj in old_objects:
        obj = copy.deepcopy(obj)
        if obj.get("type") in ("spawn", "portal"):
            out.append(obj)  # neighbour-region contracts stay untouched
        elif obj.get("name") in INTERACTION_MOVES:
            obj["x"], obj["y"] = INTERACTION_MOVES[obj["name"]]
            out.append(obj)
    return out


# ------------------------------------------------------------- tilesets ----


def props_tileset() -> dict:
    tiles = []
    for i, (name, file, ax, ay, solid, fw, fh) in enumerate(PROP_KINDS):
        src = external_source(file)
        img = Image.open(src)
        w, h = img.size
        props = [
            {"name": "prop", "type": "string", "value": name},
            {"name": "anchorX", "type": "float", "value": float(ax)},
            {"name": "anchorY", "type": "float", "value": float(ay)},
            {"name": "solid", "type": "bool", "value": solid},
            {"name": "occlusionClass", "type": "string", "value": "tall" if ay > 30 else "low"},
        ]
        tiles.append({
            "id": i,
            "type": "prop",
            "image": f"images/{file}",
            "imagewidth": w,
            "imageheight": h,
            "properties": props,
        })
    return {
        "firstgid": PROP_FIRSTGID,
        "name": "props",
        "type": "tileset",
        "version": "1.10",
        "tiledversion": "1.11.0",
        "tilewidth": 64,
        "tileheight": 62,
        "tilecount": len(tiles),
        "columns": 0,
        "margin": 0,
        "spacing": 0,
        "objectalignment": "bottomleft",
        "grid": {"orientation": "orthogonal", "width": 1, "height": 1},
        "tiles": tiles,
    }


def copy_external_assets() -> None:
    """Copy every village prop image into the region's tiled/images folder (the runtime loads by basename)."""
    out = REGION / "images"
    out.mkdir(parents=True, exist_ok=True)
    for kind in PROP_KINDS:
        shutil.copyfile(SOURCE_OF[kind[1]], out / kind[1])


def update_biome_index() -> None:
    """List the village prop images in biome-index.json so the region loader preloads them."""
    path = ROOT / "assets/world/maps/biomes/biome-index.json"
    index = json.loads(path.read_text(encoding="utf8"))
    base = "assets/world/maps/biomes/regions/qinghe-valley-v1/tiled/images/"
    for region in index["regions"]:
        if region.get("id") == "qinghe-valley":
            region["prop_images"] = [base + kind[1] for kind in PROP_KINDS]
            break
    path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf8")


# ------------------------------------------------------------- preview ----


def render_preview(g, ground, props, collision, table_path=None) -> None:
    sheet = Image.open(REGION / "images/grass-path-water-wang81.png").convert("RGBA")
    canvas = Image.new("RGBA", (W * T, H * T), (0, 0, 0, 255))
    for i, gid in enumerate(ground):
        tid = gid - 1
        sx, sy = (tid % 9) * T, (tid // 9) * T
        tile = sheet.crop((sx, sy, sx + T, sy + T))
        canvas.paste(tile, ((i % W) * T, (i // W) * T), tile)
    for obj in sorted(props, key=lambda o: next(p["value"] for p in o["properties"] if p["name"] == "sortY")):
        name = obj["name"]
        file = next(k[1] for k in PROP_KINDS if k[0] == name)
        img = Image.open(REGION / "images" / file).convert("RGBA")
        scale = next(p["value"] for p in obj["properties"] if p["name"] == "scale")
        if scale != 1:
            img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        if obj.get("flipX"):
            img = img.transpose(Image.FLIP_LEFT_RIGHT)
        px = next(p["value"] for p in obj["properties"] if p["name"] == "anchorWorldX")
        py = next(p["value"] for p in obj["properties"] if p["name"] == "anchorWorldY")
        ax = next(k[2] for k in PROP_KINDS if k[0] == name) * scale
        ay = next(k[3] for k in PROP_KINDS if k[0] == name) * scale
        canvas.alpha_composite(img, (int(px - ax), int(py - ay)))
    draw = ImageDraw.Draw(canvas, "RGBA")
    for c in collision:
        draw.rectangle([c["x"], c["y"], c["x"] + c["width"] - 1, c["y"] + c["height"] - 1],
                       outline=(255, 0, 0, 120), fill=(255, 0, 0, 40))
    canvas.convert("RGB").save(PREVIEW_PATH)


# ------------------------------------------------------------------ main ----


def main() -> None:
    tmj = json.loads(TMJ_PATH.read_text(encoding="utf8"))
    old = {layer["name"]: layer for layer in tmj["layers"] if layer["type"] == "objectgroup"}
    g = build_layout()
    table = load_wang_table()
    ground = paint_ground(g, table)
    copy_external_assets()
    rng = random.Random(994)
    props, solids = build_props(g, rng)
    collision = finalize_collision(solids, g)
    interactions = build_interactions(old["interactions"]["objects"])

    layers = []
    for layer in tmj["layers"]:
        if layer["name"] == "ground":
            layer = {**layer, "data": ground}
        elif layer["name"] == "props":
            layer = {**layer, "objects": props}
        elif layer["name"] == "collision":
            layer = {**layer, "objects": collision}
        elif layer["name"] == "interactions":
            layer = {**layer, "objects": interactions}
        layers.append(layer)
    tmj["layers"] = layers
    tmj["tilesets"] = [tmj["tilesets"][0], props_tileset()]
    update_biome_index()
    TMJ_PATH.write_text(json.dumps(tmj, ensure_ascii=False, indent=1) + "\n", encoding="utf8")
    render_preview(g, ground, props, collision)
    print(f"ground={len(ground)} props={len(props)} collision={len(collision)} interactions={len(interactions)}")


if __name__ == "__main__":
    main()
