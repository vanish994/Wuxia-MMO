#!/usr/bin/env python3
"""Build a deduplicated, organized source pack for Wuxia MMO."""
from __future__ import annotations

import hashlib
import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
WORK = DOCS / ".wuxia-mmo-mega-pack-build"
OUT_DIR = DOCS / "wuxia-mmo-mega-pack"
OUT_ZIP = DOCS / "Wuxia-MMO-Mega-Asset-Pack_v1.0.zip"

SOURCES = {
    "terrain_free": DOCS / "Free asset pack, thank u so much!.zip",
    "feudal_sample": DOCS / "FeudalJapanComplete2DMegaPropsPack_Sample_v1.0.zip",
    "feudal_full": DOCS / "FeudalJapanComplete2DMegaPropsPack_v1.0.zip",
    "seasons": DOCS / "HarmoniousSeasons-ASeasonsBased2DPixelArtPack.zip",
}


def safe_rel(name: str) -> Path:
    return Path(*[part for part in name.replace("\\", "/").split("/") if part not in ("", ".", "..")])


def copy_zip_member(zf: zipfile.ZipFile, member: zipfile.ZipInfo, destination: Path) -> str:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zf.open(member) as source, destination.open("wb") as target:
        shutil.copyfileobj(source, target)
    return hashlib.sha256(destination.read_bytes()).hexdigest()


def add_record(records: list[dict], source: str, original: str, organized: str, sha256: str, note: str = "") -> None:
    records.append({
        "source": source,
        "original_path": original,
        "organized_path": organized,
        "sha256": sha256,
        **({"note": note} if note else {}),
    })


