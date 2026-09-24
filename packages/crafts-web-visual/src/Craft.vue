<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { decodeCraftShareHash, encodeCraftShareHash } from '@craftchest/craft-core'
import { createZip } from '@craftchest/toolkit-core/zip'
import { normalizeHex } from '@craftchest/tools-fe/contrast-checker/service'
import { UiButton, UiCard } from '@craftchest/ui'
import { webVisualCraft } from './meta'
import { isWebVisualShareOptions, toWebVisualShareOptions } from './share-state'
import {
  COLOR_SHADES,
  DEFAULT_WEB_VISUAL_OPTIONS,
  createWebVisualBundle,
  type WebVisualOptions,
} from './service'

const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      colors: '配色材料',
      brand: '品牌主色',
      accent: '辅助色',
      colorInvalid: '请输入 #RGB 或 #RRGGBB。',
      gradient: '渐变设置',
      gradientKind: '类型',
      linear: '线性',
      radial: '径向',
      conic: '锥形',
      angle: '角度',
      reset: '恢复默认值',
      share: '复制选项链接',
      shared: '选项链接已复制',
      shareFailed: '复制失败，请检查浏览器剪贴板权限。',
      shareInvalid: '分享选项无效，已使用默认值。',
      preview: '渐变预览',
      previewTitle: '一组可访问、可复用的设计令牌',
      previewBody: '在真实背景上检查品牌色、辅助色与渐变的组合效果。',
      palette: '颜色色阶',
      paletteNote: '色阶以 RGB 混色生成，作为设计起稿；请结合实际背景复核。',
      contrast: '文字对比度',
      combination: '颜色组合',
      white: '白色背景',
      ink: '深色背景',
      ratio: '对比度',
      normalAA: '普通文字 AA',
      largeAA: '大号文字 AA',
      pass: '通过',
      fail: '未通过',
      suggestedText: 'AA 建议前景色',
      outputs: '设计令牌与导出',
      css: 'CSS Custom Properties',
      tailwind: 'Tailwind CSS v4 主题',
      dtcg: 'DTCG JSON',
      gradientCss: '渐变 CSS',
      copy: '复制',
      copied: '已复制',
      copyFailed: '复制失败',
      download: '下载文件',
      downloadZip: '下载完整 ZIP',
      zipReady: '包含 CSS、Tailwind 主题、DTCG JSON 与渐变声明。',
    },
    en: {
      colors: 'Color inputs',
      brand: 'Brand color',
      accent: 'Accent color',
      colorInvalid: 'Enter a color as #RGB or #RRGGBB.',
      gradient: 'Gradient settings',
      gradientKind: 'Type',
      linear: 'Linear',
      radial: 'Radial',
      conic: 'Conic',
      angle: 'Angle',
      reset: 'Restore defaults',
      share: 'Copy option link',
      shared: 'Option link copied',
      shareFailed: 'Copy failed. Check browser clipboard permission.',
      shareInvalid: 'Shared options were invalid; defaults are in use.',
      preview: 'Gradient preview',
      previewTitle: 'Accessible, reusable design tokens',
      previewBody: 'Review the brand, accent, and gradient together on a real surface.',
      palette: 'Color ramps',
      paletteNote:
        'Ramps use RGB mixing as a starting point; verify them against your actual surfaces.',
      contrast: 'Text contrast',
      combination: 'Color pairing',
      white: 'White background',
      ink: 'Dark background',
      ratio: 'Contrast',
      normalAA: 'Normal text AA',
      largeAA: 'Large text AA',
      pass: 'Pass',
      fail: 'Fail',
      suggestedText: 'Suggested AA foreground',
      outputs: 'Tokens and exports',
      css: 'CSS Custom Properties',
      tailwind: 'Tailwind CSS v4 theme',
      dtcg: 'DTCG JSON',
      gradientCss: 'Gradient CSS',
      copy: 'Copy',
      copied: 'Copied',
      copyFailed: 'Copy failed',
      download: 'Download file',
      downloadZip: 'Download complete ZIP',
      zipReady: 'Includes CSS, Tailwind theme, DTCG JSON, and gradient declaration.',
    },
  },
})

const options = reactive<WebVisualOptions>({ ...DEFAULT_WEB_VISUAL_OPTIONS })
const shareStatus = ref<'idle' | 'copied' | 'failed' | 'invalid'>('idle')
const copiedFile = ref('')

