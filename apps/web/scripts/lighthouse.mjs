// Runs Lighthouse CI (lighthouserc.json) on Home and Contact in dist/ with Playwright's Chromium (run `pnpm build` first).
import { spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";
import { pending } from "../tests/pending.ts";

const routes = ["/en/", "/en/contact/"].filter((route) => !pending.routes.includes(route));
const { status } = spawnSync("lhci", ["autorun", ...routes.map((route) => `--collect.url=http://localhost${route}`)], {
  stdio: "inherit",
  env: { ...process.env, CHROME_PATH: chromium.executablePath() },
});
process.exit(status ?? 1);
