import { expect, test } from "@playwright/test";
import { pages } from "../pages";
import { pending } from "../pending";

// Pre-launch unless explicitly "false", like the edge function: every page needs the preview cookie.
test.beforeEach(async ({ context, baseURL }) => {
  test.skip(!baseURL, "SMOKE_BASE_URL is not set");
  const token = process.env.PREVIEW_TOKEN;
  if (process.env.PUBLIC_PRELAUNCH !== "false" && !token) throw new Error("PREVIEW_TOKEN is required before launch");
  if (token) await context.addCookies([{ name: "preview", value: token, url: baseURL }]);
});

for (const path of pages.filter((p) => !p.endsWith("/404/"))) {
  test(`${path} loads`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    // The holding page has no header, so this also proves the preview cookie worked.
    if (!path.endsWith("/coming-soon/")) await expect(page.locator("header")).toBeVisible();
  });
}

test("nav links work", async ({ page }) => {
  await page.goto("/en/");
  const nav = page.locator("header nav").first();
  await expect(nav).toBeVisible();
  const hrefs = await nav.getByRole("link").evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));
  for (const href of hrefs.filter((h) => !pending.routes.includes(h))) {
    await page.goto("/en/");
    await nav.locator(`a[href="${href}"]`).click();
    await expect(page).toHaveURL(href);
    await expect(page.locator("header")).toBeVisible();
  }
});

test("theme toggle switches dark mode", async ({ page }) => {
  await page.goto("/en/");
  const html = page.locator("html");
  const dark = (await html.getAttribute("class"))?.split(" ").includes("dark");
  await page.locator("[data-theme-toggle]:visible").first().click();
  await (dark ? expect(html).not.toHaveClass(/\bdark\b/) : expect(html).toHaveClass(/\bdark\b/));
});

test("language switch opens the Arabic page", async ({ page }) => {
  await page.goto("/en/");
  await page.locator('header a[hreflang="ar"]:visible').click();
  await expect(page).toHaveURL("/ar/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("unknown page returns 404", async ({ page }) => {
  const response = await page.goto("/en/does-not-exist/");
  expect(response?.status()).toBe(404);
});
