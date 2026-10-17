# QA — Qinghe Valley / generate2dmap

Execução final do pipeline `generate2dmap` após a migração de Qinghe para um mapa aberto estilo MMORPG.

## Resultado final

| Verificação | Resultado |
|---|---:|
| Dimensão do mundo | 1792×1152 px |
| Escala lógica | tiles 32×32 px; personagem 64×64 px |
| Rota dos objetivos | 10/10 alcançáveis |
| Spawns válidos | 5/5 |
| Saídas válidas | 4/4 |
| Bolsões inacessíveis | 0 |
| Thin gaps | 0 |
| Portais fora do mundo | 0 |
| Preview de cena | PASS |
| Assets ausentes | 0 |

## Correções aplicadas

Qinghe deixou de ser uma tela compacta com a vila ocupando quase todo o enquadramento. O novo mundo tem bordas abertas, rotas longas para os quatro pontos cardeais, três áreas de água e um núcleo de serviços menor. Os distritos foram espalhados para que o jogador atravesse o mapa em vez de encontrar todos os prédios agrupados no centro.

O kit usa cabanas de 128×128 px e barracas de 48×48 px, todos em pixels nativos. A decoração estrutural foi convertida para props `solid: false`: o mapa continua vivo sem transformar elementos visuais em paredes invisíveis.

## Limitações registradas

O preview autocontido foi montado com sucesso, mas a verificação headless com Playwright continua não instalada no ambiente. A cena Phaser do cliente deve ser a referência visual final para cabanas, barracas e props externos do kit.

O diagnóstico de mídia reporta `scipy` e `resvg-py` ausentes. Não houve geração de arte nova nesta execução; todo o trabalho visual reutiliza os assets existentes no repositório.

## Artefatos

- `nav-report.json`: relatório final de navegação.
- `nav-grid.json`: grade usada pelo verificador.
- `nav-debug.png`: visualização de colisão e rotas.
- `scene-preview.html`: preview autocontido do bundle.
- `scene-preview-qa.json`: envelope do preview.
- `doctor.json`: diagnóstico da rota de mídia.
