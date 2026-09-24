<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ToolCard from '../components/ToolCard.vue'
import CraftCard from '../components/CraftCard.vue'
import { searchAll, sections } from '../registry'
import { allCrafts, searchCrafts } from '../craft-registry'
import AppIcon from '../components/AppIcon.vue'

const { t } = useI18n()

const query = ref('')
const trimmed = computed(() => query.value.trim())
// 空查询 → 按分区全量展示；有查询 → 扁平命中列表
const matches = computed(() =>
  trimmed.value === ''
    ? null
    : { tools: searchAll(query.value), crafts: searchCrafts(query.value) },
)

const groups = [
  { section: 'zh' as const, id: 'section-zh' },
  { section: 'fe' as const, id: 'section-fe' },
]
</script>

<template>
  <div class="flex flex-col gap-12">
    <header
      class="relative isolate overflow-hidden rounded-2xl border border-workshop-border bg-surface/85 px-5 py-7 shadow-sm md:px-9 md:py-9"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -top-28 -right-20 -z-10 size-80 rounded-full bg-primary-soft/55 blur-3xl"
      />
      <div class="relative grid items-end gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
        <div class="flex flex-col items-start gap-4">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/70 px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-primary uppercase"
          >
            <span class="size-1.5 rounded-full bg-primary" />
            {{ t('home.badge') }}
          </span>
          <h1
            class="max-w-3xl text-3xl font-bold leading-tight tracking-[-0.035em] text-foreground md:text-4xl lg:text-[2.75rem]"
          >
            {{ t('home.heroTitle') }}
          </h1>
          <p class="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {{ t('home.heroSub') }}
          </p>
        </div>

        <div class="grid gap-2">
          <label for="home-search" class="sr-only">{{ t('home.searchPlaceholder') }}</label>
          <div class="relative">
            <AppIcon
              name="lucide:search"
              class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="home-search"
              v-model="query"
              type="search"
              class="ui-native-field min-h-12 pl-10 text-sm"
              :placeholder="t('home.searchPlaceholder')"
            />
          </div>
          <span class="px-1 text-[11px] text-muted-foreground">{{ t('command.hint') }}</span>
        </div>
      </div>
    </header>

    <template v-if="matches !== null">
      <section aria-live="polite">
        <h2
          class="mb-4 flex items-center gap-3 text-sm font-semibold tracking-tight text-foreground"
        >
          {{ t('home.resultsTitle') }}
          <span
            class="rounded-full bg-surface-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
          >
            {{ matches.tools.length + matches.crafts.length }}
          </span>
        </h2>
        <p
          v-if="matches.tools.length + matches.crafts.length === 0"
          class="rounded-xl border border-dashed border-workshop-border bg-surface/70 p-10 text-center text-sm text-muted-foreground"
        >
          {{ t('home.noResults') }}
        </p>
        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          <CraftCard v-for="craft in matches.crafts" :key="craft.meta.id" :craft="craft" />
          <ToolCard
            v-for="tool in matches.tools"
            :key="`${tool.section}-${tool.id}`"
            :tool="tool"
          />
        </div>
      </section>
    </template>

    <template v-else>
      <section id="section-craft" class="scroll-mt-24">
        <div class="mb-5 flex items-center justify-between gap-4">
          <h2 class="flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground">
            <span
              class="rounded-md bg-primary-soft px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-primary"
              >CRAFT</span
            >{{ t('nav.crafts') }}
          </h2>
          <span
            class="rounded-full bg-surface-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
            >{{ t('home.itemCount', { count: allCrafts.length }) }}</span
          >
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          <CraftCard v-for="craft in allCrafts" :key="craft.meta.id" :craft="craft" />
        </div>
      </section>
      <section id="section-chest" class="scroll-mt-24">
        <div class="mb-6 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span
              class="rounded-md bg-surface-muted px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-muted-foreground"
              >CHEST</span
            >
            <h2 class="text-lg font-semibold tracking-tight text-foreground">
              {{ t('nav.chest') }}
            </h2>
          </div>
          <span class="h-px flex-1 bg-workshop-border/70" />
        </div>
        <div class="flex flex-col gap-9">
          <section v-for="group in groups" :id="group.id" :key="group.section">
            <div class="mb-4 flex items-center justify-between gap-4">
              <h3 class="flex items-center gap-2 text-sm font-semibold text-foreground">
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
              </h3>
              <span
                class="rounded-full bg-surface-muted px-2.5 py-1 font-mono text-[10px] text-muted-foreground"
              >
                {{ t('home.itemCount', { count: sections[group.section].length }) }}
              </span>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              <ToolCard v-for="tool in sections[group.section]" :key="tool.id" :tool="tool" />
            </div>
          </section>
        </div>
      </section>
    </template>
  </div>
</template>
