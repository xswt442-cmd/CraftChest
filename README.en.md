# CraftChest

[简体中文](./README.md) | English

A fully client-side online toolbox with two sections:

- **zh · Chinese text tools**: pinyin annotation, Simplified/Traditional conversion, lunar calendar lookup, RMB amount in words, CJK-Latin spacing, character counting
- **fe · Front-end utilities**: gradient generator, flex/grid playground, and more (in development)

## Features

- All computations run in the browser — no backend services, no external API calls
- User data stays in browser storage (localStorage / IndexedDB); no accounts
- Bilingual UI (Chinese / English), Chinese by default
- Installable PWA, works offline

## Tech Stack

Vue 3 `<script setup>` + TypeScript · Vite · Tailwind CSS v4 · Pinia · vue-router · reka-ui · vue-i18n · vite-plugin-pwa · vitest

pnpm monorepo: `apps/toolbox` + `packages/{toolkit-core, tools-zh, tools-fe, ui, config}`

## Development

Requires Node.js ≥ 20.19 and pnpm ≥ 9.

```sh
pnpm install
pnpm dev          # local dev server
pnpm build        # production build
pnpm lint && pnpm check && pnpm test   # lint / type-check / unit tests
```

## Deployment

Static assets are hosted on Cloudflare Pages; pushing to `main` triggers an automatic build and deploy.

## License

[MIT](./LICENSE)
