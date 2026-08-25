import { defineTool } from '@craftchest/toolkit-core'

/** 简繁转换 · 工具元数据（四件套之一） */
export const opencc = defineTool({
  id: 'opencc',
  section: 'zh',
  title: { zh: '简繁转换', en: 'S/T Conversion' },
  description: {
    zh: '简体↔繁体：字级与台湾/香港词汇级转换，词典本地内嵌。',
    en: 'Simplified ↔ Traditional conversion with Taiwan/Hong Kong phrase variants.',
  },
  icon: 'lucide:arrow-left-right',
  keywords: ['opencc', '简繁', '繁體', '转换', 'traditional'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 30,
})
