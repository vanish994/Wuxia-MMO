# GDD — MMORPG Wuxia Top-Down em Pixel Art

**Versão:** 0.3 — decisões de plataforma, escopo e plano técnico consolidados  
**Status:** visão e requisitos iniciais definidos; implementação por fases com critérios de aceitação  
**Gênero:** MMORPG de ação e RPG wuxia com progressão de cultivo  
**Perspectiva e arte:** visão top-down, pixel art  

---

## 1. Visão do jogo

Um MMORPG wuxia de visão top-down em pixel art, centrado em **um personagem principal controlado pelo jogador**. O jogador percorre um mundo de artes marciais, enfrenta inimigos, aprimora sua técnica com a espada e desenvolve seu poder por meio do cultivo.

O lançamento começa com um escopo intencionalmente focado: **um caminho marcial — a espada — e um caminho de cultivo**. A estrutura de progressão deve permitir que novos caminhos de cultivo sejam adicionados no futuro, sem exigir que o conteúdo inicial seja refeito. Cada caminho deve oferecer uma direção de especialização própria.

### Fantasia do jogador

> “Sou um cultivador marcial que constrói sua própria jornada: treino a espada, avanço no cultivo e conquisto meu lugar em um mundo wuxia vivo.”

### Princípio de escopo

Começar pequeno e consistente: entregar uma experiência completa e interessante com espada e cultivo antes de expandir o elenco de novos caminhos de cultivo ou armas.

---

## 2. Pilares de design

1. **A espada é o caminho inicial completo.** O jogador deve sentir que está aprendendo e dominando um estilo, não usando um caminho incompleto.
2. **Cultivo e combate se complementam.** O cultivo aumenta o potencial do personagem; a espada transforma esse potencial em decisões e ações durante o combate.
3. **Progressão com escolhas.** O avanço deve oferecer decisões significativas, evitando que todo personagem termine idêntico.
4. **Mundo compartilhado.** A experiência é de MMO: encontrar outros jogadores, cooperar, competir de forma controlada e participar de atividades coletivas.
5. **Expansão planejada desde a base.** Caminhos de cultivo adicionais devem caber na arquitetura de progressão, cada um com uma direção de especialização própria, sem ampliar o escopo do primeiro lançamento.

---

## 3. Fantasia, ambientação e tom

- **Referência temática:** wuxia — artes marciais, mestres, escolas, rivalidades, honra, disciplina e busca por aperfeiçoamento.
- **Tom visual:** pixel art top-down, com leitura clara de personagens, ataques, efeitos e elementos interativos.
- **Mundo:** Japão feudal fantástico reinterpretado por uma fantasia marcial wuxia; nomes, regiões, facções e lore ainda serão definidos.
- **Narrativa:** a jornada individual do protagonista acontece dentro de um mundo compartilhado com outros jogadores.

**Ainda não definido:** regiões iniciais detalhadas, facções e premissa narrativa principal. O protagonista predefinido e a ambientação de Japão feudal fantástico estão decididos nesta revisão.

---

## 4. Estrutura do personagem

### 4.1 Personagem principal

O jogador controla um único personagem principal persistente. O personagem evolui ao longo do tempo e concentra atributos, habilidades, equipamentos e progresso de cultivo.

**Decisão da versão inicial:** utilizar um protagonista predefinido, com visual e animações fixos. A personalização visual fica fora do protótipo. A lógica de personagem deve permanecer separada dos recursos visuais para permitir personalização futura sem reescrever combate ou progressão.

### 4.2 Caminho inicial: Espada

A espada é o único caminho marcial disponível na primeira versão. Seu combate deve combinar:

- ataques básicos;
- habilidades ativas de espada;
- movimentação e posicionamento;
- gerenciamento de recursos de combate, caso o protótipo confirme que isso melhora a experiência;
- escolhas de especialização no combate com espada, sem introduzir outros caminhos marciais no lançamento inicial.

