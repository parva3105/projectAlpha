import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: [
      "lib/__tests__/**/*.test.ts",
      "components/__tests__/**/*.test.tsx",
      "app/**/*.test.tsx",
    ],
    environmentMatchGlobs: [
      ["components/__tests__/**/*.test.tsx", "happy-dom"],
      ["app/**/*.test.tsx", "happy-dom"],
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
