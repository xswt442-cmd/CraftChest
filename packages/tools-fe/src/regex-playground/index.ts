import { defineTool } from '@craftchest/toolkit-core'

export const regexPlayground = defineTool({
  id: 'regex-playground',
  section: 'fe',
  title: { zh: '正则表达式工作台', en: 'Regex Workbench' },
  description: {
    zh: '编写并测试 JavaScript 正则，查看匹配、捕获组与替换预览。',
    en: 'Test JavaScript regular expressions with match, capture, and replacement previews.',
  },
  icon: 'lucide:regex',
  keywords: [
    'regex',
    'regexp',
    'regular expression',
    'pattern',
    'match',
    'replace',
    '正则',
    '正则表达式',
    '匹配',
    '替换',
  ],
  component: () => import('./Tool.vue').then((module) => module.default),
  order: 50,
})
