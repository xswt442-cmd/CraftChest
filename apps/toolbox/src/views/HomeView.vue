<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CraftCard from '../components/CraftCard.vue'
import ToolCard from '../components/ToolCard.vue'
import AppIcon from '../components/AppIcon.vue'
import { allCrafts, searchCrafts } from '../craft-registry'
import { searchAll, sections } from '../registry'

const { t } = useI18n()

const query = ref('')
const trimmed = computed(() => query.value.trim())
const toolCount = sections.zh.length + sections.fe.length

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
  <div class="flex flex-col gap-14 lg:gap-16">
    <header
      class="relative isolate overflow-hidden rounded-[1.75rem] bg-hero px-6 py-7 text-hero-foreground shadow-xl shadow-slate-950/10 md:px-9 md:py-9 lg:px-12 lg:py-11"
    >
      <div
        aria-hidden="true"
        class="home-hero-orb pointer-events-none absolute -top-36 -right-24 -z-10 size-[28rem] rounded-full opacity-70"
      />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_0%,rgba(255,255,255,0.08),transparent_44%)]"
      />

      <div
        class="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.82fr)] lg:gap-12"
      >
        <div class="flex flex-col items-start">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-hero-border bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-hero-foreground/80 uppercase"
          >
            <span class="size-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
            {{ t('home.badge') }}
          </span>
          <h1
            class="mt-6 max-w-2xl text-4xl font-semibold leading-[1.06] tracking-[-0.055em] md:text-5xl lg:text-6xl"
          >
            {{ t('home.heroTitle') }}
          </h1>
          <p class="mt-5 max-w-xl text-sm leading-7 text-hero-muted md:text-base md:leading-8">
            {{ t('home.heroSub') }}
          </p>
          <a
            href="#section-craft"
            class="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/15 transition-[transform,background-color,box-shadow] hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {{ t('nav.crafts') }}
            <AppIcon name="lucide:arrow-down-right" class="size-4" />
          </a>
        </div>

        <div class="relative mx-auto w-full max-w-[24rem] py-2 sm:max-w-[28rem]" aria-hidden="true">
          <div class="absolute inset-5 rounded-[2rem] bg-primary/20 blur-3xl" />
          <div
            class="relative rotate-[2deg] rounded-[1.5rem] border border-white/15 bg-white/[0.07] p-3 shadow-2xl shadow-black/25 backdrop-blur-sm"
          >
            <div class="flex items-center justify-between px-2 py-2.5">
              <div class="flex items-center gap-1.5">
                <span class="size-2 rounded-full bg-rose-300/80" />
                <span class="size-2 rounded-full bg-amber-200/80" />
                <span class="size-2 rounded-full bg-emerald-200/80" />
              </div>
              <span class="font-mono text-[9px] tracking-[0.18em] text-white/50"
                >LOCAL WORKSPACE</span
              >
            </div>
            <div class="grid grid-cols-[1fr_0.78fr] gap-2">
              <div
                class="flex min-h-28 flex-col justify-between rounded-2xl bg-[#f2e8db] p-3 text-slate-900 sm:min-h-36 sm:p-4"
              >
                <div class="flex items-start justify-between">
                  <span
                    class="grid size-9 place-items-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-900/15"
                  >
                    <AppIcon name="lucide:shapes" class="size-5" />
                  </span>
                  <span class="rounded-md bg-white/75 px-2 py-1 font-mono text-[9px] text-slate-500"
                    >CRAFT 01</span
                  >
                </div>
                <div>
                  <div class="text-xs font-semibold">App Icon Workshop</div>
                  <div class="mt-1 text-[10px] text-slate-500">PNG · PWA · ZIP</div>
                </div>
              </div>
              <div
                class="flex min-h-28 flex-col justify-between rounded-2xl bg-slate-800 p-3 sm:min-h-36 sm:p-4"
              >
                <div class="flex items-center justify-between">
                  <span class="grid size-8 place-items-center rounded-lg bg-white/10 text-sky-200">
                    <AppIcon name="lucide:sliders-horizontal" class="size-4" />
                  </span>
                  <span
                    class="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]"
                  />
                </div>
                <div class="space-y-2">
                  <div class="h-1.5 w-4/5 rounded-full bg-white/25" />
                  <div class="h-1.5 w-3/5 rounded-full bg-white/15" />
                  <div class="mt-3 flex gap-1.5">
                    <span class="size-4 rounded-md bg-orange-300" />
                    <span class="size-4 rounded-md bg-rose-300" />
                    <span class="size-4 rounded-md bg-sky-300" />
                    <span class="size-4 rounded-md bg-violet-300" />
                  </div>
                </div>
              </div>
              <div
                class="col-span-2 hidden items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 sm:flex"
              >
                <span
                  class="grid size-8 place-items-center rounded-lg bg-white/10 text-emerald-200"
                >
                  <AppIcon name="lucide:shield-check" class="size-4" />
                </span>
                <div class="min-w-0 flex-1">
                  <div class="text-[11px] font-medium text-white/90">Private by design</div>
                  <div class="mt-0.5 text-[9px] text-white/50">
                    Processed locally in your browser
                  </div>
                </div>
                <AppIcon name="lucide:arrow-up-right" class="size-4 text-white/40" />
              </div>
            </div>
          </div>
          <div
            class="absolute -right-2 bottom-0 rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 font-mono text-[9px] tracking-wider text-white/75 shadow-lg sm:-right-5"
          >
            CRAFT → CHEST
          </div>
        </div>
      </div>

      <div
        class="mt-7 grid items-end gap-5 border-t border-hero-border pt-6 sm:mt-9 sm:grid-cols-[minmax(0,1fr)_auto]"
      >
        <div class="grid gap-2">
          <label for="home-search" class="sr-only">{{ t('home.searchPlaceholder') }}</label>
          <div class="relative">
            <AppIcon
              name="lucide:search"
              class="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/50"
            />
            <input
              id="home-search"
              v-model="query"
              type="search"
              class="min-h-13 w-full rounded-xl border border-white/15 bg-white/[0.07] py-3 pr-20 pl-11 text-sm text-white outline-none transition-[border-color,background-color,box-shadow] placeholder:text-white/45 hover:bg-white/[0.1] focus:border-primary/70 focus:bg-white/[0.1] focus:ring-4 focus:ring-primary/15"
              :placeholder="t('home.searchPlaceholder')"
            />
            <kbd
              class="absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-white/15 bg-white/[0.07] px-2 py-1 font-mono text-[10px] text-white/60"
              >Ctrl K</kbd
            >
          </div>
        </div>
        <div class="flex items-center gap-6 px-1 pb-1 text-hero-muted">
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-semibold tracking-tight text-hero-foreground">{{
              allCrafts.length
            }}</span>
            <span class="text-[10px] font-semibold tracking-[0.12em] uppercase">{{
              t('nav.crafts')
            }}</span>
          </div>
          <span class="h-7 w-px bg-hero-border" />
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-semibold tracking-tight text-hero-foreground">{{
              toolCount
            }}</span>
            <span class="text-[10px] font-semibold tracking-[0.12em] uppercase">{{
              t('nav.chest')
            }}</span>
          </div>
        </div>
      </div>
    </header>

    <template v-if="matches !== null">
      <section aria-live="polite">
        <div class="mb-5 flex items-end justify-between gap-4">
          <div>
            <p class="text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
              DISCOVER
            </p>
            <h2 class="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {{ t('home.resultsTitle') }}
            </h2>
          </div>
          <span
            class="rounded-lg border border-workshop-border bg-surface-raised px-3 py-1.5 font-mono text-xs text-muted-foreground"
          >
            {{ matches.tools.length + matches.crafts.length }}
          </span>
        </div>
        <p
          v-if="matches.tools.length + matches.crafts.length === 0"
          class="rounded-2xl border border-dashed border-workshop-border bg-surface/70 p-12 text-center text-sm text-muted-foreground"
        >
          {{ t('home.noResults') }}
        </p>
        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          <CraftCard v-for="craft in matches.crafts" :key="craft.meta.id" :craft="craft" compact />
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
        <div class="mb-5 flex items-end justify-between gap-4">
          <div>
            <p class="text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
              01 / CREATE
            </p>
            <h2 class="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {{ t('nav.crafts') }}
            </h2>
          </div>
          <span
            class="rounded-lg border border-workshop-border bg-surface-raised px-3 py-1.5 text-xs text-muted-foreground"
          >
            {{ t('home.itemCount', { count: allCrafts.length }) }}
          </span>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CraftCard v-for="craft in allCrafts" :key="craft.meta.id" :craft="craft" />
        </div>
      </section>

      <section id="section-chest" class="scroll-mt-24">
        <div class="mb-6 flex items-end justify-between gap-4 border-b border-workshop-border pb-4">
          <div>
            <p class="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              02 / EXPLORE
            </p>
            <h2 class="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {{ t('nav.chest') }}
            </h2>
          </div>
          <span class="text-xs text-muted-foreground">{{
            t('home.itemCount', { count: toolCount })
          }}</span>
        </div>
        <div class="flex flex-col gap-10">
          <section v-for="group in groups" :id="group.id" :key="group.section">
            <div class="mb-4 flex items-center gap-3">
              <span
                class="rounded-md px-2 py-1 text-[10px] font-bold tracking-[0.12em]"
                :class="
                  group.section === 'zh'
                    ? 'bg-section-zh-soft text-section-zh'
                    : 'bg-section-fe-soft text-section-fe'
                "
              >
                {{ group.section.toUpperCase() }}
              </span>
              <h3 class="text-sm font-semibold text-foreground">
                {{ t(`nav.sections.${group.section}`) }}
              </h3>
              <span class="h-px flex-1 bg-workshop-border/70" />
              <span class="text-xs tabular-nums text-muted-foreground">
                {{ String(sections[group.section].length).padStart(2, '0') }}
              </span>
            </div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              <ToolCard v-for="tool in sections[group.section]" :key="tool.id" :tool="tool" />
            </div>
          </section>
        </div>
      </section>
    </template>
  </div>
</template>