**Direção proposta:** permitir que o jogador personalize o uso da espada por meio de técnicas, melhorias e combinações de habilidades, sem criar classes tradicionais para esse caminho.

### 4.3 Caminho inicial de cultivo

A primeira versão oferece um único caminho de cultivo. O jogador poderá se especializar nessa direção; no futuro, outros caminhos devem oferecer escolhas distintas de desenvolvimento, sem serem tratados como classes tradicionais. O caminho deve ser uma progressão central, não apenas uma barra adicional de experiência.

Possíveis componentes a validar:

- prática ou meditação para acumular progresso;
- estágios de cultivo claramente reconhecíveis;
- requisitos ou recursos para avançar;
- benefícios aplicados a atributos, energia ou habilidades;
- risco, desafio ou decisão durante a tentativa de avanço, se isso for adequado ao ritmo do jogo.

Os nomes, regras, recursos e consequências do caminho ainda serão definidos. A primeira implementação deve priorizar clareza e diversão, evitando sistemas punitivos antes de testar o loop principal.

### 4.4 Atributos

Lista ainda em aberto. Sugestão para protótipo, sem compromisso: **Vida**, **Ataque**, **Defesa** e um recurso ligado às técnicas marciais ou ao cultivo. Os atributos definitivos devem ser poucos, compreensíveis e ter impacto perceptível.

---

## 5. Loop principal de jogo

### Loop de curto prazo

1. Explorar uma área ou aceitar uma atividade.
2. Encontrar inimigos, desafios ou recursos.
3. Lutar usando ataques, habilidades de espada e posicionamento.
4. Obter recompensas e materiais.
5. Melhorar equipamento, técnicas ou personagem.
6. Retornar ao mundo compartilhado e escolher o próximo objetivo.

### Loop de médio prazo

- completar missões e desafios;
- aprender ou aprimorar técnicas de espada;
- avançar nos estágios do caminho de cultivo;
- obter equipamentos e recursos melhores;
- participar de atividades em grupo;
- desbloquear novas áreas e desafios.

### Loop de longo prazo

- dominar o caminho da espada disponível;
- alcançar estágios avançados de cultivo;
- buscar equipamentos, técnicas e objetivos de prestígio;
- criar vínculos com jogadores, grupos ou facções;
- acompanhar expansões que acrescentem novos caminhos e conteúdo.

---

## 6. Combate

### Direção desejada

Combate de ação em tempo real, legível em visão top-down, com ênfase em posicionamento, tempo de execução e uso das técnicas de espada.

### Requisitos de design

- o jogador deve entender por que recebeu ou evitou dano;
- ataques e habilidades precisam de sinais visuais claros em pixel art;
- inimigos devem apresentar padrões reconhecíveis;
- o movimento deve continuar responsivo durante a luta;
- habilidades devem ter funções distintas, não apenas números diferentes;
- o combate contra inimigos comuns precisa ser rápido o suficiente para sustentar o ritmo de progressão.

### Escopo inicial proposto

- ataque básico de espada;
- esquiva ou deslocamento defensivo, a validar;
- algumas habilidades ativas com funções diferentes, por exemplo dano, aproximação e controle;
- conjunto pequeno de inimigos com padrões distintos;
- um inimigo de elite ou chefe para testar leitura e cooperação.

Números, custos, recargas, alcance e controles serão definidos após protótipo jogável.

---

## 7. Progressão

A progressão deve separar, de forma compreensível, três dimensões:

1. **Experiência do personagem:** avanço geral e desbloqueio de conteúdo.
2. **Domínio da espada:** aprendizado e aprimoramento de técnicas do caminho marcial.
3. **Cultivo:** avanço pelos estágios do caminho escolhido e acesso a melhorias próprias.

Essas dimensões podem se relacionar, mas não devem ser sistemas redundantes. O jogador deve saber qual atividade faz avançar cada uma e por que essa progressão importa.

### Recompensas possíveis

- desbloqueio ou melhoria de habilidades;
- melhorias de atributos;
- equipamento e materiais;
- acesso a áreas, missões ou desafios;
- reconhecimento social ou cosmético.

