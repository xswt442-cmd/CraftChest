# @craftchest/crafts-app-icon

应用图标工坊的首个真实 Craft 实现。运行时只使用浏览器的 Canvas、Blob、`TextEncoder` 与下载 API：不引入 Sharp、WASM、JSZip 或服务端图像处理。

- 输入：一张 PNG，仅在当前内存会话中解码、诊断与渲染；不会写入 hash、localStorage、日志或网络。
- 输出：16/32/48 favicon PNG、180 Apple Touch、192/512 PWA `any` 与 `maskable`、多帧 ICO、manifest、HTML links 和 ZIP。
- 异步路由 chunk：生产构建中 `Craft-*.js` 约 21.2 kB / 8.2 kB gzip（不新增第三方运行时依赖）。
- favicon 与 PWA `any` 保留透明度；maskable 与 Apple Touch 按所选背景色铺底。
- maskable 默认内容缩进 22%，确保方形内容可以完整放入直径 80% 的平台安全圆；安全圆尺寸保持固定。
- 为限制 Canvas 内存峰值，输入上限为 25 MiB、8192 px 单边与 3200 万像素。

服务层的布局、ICO、ZIP 和派生文件可独立测试；`Craft.vue` 只负责本地输入、Canvas 适配、预览与下载。
