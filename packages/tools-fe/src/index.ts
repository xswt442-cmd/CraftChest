import type { ToolMeta } from '@craftchest/toolkit-core'
import { gradientGen } from './gradient-gen'
import { flexGridPlay } from './flex-grid-play'
import { easingCurves } from './easing-curves'
import { contrastChecker } from './contrast-checker'

/**
 * Chest 的前端工具集合包。
 *
 * 本包只负责导出 defineTool() 结果数组，
 * 禁止依赖 app 壳、router 实例或任何全局单例。
 */
export const feTools: ToolMeta[] = [gradientGen, flexGridPlay, easingCurves, contrastChecker]

export { contrastChecker, easingCurves, flexGridPlay, gradientGen }
