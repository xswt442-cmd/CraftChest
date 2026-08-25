import { defineTool } from '@craftchest/toolkit-core'

export const gradientGen = defineTool({
  id: 'gradient-gen',
  section: 'fe',
  title: { zh: '渐变生成器', en: 'Gradient Generator' },
  description: {
    zh: '可视化调节线性、径向与锥形渐变，一键复制 CSS。',
    en: 'Tune linear, radial, and conic gradients visually, then copy the CSS.',
  },
  icon: 'lucide:palette',
  keywords: ['gradient', '渐变', 'linear', 'radial', 'conic', 'css', '背景'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 10,
})
