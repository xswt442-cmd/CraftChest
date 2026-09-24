# CraftChest

[简体中文](./README.md) | English

CraftChest has two connected parts: Craft turns inputs into ready-to-use outputs, while Chest holds standalone tools that Crafts can reuse.

- **Craft · finished outputs**: the App Icon Workshop and Web Visual Recipe turn images and colors into ready-to-use files.
- **Chest · standalone tools**: Chinese tools (zh) and front-end tools (fe), each usable on its own and reusable through its pure service functions.

## Features

- All computations run in the browser — no backend services, no external API calls
- Files and user text stay in the current browser session and are never uploaded or placed in share links; only explicitly selected, non-sensitive options can be shared in versioned URL hashes
- Bilingual UI (Chinese / English), Chinese by default
- Installable PWA, works offline

## Tech Stack

Vue 3 `<script setup>` + TypeScript · Vite · Tailwind CSS v4 · Pinia · vue-router · reka-ui · vue-i18n · vite-plugin-pwa · vitest

pnpm monorepo: `apps/toolbox` + `packages/{toolkit-core, craft-core, crafts-app-icon, crafts-web-visual, tools-zh, tools-fe, ui, config}`. `craft-core` supplies a minimal Craft contract with no Vue or router dependency; share hashes contain only a versioned recipe and explicit non-sensitive options, while materials and artifacts remain in memory. Both Crafts run in the browser with no added third-party runtime dependency.

## Development

Requires Node.js ≥ 22.12 and pnpm 11.

```sh
pnpm install
pnpm dev          # local dev server
pnpm build        # production build
pnpm lint && pnpm check && pnpm test   # lint / type-check / unit tests
pnpm qa           # QA matrix over the built output (run after pnpm build)
```

## Deployment

The repository targets Cloudflare Workers Static Assets through `wrangler.jsonc`, without a Worker
script. The `craftchest` Worker is attached to `craftchest.xswt.fyi` and was most recently deployed
manually. GitHub Actions runs quality checks only; it does not deploy the Worker. Workers Builds
Git integration still needs to be configured.

Recommended Workers Builds settings:

- Production branch: `main`
- Build command: `pnpm build`
- Deploy command: `pnpm exec wrangler deploy`
- Root directory: `/` (repository root)

Use `pnpm exec wrangler preview` for branch previews after upgrading Wrangler to `4.135.0` or newer;
use `pnpm exec wrangler deploy` for production. Set `CRAFTCHEST_SITE_URL` to
`https://craftchest.xswt.fyi` so the build emits `sitemap.xml` with the canonical domain.

## License

[MIT](./LICENSE)
