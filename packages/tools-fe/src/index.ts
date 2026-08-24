import type { ToolMeta } from '@craftchest/toolkit-core'

/**
 * fe 区 · 前端小工具集合包。
 *
 * 结构纪律（SPEC §3）：本包是纯集合包，只导出 defineTool() 结果数组，
 * 禁止依赖 app 壳、router 实例或任何全局单例。
 * 首批 fe 工具在 M2 落地（SPEC §5）。
 */
export const feTools: ToolMeta[] = []
