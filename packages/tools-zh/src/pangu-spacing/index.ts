import { defineTool } from '@craftchest/toolkit-core'

/** 盘古之白 · 工具元数据（四件套之一） */
export const panguSpacing = defineTool({
  id: 'pangu-spacing',
  section: 'zh',
  title: { zh: '盘古之白', en: 'Pangu Spacing' },
  description: {
    zh: '在中英文/数字之间加空格的排版规范化，前后对照预览。',
    en: 'Insert spacing between CJK and Latin/digits, with side-by-side preview.',
  },
  icon: 'lucide:align-left',
  keywords: ['pangu', '盘古', '空格', '排版', 'spacing', '排版规范化'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 50,
})
