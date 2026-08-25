# CraftChest 本地 QA Matrix

零额外依赖，用一个同源页面同时加载首页和全部工具页，自动检查：

- SPA 路由可访问；
- 页面 title 与 h1 存在；
- 当前 iframe 宽度下没有横向溢出；
- 375 / 768 / 1440 三档快速切换。

## 使用

```sh
pnpm build
pnpm qa # 即 node tests/qa/server.mjs
```

打开 `http://127.0.0.1:4174/__qa`。端口占用时可设置 `CRAFTCHEST_QA_PORT`。

这个矩阵负责高频 smoke/responsive 检查；涉及剪贴板、离线 Service Worker、键盘焦点顺序或具体表单结果时，仍需针对对应功能做浏览器交互验收。

> 维护约定：新增工具后，同步在 `harness.html` 的 `routes` 列表补一行。
