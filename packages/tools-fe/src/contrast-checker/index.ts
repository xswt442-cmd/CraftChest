import { defineTool } from '@craftchest/toolkit-core'

export const contrastChecker = defineTool({
  id: 'contrast-checker',
  section: 'fe',
  title: { zh: '对比度检查', en: 'Contrast Checker' },
  description: {
    zh: '计算 WCAG AA/AAA 对比度评级，并给出前景与背景调整建议。',
    en: 'Check WCAG AA/AAA contrast and get foreground or background adjustments.',
  },
  icon: 'lucide:contrast',
  keywords: ['contrast', 'wcag', 'accessibility', 'a11y', '对比度', '无障碍', '颜色'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 40,
})