const bundle = computed(() => {
  if (!normalizeHex(options.brandColor) || !normalizeHex(options.accentColor)) return null
  try {
    return createWebVisualBundle({ ...options })
  } catch {
    return null
  }
})
const palettes = computed(() =>
  bundle.value
    ? [
        { id: 'brand', label: t('brand'), shades: bundle.value.brandPalette },
        { id: 'accent', label: t('accent'), shades: bundle.value.accentPalette },
      ]
    : [],
)
const outputs = computed(() =>
  bundle.value
    ? [
        { id: 'tokens-css', filename: 'tokens.css', label: t('css'), content: bundle.value.css },
        {
          id: 'tailwind-theme',
          filename: 'tailwind-theme.css',
          label: t('tailwind'),
          content: bundle.value.tailwindTheme,
        },
        {
          id: 'dtcg-tokens',
          filename: 'tokens.tokens.json',
          label: t('dtcg'),
          content: bundle.value.dtcgJson,
        },
        {
          id: 'gradient-css',
          filename: 'gradient.css',
          label: t('gradientCss'),
          content: bundle.value.gradientCss,
        },
      ]
    : [],
)
const shareLabel = computed(() => {
  if (shareStatus.value === 'copied') return t('shared')
  if (shareStatus.value === 'failed') return t('shareFailed')
  return t('share')
})
const gradientKindModel = computed({
  get: () => options.gradientKind,
  set: (value: string) => {
    if (value === 'linear' || value === 'radial' || value === 'conic') {
      options.gradientKind = value
    }
  },
})

function resetOptions(): void {
  Object.assign(options, DEFAULT_WEB_VISUAL_OPTIONS)
}

