# Plano de desenvolvimento — Wuxia MMO

## Estado e decisão inicial

O repositório começa como um **pack de mundo alpha**: os 20 mapas, assets procedurais, contratos e loaders existem e passam a suíte Node, mas ainda não havia cliente Phaser executável. Esta primeira fatia preserva as decisões do GDD v0.3: navegador/PWA como alvo, Phaser + TypeScript, câmera top-down, protagonista predefinido, protótipo local e estado temporário.

O multiplayer, autenticação, persistência, combate e economia permanecem fora desta mudança. Portais usam um adaptador local explicitamente provisório para validar a integração do mundo sem fingir que existe um servidor autoritativo.

## Design da experiência

Estilos considerados:

- **Bruma de Jade** — pixel art de alto contraste, painéis azul-noite e acentos jade para comunicar disciplina marcial (probabilidade 0,06).
- **Pergaminho de Guerra** — interface clara, marfim e vermelho lacre, com molduras ornamentais para enfatizar narrativa (probabilidade 0,04).
- **Crepúsculo do Clã** — paleta violeta e âmbar, HUD mais dramático e efeitos fortes para priorizar combate (probabilidade 0,03).

Escolhido: **Bruma de Jade**.

- **Movimento visual:** pixel art top-down legível, com contraste entre terreno orgânico e UI escura.
- **Princípios:** leitura imediata do espaço, controles móveis sem hover, feedback discreto e identidade wuxia sem excesso ornamental.
- **Paleta:** azul-noite para superfícies de interface, jade para progresso/ação e marfim para texto; o mundo conserva a paleta própria dos tilesets.
- **Layout:** HUD ancorado nas bordas, deixando o centro livre para navegação; joystick à esquerda e ação contextual à direita.
- **Elementos de assinatura:** linhas finas jade, pequenos marcadores de região e barras segmentadas.
- **Interação:** o teclado acelera o desenvolvimento, mas toda ação essencial deve ter equivalente de toque.
- **Animação:** caminhada em oito direções, transições sem teleporte visual e partículas de clima com baixa opacidade.
- **Tipografia:** títulos em fonte sans condensada e textos em sans de sistema; hierarquia por peso, cor e espaçamento.
- **Essência:** uma jornada marcial contemplativa que começa pelo movimento e pela leitura do mundo; personalidade: disciplinada, atmosférica, responsiva.

## Arquitetura desta etapa

- `src/client/main.ts`: boot do Phaser, escala FIT e Arcade Physics.
- `src/client/game/wuxia-scene.ts`: composição da cena, carregamento do mundo, câmera, personagem, HUD e transição local provisória.
- `src/client/input/virtual-joystick.ts`: joystick virtual com vetor normalizado e suporte a resize.
- `src/client/world/phaser/`: loader de regiões e utilidades existentes, mantidos como camada de integração de dados/renderização.
- `assets/characters/samurai/runtime/`: subset explícito dos frames de caminhada usados pelo cliente; o ZIP original continua como fonte completa.
- `test/client/`: testes unitários pequenos para regras puras do input e `test/world/`: invariantes do pack de mundo.

## Próximo recorte após esta entrega

1. Validar movimento, colisões e portais em navegador móvel.
2. Separar regras de personagem em domínio independente da cena.
3. Implementar alvo, ataque básico de espada, ataque básico de Qi e inimigo de teste.
4. Só depois consolidar habilidades, progressão e salvamento local.

## Ciclo 1 — combate na Vale da Lua Serena (estado atual)

Auditoria registrada em 2026-10-17: o cliente inicia com `npm run dev`, carrega `WuxiaScene` e o mapa `qinghe-valley` sem erros de execução (verificado em Chromium headless); typecheck, testes e build passam; o build de produção com `VITE_BASE=/Wuxia-MMO/` carrega sem 404. Lacunas encontradas: personagem parado usava frame de caminhada, não havia combate, inimigos nem recursos de idle/ataque integrados, e o mapa ainda é o hub Qinghe.

Decisões desta etapa (reversíveis, documentadas no GDD, seção 20):

- Regras puras em `src/client/game/combat/combat-rules.mjs`; a cena apenas apresenta e encaminha. Um servidor futuro deve reexecutar essas regras.
- Números de balanceamento em `combat-config.mjs`, marcados como provisórios.
- Lobos têm IA por modo (`idle`, `chase`, `attack`, `return`, `dead`) decidida pela função `decideWolfAction`.
- Spawns validados por teste contra colisões reais e alcançabilidade a partir da chegada.

Arquitetura resultante:

- `src/client/game/character/directions.ts`: vocabulário de 8 direções e mapa de frames do lobo.
- `src/client/game/combat/`: configuração e regras.
- `src/client/game/entities/wolf.ts`: corpo físico, barra de vida e aplicação das decisões.
- `src/client/game/wuxia-scene.ts`: cena, HUD, controles e estado do jogador.

Próximo recorte: mapa dedicado da Vale da Lua Serena (camadas, dojo, botica, mercado, portão de caça), Onda de Qi com seleção de ponto e integração da animação de morte.
