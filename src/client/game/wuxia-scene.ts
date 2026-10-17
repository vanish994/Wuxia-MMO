import Phaser from "phaser";

/**
 * Estado-base do projeto.
 * O mundo, HUD, combate e a vila foram removidos para a reconstrução começar do zero.
 * Assets e sprites permanecem no repositório, mas não são carregados nesta cena vazia.
 */
export class WuxiaScene extends Phaser.Scene {
  constructor() {
    super("wuxia-world");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0b1018);
  }
}
