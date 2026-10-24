// Checks the SEO metadata of every built page in dist/ (run `pnpm build` first).
// Exits 1 on any failure. In GitHub Actions, prints error annotations.
import { readFileSync } from "node:fs";
import { pages } from "../tests/pages.ts";
import { pending } from "../tests/pending.ts";

const dist = new URL("../dist/", import.meta.url);
const ci = process.env.GITHUB_ACTIONS === "true";
// Error and holding pages must not be indexed.
const noindexPages = /\/(404|coming-soon)\/$/;

const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map(([tag]) => attributes(tag));

let failures = 0;
for (const route of pages) {
  const file = `${route.slice(1)}index.html`;
  const html = readFileSync(new URL(file, dist), "utf8");
  const meta = tags(html, "meta");
  const links = tags(html, "link");
  const metaContent = (name) => meta.find((m) => m.name === name)?.content?.trim();

  const problems = [];
  if (!html.match(/<title>([^<]*)<\/title>/)?.[1].trim()) problems.push("missing <title>");
  if (!metaContent("description")) problems.push("missing meta description");
  if (!pending.seoLinks) {
    if (!links.some((l) => l.rel === "canonical" && l.href)) problems.push("missing canonical link");
    for (const lang of ["en", "ar", "x-default"]) {
      if (!links.some((l) => l.rel === "alternate" && l.hreflang === lang && l.href)) problems.push(`missing hreflang="${lang}"`);
    }
  }
  if (noindexPages.test(route) && !metaContent("robots")?.includes("noindex")) problems.push("missing robots noindex");

  for (const problem of problems) {
    failures++;
    console.log(ci ? `::error file=apps/web/dist/${file}::${route}: ${problem}` : `${route}: ${problem}`);
  }
}

console.log(`${pages.length} page(s) checked, ${failures} problem(s)`);
if (failures) process.exit(1);
