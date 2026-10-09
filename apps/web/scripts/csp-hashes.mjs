// Prints the CSP hashes ('sha256-…') of every inline <script> in dist/**/*.html on one line,
// for `cdk deploy WebStack -c cspScriptHashes=…`. Run after `pnpm build`.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dist = new URL("../dist", import.meta.url).pathname;
if (!existsSync(dist)) {
  console.error("dist/ not found; run `pnpm build` first");
  process.exit(1);
}

const html = readdirSync(dist, { recursive: true })
  .filter((file) => file.endsWith(".html"))
  .map((file) => readFileSync(join(dist, file), "utf8"));

const hashes = new Set();
for (const page of html) {
  for (const [, attrs, body] of page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/i.test(attrs)) continue;
    hashes.add(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
  }
}

console.log([...hashes].sort().join(" "));
