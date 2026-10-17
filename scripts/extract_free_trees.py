#!/usr/bin/env python3
"""Cut the individual trees out of the Free asset pack's '4. Trees' sheet.

The sheet has a black background. Pixels close to black become transparent, then each
connected group of remaining pixels (after a small dilation so the soft shadow under a tree
stays with it) is saved as its own PNG, cropped to its bounding box.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHEET = ROOT / "assets/external/free-asset-pack/trees-sheet.png"
OUT = ROOT / "assets/external/free-asset-pack/trees"
BG_THRESHOLD = 24   # max channel value treated as background
MIN_AREA = 900      # ignore specks and the sheet title


def main() -> None:
    img = Image.open(SHEET).convert("RGBA")
    w, h = img.size
    px = img.load()
    mask = [[max(px[x, y][:3]) > BG_THRESHOLD for x in range(w)] for y in range(h)]
    # Ignore the title band at the top of the sheet.
    for y in range(0, 110):
        for x in range(w):
            mask[y][x] = False

    seen = [[False] * w for _ in range(h)]
    boxes = []
    for y0 in range(h):
        for x0 in range(w):
            if not mask[y0][x0] or seen[y0][x0]:
                continue
            q = deque([(x0, y0)])
            seen[y0][x0] = True
            pts = []
            minx = maxx = x0
            miny = maxy = y0
            while q:
                x, y = q.popleft()
                pts.append((x, y))
                minx, maxx = min(minx, x), max(maxx, x)
                miny, maxy = min(miny, y), max(maxy, y)
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and mask[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        q.append((nx, ny))
            if len(pts) >= MIN_AREA:
                boxes.append((miny, minx, maxy, maxx, pts))

    # Reading order: rows first (grouped by height band), then columns.
    boxes.sort(key=lambda b: (round(b[0] / 200), b[1]))
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("tree_*.png"):
        old.unlink()
    for i, (miny, minx, maxy, maxx, pts) in enumerate(boxes, 1):
        tile = Image.new("RGBA", (maxx - minx + 1, maxy - miny + 1), (0, 0, 0, 0))
        src = img.crop((minx, miny, maxx + 1, maxy + 1))
        keep = set((x - minx, y - miny) for x, y in pts)
        for y in range(src.height):
            for x in range(src.width):
                if (x, y) in keep:
                    tile.putpixel((x, y), src.getpixel((x, y)))
        tile.save(OUT / f"tree_{i:02d}.png")
    print(f"trees={len(boxes)}")


if __name__ == "__main__":
    main()
