import { defineTool } from '@craftchest/toolkit-core'

/** 人民币大写 · 工具元数据（四件套之一） */
export const rmbUppercase = defineTool({
  id: 'rmb-uppercase',
  section: 'zh',
  title: { zh: '人民币大写', en: 'RMB Uppercase' },
  description: {
    zh: '数字转中文大写金额：字符串运算不经浮点，合同级严谨。',
    en: 'Convert amounts to Chinese financial uppercase words with exact string arithmetic.',
  },
  icon: 'lucide:banknote',
  keywords: ['rmb', '人民币', '大写', '金额', 'uppercase', 'money', '财务'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 10,
})
