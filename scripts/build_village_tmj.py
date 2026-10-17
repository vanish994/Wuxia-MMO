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
import json
import random
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
    fill(22, 15, 34, 25, "d")
    fill(36, 13, 46, 19, "d")
    # Shrine terrace (north) and training yard (south-west).
    fill(21, 4, 35, 8, "d")
    fill(8, 24, 19, 31, "d")
    # Lake (north-east), rounded with an ellipse test.
    for y in range(0, 10):
        for x in range(40, 56):
            if ((x - 48) / 5.2) ** 2 + ((y - 5) / 3.4) ** 2 <= 1.0:
                g[y][x] = "w"
    # Stone path from the plaza to the tea garden.
    for i, x in enumerate(range(35, 42)):
        fill(x, 11 - i // 2, x, 12 - i // 2, "d")
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

# (prop name, image file under tiled/images, anchorX, anchorY, solid, footprint w, footprint h, tile-id)
PROP_KINDS = [
    ("ambient_bamboo", "ambient_bamboo.png", 10, 47, False, 0, 0),
    ("ambient_blossom", "ambient_blossom.png", 12, 33, False, 0, 0),
    ("ambient_lantern", "ambient_lantern.png", 8, 29, False, 0, 0),
    ("ambient_shrub", "ambient_shrub.png", 10, 12, False, 0, 0),
    ("bridge", "bridge.png", 32, 25, False, 0, 0),
    ("hall", "hall.png", 32, 47, True, 26, 14),
    ("pagoda", "pagoda.png", 24, 61, True, 18, 12),
    ("sect_gate", "sect_gate.png", 28, 45, True, 14, 8),
    ("teahouse", "teahouse.png", 24, 39, True, 22, 12),
    ("cabana-1", "cabana-1.png", 64, 118, True, 88, 32),
    ("cabana-2", "cabana-2.png", 64, 118, True, 88, 32),
    ("cabana-3", "cabana-3.png", 64, 118, True, 88, 32),
    ("cabana-4", "cabana-4.png", 64, 118, True, 88, 32),
    ("barraca-1", "barraca-1.png", 24, 44, True, 40, 16),
    ("barraca-2", "barraca-2.png", 24, 44, True, 40, 16),
    ("barraca-3", "barraca-3.png", 24, 44, True, 40, 16),
]
PROP_TILE_ID = {name: i for i, (name, *_rest) in enumerate(PROP_KINDS)}
PROP_FIRSTGID = 325  # unchanged: the TMJ already references the props tileset at this gid.


def external_source(file: str) -> Path:
    if file.startswith("cabana"):
        return EXTERNAL / "cabanas" / file
    if file.startswith("barraca"):
        return EXTERNAL / "barracas" / file
    return REGION / "images" / file


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


def footprint(x: float, y: float, name: str) -> dict | None:
    _, _, ax, _ay, solid, fw, fh = next(k for k in PROP_KINDS if k[0] == name)
    if not solid:
        return None
    return {"x": x - fw / 2, "y": y - fh, "width": fw, "height": fh}


def tree_positions(g, rng: random.Random) -> list[dict]:
    """Decorative trees on grass only, kept off roads, plaza and the lake, spaced apart."""
    placed: list[tuple[float, float]] = []
    trees: list[dict] = []
    kinds = ["ambient_blossom", "ambient_bamboo", "ambient_shrub"]
    candidates = []
    for y in range(H):
        for x in range(W):
            if g[y][x] != "g":
                continue
            near_edge = x <= 3 or x >= W - 4 or y <= 2 or y >= H - 3
            near_core = 14 <= x <= 42 and 10 <= y <= 27
            if near_edge or (not near_core and rng.random() < 0.09):
                candidates.append((x, y))
    rng.shuffle(candidates)
    for x, y in candidates:
        px, py = x * T + rng.randint(4, 28), y * T + rng.randint(8, 28)
        if any((px - qx) ** 2 + (py - qy) ** 2 < 46 ** 2 for qx, qy in placed):
            continue
        if not (x <= 3 or x >= W - 4 or y <= 2 or y >= H - 3):
            if 14 <= x <= 42 and 10 <= y <= 27:
                continue
        placed.append((px, py))
        name = rng.choice(kinds)
        trees.append(place(name, px, py, flip=rng.random() < 0.5))
        if len(trees) >= 90:
            break
    return trees


def build_props(g, rng: random.Random) -> tuple[list[dict], list[dict]]:
    """Return (prop objects, solid footprints)."""
    objs: list[dict] = []
    solids: list[dict] = []

    def add(name, x, y, **kw):
        obj = place(name, x, y, **kw)
        objs.append(obj)
        fp = footprint(x, y, name)
        if fp:
            solids.append(fp)

    # Shrine (north) with stone lanterns along the stairs and the torii over the road.
    add("cabana-4", 896, 150)
    add("sect_gate", 896, 300)
    for x, y in [(860, 240), (932, 240), (860, 336), (932, 336), (860, 388), (932, 388)]:
        add("ambient_lantern", x, y)
    # Plaza: bridge-less fountain area keeps the centre clear; lanterns at the corners.
    for x, y in [(736, 512), (1056, 512), (736, 768), (1056, 768)]:
        add("ambient_lantern", x, y)
    # Botica (alchemy), forge and guest house.
    add("cabana-1", 528, 400)
    add("cabana-3", 320, 736)
    add("cabana-1", 1344, 896, flip=True)
    # Dojo tower and teahouse by the lake.
    add("pagoda", 1200, 320)
    add("teahouse", 1376, 352)
    # Market: a cabin at the back and stalls along both lanes.
    add("cabana-2", 1296, 400)
    for x in (1200, 1296, 1392):
        add(f"barraca-{1 + (x // 96) % 3}", x, 560)
    for x in (1200, 1296, 1392):
        add(f"barraca-{1 + (x // 96 + 1) % 3}", x, 772)
    # Training yard fence posts are decoration only (non-solid lanterns).
    for x, y in [(264, 800), (408, 800), (264, 960), (408, 960)]:
        add("ambient_lantern", x, y)
    objs.extend(tree_positions(g, rng))
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
    "alchemy-yard": (544, 352),
    "forge-yard": (320, 700),
    "guest-yard": (1344, 860),
    "dojo-yard": (1184, 288),
    "north-dojo.enter": (1184, 286),
    "tea-garden.enter": (1376, 380),
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
    """Make the cabins and stalls available next to the other prop images (Phaser keys use the basename)."""
    for file in ("cabana-1.png", "cabana-2.png", "cabana-3.png", "cabana-4.png",
                 "barraca-1.png", "barraca-2.png", "barraca-3.png"):
        dst = REGION / "images" / file
        if not dst.exists():
            dst.write_bytes(external_source(file).read_bytes())


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
        if obj.get("flipX"):
            img = img.transpose(Image.FLIP_LEFT_RIGHT)
        px = next(p["value"] for p in obj["properties"] if p["name"] == "anchorWorldX")
        py = next(p["value"] for p in obj["properties"] if p["name"] == "anchorWorldY")
        ax = next(k[2] for k in PROP_KINDS if k[0] == name)
        ay = next(k[3] for k in PROP_KINDS if k[0] == name)
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
    TMJ_PATH.write_text(json.dumps(tmj, ensure_ascii=False, indent=1) + "\n", encoding="utf8")
    render_preview(g, ground, props, collision)
    print(f"ground={len(ground)} props={len(props)} collision={len(collision)} interactions={len(interactions)}")


if __name__ == "__main__":
    main()
