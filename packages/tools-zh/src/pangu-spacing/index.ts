import { defineTool } from '@craftchest/toolkit-core'

/** 中文排版规范化 · 工具元数据（四件套之一） */
export const panguSpacing = defineTool({
  id: 'pangu-spacing',
  section: 'zh',
  title: { zh: '中文排版规范化', en: 'Chinese Copy Formatter' },
  description: {
    zh: '规范中英间距、全角数字和标点空格，并精确预览每一处变化。',
    en: 'Normalize CJK spacing, fullwidth digits, and punctuation spaces with an exact diff.',
  },
  icon: 'lucide:align-left',
  keywords: ['pangu', '盘古', '空格', '排版', 'spacing', '排版规范化', 'diff'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 50,
})
