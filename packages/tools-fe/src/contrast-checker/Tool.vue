<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHashShareState } from '@craftchest/toolkit-core'
import { UiButton, UiCard } from '@craftchest/ui'
import { isContrastShareState } from './share-state'
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
      share: '复制分享链接',
      shared: '分享链接已复制',
      shareFailed: '状态或剪贴板不可用',
      invalidShare: '分享链接状态无效，已使用默认值',
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
      share: 'Copy share link',
      shared: 'Share link copied',
      shareFailed: 'State or clipboard unavailable',
      invalidShare: 'Invalid shared state — defaults restored',
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
const { status: shareState, copyUrl: shareContrast } = useHashShareState({
  validate: isContrastShareState,
  read: () => ({ foreground: foreground.value, background: background.value }),
  apply: (shared) => {
    foreground.value = shared.foreground
    background.value = shared.background
  },
})
const shareLabel = computed(() => {
  if (shareState.value === 'copied') return t('shared')
  if (shareState.value === 'failed') return t('shareFailed')
  return t('share')
})

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
              class="ui-native-field font-mono"
              :aria-invalid="!normalizeHex(foreground)"
            />
            <input v-model="foreground" type="color" class="ui-color-input" />
          </span>
        </label>
        <label class="grid gap-1.5 text-sm font-medium">
          {{ t('background') }}
          <span class="grid grid-cols-[1fr_auto] gap-2">
            <input
              v-model="background"
              class="ui-native-field font-mono"
              :aria-invalid="!normalizeHex(background)"
            />
            <input v-model="background" type="color" class="ui-color-input" />
          </span>
        </label>
        <p v-if="!valid" class="text-sm text-danger">{{ t('invalid') }}</p>
        <div class="flex flex-wrap gap-2">
          <UiButton @click="swap">{{ t('swap') }}</UiButton>
          <UiButton :disabled="!valid" @click="shareContrast">{{ shareLabel }}</UiButton>
        </div>
        <p v-if="shareState === 'invalid'" class="text-xs text-danger">
          {{ t('invalidShare') }}
        </p>
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
          <strong class="font-mono text-4xl text-foreground" data-testid="contrast-ratio"
            >{{ rating.ratio.toFixed(2) }}:1</strong
          >
        </UiCard>
        <UiCard>
          <div class="grid grid-cols-[1fr_auto_auto] gap-x-5 gap-y-3 text-sm">
            <b></b><b>AA</b><b>AAA</b> <span>{{ t('normal') }}</span
            ><span :class="rating.normalAA ? 'text-success' : 'text-danger'">{{
              t(rating.normalAA ? 'pass' : 'fail')
            }}</span
            ><span :class="rating.normalAAA ? 'text-success' : 'text-danger'">{{
              t(rating.normalAAA ? 'pass' : 'fail')
            }}</span>
            <span>{{ t('large') }}</span
            ><span :class="rating.largeAA ? 'text-success' : 'text-danger'">{{
              t(rating.largeAA ? 'pass' : 'fail')
            }}</span
            ><span :class="rating.largeAAA ? 'text-success' : 'text-danger'">{{
              t(rating.largeAAA ? 'pass' : 'fail')
            }}</span>
          </div>
        </UiCard>
      </div>

      <UiCard v-if="rating" :title="t('suggestions')">
        <p v-if="rating.normalAA" class="text-sm text-success">
          {{ t('already') }}
        </p>
        <div v-else class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="suggestion in [
              { label: 'changeForeground', value: foregroundSuggestion, target: 'foreground' },
              { label: 'changeBackground', value: backgroundSuggestion, target: 'background' },
            ]"
            :key="suggestion.target"
            class="flex items-center justify-between rounded-md border border-workshop-border p-3"
          >
            <span
              ><b class="block text-sm">{{ t(suggestion.label) }}</b
              ><code class="text-xs text-muted-foreground">{{ suggestion.value }}</code></span
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
