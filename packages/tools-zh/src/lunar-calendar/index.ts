import { defineTool } from '@craftchest/toolkit-core'

/** 农历公历互查 · 工具元数据（四件套之一） */
export const lunarCalendar = defineTool({
  id: 'lunar-calendar',
  section: 'zh',
  title: { zh: '农历公历互查', en: 'Lunar ↔ Solar' },
  description: {
    zh: '公历↔农历互查，附节气、天干地支与生肖。',
    en: 'Convert between Gregorian and Chinese lunar dates with solar terms, GanZhi, and zodiac.',
  },
  icon: 'lucide:moon-star',
  keywords: ['lunar', '农历', '公历', '节气', '干支', '生肖', '黄历'],
  component: () => import('./Tool.vue').then((m) => m.default),
  order: 40,
})