A progressão deve evitar depender exclusivamente de repetição sem decisão. Sempre que possível, atividades diferentes devem contribuir para objetivos diferentes.

---

## 8. Mundo e conteúdo

### Primeira versão jogável — proposta

- uma área inicial segura;
- uma área de combate ou exploração;
- NPCs essenciais: orientação/tutorial, missão e serviços básicos;
- missões introdutórias que ensinem combate, espada e cultivo;
- inimigos comuns e pelo menos um desafio de maior dificuldade;
- um espaço social ou ponto central compartilhado, se viável para a infraestrutura escolhida.

### Conteúdo futuro

- novas regiões e histórias;
- novas escolas, facções ou estilos;
- novos caminhos de cultivo;
- novos caminhos de cultivo;
- atividades de grupo, eventos e desafios de endgame.

---

## 9. Multiplayer e dimensão MMO

O jogo é concebido como um MMORPG, portanto a presença de outros jogadores deve ter propósito além de ocupar o mesmo mapa.

### Direções possíveis para o primeiro estágio

- jogadores visíveis em áreas compartilhadas;
- grupos para enfrentar desafios;
- troca ou economia entre jogadores, caso seja compatível com o escopo e a segurança do sistema;
- atividades sociais em um ponto central.

### Decisões ainda necessárias

- tamanho esperado das áreas e quantidade de jogadores por instância;
- combate PvP: inexistente, opcional, por áreas ou por modos específicos;
- grupos, guildas ou clãs no lançamento;
- comércio entre jogadores e regras contra abuso;
- abordagem de servidores, persistência e sincronização.

**Nota de escopo:** um MMO real exige arquitetura de rede, servidor autoritativo, persistência, segurança e operação contínua. A prova de conceito pode começar com combate e progressão locais ou multiplayer limitado, mas isso não deve ser confundido com o lançamento de um MMO completo.

---

## 10. Direção de arte e interface

- visão top-down;
- personagens e cenário em pixel art;
- silhuetas e cores distintas para facilitar a leitura em combate;
- efeitos de espada e cultivo visualmente claros, sem esconder inimigos ou avisos;
- interface com barras de vida e recurso, atalhos de habilidade, objetivo atual e indicadores de progresso;
- animações curtas e legíveis para ataques, dano, esquiva e interação.

Resolução-base, tamanho dos sprites, paleta, densidade de detalhes e referências artísticas ainda serão definidos.

---

## 11. Escopo por fases

### Fase 1 — Protótipo do núcleo

- movimentação top-down;
- combate básico de espada;
- um conjunto pequeno de habilidades;
- inimigos com padrões simples;
- primeira versão do caminho de cultivo;
- teste do ritmo entre lutar, ganhar recursos e aprimorar o personagem.

### Fase 2 — Vertical slice

- área inicial com identidade visual;
- tutorial e missões introdutórias;
- progressão jogável de espada e cultivo;
- inimigos variados e um desafio de chefe;
- interface e feedback visual consistentes;
- teste multiplayer limitado, se a tecnologia e o escopo permitirem.

### Fase 3 — Primeira versão de conteúdo

- expansão das áreas e atividades;
- economia e sistemas sociais definidos;
- persistência e infraestrutura adequadas ao modelo de MMO;
- equilíbrio e testes com jogadores;
- lançamento do primeiro conjunto de conteúdo, mantendo espada e um caminho de cultivo como foco.

### Fase 4 — Expansões

- avaliar e adicionar novos caminhos de cultivo, cada um com sua própria especialização;
- adicionar novos caminhos de cultivo e conteúdo;
- expandir o mundo sem comprometer o equilíbrio do caminho inicial.

---

## 12. Critérios de sucesso do protótipo

O protótipo será promissor se jogadores de teste:

