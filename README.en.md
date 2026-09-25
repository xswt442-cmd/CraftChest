# CraftChest

[简体中文](./README.md) | English

[![CI](https://github.com/xswt442-cmd/CraftChest/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/xswt442-cmd/CraftChest/actions/workflows/ci.yml)
[![Deployment](https://github.com/xswt442-cmd/CraftChest/actions/workflows/deployment.yml/badge.svg?branch=main)](https://github.com/xswt442-cmd/CraftChest/actions/workflows/deployment.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

CraftChest has two parts: Craft turns inputs into ready-to-use outputs, while Chest provides standalone tools that Crafts can reuse.

## Craft and Chest

**Craft · finished outputs**

- App Icon Workshop: generate favicons, app icons, a manifest, and a ZIP archive.
- Web Visual Recipe: generate color ramps, contrast guidance, CSS gradients, and design tokens.

**Chest · standalone tools**

- Chinese tools (zh) and front-end tools (fe), each usable on its own.
- Pure service functions can be reused by other Crafts.

## Features

- All computation runs in the browser, with no backend service or external API calls.
- Input files and text stay in the current browser session; they are never uploaded or added to share links.
- Share links contain only explicitly selected, non-sensitive options in versioned URL hashes.
- Bilingual interface with Chinese as the default; installable PWA with offline support.

## Tech stack

- **Frontend:** Vue 3 `<script setup>`, TypeScript, and Vite.
- **UI:** Tailwind CSS v4, reka-ui, vue-router, and vue-i18n.
- **Offline support and validation:** vite-plugin-pwa and Vitest.

## Repository structure

- `apps/toolbox`: Vue single-page app, page routes, and global layout.
- `packages/tools-zh` and `packages/tools-fe`: Chest tools grouped by category.
- `packages/crafts-app-icon` and `packages/crafts-web-visual`: standalone Craft features.
- `packages/toolkit-core`, `packages/craft-core`, and `packages/color-core`: tool state, the Craft contract, and shared color algorithms.
- `packages/ui` and `packages/config`: shared UI components and engineering configuration.

Craft materials and generated artifacts stay in memory. Both Crafts run locally in the browser and add no third-party runtime dependencies.

## Development

Requires Node.js ≥ 22.12 and pnpm 11.

```sh
pnpm install
pnpm dev
pnpm build
pnpm lint && pnpm check && pnpm test
```

After building, run the local QA matrix to check routes, page headings, and horizontal overflow:

```sh
pnpm qa
```

The matrix reads its route list from [`apps/toolbox/route-catalog.json`](./apps/toolbox/route-catalog.json).

## Deployment

The app is deployed as Cloudflare Workers Static Assets. Build output and SPA fallback are configured in [`wrangler.jsonc`](./wrangler.jsonc).

To deploy:

1. Confirm CI passed for the `main` commit you want to deploy.
2. Manually run the `Deployment` workflow in GitHub Actions and select the `main` branch.
3. The workflow checks the CI result for that same commit. Deployment requires the `CF_TOKEN` and `CF_ACCOUNT_ID` repository secrets.

## License

[MIT](./LICENSE)
