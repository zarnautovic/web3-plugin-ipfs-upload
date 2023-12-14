import { defineConfig } from "vitest/dist/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: "firefox",
      headless: true,
    },
  },
});