- entenderem os controles e a leitura do combate sem explicação extensa;
- considerarem a espada divertida mesmo com apenas um caminho disponível;
- perceberem diferença entre melhorar a espada e avançar no cultivo;
- conseguirem identificar objetivos de curto prazo;
- demonstrarem vontade de continuar após os primeiros ciclos de combate e melhoria.

Métricas quantitativas e metas numéricas serão definidas depois que houver um protótipo testável.

---

## 13. Decisões em aberto para as próximas revisões

1. “Estilo Ark” significa inspiração em **ARK: Survival Evolved** (sobrevivência, coleta, criação e construção) ou apenas uma referência visual/de gênero diferente? O termo “pixel ark” pode ter mais de uma leitura.
2. O jogador cria um avatar próprio ou controla um protagonista de história já definido?
3. O combate será de ação com mira/ataques direcionais ou mais próximo de habilidades acionadas por atalhos?
4. O que significa “habilidade de primeira”: uma habilidade disponível desde o início, uma habilidade de primeiro nível ou uma habilidade específica?
5. Como funciona a especialização dentro de cada caminho de cultivo: aumenta atributos, libera técnicas, muda formas de combate ou combina essas opções?
6. O jogo terá PvP? Se sim, será opcional ou parte central da experiência?
7. Sobrevivência, coleta, fabricação e construção fazem parte do jogo, como em ARK, ou não são desejadas?
8. Qual plataforma é prioritária: PC, celular ou ambas?
9. Qual é o tamanho desejado para a primeira entrega: protótipo, demonstração ou MMO com persistência e servidores?

---

## 14. Resumo executivo

O projeto é um **MMORPG wuxia top-down em pixel art**, focado em um personagem principal cuja progressão combina **domínio da espada** e **cultivo**. A primeira versão terá apenas **um caminho marcial (espada)** e **um caminho de cultivo**. A prioridade de design é fazer esses dois sistemas formarem uma experiência satisfatória e expansível. No lançamento haverá um caminho de cultivo; caminhos adicionais, com especializações próprias, ficam para o futuro.


---

## 15. Decisões consolidadas da versão 0.3

Esta seção prevalece sobre perguntas e propostas anteriores que entrem em conflito com as decisões abaixo.

- **Plataforma:** jogo web, pensado prioritariamente para navegador móvel e instalável como PWA.
- **Motor 2D:** Phaser com TypeScript.
- **Câmera:** top-down.
- **Controle inicial:** joystick virtual. Controles por toque/clique para movimentar até um destino não fazem parte dos requisitos iniciais; podem ser avaliados depois.
- **Escopo inicial:** protótipo local antes do multiplayer.
- **Salvamento do protótipo:** temporário, sem persistência obrigatória entre sessões na primeira etapa. A camada de dados deve ser separada para permitir introduzir salvamento local e, depois, persistência no servidor.
- **Protagonista:** personagem predefinido, sem criador de personagem na primeira versão.
- **Ambientação:** Japão feudal fantástico com identidade wuxia própria.
- **Primeira versão online:** mundo compartilhado, acesso por conta, PvP restrito a zonas designadas, chat, amigos e grupos.
- **Hospedagem:** priorizar serviços gratuitos, dentro dos limites e políticas de uso de cada provedor. Não presumir disponibilidade gratuita permanente nem prometer capacidade de MMO de grande escala sem testes.
- **Escopo social excluído inicialmente:** guildas, correio, comércio entre jogadores e guerras de facções.

## 16. Arquitetura técnica prevista

### 16.1 Cliente e estrutura de código

- Phaser será responsável pela renderização 2D, cenas, câmera, sprites, animações, colisões e entrada do jogador.
- TypeScript será usado para tipagem e manutenção do código.
- Separar módulos de combate, atributos, progressão, inventário, inimigos, interface, carregamento de mapas e persistência.
- Separar regras do jogo da apresentação visual: a interface não deve decidir dano, recompensas ou progressão.
- Definir interfaces de repositório para o estado do personagem, de modo que o armazenamento temporário possa ser substituído por armazenamento local ou API de servidor.
- Usar unidades de mundo consistentes e escalonamento visual independente da resolução do aparelho.
- Manter assets e dados de jogo organizados por categoria, com licença registrada para assets externos.

