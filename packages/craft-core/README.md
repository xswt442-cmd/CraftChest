# @craftchest/craft-core

Craft 的最小、框架无关契约。它定义材料、Chest service 步骤、阶段结果、warning、artifact、生命周期和 hash 分享边界；不提供通用 runner，也不导入 Vue、`Tool.vue` 或路由。

每个具体 Craft 使用 `defineCraft()` 声明版本化配方，并自行把完整 UI 状态投影为可分享选项：

- `CraftInputMaterial.payload` 与 `CraftArtifact.payload` 仅驻留当前内存运行；
- `encodeCraftShareHash()` 只接收 recipe identity 与选项，无法接收材料或运行结果；
- 选项必须为 JSON 值，且拒绝文件/Blob 及 `material`、`artifact`、`content` 等敏感字段；
- 解码同时验证 Craft id、recipeVersion 和该 Craft 的精确选项 schema。旧版本只能由具体 Craft 显式迁移。

当存在两套真实 Craft 编排时，再从重复部分提取 runner；当前状态转换函数只管理生命周期标签。
