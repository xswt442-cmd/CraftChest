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
    class="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    :aria-label="locale === 'zh' ? 'Switch to English' : '切换到中文'"
    @click="toggle"
  >
    <AppIcon name="lucide:languages" class="size-4" />
    <span>{{ locale === 'zh' ? 'EN' : '中文' }}</span>
  </button>
</template>
