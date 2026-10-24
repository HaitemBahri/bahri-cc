import { readdirSync } from "node:fs";

// Every built page as a route ("/en/", "/ar/404/"), read from dist/ so new pages are covered automatically.
// The root index.html is only the "/" → "/en/" redirect, so it is left out.
export const pages = readdirSync(new URL("../dist/", import.meta.url), { recursive: true, encoding: "utf8" })
  .filter((file) => /^(en|ar)\/(.+\/)?index\.html$/.test(file))
  .map((file) => `/${file.slice(0, -"index.html".length)}`)
  .sort();
