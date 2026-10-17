import Phaser from "phaser";
import { WuxiaScene } from "./game/wuxia-scene";
import "./styles.css";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 1280,
  height: 720,
  backgroundColor: "#101925",
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  input: {
    activePointers: 3,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [WuxiaScene],
};

const game = new Phaser.Game(config);

// Keep the game reference available to browser diagnostics without making it part of gameplay state.
Object.assign(window, { wuxiaGame: game });