### 16.2 Protótipo local

O protótipo funciona sem conta e sem servidor de jogo. Seu estado pode ser reiniciado ao recarregar ou fechar a sessão. Não deve simular persistência ou multiplayer como se fossem reais.

O armazenamento temporário é uma decisão deliberada de escopo, não uma solução final para o MMORPG. Antes de avançar para uma demonstração de maior duração, decidir se será introduzido salvamento local.

### 16.3 Preparação para o online

A versão online deverá introduzir um servidor autoritativo para validar movimento, combate, dano, recompensas, inventário e progressão. O cliente envia intenções/ações e apresenta o estado recebido; não é autoridade sobre resultados competitivos.

A arquitetura online deverá prever:

- autenticação segura por conta;
- persistência de personagem e progresso em banco de dados;
- sincronização de jogadores, inimigos e eventos do mundo;
- validação de ações e limites contra spam/abuso;
- reconexão e recuperação após queda de rede;
- comunicação em tempo real adequada ao jogo;
- observabilidade básica, logs e tratamento de erros;
- limites de jogadores por instância/área conforme testes e capacidade real da hospedagem.

A escolha de provedor, banco de dados e protocolo de rede será feita na fase de preparação online, após comparar cotas gratuitas, restrições de inatividade, limites de conexões, armazenamento, tráfego e termos de uso.

## 17. Plano de implementação e critérios de aceitação

### Fase 1 — Fundação do projeto

**Entregas**
- Projeto Phaser + TypeScript executável no navegador.
- Estrutura inicial de cenas, configuração de escala e carregamento de assets.
- Cena de teste top-down e protagonista provisório.
- Controles básicos por teclado apenas para desenvolvimento/testes, se úteis, sem substituir o requisito de joystick virtual no celular.
- Verificação inicial em navegador Android.

**Critérios de aceitação**
- O projeto inicia sem erros críticos no console.
- A cena carrega e redimensiona sem perder a área jogável.
- O personagem é renderizado com escala consistente e não fica preso fora da área de teste.
- Código de apresentação e regras de jogo ficam em módulos distintos.

### Fase 2 — Movimento e combate básico

**Entregas**
- Joystick virtual funcional.
- Movimento top-down com colisões básicas.
- Seleção de alvo, indicador visual e botão de ataque.
- Ataque básico de espada em alcance corpo a corpo.
- Ataque básico de Qi à distância, com alcance máximo.
- Um inimigo de teste com HP, dano recebido, morte e reaparecimento controlado para testes.
- HUD inicial com HP, Qi, alvo e botões de ação.

**Critérios de aceitação**
- O joystick move o personagem nas oito direções, incluindo diagonais normalizadas para que não sejam mais rápidas que o movimento cardinal.
- Soltar o joystick interrompe o movimento sem deixar entrada travada.
- Colisões impedem atravessar obstáculos sólidos.
- O ataque de espada só acerta dentro do alcance válido; o ataque de Qi respeita seu alcance máximo.
- Um alvo derrotado deixa de receber ataques e a interface atualiza seu estado.
- O jogador consegue movimentar-se e atacar sem congelamento intencional do personagem.
- Botões e joystick funcionam em tela móvel sem depender de hover ou teclado.

### Fase 3 — Habilidades e progressão

**Entregas**
- Habilidade ativa Moon Slash/Corte da Meia-Lua para espada.
- Habilidade ativa Onda de Qi com seleção de ponto no chão e área de efeito.
- Maestria de Espada e maestria de Cultivo separadas.
- Nível geral do personagem com impacto moderado.
- Recargas, custos de Qi quando aplicáveis, dano e defesa configuráveis por dados.
- Primeira rodada de testes de equilíbrio.

