import type { Component } from 'vue'

export { buildHashStateUrl, decodeHashState, encodeHashState, hasHashState } from './hash-state'
export { useHashShareState } from './use-hash-share-state'
export type { HashShareController, HashShareOptions, HashShareStatus } from './use-hash-share-state'

/** 工具分区标识 */
export type ToolSection = 'zh' | 'fe'

export interface ToolMeta {
  /** 全局唯一 kebab-case，如 'rmb-uppercase' */
  id: string
  /** 所属分区 */
  section: ToolSection
  title: { zh: string; en: string }
  description: { zh: string; en: string }
  /** iconify 图标名（构建期内联，运行时零外部请求） */
  icon: string
  /** 中英混合搜索关键词 */
  keywords: string[]
  /** 视图组件，动态 import 保证路由级代码分割 */
  component: () => Promise<Component>
  /** 同分区内排序权重，小的在前；缺省视为 100 */
  order?: number
}

export function defineTool(meta: ToolMeta): ToolMeta {
  return meta
}

const DEFAULT_ORDER = 100

function byOrderThenId(a: ToolMeta, b: ToolMeta): number {
  const oa = a.order ?? DEFAULT_ORDER
  const ob = b.order ?? DEFAULT_ORDER
  if (oa !== ob) return oa - ob
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

/**
 * 排序：order ?? 100 升序，同序按 id 字典序。
 * 返回新数组，不修改入参。
 */
export function sortTools(tools: readonly ToolMeta[]): ToolMeta[] {
  return [...tools].sort(byOrderThenId)
}

/** 按分区分组，各分区内已排序；两个分区键恒存在 */
export function groupBySection(tools: readonly ToolMeta[]): Record<ToolSection, ToolMeta[]> {
  const grouped: Record<ToolSection, ToolMeta[]> = { zh: [], fe: [] }
  for (const tool of sortTools(tools)) {
    grouped[tool.section].push(tool)
  }
  return grouped
}

/**
 * 全字段子串搜索：title / description / keywords，中英皆查，大小写不敏感。
 * 空白查询返回空数组（由调用方决定回退到全量列表）。
 */
export function searchTools(tools: readonly ToolMeta[], query: string): ToolMeta[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return sortTools(tools).filter((tool) =>
    [tool.title.zh, tool.title.en, tool.description.zh, tool.description.en, ...tool.keywords]
      .join('\n')
      .toLowerCase()
      .includes(q),
  )
}

/** 开发期防线：id 冲突会导致路由互相覆盖，启动时显式失败而不是静默吞掉 */
export function assertUniqueToolIds(tools: readonly ToolMeta[]): void {
  const seen = new Set<string>()
  const dupes = new Set<string>()
  for (const tool of tools) {
    if (seen.has(tool.id)) dupes.add(tool.id)
    seen.add(tool.id)
  }
  if (dupes.size > 0) {
    throw new Error(`工具 id 重复：${[...dupes].sort().join(', ')}`)
  }
}
