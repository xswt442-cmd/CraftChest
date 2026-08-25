<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCard, UiCheckbox, UiSelect, type UiSelectOption } from '@craftchest/ui'
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

const modeOptions: UiSelectOption[] = [
  { value: 'flex', label: 'Flex' },
  { value: 'grid', label: 'Grid' },
]
const directionOptions: UiSelectOption[] = [
  { value: 'row', label: 'row' },
  { value: 'column', label: 'column' },
]
const justifyOptions: UiSelectOption[] = [
  'flex-start',
  'center',
  'space-between',
  'space-around',
].map((value) => ({ value, label: value }))
const alignOptions: UiSelectOption[] = ['stretch', 'flex-start', 'center', 'flex-end'].map(
  (value) => ({ value, label: value }),
)

const modeModel = computed({
  get: () => state.mode,
  set: (value: string) => {
    if (value === 'flex' || value === 'grid') state.mode = value
  },
})
const directionModel = computed({
  get: () => state.direction,
  set: (value: string) => {
    if (value === 'row' || value === 'column') state.direction = value
  },
})
const justifyModel = computed({
  get: () => state.justify,
  set: (value: string) => {
    if (
      value === 'flex-start' ||
      value === 'center' ||
      value === 'space-between' ||
      value === 'space-around'
    )
      state.justify = value
  },
})
const alignModel = computed({
  get: () => state.align,
  set: (value: string) => {
    if (value === 'stretch' || value === 'flex-start' || value === 'center' || value === 'flex-end')
      state.align = value
  },
})
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[20rem_1fr]">
    <UiCard :title="t('controls')">
      <div class="grid gap-4 text-sm">
        <UiSelect v-model="modeModel" :label="t('mode')" :options="modeOptions" />
        <UiSelect
          v-if="state.mode === 'flex'"
          v-model="directionModel"
          :label="t('direction')"
          :options="directionOptions"
        />
        <UiSelect v-model="justifyModel" :label="t('justify')" :options="justifyOptions" />
        <UiSelect v-model="alignModel" :label="t('align')" :options="alignOptions" />
        <label class="grid gap-1"
          ><span class="flex justify-between"
            ><b>{{ t('gap') }}</b
            ><output>{{ state.gap }}px</output></span
          ><input v-model.number="state.gap" type="range" min="0" max="40" class="ui-range-input"
        /></label>
        <UiCheckbox v-if="state.mode === 'flex'" v-model="state.wrap" :label="t('wrap')" />
        <label v-if="state.mode === 'grid'" class="grid gap-1"
          ><span class="flex justify-between"
            ><b>{{ t('columns') }}</b
            ><output>{{ state.columns }}</output></span
          ><input
            v-model.number="state.columns"
            type="range"
            min="1"
            max="6"
            class="ui-range-input"
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
            class="ui-range-input" /><input
            v-else
            v-model.number="state.itemSpan"
            type="range"
            min="1"
            :max="state.columns"
            class="ui-range-input"
        /></label>
      </div>
    </UiCard>

    <div class="grid gap-4">
      <UiCard :title="t('stage')">
        <div
          class="min-h-80 rounded-lg border-2 border-dashed border-workshop-border bg-surface-muted p-3"
          :style="containerStyle"
          data-testid="layout-stage"
        >
          <div
            v-for="number in 6"
            :key="number"
            class="flex min-h-14 min-w-14 items-center justify-center rounded-md border border-primary bg-primary-soft font-mono font-bold text-foreground shadow-sm"
            :style="number === 1 ? itemStyle : undefined"
          >
            {{ number }}
          </div>
        </div>
      </UiCard>
      <UiCard :title="t('css')">
        <div class="grid gap-3 lg:grid-cols-2">
          <div>
            <b class="mb-1 block text-xs text-muted-foreground">{{ t('container') }}</b>
            <pre class="overflow-x-auto rounded-md bg-code-surface p-3 text-xs text-code-accent">{{
              containerCss
            }}</pre>
          </div>
          <div>
            <b class="mb-1 block text-xs text-muted-foreground">{{ t('firstItem') }}</b>
            <pre
              class="overflow-x-auto rounded-md bg-code-surface p-3 text-xs text-code-foreground"
              >{{ itemCss }}</pre>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
