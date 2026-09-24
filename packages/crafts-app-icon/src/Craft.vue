<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { writeClipboardText } from '@craftchest/toolkit-core'
import {
  decodeCraftShareHash,
  encodeCraftShareHash,
  transitionCraftState,
  type CraftArtifact,
  type CraftState,
} from '@craftchest/craft-core'
import { UiButton, UiCard } from '@craftchest/ui'
import { appIconCraft } from './meta'
import { isIconShareOptions, toIconShareOptions } from './share-state'
import {
  DEFAULT_ICON_OPTIONS,
  ICON_OUTPUTS,
  MAX_MASKABLE_INSET,
  MIN_MASKABLE_INSET,
  backgroundStrategyFor,
  diagnoseImage,
  generateIconPackage,
  iconLayoutFor,
  maskableSafeZone,
  shouldInvalidateGeneratedArtifacts,
  validatePngInput,
  type IconOptions,
  type IconOutput,
  type ImageDiagnostics,
  type LayoutPlan,
} from './service'

interface DecodedImage {
  file: File
  image: HTMLImageElement
  url: string
  diagnostics: ImageDiagnostics
}

const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      source: '源 PNG',
      choose: '选择 PNG',
      drop: '拖入 PNG，或选择文件',
      onlyPng: '仅支持 PNG，文件不会离开此浏览器。',
      invalid: '无法读取这张 PNG。请确认文件没有损坏。',
      tooLarge: 'PNG 超出本地处理限制（最大 25 MiB、8192 px 边长或 3200 万像素）。',
      diagnostics: '图片诊断',
      size: '尺寸',
      ratio: '比例',
      alpha: '透明通道',
      yes: '有',
      no: '无',
      bounds: '可见内容边界',
      empty: '图片完全透明，无法生成有意义的图标。',
      nonSquare: '非正方形素材会等比留白，不会被拉伸。',
      options: '输出选项',
      background: '背景色',
      scale: '普通缩放',
      inset: 'Maskable 内容缩进（默认 22%）',
      reset: '恢复默认值',
      preview: '四类情境预览',
      browser: '浏览器 favicon',
      pwa: 'PWA any',
      maskable: 'Android maskable',
      apple: 'Apple Touch',
      safe: '安全区',
      generate: '生成交付包',
      generating: '正在本地生成…',
      download: '下载',
      downloadAll: '下载 ZIP',
      outputs: '生成产物',
      partial: '部分产物失败；成功项目仍可下载。',
      share: '复制选项链接',
      shared: '选项链接已复制',
      shareFailed: '无法复制链接',
      shareInvalid: '分享选项无效，已使用默认值。',
      steps: '处理记录',
      noSource: '先提供一张 PNG，即可查看预览并生成图标。',
      sourceLabel: '已加载：{name}',
    },
    en: {
      source: 'Source PNG',
      choose: 'Choose PNG',
      drop: 'Drop a PNG or choose a file',
      onlyPng: 'PNG only. The file never leaves this browser.',
      invalid: 'This PNG could not be read. Check that the file is not corrupted.',
      tooLarge: 'This PNG exceeds the local limit (25 MiB, 8,192 px per edge, or 32M pixels).',
      diagnostics: 'Image diagnostics',
      size: 'Dimensions',
      ratio: 'Aspect ratio',
      alpha: 'Alpha channel',
      yes: 'Yes',
      no: 'No',
      bounds: 'Visible-content bounds',
      empty: 'The image is fully transparent, so it cannot produce a meaningful icon.',
      nonSquare: 'Non-square sources are contained with padding; they are never stretched.',
      options: 'Output options',
      background: 'Background color',
      scale: 'Regular scale',
      inset: 'Maskable content inset (22% default)',
      reset: 'Restore defaults',
      preview: 'Four context previews',
      browser: 'Browser favicon',
      pwa: 'PWA any',
      maskable: 'Android maskable',
      apple: 'Apple Touch',
      safe: 'Safe zone',
      generate: 'Generate delivery package',
      generating: 'Generating locally…',
      download: 'Download',
      downloadAll: 'Download ZIP',
      outputs: 'Generated artifacts',
      partial: 'Some artifacts failed; successful items remain downloadable.',
      share: 'Copy option link',
      shared: 'Option link copied',
      shareFailed: 'Could not copy link',
      shareInvalid: 'Shared options were invalid; defaults are in use.',
      steps: 'Processing record',
      noSource: 'Provide a PNG to preview and generate the icon package.',
      sourceLabel: 'Loaded: {name}',
    },
  },
})

