import { defineConfig, devices } from "@playwright/test";

const ci = !!process.env.CI;
// Not 4321, so a running dev or preview server is never tested by mistake.
const port = 4329;
const smokeURL = process.env.SMOKE_BASE_URL;

// `qa` checks the built site in dist/ (run `pnpm build` first); `smoke` checks the deployed site at SMOKE_BASE_URL.
export default defineConfig({
  forbidOnly: ci,
  reporter: ci ? "github" : "list",
  projects: [
    { name: "qa", testDir: "tests/qa", use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${port}` } },
    { name: "smoke", testDir: "tests/smoke", use: { ...devices["Desktop Chrome"], baseURL: smokeURL } },
  ],
  // Smoke runs need no local server.
  webServer: smokeURL
    ? undefined
    : {
        command: `pnpm exec astro preview --port ${port} --ignore-lock`,
        url: `http://localhost:${port}/en/`,
        reuseExistingServer: !ci,
      },
});
