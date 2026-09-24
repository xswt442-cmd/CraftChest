<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ToolSection } from '@craftchest/toolkit-core'
import AppIcon from '../components/AppIcon.vue'
import ToolSkeleton from '../components/ToolSkeleton.vue'
import NotFoundView from './NotFoundView.vue'
import { findTool, sections } from '../registry'

const props = defineProps<{
  section: ToolSection
  id: string
}>()

const { locale, t } = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'zh') as 'zh' | 'en')

const tool = computed(() => findTool(props.section, props.id))
const toolCode = computed(() => {
  const index = sections[props.section].findIndex((entry) => entry.id === props.id)
  return `${props.section.toUpperCase()}-${String(index + 1).padStart(2, '0')}`
})

// 未知 id → 页内渲染 404；已知 id → 异步挂载对应工具组件（保持代码分割）
const asyncTool = computed(() =>
  tool.value
    ? defineAsyncComponent({
        loader: tool.value.component,
        loadingComponent: ToolSkeleton,
        delay: 80,
      })
    : null,
)
</script>

<template>
  <NotFoundView v-if="tool === undefined" />
  <div v-else class="flex flex-col gap-8">
    <header
      class="relative flex flex-col gap-5 border-b border-workshop-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between"
    >
      <div class="flex items-start gap-4">
        <span
          class="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm"
          :class="
            section === 'zh'
              ? 'bg-section-zh-soft text-section-zh'
              : 'bg-section-fe-soft text-section-fe'
          "
        >
          <AppIcon :name="tool.icon" class="size-6" />
        </span>
        <div class="min-w-0">
          <p class="text-xs font-semibold tracking-wide text-muted-foreground">
            {{ t(`nav.sections.${section}`) }}
          </p>
          <h1 class="mt-1 text-3xl font-bold tracking-[-0.035em] text-foreground md:text-4xl">
            {{ tool.title[lang] }}
          </h1>
          <p class="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {{ tool.description[lang] }}
          </p>
        </div>
      </div>
      <span
        class="ml-16 inline-flex w-fit shrink-0 rounded-full border border-workshop-border bg-surface/75 px-3 py-1.5 font-mono text-[10px] font-semibold tracking-wide text-muted-foreground sm:ml-0"
      >
        {{ toolCode }}
      </span>
    </header>

    <component :is="asyncTool" :key="tool.id" />
  </div>
</template>
