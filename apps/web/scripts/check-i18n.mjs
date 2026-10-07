// Lists every TODO-AR placeholder (Arabic content, data files, UI dictionary).
// Exits 0: placeholders are allowed until BUILD-1402. In GitHub Actions, prints warning annotations.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else files.push(path);
  }
};
walk(join(root, "src"));

const ci = process.env.GITHUB_ACTIONS === "true";
let count = 0;
for (const file of files) {
  const rel = relative(root, file);
  if (rel === "scripts/check-i18n.mjs") continue;
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (!line.includes("TODO-AR") || line.includes("start with TODO-AR")) return;
      count++;
      const text = line.trim();
      console.log(ci ? `::warning file=apps/web/${rel},line=${i + 1}::${text}` : `${rel}:${i + 1}: ${text}`);
    });
}
console.log(`${count} TODO-AR placeholder(s)`);
