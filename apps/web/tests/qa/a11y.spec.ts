import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { pages } from "../pages";

// No serious or critical axe violations on any page, in either theme.
for (const colorScheme of ["light", "dark"] as const) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });

    for (const path of pages) {
      test(path, async ({ page }) => {
        await page.goto(path);
        // The theme follows the OS when nothing is stored.
        const html = expect(page.locator("html"));
        await (colorScheme === "dark" ? html.toHaveClass(/\bdark\b/) : html.not.toHaveClass(/\bdark\b/));

        const { violations } = await new AxeBuilder({ page }).analyze();
        const failures = violations
          .filter((v) => v.impact === "serious" || v.impact === "critical")
          .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
        expect(failures).toEqual([]);
      });
    }
  });
}
