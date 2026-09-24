import type { ToolMeta, ToolSection } from '@craftchest/toolkit-core'
import {
  assertUniqueToolIds,
  groupBySection,
  searchTools,
  sortTools,
} from '@craftchest/toolkit-core'
import { feTools } from '@craftchest/tools-fe'
import { zhTools } from '@craftchest/tools-zh'

/**
 * 应用将工具集合交给注册表；路由、侧栏菜单与搜索索引均由注册数据派生。
 */

const rawTools = [...zhTools, ...feTools]
// id 冲突会导致路由互相覆盖，启动即失败优于静默吞掉
assertUniqueToolIds(rawTools)

export const allTools: readonly ToolMeta[] = sortTools(rawTools)

export const sections: Record<ToolSection, ToolMeta[]> = groupBySection(rawTools)

export function searchAll(query: string): ToolMeta[] {
  return searchTools(rawTools, query)
}

export function findTool(section: ToolSection, id: string): ToolMeta | undefined {
  return allTools.find((tool) => tool.section === section && tool.id === id)
}
