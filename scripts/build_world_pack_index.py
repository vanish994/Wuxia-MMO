#!/usr/bin/env python3
"""Build a hash inventory and QA summary for the Wuxia world-art pack."""
from __future__ import annotations

import hashlib
import json
import struct
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / "assets/world/pack-index.json"
VALIDATION_PATH = ROOT / "assets/world/qa/world-validation-v2.json"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def png_dimensions(path: Path) -> tuple[int, int] | None:
    try:
        with path.open("rb") as stream:
            header = stream.read(24)
        if header[:8] != b"\x89PNG\r\n\x1a\n":
            return None
        return struct.unpack(">II", header[16:24])
    except OSError:
        return None


def input_paths() -> list[Path]:
    roots = [
        ROOT / "assets/tilesets",
        ROOT / "assets/world",
        ROOT / "src/client/world/phaser",
        ROOT / "test/world",
    ]
    paths: set[Path] = set()
    for folder in roots:
        if folder.exists():
            paths.update(p for p in folder.rglob("*") if p.is_file())
    for rel in [
        "LICENSE",
        "docs/world-runtime-integration.md",
        "scripts/build_starter_village.py",
        "scripts/build_biome_grid.py",
        "scripts/build_world_pack_index.py",
        "scripts/build_world_pack_zip.py",
    ]:
        path = ROOT / rel
        if path.is_file():
            paths.add(path)
    paths.discard(INDEX_PATH)
    paths.discard(VALIDATION_PATH)
    return sorted(paths)


def summarize_validation() -> dict:
    biome_root = ROOT / "assets/world/maps/biomes"
    index = json.loads((biome_root / "biome-index.json").read_text(encoding="utf-8"))
    regions = []
    for region in index["regions"]:
        region_root = ROOT / "assets/world/maps/biomes/regions" / f"{region['id']}-v1"
        layout = json.loads((region_root / "layout-qa.json").read_text(encoding="utf-8"))
        nav_path = region_root / "qa/worldlinks-v2/nav-report.json"
        nav = json.loads(nav_path.read_text(encoding="utf-8"))
        export = json.loads((region_root / "tiled/export-report.json").read_text(encoding="utf-8"))
        render_checks = [check for check in export.get("checks", [])
                         if check.get("id") in ("rerender_map_tmj", "rerender_map_embedded_tmj")]
        checks = [
            {"id": check.get("id"), "status": check.get("status"), "value": check.get("value")}
            for check in nav.get("checks", []) if check.get("status") in ("warn", "fail")
        ]
        regions.append({
            "id": region["id"],
            "layout_status": layout.get("status"),
            "tiled_status": export.get("status"),
            "navigation_status": nav.get("status"),
            "navigation_issues": checks,
            "tiled_rerender_checks": len(render_checks),
            "tiled_rerender_mismatches": sum(int(check.get("value", 0) or 0) for check in render_checks),
            "layout_qa": str((region_root / "layout-qa.json").relative_to(ROOT)),
            "navigation_qa": str(nav_path.relative_to(ROOT)),
            "tiled_export_report": str((region_root / "tiled/export-report.json").relative_to(ROOT)),
        })
    nav_fails = sum(any(item["status"] == "fail" for item in r["navigation_issues"]) for r in regions)
    nav_warns = sum(r["navigation_status"] == "warn" for r in regions)
    wang_manifests = []
    for path in sorted((ROOT / "assets/tilesets/generated-core-v1").glob("*.tileset.json")):
        manifest = json.loads(path.read_text(encoding="utf-8"))
        if manifest.get("kind") == "wang_corner":
            wang_manifests.append({
                "id": manifest.get("id"),
                "materials": manifest.get("materials"),
                "variants": manifest.get("variants"),
                "tilecount": manifest.get("tilecount"),
                "seamless_verified": manifest.get("seamless_verified"),
                "seam_mismatches": (manifest.get("seam_proof") or {}).get("mismatches"),
                "manifest": str(path.relative_to(ROOT)),
            })
    tile_manifests = list((ROOT / "assets/tilesets/generated-core-v1").glob("*.tileset.json"))
    tile_count = sum(json.loads(path.read_text(encoding="utf-8")).get("tilecount", 0) for path in tile_manifests)
    return {
        "schema": "wuxia.world_validation.v1",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "region_count": len(regions),
        "directed_connections": len(index.get("connections", [])),
        "regions_with_navigation_warnings": nav_warns,
        "regions_with_navigation_failures": nav_fails,
        "regions_with_tiled_export_failures": sum(r["tiled_status"] != "pass" for r in regions),
        "tiled_rerender_mismatches": sum(r["tiled_rerender_mismatches"] for r in regions),
        "tileset_manifest_count": len(tile_manifests),
        "wang_manifest_count": len(wang_manifests),
        "wang_seam_mismatches": sum(item["seam_mismatches"] or 0 for item in wang_manifests),
        "atlas_tile_count_including_variants": tile_count,
        "wang_manifests": wang_manifests,
        "regions": regions,
        "scope_note": "The map-nav warnings are reported, not hidden; Node tests use actual manifests/TMJ and mocks, not a running Phaser app.",
    }


def main() -> None:
    validation = summarize_validation()
    VALIDATION_PATH.parent.mkdir(parents=True, exist_ok=True)
    VALIDATION_PATH.write_text(json.dumps(validation, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    files = []
    for path in input_paths():
        item = {
            "path": str(path.relative_to(ROOT)),
            "bytes": path.stat().st_size,
            "sha256": sha256(path),
            "media_type": path.suffix.lower().lstrip(".") or "none",
        }
        dims = png_dimensions(path) if path.suffix.lower() == ".png" else None
        if dims:
            item["dimensions"] = {"width": dims[0], "height": dims[1]}
        files.append(item)
    result = {
        "schema": "wuxia.world_pack_index.v1",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "repository_license": "BSD-3-Clause (root LICENSE; see assets/world/LICENSING.md)",
        "art_source": "code-drawn; no third-party art assets included",
        "file_count": len(files),
        "validation_report": str(VALIDATION_PATH.relative_to(ROOT)),
        "files": files,
        "index_note": "This index intentionally excludes its own hash and the validation report hash to avoid recursive manifests; all other included payload files are listed.",
    }
    INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    INDEX_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": "ok",
        "files": len(files),
        "tilesets": validation["tileset_manifest_count"],
        "wang_sets": validation["wang_manifest_count"],
        "atlas_tiles": validation["atlas_tile_count_including_variants"],
        "regions": validation["region_count"],
        "directed_connections": validation["directed_connections"],
        "navigation_warn_regions": validation["regions_with_navigation_warnings"],
        "index": str(INDEX_PATH),
        "validation": str(VALIDATION_PATH),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
