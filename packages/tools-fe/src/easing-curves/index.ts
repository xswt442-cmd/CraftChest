import { defineTool } from '@craftchest/toolkit-core'

export const easingCurves = defineTool({
  id: 'easing-curves',
  section: 'fe',
  title: { zh: '缓动曲线', en: 'Easing Curves' },
  description: {
    zh: '编辑 cubic-bezier 控制点，并用小球动画即时感受运动节奏。',
    en: 'Edit cubic-bezier control points and feel the timing with a live motion preview.',
  },
  icon: 'lucide:activity',
  keywords: ['easing', 'cubic-bezier', 'animation', 'transition', '缓动', '动画', '曲线'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 30,
})
