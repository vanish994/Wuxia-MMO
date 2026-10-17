#!/usr/bin/env python3
"""Build the 19-region Wuxia terrain grid from validated native 32px Wang sets.

All maps are data-first. Each region uses one seam-proven Wang manifest; exits form
reciprocal cardinal links. Qinghe Valley is generated separately as the authored demo map.
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from build_starter_village import (make_bamboo, make_bridge, make_gate, make_lantern,
                                   make_pagoda, make_rock, make_shrub, make_sign, make_tree)
SKILL = Path("/home/ubuntu/skills")
TILE_ROOT = ROOT / "assets/tilesets/generated-core-v1"
BIOME_ROOT = ROOT / "assets/world/maps/biomes"
REGION_ROOT = BIOME_ROOT / "regions"
SPEC_ROOT = REGION_ROOT / "specs"
GRID = [
    ["jade-valley", "jade-mountain", "frost-pass", "imperial-ruins", "spirit-grove"],
    ["bamboo-coast", "qinghe-valley", "river-market", "reed-marsh", "jade-forest"],
    ["desert-oasis", "training-grounds", "pagoda-court", "marsh-delta", "ice-lake"],
    ["stone-highland", "fire-mountain", "void-shrine", "coastal-temple", "nether-grove"],
]
REGIONS = {
    "jade-valley": ("Jade Valley", "grass-dirt-wang16", "grass", "Wind-shaped meadows and earthen knolls."),
    "jade-mountain": ("Jade Mountain", "snow-grass-wang16", "grass", "Highland grass under drifting snow shelves."),
    "frost-pass": ("Frost Pass", "snow-dirt-wang16", "snow", "A pale high pass broken by exposed earth."),
    "imperial-ruins": ("Imperial Ruins", "built-natural-stone-wang16", "natural_stone", "Carved stone paving reclaimed by weathered rock."),
    "spirit-grove": ("Spirit Grove", "corruption-grass-dirt-wang81", "grass", "A quiet grove edged by supernatural jade blight and earth paths."),
    "bamboo-coast": ("Bamboo Coast", "grass-dirt-path-wang81", "grass", "A coastal approach with a winding ochre trail."),
    "river-market": ("River Market", "sand-water-wang16", "sand", "Sandy riverbank terraces and quiet water."),
    "reed-marsh": ("Reed Marsh", "marsh-water-wang16", "marsh", "Wetland shelves at the edge of blue water."),
    "jade-forest": ("Jade Forest", "grass-sand-wang16", "grass", "Green forest floor opening into warm earth."),
    "desert-oasis": ("Desert Oasis", "grass-water-sand-wang81", "sand", "Oasis basin with grass, sand and water sharing corners."),
    "training-grounds": ("Training Grounds", "built-natural-stone-wang16", "built_stone", "Fitted courtyard stones against rough mountain rock."),
    "pagoda-court": ("Pagoda Court", "wood-stone-wang16", "weathered_wood", "Weathered timber platforms meet cut stone."),
    "marsh-delta": ("Marsh Delta", "dirt-water-wang16", "dirt", "Mud banks and tidal water."),
    "ice-lake": ("Ice Lake", "ice-water-wang16", "ice", "A walkable frozen shelf surrounding deep water."),
    "stone-highland": ("Stone Highland", "dirt-stone-wang16", "natural_stone", "Rugged stone outcrops rising through brown earth."),
    "fire-mountain": ("Fire Mountain", "lava-stone-wang16", "natural_stone", "Volcanic seams cut through black stone."),
    "void-shrine": ("Void Shrine", "corruption-stone-wang16", "natural_stone", "Ancient stone invaded by violet corruption."),
    "coastal-temple": ("Coastal Temple", "grass-dirt-water-wang81", "grass", "A green temple approach with earth and water transitions."),
    "nether-grove": ("Nether Grove", "corruption-grass-dirt-wang81", "grass", "Grass, earth and corrupt ground share a continuous vertex grid."),
}
DIRECTIONS = (("north", -1, 0), ("east", 0, 1), ("south", 1, 0), ("west", 0, -1))


def run_json(command: list[str]) -> dict:
    result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
    if result.returncode:
        sys.stderr.write(result.stdout)
        sys.stderr.write(result.stderr)
        raise SystemExit(f"command failed ({result.returncode}): {' '.join(command)}")
    lines = [line for line in result.stdout.splitlines() if line.lstrip().startswith("{")]
    if not lines:
        raise SystemExit(f"command did not return JSON: {' '.join(command)}\n{result.stdout}\n{result.stderr}")
    return json.loads(lines[-1])


def tile_manifest(set_id: str) -> tuple[Path, dict]:
    path = TILE_ROOT / f"{set_id}.tileset.json"
    if not path.is_file():
        raise SystemExit(f"missing tileset manifest: {path}")
    return path, json.loads(path.read_text(encoding="utf-8"))


def tiled_assets(output: Path, set_id: str) -> dict:
    report_path = output / "tiled/export-report.json"
    if not report_path.is_file():
        return {"tiled_dir": None, "ground_image": None, "prop_images": []}
    report = json.loads(report_path.read_text(encoding="utf-8"))
    image_outputs = [item["path"] for item in report.get("outputs", [])
                     if item.get("path", "").startswith("images/")]
    ground_rel = f"images/{set_id}.png"
    return {
        "tiled_dir": str((output / "tiled").relative_to(ROOT)),
        "ground_image": str((output / "tiled" / ground_rel).relative_to(ROOT)) if ground_rel in image_outputs else None,
        "prop_images": [str((output / "tiled" / p).relative_to(ROOT)) for p in image_outputs if p != ground_rel],
    }


def neighbours(row: int, col: int) -> list[tuple[str, str]]:
    found = []
    for edge, dr, dc in DIRECTIONS:
        rr, cc = row + dr, col + dc
        if 0 <= rr < len(GRID) and 0 <= cc < len(GRID[0]):
            found.append((edge, GRID[rr][cc]))
    return found


def prop_entry(spec: dict, occlusion: str, shape: str, width: int, depth: int,
               offset_y: float, flip: bool = True, solid: bool = True) -> dict:
    return {"pixelspec": spec, "occlusion": occlusion, "flip": flip, "solid": solid,
            "footprint": {"shape": shape, "width": width, "depth": depth,
                          "offset": [0, offset_y]}}


def write_region(map_id: str, row: int, col: int, material_spec: dict, build: bool, export: bool,
                 force: bool = False) -> dict:
    title, set_id, base, description = REGIONS[map_id]
    manifest_path, manifest = tile_manifest(set_id)
    names = manifest["materials"]
    if base not in names:
        raise SystemExit(f"{map_id}: base {base} is not in tileset {set_id}: {names}")
    source_materials = material_spec["materials"]
    material_defs = {}
    for i, name in enumerate(names):
        src = source_materials[name]
        ramps = src["ramp"]
        material_defs[name] = {
            "color": ramps[len(ramps) // 2],
            "walkable": src.get("walkable", True),
            "priority": 0 if name == base else i + 1,
        }
    transitions = [name for name in names if name != base]
    terrain = []
    for index, name in enumerate(transitions):
        center = [21 + (index % 2) * 3, 10 + (index // 2) * 4]
        radius = [4.7 if index == 0 else 3.5, 3.2 if index == 0 else 2.4]
        terrain.append({"id": f"{name}-shelf-{index+1}", "shape": "ellipse", "material": name,
                       "center": center, "radius": radius, "wobble": 0.58})
    if "dirt_path" in transitions:
        terrain.append({"id": "pilgrim-road", "shape": "road", "material": "dirt_path", "width": 1.25,
                        "points": [[-1, 11], [8, 10], [16, 12], [25, 10], [33, 11]]})
    else:
        trail = next((name for name in transitions if material_defs[name]["walkable"]), None)
        if trail:
            terrain.extend([
                {"id": "regional-road-east-west", "shape": "road", "material": trail, "width": 0.8,
                 "points": [[-1, 11], [8, 11], [16, 11], [24, 11], [33, 11]]},
                {"id": "regional-road-north-south", "shape": "road", "material": trail, "width": 0.8,
                 "points": [[16, -1], [16, 5], [16, 11], [16, 17], [16, 23]]},
            ])
    props = {
        "pine": prop_entry(make_tree("cloud-pine"), "tall", "ellipse", 7, 4, -2),
        "blossom_tree": prop_entry(make_tree("plum-blossom", blossom=True), "tall", "ellipse", 7, 4, -2),
        "bamboo": prop_entry(make_bamboo(), "tall", "ellipse", 8, 4, -2, flip=False),
        "shrub": prop_entry(make_shrub(), "low", "ellipse", 14, 5, -2.5),
        "rock": prop_entry(make_rock(), "low", "ellipse", 13, 5, -2.5),
        "lantern": prop_entry(make_lantern(), "low", "ellipse", 5, 4, -2),
        "signboard": prop_entry(make_sign(), "low", "rect", 6, 5, -2.5),
        "sect_gate": prop_entry(make_gate(), "tall", "rect", 14, 8, -4, flip=False),
        "pagoda": prop_entry(make_pagoda(), "tall", "rect", 18, 12, -6, flip=False),
        "bridge": prop_entry(make_bridge(), "low", "none", 0, 0, 0, flip=False, solid=False),
    }
    landmark_by_region = {
        "jade-mountain": "sect_gate", "imperial-ruins": "pagoda", "spirit-grove": "blossom_tree",
        "river-market": "signboard", "training-grounds": "sect_gate", "pagoda-court": "pagoda",
        "ice-lake": "lantern", "void-shrine": "pagoda", "coastal-temple": "sect_gate"
    }
    objects = []
    if map_id in landmark_by_region:
        landmark = landmark_by_region[map_id]
        objects.append({"id": f"{map_id}-landmark", "prop": landmark, "x": 21 * 32, "y": 8 * 32})
    if "snow" in names or "ice" in names:
        kinds = {"pine": 3, "rock": 2}
    elif "water" in names or "marsh" in names:
        kinds = {"bamboo": 3, "shrub": 2, "rock": 1}
    elif "corruption" in names or "lava" in names:
        kinds = {"rock": 3, "lantern": 1}
    elif "built_stone" in names or "weathered_wood" in names:
        kinds = {"rock": 2, "lantern": 2, "shrub": 1}
    else:
        kinds = {"pine": 2, "shrub": 2, "rock": 1}
    scatter = [{"id": "regional-dressing", "kinds": kinds, "count": 16, "spacing": 27,
                "region": [32, 24, 992, 656],
                "density": {"scale": 120, "octaves": 2, "threshold": 0.45,
                            "edge_bonus": 0.12, "edge_distance": 48},
                "clearance": {"blocked": 22, "object": 30, "exit": 36, "spawn": 30}}]
    exits = []
    for edge, target in neighbours(row, col):
        span = [13, 18] if edge in ("north", "south") else [8, 14]
        exits.append({"id": f"exit-{edge}", "edge": edge, "span": span,
                      "to": f"{target}:from-{map_id}", "arrival": f"from-{target}"})
    spec = {
        "schema": "codeart2d.layout_spec.v1",
        "map_id": map_id,
        "size": [32, 22],
        "tile_size": 32,
        "seed": 30417 + row * 5 + col,
        "materials": material_defs,
        "base": base,
        "terrain": terrain,
        "actor": {"radius": 7, "ySquash": 0.9},
        "props": props,
        "objects": objects,
        "scatter": scatter,
        "exits": exits,
        "spawns": [{"id": "arrival", "x": 6 * 32, "y": 11 * 32, "facing": "east"}],
    }
    SPEC_ROOT.mkdir(parents=True, exist_ok=True)
    spec_path = SPEC_ROOT / f"{map_id}.layout.json"
    spec_path.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    output = REGION_ROOT / f"{map_id}-v1"
    if force and output.exists():
        shutil.rmtree(output)
    if build and not (output / "layout-qa.json").is_file():
        built = run_json([
            "python3", str(SKILL / "codeart2d/scripts/layout_build.py"),
            "--spec", str(spec_path), "--tiles", str(manifest_path),
            "--output-dir", str(output), "--seed", str(spec["seed"]), "--preview", "--strict-qc"
        ])
        if built.get("status") != "pass" or built.get("failed_checks"):
            raise SystemExit(f"{map_id}: layout QA not clean: {built}")
    qa_path = output / "layout-qa.json"
    qa = json.loads(qa_path.read_text(encoding="utf-8")) if qa_path.is_file() else {"status": "not-built"}
    if export and qa.get("status") == "pass":
        tiled_dir = output / "tiled"
        if not (tiled_dir / "export-report.json").is_file():
            run_json(["python3", str(SKILL / "generate2dmap/scripts/export_tiled.py"), "export",
                      "--bundle", str(output / "map-bundle.json"), "--output-dir", str(tiled_dir),
                      "--embedded-variant"])
    assets = tiled_assets(output, set_id)
    return {"id": map_id, "title": title, "description": description, "grid": [row, col],
            "tileset": set_id, "materials": names, "base": base, "tile_size": 32,
            "layout_spec": str(spec_path.relative_to(ROOT)),
            "bundle": str((output / "map-bundle.json").relative_to(ROOT)),
            "qa": str((output / "layout-qa.json").relative_to(ROOT)), "qa_status": qa.get("status"),
            "tiled_map": str((output / "tiled/map.embedded.tmj").relative_to(ROOT)) if (output / "tiled/map.embedded.tmj").is_file() else None,
            **assets}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--build", action="store_true", help="run layout_build and publish validated region files")
    parser.add_argument("--export-tiled", action="store_true", help="also export each built region to Tiled TMJ/TSX")
    parser.add_argument("--force", action="store_true", help="replace this generator's 19 output folders before building")
    args = parser.parse_args()
    material_spec = json.loads((ROOT / "assets/tilesets/specs/wuxia-world.material.json").read_text(encoding="utf-8"))
    catalog = {"schema": "wuxia.world_biome_catalog.v1", "art_source": "code",
               "disclosure": "code-drawn, no image model", "tile_size": 32,
               "grid": GRID, "regions": []}
    qh = REGION_ROOT / "qinghe-valley-v1"
    qh_qa = json.loads((qh / "layout-qa.json").read_text(encoding="utf-8")) if (qh / "layout-qa.json").is_file() else {}
    qh_assets = tiled_assets(qh, "grass-path-water-wang81")
    catalog["regions"].append({"id": "qinghe-valley", "title": "Qinghe Valley", "grid": [1, 1],
                               "tileset": "grass-path-water-wang81", "materials": ["water", "grass", "dirt_path"],
                               "base": "grass", "tile_size": 32,
                               "layout_spec": "assets/world/maps/biomes/qinghe-valley.layout.json",
                               "bundle": str((qh / "map-bundle.json").relative_to(ROOT)),
                               "qa": str((qh / "layout-qa.json").relative_to(ROOT)),
                               "qa_status": qh_qa.get("status"),
                               "tiled_map": str((qh / "tiled/map.embedded.tmj").relative_to(ROOT)) if (qh / "tiled/map.embedded.tmj").is_file() else None,
                               **qh_assets})
    for row, line in enumerate(GRID):
        for col, map_id in enumerate(line):
            if map_id == "qinghe-valley":
                continue
            item = write_region(map_id, row, col, material_spec, args.build or args.force,
                                args.export_tiled, args.force)
            catalog["regions"].append(item)
            print(f"{map_id}: {item['qa_status']}", flush=True)
    catalog["regions"].sort(key=lambda item: item["grid"])
    catalog["connections"] = []
    for row, line in enumerate(GRID):
        for col, map_id in enumerate(line):
            for edge, target in neighbours(row, col):
                if (map_id, target) not in {(c["from"], c["to"]) for c in catalog["connections"]}:
                    catalog["connections"].append({"from": map_id, "to": target, "edge": edge, "reciprocal": True})
    BIOME_ROOT.mkdir(parents=True, exist_ok=True)
    catalog_path = BIOME_ROOT / "biome-index.json"
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "ok", "regions": len(catalog["regions"]), "connections": len(catalog["connections"]),
                      "catalog": str(catalog_path), "built": args.build, "tiled": args.export_tiled}), flush=True)


if __name__ == "__main__":
    main()
