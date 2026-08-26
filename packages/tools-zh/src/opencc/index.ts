import { defineTool } from '@craftchest/toolkit-core'

/** 简繁转换 · 工具元数据（四件套之一） */
export const opencc = defineTool({
  id: 'opencc',
  section: 'zh',
  title: { zh: '简繁转换', en: 'S/T Conversion' },
  description: {
    zh: '简繁与地区词汇转换，支持可编辑结果和逐字符差异视图。',
    en: 'S/T and regional phrase conversion with editable results and character-level diff.',
  },
  icon: 'lucide:arrow-left-right',
  keywords: ['opencc', '简繁', '繁體', '转换', 'traditional', 'diff', '差异'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 30,
})
