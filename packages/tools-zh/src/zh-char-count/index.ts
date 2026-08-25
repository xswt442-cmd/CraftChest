import { defineTool } from '@craftchest/toolkit-core'

/** 中文字数统计 · 工具元数据（四件套之一） */
export const zhCharCount = defineTool({
  id: 'zh-char-count',
  section: 'zh',
  title: { zh: '中文字数统计', en: 'Chinese Char Count' },
  description: {
    zh: '出版口径字符数：汉字、标点、西文词多口径并列展示。',
    en: 'Publication-style character counts: Han chars, punctuation, and Latin words side by side.',
  },
  icon: 'lucide:hash',
  keywords: ['字数', '统计', 'count', 'characters', '字数统计', '稿费'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 60,
})
