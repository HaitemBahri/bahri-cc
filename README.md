# bahri-cc

Source for [bahri.cc](https://bahri.cc), a personal site in English and Arabic.

## Structure

- `apps/web/` — Astro static site
- `docs/` — architecture and runbooks

## Run the web app

Requires Node 24 and pnpm (version in `apps/web/package.json`).

```sh
pnpm --dir apps/web install
pnpm --dir apps/web dev
pnpm --dir apps/web build
```
