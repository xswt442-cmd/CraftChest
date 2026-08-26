# CraftChest

[简体中文](./README.md) | English

A fully client-side online toolbox with two sections:

- **zh · Chinese text tools**: pinyin and Ruby export, editable S/T diff, lunar calendar lookup, RMB amount in words, Chinese copy formatting, and character counting
- **fe · Front-end utilities**: gradient generator, Flex/Grid playground, easing curves, and contrast checking

## Features

- All computations run in the browser — no backend services, no external API calls
- User text is neither persisted nor uploaded; theme, locale, recent tools, and explicitly shared options stay in browser storage or the URL hash
- Bilingual UI (Chinese / English), Chinese by default
- Installable PWA, works offline

## Tech Stack

Vue 3 `<script setup>` + TypeScript · Vite · Tailwind CSS v4 · Pinia · vue-router · reka-ui · vue-i18n · vite-plugin-pwa · vitest

pnpm monorepo: `apps/toolbox` + `packages/{toolkit-core, tools-zh, tools-fe, ui, config}`

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

The repository now targets Cloudflare Workers Static Assets through `wrangler.jsonc`, without a
Worker script. Production is still served by Cloudflare Pages until Workers Builds, preview, PWA,
and custom-domain checks are complete.

Recommended Workers Builds settings:

- Production branch: `main`
- Build command: `pnpm build`
- Deploy command: `pnpm exec wrangler deploy`
- Root directory: repository root

Set `CRAFTCHEST_SITE_URL` to the production site root so the build can emit `sitemap.xml` with the
canonical domain. `CF_PAGES_URL` remains a migration fallback.

## License

[MIT](./LICENSE)