def main() -> None:
    if WORK.exists():
        shutil.rmtree(WORK)
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    if OUT_ZIP.exists():
        OUT_ZIP.unlink()
    WORK.mkdir(parents=True)
    records: list[dict] = []

    # 1) Compact terrain sheets from the free environment pack.
    with zipfile.ZipFile(SOURCES["terrain_free"]) as zf:
        for member in zf.infolist():
            if member.is_dir() or not member.filename.lower().endswith(".png"):
                continue
            name = safe_rel(member.filename).name
            dest = WORK / "01-terrain" / "free-environment" / name
            sha = copy_zip_member(zf, member, dest)
            add_record(records, "Free asset pack, thank u so much!.zip", member.filename, str(dest.relative_to(WORK)), sha)

    # 2) Full feudal Japan pack is canonical; the sample is retained only as provenance.
    with zipfile.ZipFile(SOURCES["feudal_full"]) as zf:
        for member in zf.infolist():
            rel = safe_rel(member.filename)
            if member.is_dir() or len(rel.parts) < 2 or rel.parts[1] not in {"Tiles", "Documentation", "TileMap", "Preview"}:
                continue
            # Remove the archive's redundant top-level folder.
            rel = Path(*rel.parts[1:])
            dest = WORK / "02-feudal-japan" / rel
            sha = copy_zip_member(zf, member, dest)
            add_record(records, "FeudalJapanComplete2DMegaPropsPack_v1.0.zip", member.filename, str(dest.relative_to(WORK)), sha)

    with zipfile.ZipFile(SOURCES["feudal_sample"]) as zf:
        for member in zf.infolist():
            rel = safe_rel(member.filename)
            if member.is_dir():
                continue
            rel = Path(*rel.parts[1:])
            # Keep sample documentation and its preview; tile PNGs duplicate the full pack.
            if not (str(rel).startswith("Documentation/") or str(rel) == "Preview/Preview.png"):
                continue
            dest = WORK / "provenance" / "feudal-japan-sample" / rel
            sha = copy_zip_member(zf, member, dest)
            add_record(records, "FeudalJapanComplete2DMegaPropsPack_Sample_v1.0.zip", member.filename, str(dest.relative_to(WORK)), sha, "Sample tile images are deduplicated against the full pack.")

    # 3) Seasonal nature/character/audio pack, preserving its useful category names.
    with zipfile.ZipFile(SOURCES["seasons"]) as zf:
        for member in zf.infolist():
            rel = safe_rel(member.filename)
            if member.is_dir():
                continue
            rel = Path(*rel.parts[1:])
            if not rel.parts:
                continue
            dest = WORK / "03-harmonious-seasons" / rel
            sha = copy_zip_member(zf, member, dest)
            add_record(records, "HarmoniousSeasons-ASeasonsBased2DPixelArtPack.zip", member.filename, str(dest.relative_to(WORK)), sha)

    docs = WORK / "README.md"
    docs.write_text("""# Wuxia MMO — Mega Asset Pack v1.0\n\nPacote-fonte organizado e deduplicado para o MMORPG wuxia. Os arquivos foram agrupados sem redimensionar ou editar os pixels originais.\n\n## Estrutura\n\n- `01-terrain/free-environment/`: folhas de terreno, água, neve, deserto, praia, plantas e decoração do Free asset pack.\n- `02-feudal-japan/`: pack completo de arquitetura, casas, lojas, jardins, santuários, interiores, mercado e props japoneses.\n- `03-harmonious-seasons/`: natureza sazonal, árvores, flores, água, caminhos, personagens de referência e música.\n- `provenance/feudal-japan-sample/`: documentação e preview do sample; os PNGs duplicados foram omitidos.\n- `manifest.json`: inventário com origem, caminho organizado e SHA-256 de cada arquivo.\n\n## Uso no jogo\n\n1. Escolha uma categoria visual e valide a escala nativa antes de importar para `assets/external/`.\n2. Para o mapa top-down atual, use primeiro os módulos de `02-feudal-japan/Tiles/` e os elementos naturais de `03-harmonious-seasons/`.\n3. Mantenha o personagem de referência em 64×64 px e o grid do mundo em 32 px; não aumente sprites pequenos por escala de runtime.\n4. O conteúdo de `03-harmonious-seasons/Characters/` é referência visual e não substitui o samurai jogável atual sem uma validação de estilo e colisão.\n5. Verifique as licenças e os READMEs preservados em `Documentation/` antes de redistribuir qualquer asset fora do projeto.\n\n## Procedência\n\nEste mega pack reúne quatro fontes fornecidas pelo proprietário do projeto. O pack completo Feudal Japan é a fonte canônica dos tiles; o sample é mantido apenas para documentação e preview. Nenhum asset foi criado ou alterado neste processo.\n""", encoding="utf-8")

    (WORK / "manifest.json").write_text(json.dumps({
        "schema": "wuxia-mmo.mega-asset-pack.v1",
        "version": "1.0.0",
        "deduplicated": True,
        "sources": {key: path.name for key, path in SOURCES.items()},
        "records": records,
        "counts": {"files": len(records), "bytes": sum((WORK / r["organized_path"]).stat().st_size for r in records)},
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    OUT_DIR.mkdir(parents=True)
    for child in WORK.iterdir():
        target = OUT_DIR / child.name
        if child.is_dir():
            shutil.copytree(child, target)
        else:
            shutil.copy2(child, target)

    with zipfile.ZipFile(OUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for path in sorted(OUT_DIR.rglob("*")):
            if path.is_file():
                zf.write(path, Path("Wuxia-MMO-Mega-Asset-Pack_v1.0") / path.relative_to(OUT_DIR))

    print(json.dumps({
        "output_dir": str(OUT_DIR),
        "output_zip": str(OUT_ZIP),
        "files": len(records),
        "bytes_uncompressed": sum((WORK / r["organized_path"]).stat().st_size for r in records),
        "zip_bytes": OUT_ZIP.stat().st_size,
    }, ensure_ascii=False))
    shutil.rmtree(WORK)


if __name__ == "__main__":
    main()
""
