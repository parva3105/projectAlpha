import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: [
      "lib/__tests__/**/*.test.ts",
      "components/__tests__/**/*.test.tsx",
    ],
    environmentMatchGlobs: [
      ["components/__tests__/**/*.test.tsx", "jsdom"],
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
