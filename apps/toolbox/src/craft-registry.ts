import type { Component } from 'vue'
import type { CraftMeta } from '@craftchest/craft-core'
import { appIconCraft } from '@craftchest/crafts-app-icon/meta'
import { webVisualCraft } from '@craftchest/crafts-web-visual/meta'

export interface CraftEntry {
  meta: CraftMeta
  icon: string
  keywords: readonly string[]
  component: () => Promise<Component>
}

export const allCrafts: readonly CraftEntry[] = [
  {
    meta: appIconCraft,
    icon: 'lucide:image',
    keywords: ['favicon', 'pwa', 'maskable', 'apple touch', 'png', '图标', '应用图标'],
    component: () => import('@craftchest/crafts-app-icon/Craft').then((module) => module.default),
  },
  {
    meta: webVisualCraft,
    icon: 'lucide:palette',
    keywords: [
      'brand color',
      'color palette',
      'design tokens',
      'tailwind',
      'dtcg',
      'gradient',
      '品牌色',
      '配色',
      '色阶',
      '渐变',
      '设计令牌',
    ],
    component: () => import('@craftchest/crafts-web-visual/Craft').then((module) => module.default),
  },
]

export function findCraft(id: string): CraftEntry | undefined {
  return allCrafts.find((craft) => craft.meta.id === id)
}

export function searchCrafts(query: string): CraftEntry[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []
  return allCrafts.filter((craft) =>
    [
      craft.meta.title.zh,
      craft.meta.title.en,
      craft.meta.description.zh,
      craft.meta.description.en,
      ...craft.keywords,
    ]
      .join('\n')
      .toLowerCase()
      .includes(normalized),
  )
}
