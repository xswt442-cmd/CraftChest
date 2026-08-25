<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiCard, UiTextField } from '@craftchest/ui'
import type { LunarInfo } from './service'
import { lunarToSolar, solarToLunar, yearJieQiTable } from './service'

// 视图层只做交互编排；算法在 service.ts（SPEC §4）
const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      solarLabel: '公历日期',
      lunarResultTitle: '农历信息',
      reverseTitle: '农历 → 公历',
      yearLabel: '农历年',
      monthLabel: '月（1-12）',
      dayLabel: '日',
      leapLabel: '闰该月',
      jieQiTableTitle: '当年节气',
      emptyHint: '选择日期后自动换算',
      invalidDate: '日期无效，请检查输入',
      copy: '复制结果',
      copied: '已复制',
      copyFailed: '复制失败',
      note: '干支年以农历正月初一为界；节气表覆盖所选公历年份。',
      today: '今天',
    },
    en: {
      solarLabel: 'Gregorian date',
      lunarResultTitle: 'Lunar details',
      reverseTitle: 'Lunar → Gregorian',
      yearLabel: 'Lunar year',
      monthLabel: 'Month (1-12)',
      dayLabel: 'Day',
      leapLabel: 'Leap month',
      jieQiTableTitle: 'Solar terms this year',
      emptyHint: 'Pick a date to convert',
      invalidDate: 'Invalid date — please check input',
      copy: 'Copy result',
      copied: 'Copied',
      copyFailed: 'Copy failed',
      note: 'GanZhi years start at Lunar New Year; the table covers the selected Gregorian year.',
      today: 'Today',
    },
  },
})

const iso = ref(todayIso())
const info = ref<LunarInfo | null>(null)
const invalid = ref(false)

function todayIso(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function convert(): void {
  if (iso.value === '') {
    info.value = null
    invalid.value = false
    return
  }
  try {
    info.value = solarToLunar(iso.value)
    invalid.value = false
  } catch {
    info.value = null
    invalid.value = true
  }
}
convert()

const jieQiTable = computed<JieQiTableEntry[]>(() => {
  if (info.value === null) return []
  try {
    return yearJieQiTable(iso.value)
  } catch {
    return []
  }
})
interface JieQiTableEntry {
  name: string
  iso: string
}

// 农历 → 公历
const ly = ref('2024')
const lm = ref('1')
const ld = ref('1')
const leap = ref(false)
let reversed: string | null = null

function convertReverse(): void {
  const y = Number.parseInt(ly.value, 10)
  const m = Number.parseInt(lm.value, 10)
  const d = Number.parseInt(ld.value, 10)
  try {
    reversed =
      Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)
        ? lunarToSolar(y, m, d, leap.value)
        : null
  } catch {
    reversed = null
  }
}
convertReverse()

const summary = computed(() =>
  info.value === null ? '' : `${info.value.fullZh} · ${info.value.yearGanZhi}年 · ${info.value.yearShengXiao}`,
)

const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
let copyTimer: ReturnType<typeof setTimeout> | undefined

async function copySummary(): Promise<void> {
  try {
    await navigator.clipboard.writeText(summary.value)
    copyState.value = 'copied'
  } catch {
    copyState.value = 'failed'
  }
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => (copyState.value = 'idle'), 1500)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-end gap-3">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300" for="lunar-solar-date">
          {{ t('solarLabel') }}
        </label>
        <input
          id="lunar-solar-date"
          v-model="iso"
          type="date"
          class="rounded-md border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          @change="convert"
          @input="convert"
        />
      </div>
      <UiButton @click="iso = todayIso(); convert()">
        {{ t('today') }}
      </UiButton>
    </div>

    <p v-if="invalid" class="text-sm text-red-600 dark:text-red-400" role="alert">
      {{ t('invalidDate') }}
    </p>

    <UiCard v-if="info !== null" :title="t('lunarResultTitle')">
      <p class="font-serif text-2xl leading-relaxed break-all text-neutral-900 dark:text-neutral-100" data-testid="lunar-fullzh">
        {{ info.fullZh }}
      </p>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <span class="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          {{ info.yearGanZhi }}年 · {{ info.yearShengXiao }}
        </span>
        <span
          v-if="info.jieQi !== null"
          class="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          {{ info.jieQi }}
        </span>
        <UiButton variant="primary" class="ml-auto" @click="copySummary">
          {{ copyState === 'copied' ? t('copied') : t('copy') }}
        </UiButton>
        <span v-if="copyState === 'failed'" class="text-xs text-red-600 dark:text-red-400">{{ t('copyFailed') }}</span>
      </div>
    </UiCard>

    <UiCard v-if="jieQiTable.length > 0" :title="t('jieQiTableTitle')">
      <ul class="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
        <li v-for="entry in jieQiTable" :key="entry.iso + entry.name" class="flex justify-between gap-2 text-sm">
          <span class="text-neutral-700 dark:text-neutral-300">{{ entry.name }}</span>
          <span class="text-neutral-400 tabular-nums">{{ entry.iso.slice(5) }}</span>
        </li>
      </ul>
    </UiCard>

    <UiCard :title="t('reverseTitle')">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <UiTextField v-model.number="ly" :label="t('yearLabel')" />
        <UiTextField v-model.number="lm" :label="t('monthLabel')" />
        <UiTextField v-model.number="ld" :label="t('dayLabel')" />
        <label class="flex items-end gap-1.5 pb-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input v-model="leap" type="checkbox" class="mb-2 accent-amber-500" @change="convertReverse" />
          {{ t('leapLabel') }}
        </label>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <UiButton @click="convertReverse">→</UiButton>
        <code v-if="reversed !== null" class="rounded bg-neutral-100 px-3 py-1.5 text-sm dark:bg-neutral-800" data-testid="lunar-reverse-result">
          {{ reversed }}
        </code>
      </div>
    </UiCard>

    <p class="text-xs leading-relaxed text-neutral-400">{{ t('note') }}</p>
  </div>
</template>
