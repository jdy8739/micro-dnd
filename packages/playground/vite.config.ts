import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@micro-dnd/core": fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
      "@micro-dnd/react": fileURLToPath(new URL("../react/src/index.ts", import.meta.url)),
    },
  },
});
