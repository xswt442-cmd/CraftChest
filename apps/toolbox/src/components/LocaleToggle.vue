<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'
import { setLocale } from '../i18n'

const { locale } = useI18n()

function toggle(): void {
  setLocale(locale.value === 'zh' ? 'en' : 'zh')
}
</script>

<template>
  <button
    type="button"
    class="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-800"
    :aria-label="locale === 'zh' ? 'Switch to English' : '切换到中文'"
    @click="toggle"
  >
    <AppIcon name="lucide:languages" class="size-4" />
    <span>{{ locale === 'zh' ? 'EN' : '中文' }}</span>
  </button>
</template>
