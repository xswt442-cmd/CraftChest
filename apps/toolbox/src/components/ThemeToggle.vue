<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'
import { cycleThemePreference, themePreference } from '../theme'

const { t } = useI18n()

const icon = computed(() => {
  if (themePreference.value === 'light') return 'lucide:sun'
  if (themePreference.value === 'dark') return 'lucide:moon'
  return 'lucide:monitor-cog'
})
</script>

<template>
  <button
    type="button"
    class="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    :aria-label="t(`theme.${themePreference}`)"
    :title="t(`theme.${themePreference}`)"
    @click="cycleThemePreference"
  >
    <AppIcon :name="icon" class="size-4" />
  </button>
</template>
