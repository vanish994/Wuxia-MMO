# Wuxia Phaser world modules

Esses módulos são um adaptador de carregamento de assets para integrar ao client Phaser/TypeScript; não são uma aplicação completa.

- `wuxia-region-loader.mjs`: preloads TMJ e PNGs, cria camada ground, props de image-collection, zonas de colisão e triggers.
- `dual-grid.mjs`: consulta Wang manifests na ordem `TL, TR, BL, BR` e valida cobertura.
- `wuxia-world-state.mjs`: tint por estação/horário e partículas runtime (chuva, neve, pétalas, cinzas, neblina).
- arquivos `.d.mts`: tipos estruturais para TypeScript, sem exigir import de tipos Phaser nesta pasta.

Índice de assets: `assets/world/maps/biomes/biome-index.json`. Exemplo de uso e contrato de eventos: `docs/world-runtime-integration.md`.

A suíte Node usa mapas reais e mocks, mas a aplicação não foi aberta no Phaser: o repositório ainda não inclui versão Phaser, package manager, client ou bundler. Confirme a API da versão Phaser que o projeto vier a adotar e rode visualmente a cena. As colisões Tiled estão em retângulos aproximados; faça playtest antes de produção.
