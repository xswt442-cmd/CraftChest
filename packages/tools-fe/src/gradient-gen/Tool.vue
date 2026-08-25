<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { buildHashStateUrl, decodeHashState, hasHashState } from '@craftchest/toolkit-core'
import { UiButton, UiCard } from '@craftchest/ui'
import { isGradientShareState, toGradientShareState } from './share-state'
import { buildGradient, toBackgroundDeclaration, type GradientKind } from './service'

const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      preview: '实时预览',
      type: '渐变类型',
      linear: '线性',
      radial: '径向',
      conic: '锥形',
      angle: '角度',
      centerX: '中心 X',
      centerY: '中心 Y',
      start: '起始色',
      end: '结束色',
      css: 'CSS 输出',
      copy: '复制 CSS',
      copied: '已复制',
      copyFailed: '复制失败，请手动选择',
      share: '复制分享链接',
      shared: '分享链接已复制',
      shareFailed: '状态或剪贴板不可用',
      invalidShare: '分享链接状态无效，已使用默认值',
    },
    en: {
      preview: 'Live preview',
      type: 'Gradient type',
      linear: 'Linear',
      radial: 'Radial',
      conic: 'Conic',
      angle: 'Angle',
      centerX: 'Center X',
      centerY: 'Center Y',
      start: 'Start color',
      end: 'End color',
      css: 'CSS output',
      copy: 'Copy CSS',
      copied: 'Copied',
      copyFailed: 'Copy failed — select manually',
      share: 'Copy share link',
      shared: 'Share link copied',
      shareFailed: 'State or clipboard unavailable',
      invalidShare: 'Invalid shared state — defaults restored',
    },
  },
})

const state = reactive({ kind: 'linear' as GradientKind, angle: 135, centerX: 50, centerY: 50 })
const colors = reactive([
  { color: '#f59e0b', position: 0 },
  { color: '#ec4899', position: 100 },
])
const options = computed(() => ({ ...state, stops: colors }))
const gradient = computed(() => buildGradient(options.value))
const declaration = computed(() => toBackgroundDeclaration(options.value))
const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
const shareState = ref<'idle' | 'copied' | 'failed' | 'invalid'>('idle')
const shareLabel = computed(() => {
  if (shareState.value === 'copied') return t('shared')
  if (shareState.value === 'failed') return t('shareFailed')
  return t('share')
})

onMounted(() => {
  if (!hasHashState(window.location.hash)) return
  const shared = decodeHashState(window.location.hash, isGradientShareState)
  if (!shared) {
    shareState.value = 'invalid'
    return
  }
  Object.assign(state, {
    kind: shared.kind,
    angle: shared.angle,
    centerX: shared.centerX,
    centerY: shared.centerY,
  })
  colors[0]!.color = shared.colors[0]
  colors[1]!.color = shared.colors[1]
})

async function copyCss(): Promise<void> {
  try {
    await navigator.clipboard.writeText(declaration.value)
    copyState.value = 'copied'
  } catch {
    copyState.value = 'failed'
  }
  setTimeout(() => (copyState.value = 'idle'), 1500)
}

async function shareGradient(): Promise<void> {
  const shared = toGradientShareState(options.value)
  if (!isGradientShareState(shared)) {
    shareState.value = 'failed'
    return
  }
  const url = buildHashStateUrl(window.location.href, shared)
  window.history.replaceState(window.history.state, '', url)
  try {
    await navigator.clipboard.writeText(url)
    shareState.value = 'copied'
  } catch {
    shareState.value = 'failed'
  }
  setTimeout(() => (shareState.value = 'idle'), 1800)
}
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[minmax(18rem,24rem)_1fr]">
    <UiCard>
      <div class="grid gap-4">
        <label class="grid gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {{ t('type') }}
          <select
            v-model="state.kind"
            class="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          >
            <option value="linear">{{ t('linear') }}</option>
            <option value="radial">{{ t('radial') }}</option>
            <option value="conic">{{ t('conic') }}</option>
          </select>
        </label>

        <label v-if="state.kind !== 'radial'" class="grid gap-1 text-sm">
          <span class="flex justify-between"
            ><b>{{ t('angle') }}</b
            ><output>{{ state.angle }}°</output></span
          >
          <input
            v-model.number="state.angle"
            type="range"
            min="0"
            max="359"
            class="accent-amber-500"
          />
        </label>

        <template v-if="state.kind !== 'linear'">
          <label
            v-for="axis in ['centerX', 'centerY'] as const"
            :key="axis"
            class="grid gap-1 text-sm"
          >
            <span class="flex justify-between"
              ><b>{{ t(axis) }}</b
              ><output>{{ state[axis] }}%</output></span
            >
            <input
              v-model.number="state[axis]"
              type="range"
              min="0"
              max="100"
              class="accent-amber-500"
            />
          </label>
        </template>

        <label
          v-for="(stop, index) in colors"
          :key="index"
          class="grid grid-cols-[1fr_auto] items-end gap-3 text-sm font-medium"
        >
          <span class="grid gap-1.5">
            {{ t(index === 0 ? 'start' : 'end') }}
            <input
              v-model="stop.color"
              class="rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono dark:border-neutral-700 dark:bg-neutral-950"
            />
          </span>
          <input
            v-model="stop.color"
            type="color"
            class="size-10 cursor-pointer rounded border-0 bg-transparent"
          />
        </label>
      </div>
    </UiCard>

    <div class="grid gap-4">
      <UiCard :title="t('preview')">
        <div
          class="min-h-72 rounded-lg border border-black/10 shadow-inner"
          :style="{ background: gradient }"
          data-testid="gradient-preview"
        />
      </UiCard>
      <UiCard :title="t('css')">
        <code
          class="block break-all rounded-md bg-neutral-950 p-3 text-sm text-amber-300"
          data-testid="gradient-css"
          >{{ declaration }}</code
        >
        <div class="mt-3 flex items-center gap-3">
          <UiButton variant="primary" @click="copyCss">{{
            copyState === 'copied' ? t('copied') : t('copy')
          }}</UiButton>
          <UiButton @click="shareGradient">{{ shareLabel }}</UiButton>
          <span v-if="copyState === 'failed'" class="text-xs text-red-600">{{
            t('copyFailed')
          }}</span>
        </div>
        <p v-if="shareState === 'invalid'" class="mt-2 text-xs text-red-600 dark:text-red-400">
          {{ t('invalidShare') }}
        </p>
      </UiCard>
    </div>
  </div>
</template>
