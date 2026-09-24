# CraftChest · 合成箱

简体中文 | [English](./README.en.md)

CraftChest 由成品工坊 Craft 与单项工具库存 Chest 组成。Craft 把输入材料加工成可直接使用的成果；Chest 中的工具可以单独使用，也能作为 Craft 的底层能力。

- **Craft · 成品工坊**：目前提供应用图标工坊与 Web 视觉配方，组合颜色、对比度和渐变并导出可直接使用的文件。
- **Chest · 单项工具**：中文工具（zh）与前端工具（fe），可独立打开并复用其纯函数能力。

## 特性

- 所有计算在浏览器内完成，无后端服务，无外部 API 调用
- 输入文件与正文只在当前浏览器会话中处理，不上传、不写入分享链接；仅显式选择的非敏感选项可以通过版本化 URL hash 分享
- 中英双语界面，默认中文
- 支持 PWA 安装，离线可用

## 技术栈

Vue 3 `<script setup>` + TypeScript · Vite · Tailwind CSS v4 · Pinia · vue-router · reka-ui · vue-i18n · vite-plugin-pwa · vitest

pnpm monorepo：`apps/toolbox` + `packages/{toolkit-core, craft-core, crafts-app-icon, crafts-web-visual, tools-zh, tools-fe, ui, config}`。`craft-core` 提供不依赖 Vue/路由的最小 Craft 契约；分享 hash 仅包含版本化配方与显式的非敏感选项，材料和产物只驻留内存。两个 Craft 均在浏览器本地运行，不增加第三方运行时依赖。

## 开发

环境要求：Node.js ≥ 22.12，pnpm 11。

```sh
pnpm install
pnpm dev          # 本地开发
pnpm build        # 生产构建
pnpm lint && pnpm check && pnpm test   # 代码检查 / 类型检查 / 单元测试
pnpm qa           # 构建产物的 QA 矩阵（需先 pnpm build）
```

## 部署

仓库使用 Cloudflare Workers Static Assets；`wrangler.jsonc` 声明构建产物目录和 SPA 回退，
不包含 Worker 脚本。当前 Worker `craftchest` 已绑定 `craftchest.xswt.fyi`，最近一次部署为手动发布。
GitHub Actions 只做代码检查、类型检查、单元测试和构建，不会部署 Worker；Workers Builds 的 Git 自动部署仍需单独配置。

开发与部署使用 Node `>=22.12`；Node 20 已结束官方维护，且当前 Wrangler / workerd
工具链已要求 Node 22。

本地预览与配置校验：

```sh
pnpm workers:dev
pnpm workers:dry-run
```

配置 Workers Builds 时建议使用：

- Production branch：`main`
- Build command：`pnpm build`
- Deploy command：`pnpm exec wrangler deploy`
- Root directory：`/`（仓库根目录）

Preview command 使用 `pnpm exec wrangler preview`；启用 Worker Previews 前需将 Wrangler
升级至 `4.135.0` 或更高版本。正式环境继续使用 `pnpm exec wrangler deploy`。

正式环境请设置 `CRAFTCHEST_SITE_URL=https://craftchest.xswt.fyi`，用于生成 `sitemap.xml`。

## License

[MIT](./LICENSE)
