<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ToolCard from '../components/ToolCard.vue'
import { searchAll, sections } from '../registry'
import { UiTextField } from '@craftchest/ui'

const { t } = useI18n()

const query = ref('')
const trimmed = computed(() => query.value.trim())
// 空查询 → 按分区全量展示；有查询 → 扁平命中列表
const matches = computed(() => (trimmed.value === '' ? null : searchAll(query.value)))

const groups = [
  { section: 'zh' as const, id: 'section-zh' },
  { section: 'fe' as const, id: 'section-fe' },
]
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-2 pt-2 text-center md:pt-6">
      <h1 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        {{ t('home.heroTitle') }}
      </h1>
      <p class="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        {{ t('home.heroSub') }}
      </p>
    </header>

    <div class="mx-auto w-full max-w-md">
      <UiTextField v-model="query" :placeholder="t('home.searchPlaceholder')" />
    </div>

    <template v-if="matches !== null">
      <section aria-live="polite">
        <h2 class="mb-3 text-sm font-semibold tracking-wide text-neutral-500 uppercase">
          {{ t('home.resultsTitle') }} · {{ matches.length }}
        </h2>
        <p
          v-if="matches.length === 0"
          class="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-400 dark:border-neutral-700"
        >
          {{ t('home.noResults') }}
        </p>
        <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard v-for="tool in matches" :key="`${tool.section}-${tool.id}`" :tool="tool" />
        </div>
      </section>
    </template>

    <template v-else>
      <section v-for="group in groups" :id="group.id" :key="group.section">
        <div class="mb-3 flex items-baseline justify-between">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {{ t(`nav.sections.${group.section}`) }}
          </h2>
          <span class="text-xs text-neutral-400">
            {{ t('home.toolCount', { count: sections[group.section].length }) }}
          </span>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard
            v-for="tool in sections[group.section]"
            :key="tool.id"
            :tool="tool"
          />
        </div>
      </section>
    </template>
  </div>
</template>
