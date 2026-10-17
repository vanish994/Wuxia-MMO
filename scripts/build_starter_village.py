#!/usr/bin/env python3
"""Write the native-pixel code-art layout spec for the Wuxia starter valley.

Artwork is authored as PixelSpec at its final integer resolution; no image model or
resampling is used. The map itself is data and is validated by codeart2d layout_build.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/world/maps/biomes/qinghe-valley.layout.json"


def canvas(w: int, h: int) -> list[list[str]]:
    return [["."] * w for _ in range(h)]


def rect(g: list[list[str]], x0: int, y0: int, x1: int, y1: int, c: str) -> None:
    h, w = len(g), len(g[0])
    for y in range(max(0, y0), min(h, y1 + 1)):
        for x in range(max(0, x0), min(w, x1 + 1)):
            g[y][x] = c


def line(g: list[list[str]], x0: int, y0: int, x1: int, y1: int, c: str) -> None:
    steps = max(abs(x1 - x0), abs(y1 - y0), 1)
    for i in range(steps + 1):
        x = round(x0 + (x1 - x0) * i / steps)
        y = round(y0 + (y1 - y0) * i / steps)
        if 0 <= y < len(g) and 0 <= x < len(g[0]):
            g[y][x] = c


def pixelspec(name: str, w: int, h: int, anchor: tuple[int, int], palette: dict,
              layers: list[tuple[str, list[list[str]]]], outline: str = "o") -> dict:
    return {
        "schema": "codeart2d.pixelspec.v1",
        "name": name,
        "canvas": [w, h],
        "anchor_px": list(anchor),
        "palette": palette,
        "layers": [{"name": layer_name, "rows": ["".join(row) for row in grid]}
                   for layer_name, grid in layers],
        "outline": {"mode": "solid", "color": outline} if outline in palette else {"mode": "none"},
    }


def roofed_hall(name: str, *, width: int, height: int, roof: str, trim: str,
                wall: str, wall_light: str, door: str, window: str) -> dict:
    g = canvas(width, height)
    cx = width // 2
    wall_top = height // 2
    # East-Asian eaves: a rising tiled roof with a broad, slightly lifted edge.
    for y in range(3, wall_top + 2):
        t = y - 3
        half = min(width // 2 - 2, 7 + t * 2)
        left, right = cx - half, cx + half
        rect(g, left, y, right, y, roof if y % 4 else trim)
        if y in (wall_top, wall_top + 1):
            rect(g, max(1, left - 2), y, min(width - 2, right + 2), y, trim)
    rect(g, cx - 2, 2, cx + 2, 4, trim)
    # Plastered hall, wood frame, central double door, lattice windows.
    rect(g, 8, wall_top + 1, width - 9, height - 5, wall)
    rect(g, 8, wall_top + 1, width - 9, wall_top + 2, trim)
    rect(g, 10, wall_top + 4, 11, height - 7, trim)
    rect(g, width - 12, wall_top + 4, width - 11, height - 7, trim)
    door_w = 8 if width >= 48 else 6
    rect(g, cx - door_w // 2, height - 17, cx + door_w // 2 - 1, height - 5, door)
    line(g, cx, height - 17, cx, height - 5, trim)
    rect(g, cx - door_w // 2 - 1, height - 18, cx + door_w // 2, height - 17, trim)
    for wx in (14, width - 18):
        rect(g, wx, wall_top + 7, wx + 4, wall_top + 13, window)
        rect(g, wx + 2, wall_top + 7, wx + 2, wall_top + 13, trim)
        rect(g, wx, wall_top + 10, wx + 4, wall_top + 10, trim)
    rect(g, cx - 8, height - 4, cx + 7, height - 3, trim)
    pal = {"o": "#202630", "R": roof, "T": trim, "W": wall,
           "P": wall_light, "D": door, "B": window}
    # Recode the authored structure so the style can be varied per building.
    mapping = {roof: "R", trim: "T", wall: "W", wall_light: "P", door: "D", window: "B"}
    for row in g:
        for i, char in enumerate(row):
            if char != ".":
                row[i] = mapping.get(char, char)
    # Roof row fills need to use the symbolic chars too; map if a palette swatch was used.
    return pixelspec(name, width, height, (cx, height - 1), pal, [("structure", g)])


def make_gate() -> dict:
    w, h = 56, 46
    g = canvas(w, h)
    # Stone footings and red lacquered pillars.
    rect(g, 8, 39, 19, 43, "S")
    rect(g, 37, 39, 48, 43, "S")
    rect(g, 11, 16, 16, 39, "R")
    rect(g, 40, 16, 45, 39, "R")
    rect(g, 12, 17, 13, 38, "r")
    rect(g, 41, 17, 42, 38, "r")
    rect(g, 9, 13, 47, 16, "T")
    # Roof with lifted ends.
    for y in range(3, 14):
        half = min(26, 7 + (y - 3) * 2)
        rect(g, 28 - half, y, 28 + half, y, "R" if y % 3 else "r")
    rect(g, 3, 12, 52, 14, "T")
    rect(g, 26, 2, 29, 4, "T")
    rect(g, 22, 19, 33, 23, "B")
    line(g, 27, 19, 27, 23, "T")
    return pixelspec("sect-gate", w, h, (28, 45), {
        "o": "#202630", "R": "#8e303b", "r": "#c65b4e", "T": "#efc66d",
        "S": "#646d70", "B": "#314c5c"
    }, [("gate", g)])


def make_bridge() -> dict:
    w, h = 64, 26
    g = canvas(w, h)
    # Walkable deck is artwork only; the layout's dirt-path vertices provide collision.
    rect(g, 5, 10, 58, 20, "D")
    rect(g, 7, 12, 56, 18, "W")
    for x in range(9, 56, 6):
        rect(g, x, 12, x, 18, "T")
    rect(g, 5, 7, 58, 9, "R")
    rect(g, 5, 19, 58, 20, "R")
    for x in (6, 20, 43, 57):
        rect(g, x, 5, x + 1, 22, "T")
    return pixelspec("moonwood-bridge", w, h, (32, 25), {
        "o": "#202630", "D": "#392a29", "W": "#98623c", "T": "#c0874e", "R": "#dfb66a"
    }, [("bridge", g)])


def make_pagoda() -> dict:
    w, h = 48, 62
    g = canvas(w, h)
    # Three compact storeys; each tier has its own upturned eave.
    for base_y, half in ((13, 20), (31, 16), (47, 12)):
        for y in range(base_y - 8, base_y + 1):
            span = min(half, 4 + (y - (base_y - 8)) * 2)
            rect(g, 24 - span, y, 24 + span, y, "R" if y % 3 else "r")
        rect(g, 24 - half - 2, base_y, 24 + half + 2, base_y + 1, "T")
        rect(g, 18, base_y + 2, 29, min(h - 4, base_y + 13), "W")
        rect(g, 20, base_y + 4, 22, base_y + 8, "B")
        rect(g, 26, base_y + 4, 28, base_y + 8, "B")
        rect(g, 23, base_y + 2, 24, min(h - 4, base_y + 13), "T")
    rect(g, 22, 2, 25, 5, "T")
    rect(g, 20, 56, 28, 58, "S")
    return pixelspec("three-tier-pagoda", w, h, (24, 61), {
        "o": "#202630", "R": "#74303f", "r": "#b34b4b", "T": "#e6bd70",
        "W": "#d5c19a", "B": "#406575", "S": "#606d71"
    }, [("tower", g)])


def make_tree(name: str, blossom: bool = False) -> dict:
    w, h = 24, 34
    g = canvas(w, h)
    # Clustered canopy and visible ground-contact trunk.
    rect(g, 7, 27, 16, 31, "t")
    rect(g, 10, 18, 13, 28, "T")
    for box, c in [((7, 5, 16, 13), "G"), ((3, 10, 11, 19), "L"),
                   ((12, 9, 20, 18), "G"), ((6, 15, 17, 23), "G"),
                   ((1, 12, 8, 17), "D"), ((16, 13, 22, 18), "L")]:
        rect(g, *box, c)
    rect(g, 8, 7, 9, 8, "H")
    rect(g, 17, 11, 18, 12, "H")
    palette = {"o": "#202630", "D": "#2b6047", "G": "#3f8454", "L": "#63a76a",
               "H": "#b4ce83", "t": "#5a392e", "T": "#87563b", "p": "#f3b8c1"}
    if blossom:
        for x, y in ((5, 11), (17, 8), (4, 18), (15, 16), (20, 15), (10, 6)):
            g[y][x] = "p"
        palette["p"] = "#ef9ab0"
    return pixelspec(name, w, h, (12, 33), palette, [("canopy", g)])


def make_bamboo() -> dict:
    w, h = 20, 50
    g = canvas(w, h)
    for x in (4, 9, 15):
        rect(g, x, 4 + (x % 3), x + 1, 45, "G")
        for y in range(12, 46, 8):
            rect(g, x - 1, y, x + 2, y, "T")
    for x, y, direction in ((4, 9, 1), (9, 15, 1), (15, 8, -1), (4, 24, 1), (15, 29, -1), (9, 35, 1)):
        line(g, x, y, x + direction * 5, y - 4, "L")
        line(g, x, y, x + direction * 6, y + 2, "L")
        g[max(0, y - 4)][x + direction * 5] = "H"
    return pixelspec("bamboo-clump", w, h, (10, 47), {
        "o": "#202630", "D": "#235341", "G": "#43805a", "L": "#76ac68",
        "H": "#cad88c", "T": "#a2b878"
    }, [("stems", g)])


def make_lantern() -> dict:
    w, h = 16, 32
    g = canvas(w, h)
    rect(g, 7, 1, 8, 5, "T")
    rect(g, 3, 6, 12, 8, "T")
    rect(g, 4, 9, 11, 18, "Y")
    rect(g, 5, 10, 10, 17, "G")
    rect(g, 3, 19, 12, 21, "T")
    rect(g, 7, 22, 8, 27, "R")
    rect(g, 5, 27, 10, 28, "S")
    return pixelspec("jade-street-lantern", w, h, (8, 29), {
        "o": "#202630", "T": "#d4ad62", "Y": "#e9c96d", "G": "#f4e2a1",
        "R": "#813944", "S": "#687477"
    }, [("lamp", g)])


def make_rock() -> dict:
    w, h = 18, 14
    g = canvas(w, h)
    for box, c in [((4, 4, 13, 9), "S"), ((2, 6, 6, 10), "s"), ((11, 5, 15, 10), "S"),
                   ((6, 3, 9, 5), "H"), ((4, 5, 6, 6), "H"), ((7, 9, 12, 10), "D")]:
        rect(g, *box, c)
    return pixelspec("mossy-rocks", w, h, (9, 11), {
        "o": "#202630", "D": "#3a4849", "S": "#657775", "s": "#89958a", "H": "#c4c59d"
    }, [("stone", g)])


def make_shrub() -> dict:
    w, h = 20, 15
    g = canvas(w, h)
    rect(g, 5, 5, 14, 10, "G")
    rect(g, 2, 7, 8, 10, "L")
    rect(g, 12, 6, 17, 10, "G")
    rect(g, 8, 3, 11, 5, "H")
    rect(g, 4, 10, 15, 11, "D")
    return pixelspec("tea-shrub", w, h, (10, 12), {
        "o": "#202630", "D": "#2b6047", "G": "#3f8454", "L": "#63a76a", "H": "#b4ce83"
    }, [("foliage", g)])


def make_sign() -> dict:
    w, h = 24, 28
    g = canvas(w, h)
    rect(g, 4, 4, 19, 14, "R")
    rect(g, 6, 6, 17, 12, "W")
    rect(g, 11, 15, 12, 24, "T")
    rect(g, 8, 24, 15, 25, "S")
    # Emblem: a small jade-and-gold seal, no text so the asset is language-neutral.
    rect(g, 9, 8, 14, 10, "J")
    return pixelspec("sect-signboard", w, h, (12, 25), {
        "o": "#202630", "R": "#813944", "W": "#d7c49f", "T": "#714b32",
        "S": "#647174", "J": "#6ab18a"
    }, [("sign", g)])


def main() -> None:
    props = {
        "grass": {"color": "#57935b"},
        "dirt_path": {"color": "#b0794d"},
        "water": {"color": "#23618a", "walkable": False}
    }
    # Use explicit sprites with their authoring footprints: the top silhouette never blocks;
    # collision sits only at the trunk/base/feet.
    props.update({
        "sect_gate": {"pixelspec": make_gate(), "occlusion": "tall", "flip": False,
                      "footprint": {"shape": "rect", "width": 14, "depth": 8, "offset": [0, -4]}},
        "bridge": {"pixelspec": make_bridge(), "occlusion": "low", "solid": False, "flip": False,
                   "occupant_policy": "static_back", "footprint": {"shape": "none"}},
        "pagoda": {"pixelspec": make_pagoda(), "occlusion": "tall", "flip": False,
                     "footprint": {"shape": "rect", "width": 18, "depth": 12, "offset": [0, -6]}},
        "hall": {"pixelspec": roofed_hall("wuxia-hall", width=64, height=48, roof="#8e303b", trim="#efc66d",
                                                     wall="#d5c19a", wall_light="#efe2c5", door="#50362d", window="#406575"),
                 "occlusion": "tall", "flip": False,
                 "footprint": {"shape": "rect", "width": 26, "depth": 14, "offset": [0, -7]},
                 "interactions": [{"name": "enter", "offset": [0, -2], "reach": 26}]},
        "teahouse": {"pixelspec": roofed_hall("teahouse", width=48, height=40, roof="#526b50", trim="#d6b66f",
                                                        wall="#d9c89f", wall_light="#eee4cb", door="#4e382d", window="#507584"),
                     "occlusion": "tall", "flip": False,
                     "footprint": {"shape": "rect", "width": 22, "depth": 12, "offset": [0, -6]},
                     "interactions": [{"name": "enter", "offset": [0, -1], "reach": 24}]},
        "pine": {"pixelspec": make_tree("cloud-pine"), "occlusion": "tall",
                 "footprint": {"shape": "ellipse", "width": 7, "depth": 4, "offset": [0, -2]}},
        "blossom_tree": {"pixelspec": make_tree("plum-blossom", blossom=True), "occlusion": "tall",
                         "footprint": {"shape": "ellipse", "width": 7, "depth": 4, "offset": [0, -2]}},
        "bamboo": {"pixelspec": make_bamboo(), "occlusion": "tall", "flip": False,
                   "footprint": {"shape": "ellipse", "width": 8, "depth": 4, "offset": [0, -2]}},
        "lantern": {"pixelspec": make_lantern(), "occlusion": "low",
                    "footprint": {"shape": "ellipse", "width": 5, "depth": 4, "offset": [0, -2]}},
        "rock": {"pixelspec": make_rock(), "occlusion": "low",
                 "footprint": {"shape": "ellipse", "width": 13, "depth": 5, "offset": [0, -2.5]}},
        "shrub": {"pixelspec": make_shrub(), "occlusion": "low",
                  "footprint": {"shape": "ellipse", "width": 14, "depth": 5, "offset": [0, -2.5]}},
        "signboard": {"pixelspec": make_sign(), "occlusion": "low",
                      "footprint": {"shape": "rect", "width": 6, "depth": 5, "offset": [0, -2.5]}}
    })

    layout = {
        "schema": "codeart2d.layout_spec.v1",
        "map_id": "qinghe-valley",
        "size": [40, 25],
        "tile_size": 32,
        "seed": 30417,
        "materials": {
            "grass": {"color": "#57935b", "walkable": True, "priority": 0},
            "dirt_path": {"color": "#b0794d", "walkable": True, "priority": 2},
            "water": {"color": "#23618a", "walkable": False, "priority": 1}
        },
        "base": "grass",
        "terrain": [
            {"id": "east-lake", "shape": "ellipse", "material": "water", "center": [31, 7], "radius": [4.2, 3.3], "wobble": 0.7},
            # Praça principal larga: o spawn chega pelo sul e distribui o jogador para os quatro setores.
            {"id": "village-green", "shape": "ellipse", "material": "dirt_path", "center": [18, 14], "radius": [7.4, 2.8], "wobble": 0.12},
            {"id": "west-road", "shape": "road", "material": "dirt_path", "width": 1.35, "points": [[-1, 14], [4, 14], [9, 14], [14, 14]]},
            # Mercado e lake ficam ligados por uma via legível, sem cortar a praça de respawn.
            {"id": "east-road", "shape": "road", "material": "dirt_path", "width": 1.35, "points": [[22, 14], [27, 13], [31, 11], [36, 11], [41, 11]]},
            {"id": "north-lane", "shape": "road", "material": "dirt_path", "width": 1.2, "points": [[10, 14], [10, 9], [9, 6], [9, -1]]},
            {"id": "south-lane", "shape": "road", "material": "dirt_path", "width": 1.2, "points": [[18, 14], [19, 17], [20, 21], [20, 26]]}
        ],
        "actor": {"radius": 7, "ySquash": 0.9},
        "props": props,
        "objects": [
            {"id": "village-gate", "prop": "sect_gate", "x": 10 * 32, "y": 8 * 32},
            {"id": "respawn-shrine", "prop": "pagoda", "x": 18 * 32, "y": 10 * 32},
            {"id": "moonwood-crossing", "prop": "bridge", "x": 31 * 32, "y": 11 * 32},
            {"id": "village-pagoda", "prop": "pagoda", "x": 34 * 32, "y": 17 * 32}
        ],
        "scatter": [
            {"id": "bamboo-grove", "kinds": {"bamboo": 1}, "count": 18, "spacing": 24,
             "region": [24, 24, 360, 290], "density": {"scale": 94, "octaves": 2, "threshold": 0.42, "edge_bonus": 0.16, "edge_distance": 55},
             "clearance": {"road": 20, "blocked": 20, "object": 30, "exit": 30, "spawn": 28}},
            {"id": "plum-garden", "kinds": {"blossom_tree": 2, "shrub": 1}, "count": 14, "spacing": 28,
             "region": [640, 385, 1180, 760], "density": {"scale": 120, "octaves": 2, "threshold": 0.47, "edge_bonus": 0.1, "edge_distance": 50},
             "clearance": {"road": 18, "blocked": 18, "object": 28, "exit": 28, "spawn": 26}},
            {"id": "stone-and-lanterns", "kinds": {"rock": 2, "lantern": 1, "signboard": 1}, "count": 16, "spacing": 20,
             "near": {"road": [18, 42]},
             "clearance": {"road": 14, "blocked": 14, "object": 14, "exit": 25, "spawn": 20}}
        ],
        "exits": [
            {"id": "west-road-exit", "edge": "west", "road": "west-road", "to": "bamboo-coast:from-qinghe-valley", "arrival": "from-bamboo-coast"},
            {"id": "east-road-exit", "edge": "east", "road": "east-road", "to": "river-market:from-qinghe-valley", "arrival": "from-river-market"},
            {"id": "north-gate-exit", "edge": "north", "road": "north-lane", "to": "jade-mountain:from-qinghe-valley", "arrival": "from-jade-mountain"},
            {"id": "south-road-exit", "edge": "south", "road": "south-lane", "to": "training-grounds:from-qinghe-valley", "arrival": "from-training-grounds"}
        ],
        "spawns": [{"id": "arrival", "x": 18 * 32, "y": 15 * 32, "facing": "north"}],
        "interactions": [
            {"id": "village-notice", "x": 12 * 32, "y": 11 * 32, "reach": 32},
            {"id": "respawn-shrine", "x": 18 * 32, "y": 14 * 32, "reach": 44},
            {"id": "market-square", "x": 25 * 32, "y": 14 * 32, "reach": 64},
            {"id": "alchemy-yard", "x": 13 * 32, "y": 10 * 32, "reach": 48},
            {"id": "forge-yard", "x": 13 * 32, "y": 19 * 32, "reach": 48}
        ]
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(layout, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(OUT)


if __name__ == "__main__":
    main()