const input = ref<HTMLInputElement>()
const source = ref<DecodedImage>()
const sourceError = ref('')
const dragActive = ref(false)
const generating = ref(false)
const shareStatus = ref<'idle' | 'copied' | 'failed' | 'invalid'>('idle')
const artifacts = ref<CraftArtifact<Blob | string>[]>([])
const craftState = ref<CraftState>({
  status: 'idle',
  phaseResults: [],
  warnings: [],
  artifacts: [],
})
const options = reactive<IconOptions>({ ...DEFAULT_ICON_OPTIONS })
let generationRevision = 0

const diagnostics = computed(() => source.value?.diagnostics)
const hasUsableSource = computed(
  () => source.value !== undefined && diagnostics.value?.alphaBounds !== null,
)
const zipArtifact = computed(() =>
  artifacts.value.find((artifact) => artifact.id === 'favicon-package'),
)
const outputArtifacts = computed(() =>
  artifacts.value.filter((artifact) => artifact.id !== 'favicon-package'),
)
const safeZoneStyle = computed(() => {
  const zone = maskableSafeZone(100)
  return { left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.size}%`, height: `${zone.size}%` }
})
const previewCards = computed(() => [
  { id: 'browser', label: t('browser'), rounded: 'rounded-md', output: ICON_OUTPUTS[2] },
  { id: 'pwa', label: t('pwa'), rounded: 'rounded-[22%]', output: ICON_OUTPUTS[4] },
  { id: 'maskable', label: t('maskable'), rounded: 'rounded-[28%]', output: ICON_OUTPUTS[6] },
  { id: 'apple', label: t('apple'), rounded: 'rounded-[24%]', output: ICON_OUTPUTS[3] },
])

function previewContainerStyle(output: IconOutput): Record<string, string> {
  if (backgroundStrategyFor(output) === 'baked') return { backgroundColor: options.backgroundColor }
  return {
    backgroundColor: '#e5e7eb',
    backgroundImage:
      'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0',
    backgroundSize: '12px 12px',
  }
}

function previewImageStyle(output: IconOutput): Record<string, string> {
  if (!source.value) return {}
  const plan = iconLayoutFor(
    output,
    source.value.image.naturalWidth,
    source.value.image.naturalHeight,
    options,
  )
  return {
    left: `${(plan.x / output.size) * 100}%`,
    top: `${(plan.y / output.size) * 100}%`,
    width: `${(plan.width / output.size) * 100}%`,
    height: `${(plan.height / output.size) * 100}%`,
  }
}

function moveTo(status: CraftState['status']): void {
  const next = transitionCraftState(craftState.value, status)
  if (next) craftState.value = next
}

function resetOptions(): void {
  Object.assign(options, DEFAULT_ICON_OPTIONS)
}

function clearSource(): void {
  generationRevision += 1
  if (source.value) URL.revokeObjectURL(source.value.url)
  source.value = undefined
  artifacts.value = []
}

async function decodePng(file: File): Promise<DecodedImage> {
  if (file.type !== 'image/png') throw new TypeError('Only PNG files are supported')
  validatePngInput(file.size)
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  if (![137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => header[index] === byte)) {
    throw new TypeError('The file is not a PNG')
  }
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new TypeError('PNG decode failed'))
      image.src = url
    })
    validatePngInput(file.size, image.naturalWidth, image.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Canvas is unavailable')
    context.drawImage(image, 0, 0)
    return {
      file,
      image,
      url,
      diagnostics: diagnoseImage(
        image.naturalWidth,
        image.naturalHeight,
        context.getImageData(0, 0, canvas.width, canvas.height).data,
      ),
    }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

async function acceptFile(file: File | undefined): Promise<void> {
  if (!file) return
  sourceError.value = ''
  clearSource()
  if (craftState.value.status !== 'idle') moveTo('idle')
  try {
    const decoded = await decodePng(file)
    source.value = decoded
    if (decoded.diagnostics.alphaBounds === null) {
      moveTo('input-invalid')
      sourceError.value = t('empty')
      return
    }
    moveTo('processing')
    craftState.value = {
      ...craftState.value,
      phaseResults: [
        {
          stepId: 'diagnose-image',
          status: 'succeeded',
          usedMaterialIds: ['source-png'],
          artifactIds: ['image-diagnostics'],
          summary: `${decoded.diagnostics.width}×${decoded.diagnostics.height}`,
          warnings: [],
        },
      ],
    }
    moveTo('preview-ready')
  } catch (error) {
    moveTo('input-invalid')
    sourceError.value = error instanceof RangeError ? t('tooLarge') : t('invalid')
  }
}

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement
  void acceptFile(target.files?.[0])
  target.value = ''
}

function onDrop(event: DragEvent): void {
  event.preventDefault()
  dragActive.value = false
  void acceptFile(event.dataTransfer?.files[0])
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))),
      'image/png',
    ),
  )
}

async function renderPng(
  output: IconOutput,
  plan: LayoutPlan,
  backgroundColor: string,
): Promise<Blob> {
  if (!source.value) throw new Error('No source image')
  const canvas = document.createElement('canvas')
  canvas.width = output.size
  canvas.height = output.size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is unavailable')
  if (backgroundStrategyFor(output) === 'baked') {
    context.fillStyle = backgroundColor
    context.fillRect(0, 0, output.size, output.size)
  }
  context.drawImage(source.value.image, plan.x, plan.y, plan.width, plan.height)
  return canvasBlob(canvas)
}

async function generate(): Promise<void> {
  if (!source.value || !hasUsableSource.value || generating.value) return
  generating.value = true
  artifacts.value = []
  moveTo('processing')
  const revision = generationRevision
  try {
    const generationOptions = { ...options }
    const result = await generateIconPackage(
      { width: source.value.image.naturalWidth, height: source.value.image.naturalHeight },
      generationOptions,
      (output, plan) => renderPng(output, plan, generationOptions.backgroundColor),
    )
    if (revision !== generationRevision) return
    artifacts.value = result.artifacts
    craftState.value = {
      status: result.status,
      phaseResults: result.phaseResults,
      warnings: result.warnings,
      artifacts: result.artifacts,
    }
  } finally {
    generating.value = false
  }
}

function download(artifact: CraftArtifact<Blob | string>): void {
  if (!artifact.filename) return
  const blob =
    typeof artifact.payload === 'string'
      ? new Blob([artifact.payload], { type: artifact.mediaType })
      : artifact.payload
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = artifact.filename
  anchor.click()
  URL.revokeObjectURL(url)
}

async function copyShare(): Promise<void> {
  const hash = encodeCraftShareHash(appIconCraft, toIconShareOptions(options))
  const url = new URL(window.location.href)
  url.hash = hash.slice(1)
  window.history.replaceState(window.history.state, '', url)
  shareStatus.value = (await writeClipboardText(url.toString())) ? 'copied' : 'failed'
}

watch(
  () => ({ ...options }),
  (next, previous) => {
    if (!shouldInvalidateGeneratedArtifacts(previous, next)) return
    generationRevision += 1
    artifacts.value = []
    if (source.value && hasUsableSource.value) {
      craftState.value = {
        status: 'preview-ready',
        phaseResults: craftState.value.phaseResults.filter(
          (result) => result.stepId === 'diagnose-image',
        ),
        warnings: [],
        artifacts: [],
      }
    }
    if (shareStatus.value !== 'invalid') shareStatus.value = 'idle'
  },
)

onMounted(() => {
  if (!window.location.hash) return
  const shared = decodeCraftShareHash(window.location.hash, appIconCraft, isIconShareOptions)
  if (shared) Object.assign(options, shared.options)
  else shareStatus.value = 'invalid'
})
onBeforeUnmount(clearSource)
</script>

<template>
  <div class="grid gap-4" data-testid="app-icon-craft">
    <UiCard :title="t('source')">
      <input ref="input" class="sr-only" type="file" accept="image/png" @change="onInput" />
      <div
        class="grid min-h-40 place-items-center rounded-lg border border-dashed p-5 text-center transition-colors"
        :class="
          dragActive
            ? 'border-primary bg-primary-soft'
            : 'border-workshop-border bg-surface-muted/40'
        "
        @dragenter.prevent="dragActive = true"
        @dragover.prevent="dragActive = true"
        @dragleave.prevent="dragActive = false"
        @drop="onDrop"
      >
        <div class="grid gap-2">
          <b class="text-sm text-foreground">{{
            source ? t('sourceLabel', { name: source.file.name }) : t('drop')
          }}</b>
          <p class="text-xs text-muted-foreground">{{ t('onlyPng') }}</p>
          <UiButton class="mx-auto mt-1" @click="input?.click()">{{ t('choose') }}</UiButton>
        </div>
      </div>
      <p v-if="sourceError" class="mt-3 text-sm text-danger" role="alert">{{ sourceError }}</p>
    </UiCard>

    <template v-if="source && diagnostics">
      <div class="grid gap-4 xl:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.2fr)]">
        <UiCard :title="t('diagnostics')">
          <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <dt class="text-muted-foreground">{{ t('size') }}</dt>
            <dd>{{ diagnostics.width }} × {{ diagnostics.height }}</dd>
            <dt class="text-muted-foreground">{{ t('ratio') }}</dt>
            <dd>{{ diagnostics.aspectRatio.toFixed(2) }}:1</dd>
            <dt class="text-muted-foreground">{{ t('alpha') }}</dt>
            <dd>{{ diagnostics.hasAlpha ? t('yes') : t('no') }}</dd>
            <template v-if="diagnostics.alphaBounds"
              ><dt class="text-muted-foreground">{{ t('bounds') }}</dt>
              <dd>
                {{ diagnostics.alphaBounds.width }} × {{ diagnostics.alphaBounds.height }}
              </dd></template
            >
          </dl>
          <p
            v-if="diagnostics.width !== diagnostics.height"
            class="mt-4 text-xs leading-relaxed text-muted-foreground"
          >
            {{ t('nonSquare') }}
          </p>
        </UiCard>
        <UiCard :title="t('options')">
          <div class="grid gap-4 sm:grid-cols-3">
            <label class="grid gap-1.5 text-sm font-semibold"
              ><span>{{ t('background') }}</span
              ><input v-model="options.backgroundColor" type="color" class="ui-color-input"
            /></label>
            <label class="grid gap-1.5 text-sm font-semibold"
              ><span>{{ t('scale') }} · {{ options.scale.toFixed(2) }}×</span
              ><input
                v-model.number="options.scale"
                class="ui-range-input"
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
            /></label>
            <label class="grid gap-1.5 text-sm font-semibold"
              ><span>{{ t('inset') }} · {{ Math.round(options.maskableInset * 100) }}%</span
              ><input
                v-model.number="options.maskableInset"
                class="ui-range-input"
                type="range"
                :min="MIN_MASKABLE_INSET"
                :max="MAX_MASKABLE_INSET"
                step="0.01"
            /></label>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <UiButton @click="resetOptions">{{ t('reset') }}</UiButton
            ><UiButton @click="copyShare">{{
              shareStatus === 'copied' ? t('shared') : t('share')
            }}</UiButton>
          </div>
          <p
            v-if="shareStatus === 'failed' || shareStatus === 'invalid'"
            class="mt-2 text-xs text-danger"
          >
            {{ shareStatus === 'invalid' ? t('shareInvalid') : t('shareFailed') }}
          </p>
        </UiCard>
      </div>

      <UiCard :title="t('preview')">
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="preview in previewCards"
            :key="preview.id"
            :data-testid="`icon-preview-${preview.id}`"
            class="rounded-lg border border-workshop-border bg-surface-muted/40 p-3"
          >
            <b class="block text-xs text-foreground">{{ preview.label }}</b>
            <div
              class="relative mx-auto mt-3 grid size-28 place-items-center overflow-hidden shadow-sm"
              :class="preview.rounded"
              :style="previewContainerStyle(preview.output)"
            >
              <img
                :src="source.url"
                alt=""
                class="absolute transition-transform"
                :style="previewImageStyle(preview.output)"
              />
              <span
                v-if="preview.id === 'maskable'"
                class="pointer-events-none absolute rounded-full border-2 border-dashed border-foreground/70"
                :style="safeZoneStyle"
              />
            </div>
            <span
              v-if="preview.id === 'maskable'"
              class="mt-2 block text-center text-[10px] text-muted-foreground"
              >{{ t('safe') }}</span
            >
          </div>
        </div>
      </UiCard>

      <div class="flex flex-wrap items-center gap-3">
        <UiButton
          data-testid="generate-icon-package"
          variant="primary"
          :disabled="!hasUsableSource || generating"
          @click="generate"
          >{{ generating ? t('generating') : t('generate') }}</UiButton
        ><UiButton
          v-if="zipArtifact"
          data-testid="download-icon-zip"
          @click="download(zipArtifact)"
          >{{ t('downloadAll') }}</UiButton
        ><span v-if="craftState.status === 'partial-success'" class="text-sm text-danger">{{
          t('partial')
        }}</span>
      </div>

      <UiCard v-if="outputArtifacts.length" :title="t('outputs')">
        <ul class="grid gap-2 sm:grid-cols-2">
          <li
            v-for="artifact in outputArtifacts"
            :key="artifact.id"
            data-testid="icon-output"
            class="flex items-center justify-between gap-3 rounded-md border border-workshop-border bg-surface-muted/35 px-3 py-2 text-sm"
          >
            <span class="min-w-0 truncate font-mono">{{ artifact.filename }}</span
            ><UiButton @click="download(artifact)">{{ t('download') }}</UiButton>
          </li>
        </ul>
      </UiCard>
      <UiCard v-if="craftState.phaseResults.length" :title="t('steps')"
        ><ol class="grid gap-2 text-sm">
          <li
            v-for="result in craftState.phaseResults"
            :key="result.stepId"
            class="flex justify-between gap-3"
          >
            <span>{{ result.stepId }}</span
            ><span :class="result.status === 'failed' ? 'text-danger' : 'text-muted-foreground'">{{
              result.summary
            }}</span>
          </li>
        </ol></UiCard
      >
    </template>
    <UiCard v-else
      ><p class="text-sm text-muted-foreground">{{ t('noSource') }}</p></UiCard
    >
  </div>
</template>
