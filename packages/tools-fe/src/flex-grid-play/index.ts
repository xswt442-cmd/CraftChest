import { defineTool } from '@craftchest/toolkit-core'

export const flexGridPlay = defineTool({
  id: 'flex-grid-play',
  section: 'fe',
  title: { zh: 'Flex / Grid 调试板', en: 'Flex / Grid Playground' },
  description: {
    zh: '实时演示容器与子项布局属性，并生成对应 CSS 速查。',
    en: 'Experiment with container and item layout properties and inspect the CSS.',
  },
  icon: 'lucide:layout-grid',
  keywords: ['flex', 'grid', '布局', 'playground', 'css', 'justify', 'align'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 20,
})
