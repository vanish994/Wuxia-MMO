# Dual Grid e Wang corner — Wuxia World

## Convenção de canto

Cada tile é escolhido a partir dos **quatro vértices** que delimitam a célula lógica. A ordem gravada nos manifests é:

1. `top-left` (TL / noroeste)
2. `top-right` (TR / nordeste)
3. `bottom-left` (BL / sudoeste)
4. `bottom-right` (BR / sudeste)

O valor em cada posição é o índice do material dentro de `manifest.materials`. A implementação em `src/client/world/phaser/dual-grid.mjs` lê uma grade de vértices e devolve `[grid[y][x], grid[y][x+1], grid[y+1][x], grid[y+1][x+1]]`.

Para um par binário A/B existem `2^4 = 16` estados. Como há quatro variantes de interior, cada tileset `wang16` contém `16 × 4 = 64` células. Para três materiais existem `3^4 = 81` topologias (`wang81`) e `81 × 4 = 324` células. Cada par dentro de um conjunto de três materiais continua contendo as 16 combinações binárias; o terceiro material é usado somente quando a topologia realmente pede três tipos de canto.

Para referência visual, um estado binário pode ser representado pelo mask `bit0=TL, bit1=TR, bit2=BL, bit3=BR`, onde `0=A` e `1=B`. **O runtime não calcula o índice do atlas por esse mask**: ele procura a tupla `wang` e a `variant` no manifest, evitando depender de uma ordem de geração implícita.

## Índices e atlas

- `tileset.json` é a fonte de verdade: cada entrada de `tiles` contém `index`, `variant`, `wang`, `wangid`, colisão e propriedades.
- Os atlas são PNG RGBA em resolução nativa, tiles de `32×32`, sem espaçamento entre células.
- `wang16`: 16 colunas; `wang81`: 9 colunas; os arquivos usam ordem row-major indicada por `index`.
- `wangid` segue a ordem Tiled documentada: top, top-right, right, bottom-right, bottom, bottom-left, left, top-left. Não misture a ordem de `wang` (quatro cantos) com a de `wangid` (oito bordas/cantos).
- Use `selectCellTile(manifest, vertexGrid, x, y, variant)`; consulte a posição de origem do terreno na sua convenção de grid antes de adaptar o algoritmo ao runtime do jogo.

## Cobertura entregue

O spec `assets/tilesets/specs/wuxia-world.material.json` declara pares para grama–terra, grama–areia, terra–pedra natural, grama–água, terra–água, areia–água, caminho–grama, pedra construída–pedra natural, neve–grama, neve–terra, corrupção–grama, corrupção–pedra e lava–pedra. Também inclui conjuntos de três materiais para transições que se encontram diretamente, pisos de madeira/pedra, gelo/água e pântano/água, além de fills, bevel e overlay de caminho.

## Validação

Cada manifest Wang declara `seamless_verified`. O build compara tiles montados com um render global independente em combinações exaustivas de adjacência; os testes do repositório confirmam `mismatches = 0`, 16 estados para cada par por variante e os pares de aceitação acima. O método é descrito em `assets/tilesets/generated-core-v1/autotile-qa.json` e nos manifests individuais.

## Limites

A regra fornece topologia e costuras exatas, não arte pintada. Os tiles de terreno desta versão são **desenhados por código**, com ramps e marcas procedurais. Isso mantém o tamanho e a paleta exatos, mas não equivale a acabamento manual ou textura pictórica. O runtime de jogo deve conservar o manifest ao reordenar ou repacotar o atlas.
