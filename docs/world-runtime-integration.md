# Integração do mundo Wuxia — Phaser/TypeScript e contrato de rede

## Estado observado do repositório

O repositório tinha GDD, README, licença e o pack anterior de animações do samurai, mas **não tinha aplicação Phaser, TypeScript, `package.json`, cena client nem servidor/socket**. Por isso, esta entrega adiciona módulos cliente independentes e um contrato de integração; não declara combate, inventário, persistência ou MMO implementados.

## Phaser

Os módulos em `src/client/world/phaser/` são ES modules JavaScript com declarações `.d.mts` para importação por TypeScript. `wuxia-world-loader.ts` fornece a API de alto nível; ela usa o loader de Tiled JSON, `addTilesetImage`, layers, `scene.add.image/zone`, Arcade Physics e partículas. A compatibilidade de execução com uma versão específica de Phaser ainda precisa ser confirmada no projeto client.

### Loader TypeScript

Crie o adaptador dentro de uma cena Phaser e entre na região inicial. O `assetRoot` aponta para a raiz HTTP que contém a pasta `assets/`:

```ts
import { WuxiaWorldLoader } from "./world/phaser/wuxia-world-loader.js";

async create() {
  this.wuxiaWorld = new WuxiaWorldLoader(this, {
    assetRoot: "/",
    callbacks: {
      onPortalRequest: (request) => this.socket.emit("world:transition:request", request),
      onInteractionRequest: (request) => this.socket.emit("world:interaction:request", request),
    },
  });
  await this.wuxiaWorld.enterRegion("qinghe-valley", {
    player: this.player, spawnId: "arrival", season: "spring", hour: 17, weather: "petals",
  });
}
```

`enterRegion()` busca o `biome-index.json`, enfileira somente assets ausentes nos caches, espera o término do loader, cria o mapa/camadas/colisões, posiciona o jogador no spawn solicitado e atualiza os limites/seguimento da câmera. Em transições remotas, chame `enterRegion(regionId, { player, spawnId })` **somente após o servidor aceitar** `world:transition:request`; em rejeição ou aceite, chame `clearPortalLatch()`. Use `requestPortal("west-road-exit")` e `requestInteraction(objectId)` no input de interação: o pedido de portal exige que o jogador esteja na zona e se mova na direção de viagem configurada. `destroy()` libera camadas, props e efeitos visuais ao encerrar a cena. O adaptador não executa a transição nem substitui validação do servidor.

O loader espera que o servidor estático disponibilize `assets/world/maps/biomes/biome-index.json` e os caminhos relativos listados pelo índice. `assetRoot` pode ser, por exemplo, `"/game/"` quando os assets estiverem em um subdiretório.

O mapa embedded continua apontando para as imagens dentro da pasta `tiled/images/`; `biome-index.json` fornece esses caminhos. O loader desenha manualmente os tiles do tileset de coleção de imagens `props`, cria zonas invisíveis a partir da camada `collision` e expõe os objetos `portal`/`interaction`. Depth de props usa o `sortY` gravado pelo mapa. O jogo deve atribuir ao personagem depth coerente com a coordenada Y.

Para selecionar um tile Dual Grid no código, importe o manifest do tileset e use `selectCellTile(manifest, vertexGrid, x, y, variant)`. A ordem de vértices e a decisão do atlas estão em `assets/tilesets/documentation/dual-grid.md`; não assuma que o índice é o mask binário sem ler o manifest.

As utilidades `applySeasonTint`, `applyTimeOfDay` e `startWeather` criam tint e partículas runtime por código. São recursos visuais de cliente, não sistemas de gameplay/servidor e não foram validados numa cena Phaser real.

## Contrato de transição e interação para um backend futuro

**O servidor, não o cliente, deve decidir a transição e validar o estado.** O cliente usa os nomes de evento abaixo como proposta; nenhum socket handler está implementado nesta branch.

| Direção | Evento | Conteúdo mínimo |
|---|---|---|
| Client → Server | `world:transition:request` | `regionId`, `portalId`, `clientSeq` |
| Server → Client | `world:transition:accepted` | `regionId`, `spawnId`, `instanceId`, `serverTick`, `worldRevision` |
| Server → Client | `world:transition:rejected` | `reason`, `serverTick` |
| Client → Server | `world:interaction:request` | `regionId`, `objectId`, `clientSeq` |
| Server → Client | `world:interaction:result` | `objectId`, `resultCode`, `serverTick` |
| Client → Server | `actor:move:input` | `sequence`, direção normalizada, estado de botões |
| Server → Client | `actor:state` | posição e facing confirmados, `serverTick`, `sequenceAck` |
| Client → Server | `combat:action:request` | `actionId`, `targetId?`, `clientSeq` |
| Server → Client | `combat:action:result` | resultado validado, `serverTick`, cooldowns/recursos confirmados |

Antes de aceitar uma transição, o servidor deve verificar se o portal existe no bundle autorizado, se o jogador está dentro da área e se o spawn de destino é válido; deve evitar replay por `clientSeq` e carregar o destino a partir da lista de conexões do servidor. Interações e combate também precisam de validação de distância, cooldown e estado; colisão e posição do cliente são sugestões, não autoridade. Persistência, conta, inventário, grupos, chat e economia ficam fora deste pack e do GDD atual de protótipo local.

## Testes e limites

Execute `node --test test/world/wuxia-region-loader.test.mjs`. Essa suíte verifica 20 TMJ, assets referenciados, 62 conexões, spawns de destino, cobertura Wang, loaders e mocks de estação/clima. Ela **não substitui** build TypeScript nem teste em Phaser/browser; para isso, o projeto precisa inicializar o client e fixar a versão de Phaser.
