# Guia de Produção de Mapas Top-Down em Pixel Art
## Padrão obrigatório para agentes de IA — Wuxia-MMO

Este documento é a referência operacional para qualquer agente que planeje, construa, revise ou integre mapas no Wuxia-MMO. O agente deve segui-lo mesmo sem treinamento prévio sobre o projeto.

## 1. Objetivo e princípios

Produzir mapas top-down em pixel art com qualidade profissional, identidade Wuxia, leitura clara durante o gameplay, navegação funcional e consistência entre regiões.

Princípios inegociáveis:
- Planejar antes de decorar.
- Auditar e reutilizar os assets reais do repositório antes de criar ou substituir recursos.
- Preservar a perspectiva top-down, a escala dos sprites e a nitidez da pixel art.
- Separar composição visual, terreno, colisão e lógica de navegação.
- Não declarar algo implementado ou validado sem evidência real.
- Não criar mapas que sejam apenas terreno vazio com objetos espalhados aleatoriamente.

## 2. Contexto técnico do projeto

Antes de modificar arquivos, confirme o estado atual do projeto e leia os documentos relevantes. Comece por:
- `README.md`
- `docs/GDD_Wuxia_v0.3.md`
- `assets/world/README.md`
- `docs/world-runtime-integration.md`
- `docs/ASSET_CATALOG.md`

Confirme a existência e o conteúdo desses arquivos antes de depender deles. Examine também o mapa e o código de integração relacionados à tarefa.

Padrões conhecidos do projeto:
- MMORPG Wuxia 2D, top-down, pixel art.
- Cliente web baseado em Phaser + TypeScript.
- Tile base de mundo: 32×32 pixels, salvo se os metadados de um asset específico indicarem outra coisa.
- O mundo já contém mapas conectados e uma vila de demonstração chamada Qinghe; não presuma que o conteúdo esteja completo ou livre de defeitos.
- O pack de mundo utiliza transições Dual Grid de 32×32 para representar as 16 configurações de vizinhança. Antes de criar transições, leia a implementação e os metadados existentes; não invente uma convenção de índices ou orientação.
- A experiência deve continuar adequada a telas móveis.

O estado do repositório pode mudar. Trate os pontos acima como orientação inicial e verifique a implementação atual antes de agir.

## 3. Etapa A — Auditoria dos assets

Antes de editar:
1. Inspecione os diretórios de mapas, tilesets, sprites, metadados, colisões, cenas e renderização.
2. Confirme nomes, caminhos, dimensões, resolução dos tiles, origem, licença e função dos recursos usados.
3. Consulte manifestos, índices e arquivos JSON existentes para identificar atlas, animações, transições e relações entre assets.
4. Abra prévias visuais quando houver ferramentas disponíveis. Não avalie um tileset apenas pelo nome do arquivo.
5. Identifique tiles centrais, bordas, cantos, diagonais, transições, variantes decorativas e regras de autotiling.
6. Registre lacunas reais e proponha a menor adição de assets que resolva o problema.
7. Preserve arquivos compartilhados e compatibilidade retroativa. Não apague, renomeie ou substitua assets sem verificar dependências.

A auditoria deve distinguir claramente: recurso confirmado, recurso ausente e recurso ainda não inspecionado.

## 4. Etapa B — Briefing e layout

Antes de produzir detalhes, descreva:
- Tema, bioma, clima, atmosfera e história ambiental.
- Limites do mapa e área caminhável.
- Entradas, saídas, rotas principais e caminhos secundários.
- Pontos focais e marcos de orientação.
- Distribuição de construções, vegetação, rochas, água e decoração.
- Áreas de exploração, combate, descanso e interação com NPCs.
- Colisões previstas, gargalos e largura das passagens.
- Enquadramento da câmera e escala de gameplay.

Crie um blockout simples, com grandes massas e rotas, antes de posicionar objetos pequenos. Se o projeto ou as ferramentas permitirem, apresente uma prévia do layout antes de finalizar.

### Ordem de construção obrigatória
1. **Estrutura:** terreno, grandes áreas de vegetação, rios, elevações, construções e caminhos.
2. **Composição:** clareiras, cercas, pontes, rochas, jardins, ruínas, objetos médios e pontos focais.
3. **Acabamento:** flores, pedras pequenas, folhas, marcas no chão, musgo, rachaduras e variações discretas.

