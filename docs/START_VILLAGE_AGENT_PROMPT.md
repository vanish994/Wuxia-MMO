# Prompt para iniciar o desenvolvimento da vila Wuxia

Você é um agente sênior de desenvolvimento de jogos trabalhando diretamente no repositório GitHub `vanish994/Wuxia-MMO`.

## Objetivo principal

Reconstruir a primeira vila do MMORPG Wuxia do zero, começando pelo cenário e pela navegação. O resultado deve ser uma vila densa, bonita, atmosférica e jogável, com aparência profissional de pixel art top-down, sem perspectiva isométrica.

O repositório foi deliberadamente resetado para um estado-base: a aplicação deve começar com uma tela Phaser vazia e os assets foram preservados para uma nova integração. Não tente recuperar ou reutilizar o antigo mapa, HUD, combate, sistema de regiões ou layout Qinghe.

## Restrições de assets

Use somente os packs já disponíveis no projeto:

1. **Feudal Japan Complete 2D Mega Props Pack**
   - Fonte principal das construções e da arquitetura.
   - Priorizar fachadas de lojas, casa de chá, estalagem, barracas, templos, dojos, lanternas, poços, cercas, portões, estruturas de produção e elementos de mercado.

2. **Free Asset Pack de aproximadamente 16 MB**
   - Usar principalmente para terreno, grama, terra, caminhos, água, pedras, flores e preenchimento de base.

3. **Harmonious Seasons**
   - Usar para vegetação, árvores, arbustos, flores, grama alta, folhas, pedras e ambientação sazonal.
   - Preferir uma estação dominante para a primeira vila e usar variações somente quando mantiverem a coerência visual.

Também podem permanecer disponíveis os assets do personagem Samurai e os sprites originais de combate, mas o foco desta tarefa é a vila. Não implemente combate, HUD, NPCs ou economia nesta primeira etapa, exceto se forem necessários como marcadores visuais temporários.

### Assets proibidos nesta reconstrução

Não usar nem restaurar:

- PixelLab de cabanas e barracas removido anteriormente.
- OPP4 Village Tiles.
- Feudal Japan Nature antigo.
- Qualquer arte nova gerada por IA ou desenhada por código sem autorização explícita do usuário.
- Qualquer sprite esticado para corrigir incompatibilidade de escala.

Se faltar uma peça visual essencial, pare e informe qual asset está faltando. Não crie arte nova automaticamente.

## Regras visuais e técnicas obrigatórias

- Phaser 3 com TypeScript.
- Vite como build tool.
- Tela em landscape, responsiva e pronta para tela cheia.
- Perspectiva top-down, sem isometria.
- Grade base de **32×32 pixels**.
- Personagem de referência: **64×64 pixels**.
- Não redimensionar sprites individualmente de forma não uniforme.
- Construções principais devem ficar aproximadamente entre **128×128 e 192×192 pixels**, ou ocupar de 4×4 a 6×6 células visuais.
- Props menores devem respeitar seus pixels nativos.
- Manter nearest-neighbor/pixel art sem blur.
- Todas as posições devem ser alinhadas à grade quando isso não prejudicar o encaixe nativo do asset.
- As bases das construções devem ser legíveis e ter colisão somente na área física real, normalmente a fundação ou a frente da estrutura.
- Evitar áreas vazias grandes e evitar espalhar a vila como um conjunto de prédios isolados.
- Criar densidade por sobreposição controlada de fachadas, becos, barracas, jardins, cercas, lanternas, árvores e pequenas variações de terreno.

## Conceito da primeira vila

Criar uma vila compacta de influência wuxia com arquitetura japonesa feudal, sem tentar imitar uma cidade moderna.

A composição recomendada é:

- **Praça central:** área de chegada e circulação.
- **Mercado:** barracas cobertas, carrinhos, caixas, placas, lanternas e uma loja principal.
- **Casa de chá:** ponto visual principal próximo ao mercado.
- **Forja:** área lateral com espaço aberto, estruturas de oficina e elementos metálicos/industriais disponíveis no pack.
- **Alquimia:** pátio com vegetação, recipientes, bancada, loja ou interior compatível.
- **Dojo ou templo:** estrutura de destaque em uma área um pouco mais elevada ou protegida.
- **Área residencial:** fachadas menores e becos conectados ao núcleo.
- **Jardins e água:** usar Harmonious Seasons e os elementos de água disponíveis para quebrar a repetição do terreno.
- **Bordas naturais:** árvores e arbustos formando uma moldura, sem bloquear as rotas principais.
- **Saídas futuras:** deixar pelo menos quatro caminhos legíveis para futuras regiões, mas não criar regiões novas nesta tarefa.

A vila deve parecer viva mesmo sem NPCs: composição de comércio, produção, descanso, jardins, iluminação, caminhos e pequenas diferenças de altura visual.

