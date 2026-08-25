import { ref } from 'vue'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = Exclude<ThemePreference, 'system'>

export const THEME_STORAGE_KEY = 'craftchest.theme'

const VALID_PREFERENCES = new Set<ThemePreference>(['system', 'light', 'dark'])

export function parseThemePreference(value: string | null): ThemePreference {
  return value !== null && VALID_PREFERENCES.has(value as ThemePreference)
    ? (value as ThemePreference)
    : 'system'
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference
}

function readPreference(): ThemePreference {
  try {
    return parseThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return 'system'
  }
}

const media =
  typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : ({ matches: false, addEventListener: () => undefined } as Pick<
        MediaQueryList,
        'matches' | 'addEventListener'
      >)

export const themePreference = ref<ThemePreference>(readPreference())

function applyTheme(): void {
  const resolved = resolveTheme(themePreference.value, media.matches)
  document.documentElement.dataset.theme = resolved
  document.documentElement.style.colorScheme = resolved
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute('content', resolved === 'dark' ? '#161a22' : '#f7f2e9')
}

export function setThemePreference(preference: ThemePreference): void {
  themePreference.value = preference
  try {
    if (preference === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY)
    else window.localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // 隐私模式或禁用存储时，当前会话仍保持可用。
  }
  applyTheme()
}

export function cycleThemePreference(): void {
  const order: ThemePreference[] = ['system', 'light', 'dark']
  const index = order.indexOf(themePreference.value)
  setThemePreference(order[(index + 1) % order.length] ?? 'system')
}

media.addEventListener('change', applyTheme)
applyTheme()
