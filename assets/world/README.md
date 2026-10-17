# Wuxia World — tilesets e mapa de demonstração (alpha)

Este diretório contém uma **entrega utilizável de núcleo/vertical slice**, não um pack profissional completo. A arte de terreno e os props foram **desenhados por código (sem modelo de imagem)** para obedecer a tiles nativos `32×32`, paleta e prova de costura; o resultado ainda é simples e não substitui arte final refinada à mão.

## Entregue nesta versão

- **27 manifests de tileset** do núcleo: 22 Wang corner (16 sets binários e 6 sets de três materiais), 3 fills, 1 overlay blob-47 e 1 bevel.
- **3.232 células de atlas** contabilizando as quatro variantes: 16 Wang-16 × 64, 6 Wang-81 × 324, 3 fills × 4, blob-47 × 188 e bevel × 64.
- **20 regiões** numa malha topológica 4×5; cada mapa tem fonte `map-bundle.v2`, layout JSON e export Tiled TMJ/TSX embedded.
- **62 conexões direcionadas** entre regiões (31 pares recíprocos), com spawns nomeados nas duas pontas.
- **11 imagens de props** no mapa de demonstração Qinghe, de tamanhos nativos variáveis; incluem vegetação, rochas, lanternas, placa, ponte e algumas estruturas. O catálogo não equivale a 11 edifícios.
- Mapa reproduzível de **Qinghe Valley**, com vila, caminhos, bambuzal, água, ponte, construções, decoração, colisão, entradas e saídas.
- A vila inicial de Qinghe é um hub aberto de 1792×1152 px com praça central menor, rotas longas para os quatro pontos cardeais, três áreas de água e quatro distritos funcionais declarados no mapa: `respawn-shrine`, `market-square`, `alchemy-yard`, `forge-yard` e `guest-yard`. Eles são pontos de integração para futuros NPCs, economia, hospedagem e produção; não implementam esses sistemas ainda.
- O kit visual executável está em `assets/world/maps/biomes/qinghe-valley-village-kit.json`: cabanas 128×128, barracas 48×48 e props japoneses de cerejeira, bambu, lótus, pedra e carpas, todos ancorados na grade nativa sem escala artificial. A fonte OPP4 de 224×224 foi retirada do mapa jogável por ficar desproporcional ao personagem de 64×64; a decoração procedural restante é `solid: false` para manter o mundo vivo sem criar paredes invisíveis.
- Loader de TMJ/atlas/props/colisão/interações, seletor Dual Grid e utilidades Phaser de estação, horário e clima em `src/client/world/phaser/`.
- Contrato de integração servidor/cliente, inventário com hashes e relatórios de QA.

## Onde encontrar

- Índice de regiões e caminhos de assets: [`maps/biomes/biome-index.json`](maps/biomes/biome-index.json).
- Revisão dos 20 mapas: [`maps/biomes/regions/review-all-biomes-v2.png`](maps/biomes/regions/review-all-biomes-v2.png).
- Demo reconstruível: [`maps/biomes/qinghe-valley.layout.json`](maps/biomes/qinghe-valley.layout.json), [`maps/biomes/regions/qinghe-valley-v1/preview.png`](maps/biomes/regions/qinghe-valley-v1/preview.png) e [`maps/biomes/regions/qinghe-valley-v1/map-bundle.json`](maps/biomes/regions/qinghe-valley-v1/map-bundle.json).
- Regras e paleta Dual Grid: [`../tilesets/documentation/dual-grid.md`](../tilesets/documentation/dual-grid.md) e [`../tilesets/specs/wuxia-world.material.json`](../tilesets/specs/wuxia-world.material.json).
- Runtime Phaser: [`../../src/client/world/phaser/README.md`](../../src/client/world/phaser/README.md).
- Contrato de eventos para um futuro servidor: [`../../docs/world-runtime-integration.md`](../../docs/world-runtime-integration.md).
- Inventário/sha256: [`pack-index.json`](pack-index.json).

## QA medido

- Os manifests Wang passaram pela prova de costuras do gerador, com **zero mismatches**; o teste verifica todas as configurações binárias por variante e as transições requeridas.
- **10/10 testes Node passam** contra os TMJ, mapas, atlas e scripts presentes no repositório; o smoke test de tipos TypeScript também compila.
- Os 20 layouts e exports Tiled estão com status `pass`; o re-render de TMJ externo e embedded tem zero pixels divergentes. Isso não comprova abertura no editor Tiled nem execução no Phaser.
- A validação cruzada dos 20 mapas encontrou **zero falhas de destino**, mas **18 mapas têm o aviso `unreachable_walkable_area`** para pequenos bolsões de terreno caminhável isolados (detalhes e contagens em `regions/*/qa/worldlinks-v2/nav-report.json`). Duas regiões não têm esse aviso. Estes bolsões ainda precisam de revisão de design/navegação; não declare o mundo sem warnings.
- O loader foi testado com mocks Node sobre os dados reais. **Não foi executado no Phaser**: este repositório não contém aplicação, dependência Phaser, `package.json` ou build client para abrir a cena. Veja as limitações no guia de integração.

## O que ainda não está concluído

Esta versão **não** entrega todas as categorias do briefing original. Permanecem pendentes, entre outros: arquitetura modular extensa/interiores e 10 edifícios distintos; biblioteca ampla de props; tilesets únicos e desenhados à mão para cada um dos 20 biomas (os mapas atuais reutilizam o núcleo procedural); cavernas, minas, dungeon, castelo/fortaleza, arena PvP e acampamento de bandidos como kits dedicados; spritesheets de água/cachoeira/fogo/folhas/Qi; personagens NPC adicionais e animações; colisões refinadas por playtest; cena Phaser compilada/rodando; e servidor de jogo autoritativo. O módulo de clima/estação/horário é uma utilidade de cliente, ainda sem cena real validada.

Para esta reorganização da vila não foi criada arte nova: foram reaproveitados o tileset Wang, os props de telhado, pagoda, ponte, lanternas, bambu, árvores e placa já presentes no repositório. Qualquer novo edifício, tileset ou ilustração deverá ser aprovado antes de ser produzido.

## Rebuild básico

No ambiente que possui as ferramentas de geração instaladas:

```bash
python3 scripts/build_starter_village.py
python3 /home/ubuntu/skills/codeart2d/scripts/layout_build.py \
  --spec assets/world/maps/biomes/qinghe-valley.layout.json \
  --tiles assets/tilesets/generated-core-v1/grass-path-water-wang81.tileset.json \
  --output-dir assets/world/maps/biomes/regions/qinghe-valley-v1 \
  --seed 30417 --preview --strict-qc
python3 scripts/build_biome_grid.py --build --export-tiled --force
python3 scripts/build_world_pack_index.py
python3 scripts/build_world_pack_zip.py
node --test test/world/wuxia-region-loader.test.mjs
```

`--force` substitui somente as 19 pastas de região controladas pelo gerador; Qinghe é gerada separadamente. Os scripts das skills ficam no ambiente Manus e não foram copiados para o repositório.

## Origem e licença

Não foram incorporados sprites, fontes, sons ou imagens externos neste pacote; os arquivos listados são saídas procedurais originais e fontes do próprio repositório. O projeto tem uma licença BSD-3 na raiz; nenhuma atribuição de terceiros foi necessária para esses assets. Isso não altera nem interpreta juridicamente o escopo da licença do projeto.
