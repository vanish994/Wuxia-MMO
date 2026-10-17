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
- [ ] Verificar a cena em navegador Android e registrar problemas de escala, toque e colisão.

## Movimento e combate básico — próximo incremento

- [ ] Extrair e registrar os efeitos das habilidades ativas **Moon Slash/Corte da Meia-Lua** (`sword-attack`) e **Onda de Qi** (`energy-orb-attack`) do pack do samurai.
- [ ] Fatiar os componentes CC0 do HUD Tiny RPG para barras, retrato e botões responsivos.
- [ ] O joystick move o personagem nas oito direções com diagonais normalizadas e soltar o controle interrompe o movimento.
- [ ] Colisões impedem atravessar obstáculos sólidos do mapa.
- [ ] Existe seleção de alvo com indicador visual e botão de ataque.
- [ ] O ataque de espada respeita alcance corpo a corpo.
- [ ] O ataque básico de Qi respeita alcance máximo.
- [ ] Um inimigo de teste possui HP, dano recebido, morte e reaparecimento controlado.

## Escopo explicitamente posterior

- [ ] Criar uma região de demonstração isolada com natureza feudal e validar escala/paleta antes de alterar Qinghe.
- [ ] Avaliar tiles de vila somente a partir das pastas autorizadas pelo aviso de licença do pacote.
- [ ] Moon Slash/Corte da Meia-Lua e Onda de Qi com cooldown, custo e área configuráveis por dados.
- [ ] Maestrias de Espada e Cultivo separadas.
- [ ] Persistência local e, depois, servidor autoritativo.
- [ ] Multiplayer compartilhado, autenticação, chat, grupos e PvP restrito.
