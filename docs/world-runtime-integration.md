# Integração do mundo Wuxia — Phaser/TypeScript e contrato de rede

## Estado observado do repositório

O repositório tinha GDD, README, licença e o pack anterior de animações do samurai, mas **não tinha aplicação Phaser, TypeScript, `package.json`, cena client nem servidor/socket**. Por isso, esta entrega adiciona módulos cliente independentes e um contrato de integração; não declara combate, inventário, persistência ou MMO implementados.

## Phaser

Os módulos em `src/client/world/phaser/` são ES modules JavaScript com declarações `.d.mts` para importação por TypeScript. APIs usadas: loader de Tiled JSON, `addTilesetImage`, layers, `scene.add.image/zone`, Arcade Physics e partículas. A compatibilidade de execução com uma versão específica de Phaser precisa ser confirmada no projeto client.

Carregamento mínimo, dentro de uma cena Phaser:

```ts
import { preloadRegion, createRegion } from "./world/phaser/wuxia-region-loader.mjs";
import { worldAppearance } from "./world/phaser/wuxia-world-state.mjs";

// Carregue biome-index.json por HTTP antes de selecionar a região.
const worldIndex = await fetch("/assets/world/maps/biomes/biome-index.json").then((r) => r.json());
const queued = preloadRegion(this, worldIndex, "qinghe-valley", { assetRoot: "/" });
this.load.once("complete", () => {
  this.wuxiaRegion = createRegion(this, worldIndex, queued.region.id);
  this.worldLook = worldAppearance(this, this.wuxiaRegion.groundLayer, {
    season: "spring", hour: 17, weather: "petals"
  });
  this.wuxiaRegion.attachPlayer(this.player, {
    onPortal: (portal) => this.socket?.emit("world:transition:request", {
      regionId: this.wuxiaRegion.id, portalId: portal.id
    }),
    onInteraction: (object) => this.socket?.emit("world:interaction:request", {
      regionId: this.wuxiaRegion.id, objectId: object.id
    })
  });
});
this.load.start();
```

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
