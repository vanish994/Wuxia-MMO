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
const gate = document.querySelector<HTMLElement>("#immersive-gate");
const startButton = document.querySelector<HTMLButtonElement>("#immersive-start");
const title = document.querySelector<HTMLElement>("#immersive-title");
const message = document.querySelector<HTMLElement>("#immersive-message");
const portraitQuery = window.matchMedia("(orientation: portrait)");

function isFullscreen(): boolean {
  return Boolean(document.fullscreenElement);
}

function updateImmersiveGate(): void {
  if (!gate || !title || !message) return;
  const portrait = portraitQuery.matches;
  title.textContent = portrait ? "Gire o aparelho" : isFullscreen() ? "" : "Jogue em tela cheia";
  message.textContent = portrait
    ? "Vire o aparelho para a horizontal para continuar."
    : isFullscreen()
      ? ""
      : "Para uma melhor experiência, use o jogo na horizontal e em tela cheia.";
  gate.classList.toggle("is-ready", isFullscreen() && !portrait);
}

async function enterImmersiveMode(): Promise<void> {
  const target = document.documentElement;
  try {
    if (!document.fullscreenElement) {
      const requestFullscreen = target.requestFullscreen
        ?? document.querySelector<HTMLElement>("#game-container")?.requestFullscreen;
      await requestFullscreen?.call(target, { navigationUI: "hide" });
    }
  } catch {
    // Browsers can reject fullscreen outside a trusted gesture; the game remains usable.
  }

  try {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: "landscape") => Promise<void>;
    };
    await orientation.lock?.("landscape");
  } catch {
    // iOS Safari and some desktop browsers do not expose orientation locking.
  }
  updateImmersiveGate();
}

startButton?.addEventListener("click", () => { void enterImmersiveMode(); });
// Some embedded previews and desktop browsers refuse fullscreen/orientation lock. Let the player continue
// in landscape instead of leaving the gate stuck. Portrait still blocks until the device is rotated.
const skipButton = document.querySelector<HTMLButtonElement>("#immersive-skip");
skipButton?.addEventListener("click", () => { gate?.classList.add("is-dismissed"); });
document.addEventListener("fullscreenchange", updateImmersiveGate);
portraitQuery.addEventListener?.("change", updateImmersiveGate);
updateImmersiveGate();

// Keep the game reference available to browser diagnostics without making it part of gameplay state.
Object.assign(window, { wuxiaGame: game });
