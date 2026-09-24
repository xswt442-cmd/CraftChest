# CraftChest · 合成箱

简体中文 | [English](./README.en.md)

CraftChest 由两部分组成：Craft 把材料加工成可直接使用的成果，Chest 提供可单独使用、也可被 Craft 复用的工具。

## Craft 与 Chest

**Craft · 成品工坊**

- 应用图标工坊：生成 favicon、应用图标、manifest 与 ZIP 文件。
- Web 视觉配方：生成色阶、对比度建议、CSS 渐变与设计令牌。

**Chest · 单项工具**

- 中文工具（zh）与前端工具（fe），可独立使用。
- 纯函数服务可供其他 Craft 复用。

## 特性

- 所有计算均在浏览器本地完成，无后端服务或外部 API 调用。
- 输入文件与正文只在当前浏览器会话中处理，不上传，也不写入分享链接。
- 分享链接只包含用户显式选择的非敏感选项，并使用版本化 URL hash。
- 中英双语界面，默认中文；支持安装为 PWA 并离线使用。

## 技术栈

- **前端**：Vue 3 `<script setup>`、TypeScript、Vite。
- **界面**：Tailwind CSS v4、reka-ui、vue-router、vue-i18n。
- **离线与验证**：vite-plugin-pwa、Vitest。

## 仓库结构

- `apps/toolbox`：Vue 单页应用、页面路由与全局布局。
- `packages/tools-zh`、`packages/tools-fe`：按类别组织的 Chest 工具。
- `packages/crafts-app-icon`、`packages/crafts-web-visual`：独立 Craft 功能。
- `packages/toolkit-core`、`packages/craft-core`、`packages/color-core`：工具状态、Craft 契约与共享颜色算法。
- `packages/ui`、`packages/config`：共享 UI 组件与工程配置。

Craft 的材料和生成产物只保留在内存中。两个 Craft 都在浏览器本地运行，不增加第三方运行时依赖。

## 开发

环境要求：Node.js ≥ 22.12、pnpm 11。

```sh
pnpm install
pnpm dev
pnpm build
pnpm lint && pnpm check && pnpm test
```

构建后可运行本地 QA 矩阵，检查所有页面的路由、标题和横向溢出：

```sh
pnpm qa
```

QA 矩阵使用 [`apps/toolbox/route-catalog.json`](./apps/toolbox/route-catalog.json) 中的路由清单。

## 部署

应用部署为 Cloudflare Workers Static Assets，构建目录和 SPA 回退配置见 [`wrangler.jsonc`](./wrangler.jsonc)。

部署步骤：

1. 确认待部署的 `main` 提交已通过 CI。
2. 在 GitHub Actions 中手动运行 `Deployment` 工作流，并选择 `main` 分支。
3. 工作流会再次核对该提交的 CI 结果。部署需要仓库 secrets `CF_TOKEN` 和 `CF_ACCOUNT_ID`。

## License

[MIT](./LICENSE)
