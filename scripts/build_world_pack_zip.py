#!/usr/bin/env python3
"""Package the versioned Wuxia world-art source and assets into a portable ZIP."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
INCLUDE_DIRS = [
    "assets/tilesets",
    "assets/world",
    "src/client/world/phaser",
    "test/world",
]
INCLUDE_FILES = [
    "LICENSE",
    "docs/world-runtime-integration.md",
    "scripts/build_starter_village.py",
    "scripts/build_biome_grid.py",
    "scripts/build_world_pack_index.py",
    "scripts/build_world_pack_zip.py",
]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def payload_paths() -> list[Path]:
    files: set[Path] = set()
    for rel in INCLUDE_DIRS:
        folder = ROOT / rel
        if folder.exists():
            files.update(path for path in folder.rglob("*") if path.is_file())
    for rel in INCLUDE_FILES:
        path = ROOT / rel
        if path.is_file():
            files.add(path)
    return sorted(files)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", default="assets/packs/wuxia-world-pack-alpha.zip")
    args = parser.parse_args()
    output = (ROOT / args.output).resolve()
    if not output.is_relative_to(ROOT):
        raise SystemExit("output must stay inside the repository")
    payload = payload_paths()
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(output.suffix + ".tmp")
    with ZipFile(temporary, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in payload:
            archive.write(path, path.relative_to(ROOT).as_posix())
    temporary.replace(output)
    print(json.dumps({
        "status": "ok",
        "files": len(payload),
        "bytes": output.stat().st_size,
        "sha256": sha256(output),
        "zip": str(output),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
