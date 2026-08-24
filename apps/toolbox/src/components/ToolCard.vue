<script setup lang="ts">
import type { ToolMeta } from '@craftchest/toolkit-core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  tool: ToolMeta
}>()

const { locale } = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'zh') as 'zh' | 'en')
const title = computed(() => props.tool.title[lang.value])
const description = computed(() => props.tool.description[lang.value])
</script>

<template>
  <RouterLink
    :to="`/${tool.section}/${tool.id}`"
    class="group flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-amber-500"
  >
    <div class="flex items-center gap-2.5">
      <span
        class="flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600 group-hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400"
      >
        <AppIcon :name="tool.icon" class="size-5" />
      </span>
      <h3 class="font-medium text-neutral-900 dark:text-neutral-100">{{ title }}</h3>
    </div>
    <p class="line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
      {{ description }}
    </p>
  </RouterLink>
</template>
