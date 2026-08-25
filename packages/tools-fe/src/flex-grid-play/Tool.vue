<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCard } from '@craftchest/ui'
import { buildContainerStyle, buildItemStyle, stylesToCss, type LayoutOptions } from './service'

const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      controls: '布局控制',
      mode: '模式',
      direction: '方向',
      justify: '主轴分布',
      align: '交叉轴对齐',
      gap: '间距',
      wrap: '允许换行',
      columns: '列数',
      grow: '首项 flex-grow',
      span: '首项跨列',
      stage: '实时画布',
      css: 'CSS 速查',
      container: '容器',
      firstItem: '第一个子项',
    },
    en: {
      controls: 'Layout controls',
      mode: 'Mode',
      direction: 'Direction',
      justify: 'Justify content',
      align: 'Align items',
      gap: 'Gap',
      wrap: 'Allow wrapping',
      columns: 'Columns',
      grow: 'First item flex-grow',
      span: 'First item span',
      stage: 'Live canvas',
      css: 'CSS reference',
      container: 'Container',
      firstItem: 'First item',
    },
  },
})

const state = reactive<LayoutOptions>({
  mode: 'flex',
  gap: 12,
  direction: 'row',
  justify: 'space-between',
  align: 'center',
  wrap: true,
  columns: 3,
  itemGrow: 1,
  itemSpan: 2,
})
const containerStyle = computed(() => buildContainerStyle(state))
const itemStyle = computed(() => buildItemStyle(state))
const containerCss = computed(() => stylesToCss('.container', containerStyle.value))
const itemCss = computed(() => stylesToCss('.item:first-child', itemStyle.value))
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[20rem_1fr]">
    <UiCard :title="t('controls')">
      <div class="grid gap-4 text-sm">
        <label class="grid gap-1"
          ><b>{{ t('mode') }}</b
          ><select
            v-model="state.mode"
            class="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          >
            <option value="flex">Flex</option>
            <option value="grid">Grid</option>
          </select></label
        >
        <label v-if="state.mode === 'flex'" class="grid gap-1"
          ><b>{{ t('direction') }}</b
          ><select
            v-model="state.direction"
            class="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          >
            <option value="row">row</option>
            <option value="column">column</option>
          </select></label
        >
        <label class="grid gap-1"
          ><b>{{ t('justify') }}</b
          ><select
            v-model="state.justify"
            class="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          >
            <option
              v-for="value in ['flex-start', 'center', 'space-between', 'space-around']"
              :key="value"
            >
              {{ value }}
            </option>
          </select></label
        >
        <label class="grid gap-1"
          ><b>{{ t('align') }}</b
          ><select
            v-model="state.align"
            class="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          >
            <option v-for="value in ['stretch', 'flex-start', 'center', 'flex-end']" :key="value">
              {{ value }}
            </option>
          </select></label
        >
        <label class="grid gap-1"
          ><span class="flex justify-between"
            ><b>{{ t('gap') }}</b
            ><output>{{ state.gap }}px</output></span
          ><input v-model.number="state.gap" type="range" min="0" max="40" class="accent-amber-500"
        /></label>
        <label v-if="state.mode === 'flex'" class="flex items-center gap-2"
          ><input v-model="state.wrap" type="checkbox" class="accent-amber-500" />{{
            t('wrap')
          }}</label
        >
        <label v-if="state.mode === 'grid'" class="grid gap-1"
          ><span class="flex justify-between"
            ><b>{{ t('columns') }}</b
            ><output>{{ state.columns }}</output></span
          ><input
            v-model.number="state.columns"
            type="range"
            min="1"
            max="6"
            class="accent-amber-500"
        /></label>
        <label class="grid gap-1"
          ><span class="flex justify-between"
            ><b>{{ t(state.mode === 'flex' ? 'grow' : 'span') }}</b
            ><output>{{ state.mode === 'flex' ? state.itemGrow : state.itemSpan }}</output></span
          ><input
            v-if="state.mode === 'flex'"
            v-model.number="state.itemGrow"
            type="range"
            min="0"
            max="5"
            class="accent-amber-500" /><input
            v-else
            v-model.number="state.itemSpan"
            type="range"
            min="1"
            :max="state.columns"
            class="accent-amber-500"
        /></label>
      </div>
    </UiCard>

    <div class="grid gap-4">
      <UiCard :title="t('stage')">
        <div
          class="min-h-80 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-950"
          :style="containerStyle"
          data-testid="layout-stage"
        >
          <div
            v-for="number in 6"
            :key="number"
            class="flex min-h-14 min-w-14 items-center justify-center rounded-md border border-amber-300 bg-amber-100 font-mono font-bold text-amber-800 shadow-sm dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
            :style="number === 1 ? itemStyle : undefined"
          >
            {{ number }}
          </div>
        </div>
      </UiCard>
      <UiCard :title="t('css')">
        <div class="grid gap-3 lg:grid-cols-2">
          <div>
            <b class="mb-1 block text-xs text-neutral-500">{{ t('container') }}</b>
            <pre class="overflow-x-auto rounded-md bg-neutral-950 p-3 text-xs text-amber-300">{{
              containerCss
            }}</pre>
          </div>
          <div>
            <b class="mb-1 block text-xs text-neutral-500">{{ t('firstItem') }}</b>
            <pre class="overflow-x-auto rounded-md bg-neutral-950 p-3 text-xs text-sky-300">{{
              itemCss
            }}</pre>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
