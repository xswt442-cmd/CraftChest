import { defineTool } from '@craftchest/toolkit-core'

/** 拼音标注 · 工具元数据（四件套之一） */
export const pinyin = defineTool({
  id: 'pinyin',
  section: 'zh',
  title: { zh: '拼音标注', en: 'Pinyin' },
  description: {
    zh: '逐字注音：带调/数字/无声调三种格式，多音字可标全部读音。',
    en: 'Per-character pinyin with tone marks/numbers/plain formats and polyphone readings.',
  },
  icon: 'lucide:speech',
  keywords: ['pinyin', '拼音', '注音', '多音字'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 20,
})
