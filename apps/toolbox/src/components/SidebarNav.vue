<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'
import LocaleToggle from './LocaleToggle.vue'
import { sections } from '../registry'

// 移动端抽屉开关；桌面端常驻（md: 起静态布局）
const open = defineModel<boolean>('open', { default: false })

const { t, locale } = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'zh') as 'zh' | 'en')

const groups = [
  { section: 'zh' as const, icon: 'lucide:languages' },
  { section: 'fe' as const, icon: 'lucide:puzzle' },
]
</script>

<template>
  <!-- 移动端遮罩 -->
  <div
    v-if="open"
    class="fixed inset-0 z-40 bg-black/40 md:hidden"
    @click="open = false"
  />

  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 md:static md:translate-x-0 dark:border-neutral-800 dark:bg-neutral-900"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
    :aria-hidden="!open && undefined"
  >
    <div class="flex h-12 items-center gap-2 border-b border-neutral-200 px-4 dark:border-neutral-800">
      <span class="text-xl" aria-hidden="true">📦</span>
      <RouterLink to="/" class="font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        CraftChest
      </RouterLink>
      <button
        type="button"
        class="ml-auto cursor-pointer rounded p-1 text-neutral-500 hover:bg-neutral-100 md:hidden dark:hover:bg-neutral-800"
        :aria-label="t('nav.home')"
        @click="open = false"
      >
        <AppIcon name="lucide:x" class="size-5" />
      </button>
    </div>

    <nav class="flex-1 space-y-4 overflow-y-auto px-3 py-4">
      <RouterLink
        to="/"
        class="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <AppIcon name="lucide:house" class="size-4 text-neutral-400" />
        {{ t('nav.home') }}
      </RouterLink>

      <div v-for="group in groups" :key="group.section">
        <p class="px-2.5 pb-1 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
          {{ t(`nav.sections.${group.section}`) }}
        </p>
        <ul>
          <li v-for="tool in sections[group.section]" :key="tool.id">
            <RouterLink
              :to="`/${tool.section}/${tool.id}`"
              class="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <AppIcon :name="tool.icon" class="size-4 shrink-0 text-neutral-400" />
              <span class="truncate">{{ tool.title[lang] }}</span>
            </RouterLink>
          </li>
          <li v-if="sections[group.section].length === 0" class="px-2.5 py-1.5 text-xs text-neutral-300 dark:text-neutral-600">
            ···
          </li>
        </ul>
      </div>
    </nav>

    <div class="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <LocaleToggle />
      <span class="text-xs text-neutral-300 dark:text-neutral-600">MIT</span>
    </div>
  </aside>
</template>
