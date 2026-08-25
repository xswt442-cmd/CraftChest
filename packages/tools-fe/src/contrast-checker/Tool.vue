<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiCard } from '@craftchest/ui'
import { normalizeHex, rateContrast, suggestColor } from './service'

const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      foreground: '前景色',
      background: '背景色',
      swap: '交换颜色',
      preview: '实际预览',
      sampleTitle: '清晰的信息层级',
      sampleBody: '快速检查正文与大号文字在当前配色下是否易读。',
      ratio: '对比度',
      normal: '普通文本',
      large: '大号文本',
      pass: '通过',
      fail: '未通过',
      invalid: '请输入 #RGB 或 #RRGGBB',
      suggestions: 'AA 调整建议',
      changeForeground: '调整前景',
      changeBackground: '调整背景',
      apply: '应用',
      already: '当前配色已满足普通文本 AA。',
    },
    en: {
      foreground: 'Foreground',
      background: 'Background',
      swap: 'Swap colors',
      preview: 'Live preview',
      sampleTitle: 'Clear information hierarchy',
      sampleBody: 'Check whether body and large text remain readable with this color pair.',
      ratio: 'Contrast ratio',
      normal: 'Normal text',
      large: 'Large text',
      pass: 'Pass',
      fail: 'Fail',
      invalid: 'Enter #RGB or #RRGGBB',
      suggestions: 'AA adjustments',
      changeForeground: 'Change foreground',
      changeBackground: 'Change background',
      apply: 'Apply',
      already: 'This pair already passes AA for normal text.',
    },
  },
})

const foreground = ref('#111827')
const background = ref('#f9fafb')
const valid = computed(() =>
  Boolean(normalizeHex(foreground.value) && normalizeHex(background.value)),
)
const rating = computed(() =>
  valid.value ? rateContrast(foreground.value, background.value) : null,
)
const foregroundSuggestion = computed(() =>
  valid.value ? suggestColor(foreground.value, background.value) : '',
)
const backgroundSuggestion = computed(() =>
  valid.value ? suggestColor(background.value, foreground.value) : '',
)

function swap(): void {
  const previous = foreground.value
  foreground.value = background.value
  background.value = previous
}
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[22rem_1fr]">
    <UiCard>
      <div class="grid gap-4">
        <label class="grid gap-1.5 text-sm font-medium">
          {{ t('foreground') }}
          <span class="grid grid-cols-[1fr_auto] gap-2">
            <input
              v-model="foreground"
              class="rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono dark:border-neutral-700 dark:bg-neutral-950"
              :aria-invalid="!normalizeHex(foreground)"
            />
            <input
              v-model="foreground"
              type="color"
              class="size-10 cursor-pointer rounded border-0 bg-transparent"
            />
          </span>
        </label>
        <label class="grid gap-1.5 text-sm font-medium">
          {{ t('background') }}
          <span class="grid grid-cols-[1fr_auto] gap-2">
            <input
              v-model="background"
              class="rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono dark:border-neutral-700 dark:bg-neutral-950"
              :aria-invalid="!normalizeHex(background)"
            />
            <input
              v-model="background"
              type="color"
              class="size-10 cursor-pointer rounded border-0 bg-transparent"
            />
          </span>
        </label>
        <p v-if="!valid" class="text-sm text-red-600 dark:text-red-400">{{ t('invalid') }}</p>
        <UiButton @click="swap">{{ t('swap') }}</UiButton>
      </div>
    </UiCard>

    <div class="grid gap-4">
      <UiCard :title="t('preview')">
        <div
          class="rounded-lg border border-black/10 p-8 transition-colors"
          :style="{ color: foreground, backgroundColor: background }"
          data-testid="contrast-preview"
        >
          <h2 class="text-3xl font-bold">{{ t('sampleTitle') }}</h2>
          <p class="mt-3 max-w-xl text-base leading-relaxed">{{ t('sampleBody') }}</p>
          <p class="mt-5 text-sm font-medium">Aa · 14px / AA · 24px</p>
        </div>
      </UiCard>

      <div v-if="rating" class="grid gap-4 md:grid-cols-[12rem_1fr]">
        <UiCard :title="t('ratio')">
          <strong
            class="font-mono text-4xl text-neutral-900 dark:text-neutral-50"
            data-testid="contrast-ratio"
            >{{ rating.ratio.toFixed(2) }}:1</strong
          >
        </UiCard>
        <UiCard>
          <div class="grid grid-cols-[1fr_auto_auto] gap-x-5 gap-y-3 text-sm">
            <b></b><b>AA</b><b>AAA</b> <span>{{ t('normal') }}</span
            ><span :class="rating.normalAA ? 'text-emerald-600' : 'text-red-600'">{{
              t(rating.normalAA ? 'pass' : 'fail')
            }}</span
            ><span :class="rating.normalAAA ? 'text-emerald-600' : 'text-red-600'">{{
              t(rating.normalAAA ? 'pass' : 'fail')
            }}</span>
            <span>{{ t('large') }}</span
            ><span :class="rating.largeAA ? 'text-emerald-600' : 'text-red-600'">{{
              t(rating.largeAA ? 'pass' : 'fail')
            }}</span
            ><span :class="rating.largeAAA ? 'text-emerald-600' : 'text-red-600'">{{
              t(rating.largeAAA ? 'pass' : 'fail')
            }}</span>
          </div>
        </UiCard>
      </div>

      <UiCard v-if="rating" :title="t('suggestions')">
        <p v-if="rating.normalAA" class="text-sm text-emerald-700 dark:text-emerald-400">
          {{ t('already') }}
        </p>
        <div v-else class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="suggestion in [
              { label: 'changeForeground', value: foregroundSuggestion, target: 'foreground' },
              { label: 'changeBackground', value: backgroundSuggestion, target: 'background' },
            ]"
            :key="suggestion.target"
            class="flex items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
          >
            <span
              ><b class="block text-sm">{{ t(suggestion.label) }}</b
              ><code class="text-xs text-neutral-500">{{ suggestion.value }}</code></span
            >
            <UiButton
              @click="
                suggestion.target === 'foreground'
                  ? (foreground = suggestion.value)
                  : (background = suggestion.value)
              "
              >{{ t('apply') }}</UiButton
            >
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
