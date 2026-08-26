# CraftChest · 合成箱

简体中文 | [English](./README.en.md)

纯前端在线工具箱，双分区：

- **zh · 中文文本工具**：拼音标注、简繁转换、农历公历互查、人民币大写、盘古之白、中文字数统计等 （开发中）
- **fe · 前端小工具**：渐变生成器、flex/grid 调试板等（开发中）

## 特性

- 所有计算在浏览器内完成，无后端服务，无外部 API 调用
- 用户数据仅存储于浏览器本地（localStorage / IndexedDB），无账号系统
- 中英双语界面，默认中文
- 支持 PWA 安装，离线可用

## 技术栈

Vue 3 `<script setup>` + TypeScript · Vite · Tailwind CSS v4 · Pinia · vue-router · reka-ui · vue-i18n · vite-plugin-pwa · vitest

pnpm monorepo：`apps/toolbox` + `packages/{toolkit-core, tools-zh, tools-fe, ui, config}`

## 开发

环境要求：Node.js ≥ 20.19，pnpm ≥ 9。

```sh
pnpm install
pnpm dev          # 本地开发
pnpm build        # 生产构建
pnpm lint && pnpm check && pnpm test   # 代码检查 / 类型检查 / 单元测试
pnpm qa           # 构建产物的 QA 矩阵（需先 pnpm build）
```

## 部署

仓库部署目标已切换为 Cloudflare Workers Static Assets；`wrangler.jsonc` 仅声明 assets，
不包含 Worker 脚本。SPA 未命中的路径会回退到 `index.html`；线上切换仍需完成下述 Git 集成
与独立域名发布步骤。

开发与部署使用 Node `>=22.12`；Node 20 已结束官方维护，且当前 Wrangler / workerd
工具链已要求 Node 22。

本地预览与配置校验：

```sh
pnpm workers:dev
pnpm workers:dry-run
```

Cloudflare Workers Builds 的 Git 集成建议配置为：

- Production branch：`main`
- Build command：`pnpm build`
- Deploy command：`pnpm exec wrangler deploy`
- Root directory：仓库根目录

非生产分支由 Workers Builds 生成预览部署。正式域名切换保持为独立发布步骤：先确认
Workers 预览 URL、SPA 深链与 PWA 更新均正常，再把现有自定义域名从 Pages 切到 Worker。

正式环境请设置 `CRAFTCHEST_SITE_URL` 为站点根 URL，用于生成 `sitemap.xml`；迁移期间仍保留
`CF_PAGES_URL` 作为 Pages 兼容回退。

## License

[MIT](./LICENSE)
