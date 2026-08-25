<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHashShareState } from '@craftchest/toolkit-core'
import { UiButton, UiCard } from '@craftchest/ui'
import { isEasingShareState, toEasingShareState } from './share-state'
import { EASING_PRESETS, toCubicBezier, toSvgPath, type BezierCurve } from './service'

const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      presets: '常用预设',
      controls: '控制点',
      curve: '曲线视图',
      preview: '运动预览',
      replay: '重新播放',
      duration: '时长',
      output: 'CSS 输出',
      copy: '复制',
      copied: '已复制',
      share: '复制分享链接',
      shared: '分享链接已复制',
      shareFailed: '状态或剪贴板不可用',
      invalidShare: '分享链接状态无效，已使用默认值',
    },
    en: {
      presets: 'Presets',
      controls: 'Control points',
      curve: 'Curve view',
      preview: 'Motion preview',
      replay: 'Replay',
      duration: 'Duration',
      output: 'CSS output',
      copy: 'Copy',
      copied: 'Copied',
      share: 'Copy share link',
      shared: 'Share link copied',
      shareFailed: 'State or clipboard unavailable',
      invalidShare: 'Invalid shared state — defaults restored',
    },
  },
})

const curve = reactive<BezierCurve>({ ...EASING_PRESETS.ease })
const duration = ref(1200)
const running = ref(false)
const copied = ref(false)
const cssValue = computed(() => toCubicBezier(curve))
const path = computed(() => toSvgPath(curve))
const { status: shareState, copyUrl: shareEasing } = useHashShareState({
  validate: isEasingShareState,
  read: () => toEasingShareState(curve, duration.value),
  apply: (shared) => {
    curve.x1 = shared.curve.x1
    curve.y1 = shared.curve.y1
    curve.x2 = shared.curve.x2
    curve.y2 = shared.curve.y2
    duration.value = shared.duration
  },
})
const shareLabel = computed(() => {
  if (shareState.value === 'copied') return t('shared')
  if (shareState.value === 'failed') return t('shareFailed')
  return t('share')
})

function applyPreset(name: keyof typeof EASING_PRESETS): void {
  Object.assign(curve, EASING_PRESETS[name])
  replay()
}

function replay(): void {
  running.value = false
  requestAnimationFrame(() => requestAnimationFrame(() => (running.value = true)))
}

async function copyCss(): Promise<void> {
  await navigator.clipboard.writeText(`transition-timing-function: ${cssValue.value};`)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[20rem_1fr]">
    <UiCard>
      <section>
        <h2 class="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {{ t('presets') }}
        </h2>
        <div class="flex flex-wrap gap-2">
          <UiButton v-for="(_, name) in EASING_PRESETS" :key="name" @click="applyPreset(name)">{{
            name
          }}</UiButton>
        </div>
      </section>

      <section class="mt-5 grid gap-4">
        <h2 class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {{ t('controls') }}
        </h2>
        <label
          v-for="key in ['x1', 'y1', 'x2', 'y2'] as const"
          :key="key"
          class="grid gap-1 text-sm"
        >
          <span class="flex justify-between"
            ><b>{{ key }}</b
            ><output>{{ curve[key].toFixed(2) }}</output></span
          >
          <input
            v-model.number="curve[key]"
            type="range"
            :min="key.startsWith('x') ? 0 : -0.5"
            :max="key.startsWith('x') ? 1 : 1.5"
            step="0.01"
            class="ui-range-input"
          />
        </label>
        <label class="grid gap-1 text-sm"
          ><span class="flex justify-between"
            ><b>{{ t('duration') }}</b
            ><output>{{ duration }}ms</output></span
          ><input
            v-model.number="duration"
            type="range"
            min="300"
            max="3000"
            step="100"
            class="ui-range-input"
        /></label>
      </section>
    </UiCard>

    <div class="grid gap-4 lg:grid-cols-2">
      <UiCard :title="t('curve')">
        <svg
          viewBox="0 -100 200 400"
          class="mx-auto block aspect-square max-h-72 w-full"
          role="img"
          :aria-label="cssValue"
        >
          <path
            d="M 0 200 L 200 0"
            stroke="currentColor"
            class="text-workshop-border"
            stroke-dasharray="5"
          />
          <path
            :d="path"
            fill="none"
            stroke="currentColor"
            class="text-primary"
            stroke-width="5"
            stroke-linecap="round"
          />
          <circle cx="0" cy="200" r="6" class="fill-foreground" />
          <circle cx="200" cy="0" r="6" class="fill-foreground" />
        </svg>
      </UiCard>

      <UiCard :title="t('preview')">
        <div class="relative mt-8 h-8 rounded-full bg-surface-muted shadow-inner">
          <div
            class="absolute top-0 size-8 rounded-full bg-primary shadow-md"
            :style="{
              left: running ? 'calc(100% - 2rem)' : '0',
              transitionProperty: 'left',
              transitionDuration: `${duration}ms`,
              transitionTimingFunction: cssValue,
            }"
            data-testid="easing-ball"
          />
        </div>
        <UiButton class="mt-8" variant="primary" @click="replay">{{ t('replay') }}</UiButton>
      </UiCard>

      <UiCard :title="t('output')" class="lg:col-span-2">
        <code
          class="block break-all rounded-md bg-code-surface p-3 text-sm text-code-accent"
          data-testid="easing-css"
          >transition-timing-function: {{ cssValue }};</code
        >
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <UiButton @click="copyCss">{{ copied ? t('copied') : t('copy') }}</UiButton>
          <UiButton @click="shareEasing">{{ shareLabel }}</UiButton>
        </div>
        <p v-if="shareState === 'invalid'" class="mt-2 text-xs text-danger">
          {{ t('invalidShare') }}
        </p>
      </UiCard>
    </div>
  </div>
</template>
