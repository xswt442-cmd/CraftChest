import type { ToolMeta } from '@craftchest/toolkit-core'
import { rmbUppercase } from './rmb-uppercase'

/**
 * zh 区 · 中文文本工具集合包。
 *
 * 结构纪律（SPEC §3）：本包是纯集合包，只导出 defineTool() 结果数组，
 * 禁止依赖 app 壳、router 实例或任何全局单例。
 */
export const zhTools: ToolMeta[] = [rmbUppercase]

export { rmbUppercase } from './rmb-uppercase'