**Critérios de aceitação**
- Cada habilidade respeita recarga, alcance, área, custo e condições de uso.
- Moon Slash aplica dano apenas aos alvos válidos no arco frontal definido.
- Onda de Qi aplica dano a todos os inimigos dentro do raio no ponto escolhido, sem exigir que o alvo esteja selecionado.
- Maestria de Espada afeta apenas o caminho de Espada; maestria de Cultivo afeta apenas o caminho de Qi.
- Os resultados de dano são reproduzíveis com os mesmos atributos e condições.
- Fórmulas e coeficientes são dados/configurações identificáveis, não números espalhados pela interface.

### Fase 4 — Primeira fatia de mundo e conteúdo

**Entregas**
- Uma pequena vila inspirada no Japão feudal fantástico.
- Uma floresta de bambu ou região adjacente para combate.
- Caminhos, obstáculos, pontos de interesse e zona segura inicial.
- Pelo menos um tipo de inimigo básico e variação de dificuldade.
- Recompensas e inventário mínimos para sustentar o ciclo de combate.
- Interface visual coerente com a identidade do jogo.

**Critérios de aceitação**
- O jogador consegue sair da área inicial, encontrar inimigos, combater e retornar à vila.
- As transições entre áreas não provocam perda de controle nem erros fatais.
- Obstáculos, colisões e limites de mapa são consistentes.
- O conteúdo utiliza assets com origem e licença documentadas.
- A área funciona em tela móvel, com HUD sem cobrir controles essenciais.

### Fase 5 — PWA e testes de uso móvel

**Entregas**
- Manifesto da aplicação, ícones e metadados de instalação.
- Configuração HTTPS no ambiente publicado.
- Estratégia de cache para arquivos estáticos e versão dos assets.
- Tela de carregamento e mensagens de erro compreensíveis.

**Critérios de aceitação**
- O jogo pode ser instalado na tela inicial por um navegador compatível.
- A inicialização instalada e a inicialização pelo navegador abrem a cena correta.
- Atualizações de arquivos não deixam o cliente preso indefinidamente em assets antigos.
- Se não houver conexão, o jogo só promete funcionar offline na medida em que os recursos necessários estiverem efetivamente em cache; recursos online futuros devem mostrar estado de conexão.

### Fase 6 — Preparação e prova de multiplayer

**Entregas**
- Comparação documentada de provedores gratuitos para aplicação, API, banco e comunicação em tempo real.
- Serviço de autenticação e persistência de personagem.
- Servidor autoritativo para combate e estado competitivo.
- Sincronização de dois clientes numa região de teste.
- Estratégias de reconexão, validação de ações e logs.

**Critérios de aceitação**
- Dois clientes autenticados entram na mesma região e observam a presença e o movimento um do outro.
- O servidor valida os resultados de combate; manipular o cliente não permite definir dano ou conceder itens livremente.
- O progresso salvo pode ser recuperado após logout e reconexão.
- Uma desconexão não duplica recompensas nem cria múltiplas sessões conflitantes do mesmo personagem.
- Testes documentam latência, falhas conhecidas e limites da hospedagem gratuita.

### Fase 7 — Sistemas sociais e PvP controlado

**Entregas**
- Chat público da região e mensagens privadas.
- Solicitações e lista de amigos com presença online.
- Criar grupo, convidar, aceitar/recusar, sair e atualizar a lista de integrantes.
- Zonas PvP explícitas, com regras de entrada, saída e combate.
- Ferramentas básicas contra spam, assédio e abuso.

**Critérios de aceitação**
- Mensagens e ações sociais são validadas pelo servidor e respeitam limites de frequência.
- Apenas usuários autorizados conseguem enviar mensagens privadas ou alterar grupos.
- A lista de amigos e integrantes reflete mudanças de estado de forma consistente.
- PvP é desativado fora das zonas definidas, salvo decisão futura explícita no GDD.
- A entrada e saída de zona não permitem manter ataques PvP ativos fora dos limites autorizados.

## 18. Regras de escopo e qualidade

