# CraftChest · 合成箱

简体中文 | [English](./README.en.md)

纯前端在线工具箱，双分区：

- **zh · 中文文本工具**：拼音标注、简繁转换、农历公历互查、人民币大写、盘古之白、中文字数统计
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
```

## 部署

静态产物托管于 Cloudflare Pages，推送 `main` 分支自动构建部署。

## License

[MIT](./LICENSE)