Não use detalhes para esconder problemas de layout.

## 5. Grid, escala e perspectiva

- Use 32×32 pixels como módulo de terreno padrão do projeto, após confirmar os assets concretos.
- Não force sprites de tamanhos diferentes a caber no grid por redimensionamento arbitrário.
- Preserve a nitidez dos pixels e evite blur ou escalonamento fracionário que deteriore a arte.
- Mantenha uma perspectiva top-down consistente em terreno, personagens, edifícios, árvores e objetos.
- Garanta proporções plausíveis entre personagem, portas, construções, vegetação e obstáculos.
- Alinhe arquitetura e objetos construídos ao grid quando fizer sentido; use deslocamentos controlados em elementos orgânicos.
- O grid serve à consistência, não deve tornar a natureza mecanicamente uniforme.

## 6. Terrenos, autotiling e Dual Grid

O terreno deve formar superfícies contínuas. Um tile isolado bonito não prova que o tileset funcione.

### Regras
- Use os tiles centrais, bordas, cantos e transições corretos.
- Teste combinações de vizinhança relevantes, incluindo encontros entre três ou mais tipos de terreno.
- Procure costuras visíveis, pixels soltos, lacunas, bordas duplicadas e mudanças bruscas de textura.
- Para Dual Grid, siga exatamente o contrato de dados, a ordem das máscaras e a convenção já implementada no projeto.
- Não assuma que a numeração dos 16 estados é universal: leia o código e os metadados do repositório.
- Não substitua o sistema de autotiling existente por outra abordagem sem necessidade comprovada e análise das dependências.
- Valide os resultados em uma cena real do Phaser, não apenas em uma montagem estática, sempre que possível.

## 7. Construções modulares e variação

Quando os assets permitirem, componha edifícios com módulos compatíveis:
- Telhados e beirais.
- Paredes, cantos, portas e janelas.
- Fundações, escadas, plataformas e detalhes.
- Elementos decorativos específicos do cenário.

Verifique continuidade estrutural, coerência de perspectiva, acesso às portas e compatibilidade das colisões. Não invente módulos que não existem.

### Espelhamento
Flip horizontal ou vertical é permitido somente após verificar:
- Direção da luz e das sombras.
- Formas e marcas assimétricas.
- Continuidade das bordas.
- Elementos que têm orientação definida.

Não espelhe automaticamente todos os tiles.

### Vegetação
- Crie agrupamentos com tamanhos, densidades e silhuetas variados.
- Alterne áreas densas e clareiras.
- Use deslocamentos para reduzir padrões repetitivos.
- Evite fileiras regulares, espaçamento uniforme e cópias idênticas evidentes.
- Mantenha rotas navegáveis e espaço suficiente para combate.

## 8. Valores, contraste e hierarquia visual

Quando possível, avalie a composição primeiro em escala de cinza.

Priorize a leitura nesta ordem:
1. Personagem, inimigos e elementos interativos.
2. Construções, obstáculos e marcos importantes.
3. Terreno e decoração de baixa prioridade.

Use silhueta, luminosidade, contraste local e cores de destaque para separar elementos. Não escureça todo o fundo artificialmente e não dependa apenas da diferença de matiz para comunicar importância.

Testes obrigatórios:
- Ver a cena no zoom real de gameplay.
- Ver uma versão reduzida.
- Ver em escala de cinza, se possível.
- Conferir se personagens e inimigos continuam distinguíveis em cada tipo de terreno.

## 9. Iluminação, materiais e paleta

Defina uma direção de luz predominante e mantenha-a consistente.

- Use sombras e realces para sugerir volume sem excesso de ruído visual.
- Aplique musgo, lama, desgaste, rachaduras e sujeira somente onde forem plausíveis.
- Neve, se existir no cenário, deve se acumular principalmente em superfícies superiores, como telhados, galhos e rochas.
- Use uma paleta limitada e compartilhada entre assets relacionados.
- Diferencie materiais por valor, matiz, saturação e textura.
- Reserve cores de destaque para marcos e elementos de gameplay.
- Contornos coloridos podem substituir preto puro se a legibilidade for preservada.
- Se usar uma base em escala de cinza com camada Color, inspecione o resultado manualmente; o modo de mistura não substitui a revisão da paleta.
- Confira a leitura em telas pequenas.