## Processo obrigatório

### Fase 1 — Auditoria

1. Inspecione o estado atual do repositório.
2. Confirme que o cliente está no estado-base com cena vazia.
3. Liste os ZIPs e assets disponíveis nos três packs autorizados.
4. Não assuma nomes de arquivos; confirme os caminhos reais.
5. Verifique dimensões, transparência, paleta e provável escala dos assets relevantes.
6. Registre a origem e a licença declarada de cada asset escolhido.

### Fase 2 — Planejamento

Antes de escrever o mapa final, crie um documento de layout com:

- Dimensão do mundo em pixels e células.
- Praça central.
- Posição de cada distrito funcional.
- Rotas de navegação.
- Áreas de água.
- Bordas naturais.
- Pontos de colisão.
- Pontos de entrada e saídas futuras.
- Lista de assets escolhidos por função.
- Regras de profundidade/ordenação visual.

O mundo deve seguir a lógica de mapa aberto de MMORPG, não uma única tela compacta. Entretanto, o núcleo da vila precisa continuar denso e legível.

### Fase 3 — Montagem visual

1. Monte primeiro o terreno e os caminhos.
2. Monte a praça e as rotas principais.
3. Posicione as construções grandes do Feudal Japan.
4. Adicione mercado, casa de chá, forja, alquimia e dojo.
5. Faça a borda natural com Harmonious Seasons.
6. Adicione props pequenos para preencher sem poluir.
7. Use variação de posição, flip horizontal quando apropriado e mudanças de distância para evitar repetição óbvia.
8. Garanta que os pontos funcionais tenham contraste visual próprio.
9. Não coloque props apenas para preencher espaço: cada elemento deve reforçar uma área ou uma rota.

### Fase 4 — Integração Phaser

- Integrar o mapa na cena vazia existente.
- Manter a câmera em landscape e escala adequada para um personagem 64×64.
- Garantir nearest-neighbor e ausência de suavização.
- Implementar colisões básicas das construções, água e limites do mapa.
- Permitir movimentação simples do personagem Samurai apenas para validar escala e navegação.
- Não adicionar HUD ou combate nesta etapa.
- Criar pontos de spawn e marcadores internos para futura integração, sem implementar NPCs ainda.

### Fase 5 — QA

Validar obrigatoriamente:

- Build TypeScript/Vite.
- Carregamento de todos os assets usados.
- Ausência de imagens 404.
- Ausência de quadrados pretos ou placeholders.
- Escala visual do personagem contra construções.
- Colisão das construções e da água.
- Navegação entre praça, mercado, casa de chá, alquimia, forja e dojo.
- Pelo menos quatro rotas de saída futuras.
- Ausência de bolsões inacessíveis acidentais.
- Profundidade correta do personagem em relação às construções e árvores.
- Funcionamento em tela horizontal e viewport menor.
- `npm run typecheck`.
- `npm test`, caso existam testes no novo estado.
- `npm run build`.
- `git diff --check`.

Faça também uma inspeção visual no preview público do GitHub Pages depois do deploy. Se houver cache, use uma query string de versão para confirmar o build atual.

## Entregáveis esperados

Ao terminar esta etapa, entregue:

1. Cena Phaser funcional com a nova vila.
2. Mapa/layout versionado e editável.
3. Manifesto dos assets usados com origem e escala.
4. Documento curto explicando o layout e as decisões de composição.
5. Relatório de QA com dimensões, navegação, colisões e assets carregados.
6. Commit claro no GitHub.
7. Link do GitHub Pages atualizado.

## Critérios de aceitação visual

Não considere a vila pronta se ela:

- Parecer um campo vazio com prédios espalhados.
- Tiver prédios pequenos em relação ao personagem.
- Usar uma construção única esticada para parecer maior.
- Misturar estilos, escalas ou perspectivas incompatíveis.
- Tiver grandes espaços sem função.
- Tiver caminhos que não conectam os distritos.
- Tiver placeholders pretos, imagens ausentes ou props fora da escala.
- Parecer apenas um mockup estático sem navegação real.

O objetivo não é apenas fazer o jogo compilar. O objetivo é demonstrar, com os assets existentes, uma primeira vila wuxia densa, coerente, navegável e pronta para receber sistemas de NPC, economia, alquimia, forja, quests e combate em etapas posteriores.

## Forma de trabalho

Trabalhe diretamente no repositório. Faça alterações pequenas e verificáveis. Não publique arte nova sem pedir autorização. Ao encontrar uma decisão visual ambígua, prefira a alternativa mais reversível e registre-a no documento de planejamento.

Antes de encerrar, informe:

- O que foi implementado.
- Quais assets foram usados.
- Quais limitações permanecem.
- Quais comandos de QA passaram.
- O hash do commit.
- O link do GitHub Pages.
