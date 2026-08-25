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

const { locale } = useI18n()
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
  <div v-else class="flex flex-col gap-7">
    <header class="relative flex items-start gap-4 border-b border-workshop-border pb-5">
      <span
        class="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-lg"
        :class="
          section === 'zh'
            ? 'bg-section-zh-soft text-section-zh'
            : 'bg-section-fe-soft text-section-fe'
        "
      >
        <AppIcon :name="tool.icon" class="size-5" />
      </span>
      <div class="min-w-0">
        <span
          class="block text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase"
          >{{ toolCode }}</span
        >
        <h1 class="mt-0.5 text-2xl font-bold tracking-[-0.02em] text-foreground">
          {{ tool.title[lang] }}
        </h1>
        <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
          {{ tool.description[lang] }}
        </p>
      </div>
    </header>

    <component :is="asyncTool" :key="tool.id" />
  </div>
</template>
