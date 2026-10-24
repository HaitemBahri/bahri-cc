import { expect, test } from "@playwright/test";
import { pages } from "../pages";

// No page scrolls sideways at phone, tablet, laptop or desktop width.
for (const width of [320, 768, 1024, 1280]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const path of pages) {
      test(path, async ({ page }) => {
        await page.goto(path);
        const { scrollWidth, clientWidth } = await page.evaluate(() => {
          const { scrollWidth, clientWidth } = document.documentElement;
          return { scrollWidth, clientWidth };
        });
        expect(scrollWidth, "horizontal overflow").toBeLessThanOrEqual(clientWidth);
      });
    }
  });
}
