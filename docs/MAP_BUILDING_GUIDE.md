# Guia de construção de mapas — Wuxia MMO

Guia de referência para construir mapas com aparência profissional, perspectiva coerente, contraste visual, proporções corretas e aproveitamento dos tilesets do repositório.

A ideia central: o mapa não deve parecer uma coleção de sprites espalhados. Ele precisa parecer um lugar construído intencionalmente, com profundidade visual, composição, caminhos naturais e identidade própria.

## 1. Regras fundamentais do projeto

- **Grade de 32 × 32 pixels.** Usar tiles de 32 × 32 como unidade de construção do cenário. Alinhar as peças à grade, sem esticar, deformar ou redimensionar individualmente os tiles.
- **Perspectiva top-down não isométrica.** Manter o mundo visto de cima, com orientação consistente entre terreno, telhados, vegetação, personagens e construções. Não misturar assets isométricos com top-down.
- **Coerência visual.** Priorizar os assets do pack escolhido para compor cada mapa. Preservar paleta, estilo de contorno, iluminação e escala; não misturar packs visualmente incompatíveis.
- **Planejamento antes dos detalhes.** Definir primeiro layout, caminhos, limites naturais, pontos de interesse e áreas jogáveis. Só depois trabalhar a decoração fina.

## 2. Perspectiva

A perspectiva precisa funcionar tanto visualmente quanto durante a movimentação do personagem.

- **Correto:** top-down. Telhados, caminhos, árvores e construções seguem uma projeção consistente; o chão forma uma superfície contínua.
- **Incompatível:** isométrico. Projeção inclinada e grade em losangos não devem ser misturadas com o sistema top-down do jogo.

### Regras práticas

- **Terreno:** grama, terra, areia e pedra devem se conectar sem mudanças bruscas de escala ou orientação.
- **Edificações:** usar os tiles de base, paredes, telhados e entradas previstos pelo próprio pack.
- **Árvores e bambus:** respeitar o ponto de origem e a área ocupada de cada objeto.
- **Personagens 64 × 64:** podem ser maiores que os tiles de 32 × 32. Não é erro: são duas escalas de arte diferentes, desde que a proporção aparente seja coerente.
- **Pés e colisões:** definir a colisão pela área em que o personagem realmente toca o chão, não pelo retângulo completo do sprite.
- **Altura visual:** telhados, copas e elementos altos podem ocupar várias células, mas precisam de ordem de desenho correta para o personagem passar à frente ou atrás deles conforme a posição.

Importante: não aumentar tiles de 32 × 32 para 64 × 64 apenas para combinar com o personagem. Compor o cenário com tiles originais e ajustar a escala visual e as regras de renderização.

## 3. Fluxo de trabalho

1. **Auditar o tileset:** identificar recursos, dimensões, variações e regras de composição.
2. **Layout-guia:** desenhar limites, praça, construções, rotas e zonas de combate.
3. **Construir o terreno:** aplicar texturas e resolver transições antes da decoração.
4. **Compor as estruturas:** posicionar casas, mercado, vegetação, cercas e pontos de referência.
5. **Trabalhar o contraste:** ajustar luminosidade, cores, densidade e silhuetas; conferir em escala de cinza.
6. **Implementar e testar:** verificar colisões, navegação, escala e renderização no jogo.
7. **Refinar:** corrigir repetições, emendas, áreas vazias sem propósito e pontos visualmente confusos.

## 4. Validação técnica no jogo

O mapa não está pronto apenas porque a imagem ficou bonita. Ele precisa funcionar durante a exploração.

| Verificação  | Critério de aprovação                                             |
| ------------ | ----------------------------------------------------------------- |
| Grade        | Tiles alinhados em células de 32 × 32                             |
| Perspectiva  | Todos os assets compatíveis com top-down                          |
| Escala       | Nenhum sprite ou tile deformado                                   |
| Colisões     | Paredes, árvores e obstáculos bloqueiam corretamente              |
| Navegação    | Rotas, portas e saídas podem ser atravessadas                     |
| Renderização | Personagem passa à frente e atrás dos objetos conforme necessário |
| Densidade    | Clareiras e espaços de combate permanecem livres                  |
| Contraste    | Praça, casas, caminhos e floresta são distinguíveis               |
| Repetição    | Não há padrões excessivamente óbvios ou emendas                   |
| Desempenho   | Mapa funciona na resolução e no dispositivo-alvo                  |

Se o projeto usar Phaser, verificar também as camadas de terreno, objetos, colisões e elementos superiores, além da ordenação de profundidade dos sprites.

## 5. Checklist de 14 itens — estado da vila Qinghe (Vale da Lua Serena)

Avaliação no ciclo 2 (commit `4f2bb4c`). "Sim" = verificado; "Parcial" = verificado em parte; "Não verificado" = ainda não testado.

| # | Item | Estado | Observação |
|---|------|--------|------------|
| 1 | Usa assets do pack definido, sem misturar estilos incompatíveis | Em revisão | A arquitetura deve usar o Mega Pack Feudal Japan e a natureza o Harmonious Seasons; compatibilidade de paleta e contorno será validada por região. |
| 2 | Perspectiva top-down e não isométrica | Sim | Conferido nas capturas. |
| 3 | Tiles de 32 × 32 alinhados, sem deformação | Não verificado | Assets em tamanhos variados (cabana 128 px, barraca 48 px). Alinhamento à grade não auditado. |
| 4 | Layout definido antes dos detalhes | Sim | Plano de composição registrado no kit (`layout_notes`). |
| 5 | Caminhos legíveis e conectando os pontos de interesse | Parcial | Estrada norte, eixo leste-oeste e caminhos de pedra visíveis; faltam ligações ao santuário. |
| 6 | Densidade variando entre áreas abertas, intermediárias e densas | Parcial | Praça aberta e bordas arborizadas; faixa intermediária não medida. |
| 7 | Contraste funciona em escala de cinza | Não verificado | Não houve teste em escala de cinza. |
| 8 | Construções integradas ao terreno | Parcial | Casas e barracas assentadas no chão; sombras e transições não auditadas. |
| 9 | Decoração sem repetições óbvias e emendas | Não verificado | Sakura e bambu se repetem no kit. |
| 10 | Personagens 64 × 64 com proporções coerentes | Parcial | Proporção aparente parece coerente nas capturas; sem comparação formal. |
| 11 | Colisões correspondem às bases dos objetos | Parcial | Colisores novos validados por teste de alcançabilidade; não conferidos item a item visualmente. |
| 12 | Vila com referências visuais, praça livre e saídas | Sim | Praça central livre; saídas norte, sul e oeste. |
| 13 | Campo inicial com espaço para lobos de nível 1 e combate | Sim | Seis pontos de caça validados por teste; lobos aparecem nas capturas. |
| 14 | Mapa testado dentro do jogo, não só como imagem | Sim | Testado no navegador, sem erros de página. |

Resumo: 5 Sim (itens 2, 4, 12, 13, 14), 6 Parcial (1, 5, 6, 8, 10, 11), 3 Não verificado (3, 7, 9). Próximos passos de validação: itens 3, 7 e 9.

## 6. Regra mais importante

Primeiro construa um espaço que faça sentido; depois faça esse espaço parecer vivo. Perspectiva correta, composição, contraste, circulação e coerência dos assets vêm antes da quantidade de detalhes.
