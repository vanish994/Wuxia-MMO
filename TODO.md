# TODO — Wuxia MMO

## Fundação executável do cliente — em andamento

- [x] O projeto inicia como aplicação Phaser + TypeScript executável pelo navegador com `npm run dev`.
- [x] A cena carrega a região inicial `qinghe-valley` através do loader de mundo existente.
- [x] O protagonista predefinido é renderizado com frames de caminhada em oito direções.
- [x] O protótipo oferece joystick virtual para toque e teclado apenas como apoio de desenvolvimento.
- [x] A câmera acompanha o personagem e os limites físicos do mapa são aplicados após o carregamento.
- [x] HUD inicial exibe região, HP, Qi e instruções de movimento/interação.
- [x] Portais podem ser solicitados e carregados localmente para testar a integração; o código deixa explícito que isso será substituído pelo servidor autoritativo.
- [x] O cliente inicia com composição 16:9, solicita tela cheia após gesto do usuário e tenta bloquear a orientação em landscape.
- [x] Em portrait, a entrada bloqueia a continuação e orienta o jogador a girar o aparelho.
- [ ] Verificar a cena em navegador Android real (o ambiente de testes usa Chromium headless com viewport móvel; não substitui aparelho).

## Ciclo 1 — Vale da Lua Serena, lobos e combate corpo a corpo (concluído localmente)

- [x] Idle (4 quadros × 8 direções) e ataque com espada (`sword-attack`) extraídos do pacote do samurai para `assets/characters/samurai/runtime/`; o personagem usa idle quando parado (antes congelava o frame de caminhada).
- [x] Lobo Feroz de nível 1 com o spritesheet real de `docs/Lobo_Feroz_estilo_wuxia-Idle` (8 direções) em `assets/characters/wolf/runtime/`.
- [x] Atributos do lobo, do jogador, spawns da caça, alcances, cooldowns, respawn e XP centralizados em `src/client/game/combat/combat-config.mjs`.
- [x] Lógica de combate, IA do lobo (ocioso, perseguição, retorno à área, ataque com cooldown) e progressão em `combat-rules.mjs`, sem dependência de Phaser.
- [x] Seis lobos nos pontos de caça ao redor da praça; colidem com colisões do mapa e do kit da vila.
- [x] Ataque por botão ATACAR (toque), tecla J ou Espaço; acerta apenas alvos no arco frontal de 120° e alcance de 64 px.
- [x] Barra de HP por lobo, flash de dano, números de dano flutuantes e HP/XP do jogador no HUD.
- [x] Morte do lobo: +12 XP e +1 Pele de Lobo; respawn do lobo após 8 s no mesmo ponto.
- [x] Morte do jogador: retorno à praça após 3 s com HP cheio.
- [x] Testes Node: regras de combate/IA/XP (`test/client/combat-rules.test.mjs`) e alcance/colisão/reachability dos spawns sobre o TMJ real (`test/world/hunt-spawns.test.mjs`).
- [ ] Validar o ataque em aparelho Android real.
- [ ] Qi (`energy-orb-attack`) ainda não é usado: o slot "2 ONDA QI" continua apenas visual.
- [ ] Animação de dano/morte do personagem: o pacote tem `death-front`, ainda não integrado.
- [ ] Os lobos não têm animação de caminhada/ataque própria (o sheet só tem idle em 8 direções); o golpe é indicado por um avanço curto.
- [ ] Botão de ataque ainda não está ligado ao slot 1 da barra de habilidades.

## Movimento e combate básico — pendências de HUD e controles

- [ ] Fatiar os componentes CC0 do HUD Tiny RPG para barras, retrato e botões responsivos.
- [x] O joystick move o personagem nas oito direções com diagonais normalizadas e soltar o controle interrompe o movimento.
- [x] Colisões impedem atravessar obstáculos sólidos do mapa.
- [ ] Seleção de alvo com indicador visual (hoje o ataque é em arco, sem seleção).
- [ ] O ataque básico de Qi respeita alcance máximo (depende de Onda de Qi, ainda não implementada).

## Vale da Lua Serena — mapa planejado (pendente)

- [ ] Recompor o layout em camadas, com praça, casas, dojo, botica, mercado, portão para a caça e área externa dedicada. Hoje a área jogável é o hub Qinghe já existente, exibido com o nome Vale da Lua Serena.
- [ ] Mais de um tipo de edifício com telhados chineses: os assets do repositório são majoritariamente japoneses (ver decisão DD-1 no GDD).
- [ ] Tratar o bolsão de área caminhável isolada no canto inferior direito do mapa (aviso `unreachable_walkable_area`).
- [ ] NPCs e santuário de respawn com interação própria.

## Escopo explicitamente posterior

- [ ] Criar uma região de demonstração isolada com natureza feudal e validar escala/paleta antes de alterar Qinghe.
- [ ] Avaliar tiles de vila somente a partir das pastas autorizadas pelo aviso de licença do pacote.
- [ ] Moon Slash/Corte da Meia-Lua e Onda de Qi com cooldown, custo e área configuráveis por dados.
- [ ] Maestrias de Espada e Cultivo separadas.
- [ ] Persistência local e, depois, servidor autoritativo.
- [ ] Multiplayer compartilhado, autenticação, chat, grupos e PvP restrito.
