<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ToolSection } from '@craftchest/toolkit-core'
import AppIcon from '../components/AppIcon.vue'
import ToolSkeleton from '../components/ToolSkeleton.vue'
import NotFoundView from './NotFoundView.vue'
import { findTool } from '../registry'

const props = defineProps<{
  section: ToolSection
  id: string
}>()

const { locale } = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'zh') as 'zh' | 'en')

const tool = computed(() => findTool(props.section, props.id))

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
  <div v-else class="flex flex-col gap-6">
    <header class="flex items-start gap-3">
      <span
        class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
      >
        <AppIcon :name="tool.icon" class="size-5.5" />
      </span>
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          {{ tool.title[lang] }}
        </h1>
        <p class="mt-0.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {{ tool.description[lang] }}
        </p>
      </div>
    </header>

    <component :is="asyncTool" :key="tool.id" />
  </div>
</template>
