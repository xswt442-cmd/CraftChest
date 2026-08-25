<script setup lang="ts">
import type { ToolMeta } from '@craftchest/toolkit-core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'
import { sections } from '../registry'

const props = defineProps<{
  tool: ToolMeta
}>()

const { locale } = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'zh') as 'zh' | 'en')
const title = computed(() => props.tool.title[lang.value])
const description = computed(() => props.tool.description[lang.value])
const toolCode = computed(() => {
  const index = sections[props.tool.section].findIndex((tool) => tool.id === props.tool.id)
  return `${props.tool.section.toUpperCase()}-${String(index + 1).padStart(2, '0')}`
})
</script>

<template>
  <RouterLink
    :to="`/${tool.section}/${tool.id}`"
    class="group relative flex min-h-35 flex-col gap-3 overflow-hidden rounded-lg border border-workshop-border bg-surface-raised p-4 pl-5 shadow-sm transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-px hover:border-workshop-border-strong hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    :class="tool.section === 'zh' ? 'section-rail-zh' : 'section-rail-fe'"
  >
    <div class="flex items-start gap-3">
      <span
        class="flex size-9 shrink-0 items-center justify-center rounded-md transition-colors"
        :class="
          tool.section === 'zh'
            ? 'bg-section-zh-soft text-section-zh'
            : 'bg-section-fe-soft text-section-fe'
        "
      >
        <AppIcon :name="tool.icon" class="size-5" />
      </span>
      <div class="min-w-0 flex-1">
        <span class="block text-[9px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
          {{ toolCode }}
        </span>
        <h3 class="mt-0.5 font-semibold text-foreground">{{ title }}</h3>
      </div>
      <AppIcon
        name="lucide:arrow-up-right"
        class="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </div>
    <p class="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
      {{ description }}
    </p>
  </RouterLink>
</template>
