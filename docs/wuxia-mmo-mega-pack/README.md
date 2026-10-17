# Wuxia MMO — Mega Asset Pack v1.0

Pacote-fonte organizado e deduplicado para o MMORPG wuxia. Os arquivos foram agrupados sem redimensionar ou editar os pixels originais.

## Estrutura

- `01-terrain/free-environment/`: folhas de terreno, água, neve, deserto, praia, plantas e decoração do Free asset pack.
- `02-feudal-japan/`: pack completo de arquitetura, casas, lojas, jardins, santuários, interiores, mercado e props japoneses.
- `03-harmonious-seasons/`: natureza sazonal, árvores, flores, água, caminhos, personagens de referência e música.
- `provenance/feudal-japan-sample/`: documentação e preview do sample; os PNGs duplicados foram omitidos.
- `manifest.json`: inventário com origem, caminho organizado e SHA-256 de cada arquivo.

## Uso no jogo

1. Escolha uma categoria visual e valide a escala nativa antes de importar para `assets/external/`.
2. Para o mapa top-down atual, use primeiro os módulos de `02-feudal-japan/Tiles/` e os elementos naturais de `03-harmonious-seasons/`.
3. Mantenha o personagem de referência em 64×64 px e o grid do mundo em 32 px; não aumente sprites pequenos por escala de runtime.
4. O conteúdo de `03-harmonious-seasons/Characters/` é referência visual e não substitui o samurai jogável atual sem uma validação de estilo e colisão.
5. Verifique as licenças e os READMEs preservados em `Documentation/` antes de redistribuir qualquer asset fora do projeto.

## Procedência

Este mega pack reúne quatro fontes fornecidas pelo proprietário do projeto. O pack completo Feudal Japan é a fonte canônica dos tiles; o sample é mantido apenas para documentação e preview. Nenhum asset foi criado ou alterado neste processo.
