# CraftChest · 合成箱

简体中文 | [English](./README.en.md)

纯前端在线工具箱，双分区：

- **zh 区 · 中文文本工具**：拼音标注、简繁转换、农历、人民币大写等
- **fe 区 · 前端小工具**：渐变生成器、flex/grid 调试板等可视化调试玩具

## 特性

- 所有计算在浏览器完成——零后端、零外部 API
- 数据只存本地（localStorage / IndexedDB），无账号系统
- 中英双语 UI，默认中文；PWA 可安装、离线可用
- 功能克制，自用优先

## 技术栈

Vue 3 `<script setup>` + TypeScript · Vite · Tailwind CSS v4 · Pinia · vue-router · reka-ui · vue-i18n · vite-plugin-pwa · vitest

pnpm monorepo：`apps/toolbox` + `packages/{toolkit-core, tools-zh, tools-fe, ui, config}`

## 开发

```sh
pnpm install
pnpm dev          # 本地开发
pnpm lint && pnpm check && pnpm test   # 变更验证三连
```

## License

[MIT](./LICENSE)
