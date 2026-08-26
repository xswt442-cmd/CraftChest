import { defineTool } from '@craftchest/toolkit-core'

/** 拼音标注 · 工具元数据（四件套之一） */
export const pinyin = defineTool({
  id: 'pinyin',
  section: 'zh',
  title: { zh: '拼音标注', en: 'Pinyin' },
  description: {
    zh: '逐字注音并导出语义化 HTML ruby，支持三种声调格式与多音字。',
    en: 'Per-character pinyin with semantic HTML ruby export, tone formats, and polyphones.',
  },
  icon: 'lucide:speech',
  keywords: ['pinyin', '拼音', '注音', '多音字', 'ruby', 'HTML'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 20,
})
