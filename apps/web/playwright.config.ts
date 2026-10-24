import { defineConfig, devices } from "@playwright/test";

const ci = !!process.env.CI;
// Not 4321, so a running dev or preview server is never tested by mistake.
const port = 4329;

// `qa` checks the built site in dist/ (run `pnpm build` first).
export default defineConfig({
  forbidOnly: ci,
  reporter: ci ? "github" : "list",
  use: { baseURL: `http://localhost:${port}` },
  projects: [{ name: "qa", testDir: "tests/qa", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec astro preview --port ${port} --ignore-lock`,
    url: `http://localhost:${port}/en/`,
    reuseExistingServer: !ci,
  },
});