- Não implementar todas as regiões, chefes, guildas ou comércio entre jogadores antes de validar o loop central.
- Não declarar o jogo como MMO funcional enquanto não houver autenticação, servidor compartilhado, persistência e sincronização comprovadas.
- Não depender de serviços gratuitos sem verificar cotas e restrições atuais; desenhar a arquitetura para trocar de provedor quando possível.
- Manter o protótipo testável em etapas pequenas e registrar decisões e critérios de aceitação no repositório.
- Toda fase deve terminar com uma versão executável e uma lista explícita de limitações conhecidas.

## 19. Critério de saída do protótipo local

O protótipo local estará pronto para iniciar a preparação online quando:

1. o personagem movimentar-se com joystick em aparelho móvel;
2. espada e Qi funcionarem como caminhos distintos no mesmo personagem;
3. as duas habilidades ativas e as regras de alcance/recarga funcionarem;
4. inimigos puderem ser enfrentados, derrotados e reaparecerem em testes;
5. o jogador puder completar o ciclo básico de explorar, combater e receber recompensas;
6. não houver bloqueadores críticos de execução nos navegadores móveis testados;
7. os módulos de regras, interface e persistência estiverem separados o suficiente para substituir a execução local por uma autoridade de servidor.

A conclusão desta fase não significa que o multiplayer esteja pronto: ela apenas autoriza iniciar a fase de arquitetura e prova de conexão online.

---

## 20. Registro de decisões de implementação — ciclo 1 (Vale da Lua Serena)

Estas notas não alteram as decisões consolidadas da seção 15. Registram o que foi implementado e as escolhas provisórias.

### DD-1 — Ambientação visual da primeira área (divergência em aberto)

- **Pedido de produto:** a primeira área deve ser a vila **Vale da Lua Serena**, com identidade wuxia inspirada na China antiga.
- **Esta seção 15:** ambientação de *Japão feudal fantástico com identidade wuxia própria*.
- **Estado do repositório:** os tilesets, casas e árvores existentes são majoritariamente de estética japonesa (pagodes, portões, cerejeiras), com alguns edifícios de estética asiática genérica.
- **Decisão provisória:** a área jogável é o mapa existente de Qinghe, exibido com o nome Vale da Lua Serena. Não há novos assets de estilo chinês. **Confirmar com o responsável de design** qual estética prevalece antes de produzir os novos edifícios.

### DD-2 — Combate corpo a corpo e lobos

- Escopo do ciclo: espada corpo a corpo, sem Qi ativo ainda. O ataque acerta alvos no arco frontal de 120° e alcance de 64 px.
- Lobo Feroz nível 1: 40 HP, dano 6, defesa 1, detecção de 150 px, leash de 260 px, ataque a 34 px com cooldown de 1,2 s, respawn de 8 s, 12 XP e 1 Pele de Lobo.
- Jogador: 100 HP, dano base 18, defesa 2, respawn na praça após 3 s.
- Todos os números são **provisórios** e estão em `src/client/game/combat/combat-config.mjs`. Balanceamento deve ser feito após playtest.
- Progressão: XP por nível = 100 × nível atual. Maestria de Espada e Cultivo, previstas na seção 7, continuam fora deste ciclo.

### DD-3 — Limitações técnicas assumidas

- O combate roda no cliente. A lógica está separada em `combat-rules.mjs`, pronta para ser executada por um servidor autoritativo, mas nenhuma validação server-side existe.
- Morte e respawn são locais; nada é persistido entre sessões, conforme a seção 16.2.
- O lobo usa apenas o spritesheet de idle; o golpe é um avanço curto e o dano é mostrado por número flutuante.

### DD-4 — Sem portão de tela cheia

- O portão de entrada com botão de tela cheia e bloqueio de orientação foi removido a pedido do responsável pelo produto.
- Único aviso mantido: em retrato, pede para girar o aparelho para a horizontal. Em landscape o jogo fica liberado sem overlay.
- Consequência: o cliente não solicita tela cheia; o requisito de solicitação por gesto explícito da seção 17 (Fase 5/PWA) fica para ser reavaliado.
