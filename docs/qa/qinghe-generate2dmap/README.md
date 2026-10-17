# QA — Qinghe Valley / generate2dmap

Execução do pipeline `generate2dmap` sobre o bundle publicado de Qinghe.

## Resultado

- `map_nav.py check`: **WARN**, com todas as rotas funcionais alcançáveis.
- Spawns válidos: **5/5**.
- Interações alcançáveis: **10/10**.
- Saídas alcançáveis: **4/4**.
- Portais fora do mundo: **0**.
- Thin gaps: **0**.
- `build_scene_preview.py`: **PASS** na montagem e resolução dos assets.
- Assets externos ao preview: **0**.
- Arte ausente: **0**.

## Warnings registrados

1. `unreachable_walkable_area`: **10 bolsões / 30 células**. São pequenos bolsões decorativos isolados próximos de bordas, árvores e massas d’água; não contêm spawn, interação, portal ou rota funcional.
2. `browser-verify`: **SKIPPED** porque o pacote Playwright não está instalado no ambiente. A revisão de runtime Phaser foi feita separadamente no navegador público do jogo.
3. O diagnóstico de mídia reporta `scipy` e `resvg-py` ausentes. Não houve geração de arte nova nesta execução; a vila usa exclusivamente assets existentes.

## Artefatos

- `nav-report.json`: relatório completo de navegação.
- `nav-grid.json`: grade usada pelo verificador.
- `nav-debug.png`: visualização de colisão e rotas.
- `scene-preview.html`: preview autocontido do bundle.
- `scene-preview-qa.json`: envelope do preview.
- `doctor.json`: diagnóstico de capacidade da rota de mídia.
