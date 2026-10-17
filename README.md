# Wuxia-MMO

## Documentação

- [GDD — Wuxia Top-Down em Pixel Art, versão 0.3](docs/GDD_Wuxia_v0.3.md)

## Assets do personagem

- [Pacote completo de animações do samurai (ZIP)](assets/characters/samurai/samurai-all-animations-pack.zip)

O pacote reúne caminhada, idle, ataques com espada e orbe de energia, e morte frontal. Inclui atlas, quadros PNG, prévias GIF e os JSONs de manifesto, animação, pipeline e QA. Os ataques em oito direções usam a ordem de linhas documentada no manifesto; a morte é frontal.

## Mundo e tilesets

- [Pack de mundo Wuxia — conteúdo, QA e pendências](assets/world/README.md)
- [Pack de mundo Wuxia (ZIP)](assets/packs/wuxia-world-pack-alpha.zip)
- [Inventário dos assets com SHA-256](assets/world/pack-index.json)
- [Contrato Phaser/TypeScript e eventos de servidor](docs/world-runtime-integration.md)
- [Catálogo de assets, licenças e plano de integração](docs/ASSET_CATALOG.md)

O núcleo inclui transições Dual Grid de 32×32, vinte mapas conectados e a vila de demonstração Qinghe. Está identificado como alpha vertical slice; o README do pack lista avisos de navegação e o conteúdo ainda não produzido.

## Cliente executável — primeira fundação

O repositório agora inclui um cliente Phaser + TypeScript mínimo em `src/client/`. Ele carrega `qinghe-valley`, instancia o protagonista predefinido com caminhada em oito direções, aplica câmera e colisões do mapa, exibe HUD/joystick virtual e permite testar portais com um adaptador local provisório. Esse adaptador **não é multiplayer nem servidor autoritativo**; ele existe somente para validar a integração do mundo antes do combate e da camada online.

### Executar localmente

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite. No desktop, use `WASD` ou as setas; em toque, use o joystick à esquerda. A tecla `E` e o botão `INTERAGIR` testam saídas quando o personagem está sobre um portal. Para validar a suíte completa e o build:

Na entrada, o cliente solicita tela cheia após o toque/clique do jogador e tenta travar a orientação em `landscape`. Em aparelhos mantidos na vertical, a camada de entrada pede que o usuário vire o dispositivo. A solicitação de tela cheia precisa ocorrer por gesto explícito porque essa é uma restrição dos navegadores móveis.

```bash
npm test
npm run typecheck
npm run build
```

O plano da etapa está em [`plan.md`](plan.md) e as entregas/pendências em [`TODO.md`](TODO.md). O próximo incremento é combate básico de espada e Qi com inimigo de teste; autenticação, persistência e MMO real continuam fora do protótipo local.

### Vila inicial de Qinghe

Qinghe foi reorganizada como uma vila inicial japonesa feudal/wuxia, usando somente os tiles e props já existentes. A praça central funciona como área de chegada e respawn; ao leste fica o mercado junto ao lago e à ponte; ao norte fica o pátio de alquimia; ao sul fica o pátio de forja. As quatro áreas já possuem IDs de interação no mapa para receber NPCs e sistemas de produção no futuro, sem fingir que esses sistemas já estão implementados.
