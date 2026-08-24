import { createI18n } from 'vue-i18n'
import en from './messages/en'
import zhCN from './messages/zh-CN'

export type Locale = 'zh' | 'en'

const STORAGE_KEY = 'craftchest.locale'

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'zh' || saved === 'en') return saved
  } catch {
    // localStorage 不可用（隐私模式等）时静默回退默认中文
  }
  return 'zh'
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: 'zh',
  messages: { zh: zhCN, en },
})

export function setLocale(locale: Locale): void {
  i18n.global.locale.value = locale
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // 同上：存储失败不致命
  }
}
