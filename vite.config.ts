import { defineConfig } from "vite";

const runtimeProcess = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};
const pagesBase = runtimeProcess.process?.env?.VITE_BASE ?? "/";

export default defineConfig({
  base: pagesBase,
  server: {
    host: "0.0.0.0",
    fs: { strict: true },
  },
  preview: {
    host: "0.0.0.0",
  },
  build: {
    target: "es2022",
    assetsInlineLimit: 0,
  },
});
