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
  <div class="flex flex-col gap-10">
    <header class="flex flex-col gap-3 pt-2 text-center md:pt-5">
      <span
        class="mx-auto inline-flex items-center gap-2 rounded-full border border-workshop-border bg-surface/80 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase shadow-sm"
      >
        <span class="size-1.5 rounded-full bg-primary" />
        Local-first workbench
      </span>
      <h1 class="text-3xl font-bold tracking-[-0.025em] text-foreground md:text-4xl">
        {{ t('home.heroTitle') }}
      </h1>
      <p class="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
        {{ t('home.heroSub') }}
      </p>
    </header>

    <div class="mx-auto w-full max-w-xl">
      <UiTextField v-model="query" :placeholder="t('home.searchPlaceholder')" />
    </div>

    <template v-if="matches !== null">
      <section aria-live="polite">
        <h2 class="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {{ t('home.resultsTitle') }} · {{ matches.length }}
        </h2>
        <p
          v-if="matches.length === 0"
          class="rounded-lg border border-dashed border-workshop-border bg-surface/70 p-8 text-center text-sm text-muted-foreground"
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
        <div class="mb-4 flex items-center justify-between border-b border-workshop-border pb-2.5">
          <h2 class="flex items-center gap-2.5 text-base font-semibold text-foreground">
            <span
              class="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-[0.14em]"
              :class="
                group.section === 'zh'
                  ? 'bg-section-zh-soft text-section-zh'
                  : 'bg-section-fe-soft text-section-fe'
              "
              >{{ group.section.toUpperCase() }}</span
            >
            {{ t(`nav.sections.${group.section}`) }}
          </h2>
          <span class="font-mono text-[11px] text-muted-foreground">
            {{ t('home.toolCount', { count: sections[group.section].length }) }}
          </span>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard v-for="tool in sections[group.section]" :key="tool.id" :tool="tool" />
        </div>
      </section>
    </template>
  </div>
</template>