Uma paleta limitada deve gerar coesão, não monotonia.

## 10. Composição profissional

Aplique conscientemente:
- **Contraste:** varie áreas abertas e densas, claras e escuras, simples e detalhadas.
- **Pontos focais:** crie marcos que ajudem o jogador a se orientar.
- **Ritmo visual:** varie formas e espaçamentos sem recorrer ao caos.
- **Profundidade:** use sobreposição, sombras e separação de valores coerentes com a perspectiva.
- **Espaço negativo:** preserve áreas livres para movimentação, combate e descanso visual.
- **Narrativa ambiental:** mostre a função, história ou condição do local por meio do layout e dos objetos.
- **Controle de densidade:** não preencha todos os espaços vazios.

Evite tanto grandes extensões sem interesse quanto excesso de detalhes que esconda o gameplay.

## 11. Navegação, colisões e gameplay

O mapa só está completo quando funciona dentro do jogo.

Verifique, conforme aplicável:
- Colisões alinhadas aos objetos visíveis.
- Rotas com largura suficiente para o personagem e os controles móveis.
- Entradas, saídas e portais identificáveis.
- Ausência de bloqueios invisíveis inexplicados.
- Espaço adequado para movimentação e combate.
- Decoração sem obstruir a leitura de personagens e inimigos.
- Câmera e zoom apropriados para a tela móvel.
- Separação correta entre camada visual e camada de colisão conforme a arquitetura do projeto.

Teste a navegação real no Phaser quando o ambiente permitir. Uma imagem estática não comprova colisões ou jogabilidade.

## 12. Disciplina de implementação

1. Identifique os arquivos e dependências antes de modificar.
2. Siga as convenções de nomes, formatos e arquitetura existentes.
3. Faça alterações pequenas, rastreáveis e reversíveis.
4. Não invente caminhos, APIs, formatos de mapa ou metadados.
5. Não substitua mapas funcionais sem justificativa e proteção adequada.
6. Execute testes e verificações pertinentes após a alteração.
7. Se houver preview executável, inspecione o resultado depois da implementação.
8. Não afirme que os testes passaram sem executá-los.
9. Não afirme que a qualidade visual foi validada se não foi possível ver o resultado.
10. Se estiver bloqueado, informe o arquivo, dado ou ferramenta que está faltando e proponha o próximo passo concreto.

## 13. Checklist de aceitação

### Integridade técnica
- [ ] Arquivos, dimensões e metadados foram confirmados.
- [ ] Tiles e transições conectam corretamente.
- [ ] Não há lacunas, sobreposições ou costuras não intencionais.
- [ ] Escala e perspectiva são coerentes.
- [ ] Colisões e rotas foram verificadas quando aplicável.

### Qualidade visual
- [ ] O layout foi planejado antes dos detalhes.
- [ ] Existem pontos focais e espaço negativo.
- [ ] A paleta e a iluminação são coerentes.
- [ ] Repetições evidentes foram reduzidas.
- [ ] Silhuetas e volumes são legíveis.
- [ ] A cena funciona no zoom de gameplay e em telas móveis.

### Entrega
- [ ] Os arquivos modificados estão listados.
- [ ] Os testes executados e seus resultados são informados.
- [ ] As limitações não verificadas estão explícitas.
- [ ] Há uma prévia ou evidência visual, se disponível.
- [ ] Nenhuma validação foi alegada sem evidência.

## 14. Formato de resposta obrigatório para tarefas de mapa

Para tarefas substanciais, o agente deve apresentar:

1. **Auditoria de assets:** recursos confirmados, arquivos usados e lacunas.
2. **Plano de composição:** zonas, caminhos, pontos focais e elementos principais.
3. **Plano de implementação:** arquivos a alterar e estratégia de integração.
4. **Validação:** testes executados, inspeções visuais e problemas corrigidos.
5. **Entrega:** arquivos modificados, evidências ou preview, resultados e pendências.

Para ajustes pequenos, seja conciso, mas indique a mudança e a validação realizada.

## Critério final

Considere o mapa concluído somente quando ele for coeso, legível, visualmente bem composto, consistente com os assets e a perspectiva do projeto e funcional no gameplay. Se algum ponto não puder ser verificado, marque-o explicitamente como **não verificado**.
