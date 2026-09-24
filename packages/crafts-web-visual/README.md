# @craftchest/crafts-web-visual

Web 视觉配方将两种颜色与渐变设置组合为一套前端设计令牌：

- 两组 50–950 RGB 混色色阶，供设计起稿；
- 品牌色和辅助色在白色、深色背景上的 WCAG 对比度；
- 线性、径向或锥形 CSS 渐变；
- CSS Custom Properties、Tailwind CSS v4 主题与 DTCG JSON；
- 可独立下载的文件和完整 ZIP。

对比度与渐变计算复用 Chest 的纯函数 service。分享链接只包含颜色和渐变选项，不包含文本、文件或生成产物。
色阶使用零依赖 RGB 混色，提供起步参考，不声称具备感知均匀性。所有处理均在浏览器本地完成。
