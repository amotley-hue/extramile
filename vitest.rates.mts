import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Config for `npm run rates` only.
 *
 * The rate preview asserts nothing — it prints what the current rate card
 * produces for real Atlanta trips. Keeping it out of the main config means
 * `npm test` stays a pass/fail signal rather than a wall of numbers.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.check.ts"],
  },
});
