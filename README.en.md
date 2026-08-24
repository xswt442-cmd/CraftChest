# CraftChest

[简体中文](./README.md) | English

A fully client-side online toolbox with two sections:

- **zh · Chinese text tools**: pinyin annotation, Simplified/Traditional conversion, lunar calendar, RMB amount in words, etc.
- **fe · Front-end utilities**: gradient generator, flex/grid playground, and other visual debugging toys

## Features

- All computation runs in the browser — zero backend, zero external APIs
- Data stays on your device (localStorage / IndexedDB); no accounts
- Bilingual UI (Chinese / English), Chinese by default; installable PWA, works offline
- Restrained scope, personal use first

## Tech Stack

Vue 3 `<script setup>` + TypeScript · Vite · Tailwind CSS v4 · Pinia · vue-router · reka-ui · vue-i18n · vite-plugin-pwa · vitest

pnpm monorepo: `apps/toolbox` + `packages/{toolkit-core, tools-zh, tools-fe, ui, config}`

## Development

```sh
pnpm install
pnpm dev          # local dev server
pnpm lint && pnpm check && pnpm test   # full verification
```

## License

[MIT](./LICENSE)
