# bahri-cc

Architecture: [docs/architecture.md](docs/architecture.md).

- Monorepo; nothing language-specific at the root. Run pnpm with `--dir apps/web`.
- pnpm 11 runs dependency build scripts only if listed under `allowBuilds` in `apps/web/pnpm-workspace.yaml`.
- `astro check` does not support TypeScript 7; keep `typescript` on 6.
- `apps/web/src/styles/starwind.css` is the single design-token source.
- RTL: use logical utilities (`ms-`/`me-`/`ps-`/`pe-`, `start`/`end`), not left/right; physical positioning only when the direction must not mirror.
- Arabic placeholders are marked `TODO-AR`; `pnpm --dir apps/web check:i18n` lists them.