function download(filename: string, content: string, mediaType: string): void {
  const blob = new Blob([content], { type: mediaType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

async function downloadBundle(): Promise<void> {
  if (outputs.value.length === 0) return
  const zip = await createZip(
    outputs.value.map(({ filename, content }) => ({ name: filename, data: content })),
  )
  const url = URL.createObjectURL(zip)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'web-visual-kit.zip'
  anchor.click()
  URL.revokeObjectURL(url)
}

async function copyOutput(id: string, content: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(content)
    copiedFile.value = id
  } catch {
    copiedFile.value = 'failed'
  }
  setTimeout(() => (copiedFile.value = ''), 1500)
}

async function copyShare(): Promise<void> {
  if (!bundle.value) return
  const hash = encodeCraftShareHash(webVisualCraft, toWebVisualShareOptions(options))
  const url = new URL(window.location.href)
  url.hash = hash.slice(1)
  window.history.replaceState(window.history.state, '', url)
  try {
    await navigator.clipboard.writeText(url.toString())
    shareStatus.value = 'copied'
  } catch {
    shareStatus.value = 'failed'
  }
}

onMounted(() => {
  if (!window.location.hash) return
  const shared = decodeCraftShareHash(window.location.hash, webVisualCraft, isWebVisualShareOptions)
  if (shared) Object.assign(options, shared.options)
  else shareStatus.value = 'invalid'
})
</script>

<template>
  <div class="grid min-w-0 grid-cols-1 gap-5" data-testid="web-visual-craft">
    <section class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
      <UiCard :title="t('colors')">
        <div class="grid gap-4">
          <label class="grid gap-1.5 text-sm font-semibold">
            {{ t('brand') }}
            <span class="grid grid-cols-[1fr_auto] gap-2">
              <input v-model="options.brandColor" class="ui-native-field font-mono" />
              <input v-model="options.brandColor" type="color" class="ui-color-input" />
            </span>
            <span
              v-if="!normalizeHex(options.brandColor)"
              class="text-xs font-normal text-danger"
              role="alert"
            >
              {{ t('colorInvalid') }}
            </span>
          </label>
          <label class="grid gap-1.5 text-sm font-semibold">
            {{ t('accent') }}
            <span class="grid grid-cols-[1fr_auto] gap-2">
              <input v-model="options.accentColor" class="ui-native-field font-mono" />
              <input v-model="options.accentColor" type="color" class="ui-color-input" />
            </span>
            <span
              v-if="!normalizeHex(options.accentColor)"
              class="text-xs font-normal text-danger"
              role="alert"
            >
              {{ t('colorInvalid') }}
            </span>
          </label>
          <label class="grid gap-1.5 text-sm font-semibold">
            {{ t('gradientKind') }}
            <select v-model="gradientKindModel" class="ui-native-field">
              <option value="linear">{{ t('linear') }}</option>
              <option value="radial">{{ t('radial') }}</option>
              <option value="conic">{{ t('conic') }}</option>
            </select>
          </label>
          <label class="grid gap-1.5 text-sm font-semibold">
            <span class="flex justify-between"
              ><span>{{ t('angle') }}</span
              ><output>{{ options.gradientAngle }}°</output></span
            >
            <input
              v-model.number="options.gradientAngle"
              type="range"
              min="0"
              max="359"
              step="1"
              class="ui-range-input"
            />
          </label>
          <div class="flex flex-wrap gap-2">
            <UiButton @click="resetOptions">{{ t('reset') }}</UiButton>
            <UiButton :disabled="!bundle" @click="copyShare">{{ shareLabel }}</UiButton>
          </div>
          <p
            v-if="shareStatus === 'failed' || shareStatus === 'invalid'"
            class="text-xs text-danger"
            role="status"
          >
            {{ shareStatus === 'invalid' ? t('shareInvalid') : t('shareFailed') }}
          </p>
        </div>
      </UiCard>

      <UiCard :title="t('preview')">
        <div
          v-if="bundle"
          class="grid min-h-64 content-end rounded-lg border border-black/10 p-6 text-white shadow-inner sm:p-9"
          :style="{ background: bundle.gradient }"
          data-testid="web-visual-gradient-preview"
        >
          <div class="max-w-xl rounded-md bg-black/15 p-4 backdrop-blur-sm sm:p-5">
            <h2 class="text-2xl font-bold">{{ t('previewTitle') }}</h2>
            <p class="mt-2 text-sm leading-relaxed">{{ t('previewBody') }}</p>
          </div>
        </div>
        <p
          v-else
          class="rounded-md border border-dashed border-workshop-border p-5 text-sm text-danger"
          role="alert"
        >
          {{ t('colorInvalid') }}
        </p>
        <p
          v-if="bundle"
          class="mt-3 break-all font-mono text-xs text-muted-foreground"
          data-testid="web-visual-gradient-css"
        >
          {{ bundle.gradientCss }}
        </p>
      </UiCard>
    </section>

    <UiCard :title="t('palette')">
      <div class="grid gap-5">
        <div v-for="palette in palettes" :key="palette.id" class="grid gap-2">
          <div class="flex items-center justify-between text-sm">
            <b>{{ palette.label }}</b
            ><code class="font-mono text-muted-foreground">{{ palette.shades[500] }}</code>
          </div>
          <div class="grid grid-cols-3 gap-2 sm:grid-cols-6 xl:grid-cols-11">
            <div
              v-for="shade in COLOR_SHADES"
              :key="shade"
              class="min-w-0 overflow-hidden rounded-md border border-workshop-border"
            >
              <div
                class="h-12"
                :style="{ backgroundColor: palette.shades[shade] }"
                :title="palette.shades[shade]"
              />
              <div class="bg-surface-raised px-1.5 py-1 text-center">
                <span class="block text-[10px] font-semibold">{{ shade }}</span>
                <code class="block truncate text-[9px] text-muted-foreground">{{
                  palette.shades[shade]
                }}</code>
              </div>
            </div>
          </div>
        </div>
        <p class="text-xs leading-relaxed text-muted-foreground">{{ t('paletteNote') }}</p>
      </div>
    </UiCard>

    <UiCard v-if="bundle" :title="t('contrast')">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[38rem] border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-workshop-border text-xs text-muted-foreground">
              <th class="px-3 py-2">{{ t('combination') }}</th>
              <th class="px-3 py-2">{{ t('ratio') }}</th>
              <th class="px-3 py-2">{{ t('normalAA') }}</th>
              <th class="px-3 py-2">{{ t('largeAA') }}</th>
              <th class="px-3 py-2">{{ t('suggestedText') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="check in bundle.contrastChecks"
              :key="check.id"
              class="border-b border-workshop-border/60"
            >
              <td class="px-3 py-3">{{ t(check.label) }} · {{ t(check.background) }}</td>
              <td class="px-3 py-3 font-mono">{{ check.ratio.toFixed(2) }}:1</td>
              <td class="px-3 py-3" :class="check.normalAA ? 'text-success' : 'text-danger'">
                {{ t(check.normalAA ? 'pass' : 'fail') }}
              </td>
              <td class="px-3 py-3" :class="check.largeAA ? 'text-success' : 'text-danger'">
                {{ t(check.largeAA ? 'pass' : 'fail') }}
              </td>
              <td class="px-3 py-3 font-mono">{{ check.suggestedForeground }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>

    <UiCard v-if="bundle" :title="t('outputs')">
      <p class="mb-4 text-sm text-muted-foreground">{{ t('zipReady') }}</p>
      <div class="grid min-w-0 gap-3">
        <details
          v-for="output in outputs"
          :key="output.id"
          class="min-w-0 overflow-hidden rounded-md border border-workshop-border bg-surface-muted/20"
        >
          <summary class="flex cursor-pointer flex-wrap items-center gap-3 px-3 py-2.5 text-sm">
            <span class="min-w-0 flex-1 font-semibold">{{ output.label }}</span>
            <code class="text-xs text-muted-foreground">{{ output.filename }}</code>
          </summary>
          <pre
            class="max-h-64 overflow-auto border-t border-workshop-border bg-code-surface p-3 text-xs leading-relaxed text-code-accent"
          ><code>{{ output.content }}</code></pre>
          <div class="flex flex-wrap gap-2 border-t border-workshop-border px-3 py-2">
            <UiButton @click="copyOutput(output.id, output.content)">{{
              copiedFile === output.id
                ? t('copied')
                : copiedFile === 'failed'
                  ? t('copyFailed')
                  : t('copy')
            }}</UiButton>
            <UiButton
              @click="
                download(
                  output.filename,
                  output.content,
                  output.filename.endsWith('.json') ? 'application/json' : 'text/css',
                )
              "
              >{{ t('download') }}</UiButton
            >
          </div>
        </details>
      </div>
      <div class="mt-4">
        <UiButton data-testid="download-web-visual-zip" variant="primary" @click="downloadBundle">{{
          t('downloadZip')
        }}</UiButton>
      </div>
    </UiCard>
  </div>
</template>
