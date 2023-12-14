import { defineConfig } from "vitest/dist/config";

export default defineConfig({
  test: {},
  esbuild: {
    target: "node18",
  },
});
