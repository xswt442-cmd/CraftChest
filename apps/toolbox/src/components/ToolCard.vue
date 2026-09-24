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
    class="group relative flex min-h-40 flex-col gap-4 overflow-hidden rounded-xl border border-workshop-border/90 bg-surface-raised/90 p-5 pl-6 shadow-sm transition-[transform,border-color,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-raised hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    :class="tool.section === 'zh' ? 'section-rail-zh' : 'section-rail-fe'"
  >
    <div class="flex items-start gap-3">
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors"
        :class="
          tool.section === 'zh'
            ? 'bg-section-zh-soft text-section-zh'
            : 'bg-section-fe-soft text-section-fe'
        "
      >
        <AppIcon :name="tool.icon" class="size-5" />
      </span>
      <div class="min-w-0 flex-1">
        <span
          class="inline-flex rounded bg-surface-muted px-1.5 py-0.5 text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase"
        >
          {{ toolCode }}
        </span>
        <h3 class="mt-1 font-semibold tracking-tight text-foreground">{{ title }}</h3>
      </div>
      <AppIcon
        name="lucide:arrow-up-right"
        class="size-4 text-muted-foreground/45 transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
      />
    </div>
    <p class="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
      {{ description }}
    </p>
  </RouterLink>
</template>
