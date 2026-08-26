<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHashShareState } from '@craftchest/toolkit-core'
import { UiButton, UiCard, UiCheckbox, UiTextarea } from '@craftchest/ui'
import { isPinyinShareState } from './share-state'
import type { PinyinFormat } from './service'
import { toPinyin, toRubyHtml, toRubySegments } from './service'

// 视图层只做交互编排；算法在 service.ts（SPEC §4）
const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      inputLabel: '文本',
      inputPlaceholder: '输入或粘贴中文，例如：银行利率又调整了',
      resultTitle: '拼音文本',
      rubyTitle: 'Ruby 预览',
      htmlTitle: 'HTML 代码',
      formatLabel: '声调格式',
      formats: { symbol: '带调（nǐ）', num: '数字（ni3）', none: '无声调（ni）' },
      multipleLabel: '多音字标注全部读音',
      emptyHint: '输入文本后自动注音',
      copy: '复制拼音',
      copyHtml: '复制 HTML',
      copied: '已复制',
      copyFailed: '复制失败，请手动选择复制',
      htmlNote: '标准 ruby/rp/rt 片段，可直接嵌入 HTML；输入中的标签和特殊字符已转义。',
      note: '非中文字符原样保留；默认按上下文选取读音，勾选后列出多音字全部读音。正文与导出内容只在本地浏览器处理。',
      share: '复制选项链接',
      shared: '选项链接已复制',
      shareFailed: '状态或剪贴板不可用',
      invalidShare: '分享链接选项无效，已使用默认值',
    },
    en: {
      inputLabel: 'Text',
      inputPlaceholder: 'Type or paste Chinese, e.g. 银行利率又调整了',
      resultTitle: 'Pinyin text',
      rubyTitle: 'Ruby preview',
      htmlTitle: 'HTML code',
      formatLabel: 'Tone format',
      formats: { symbol: 'Marks (nǐ)', num: 'Numbers (ni3)', none: 'Plain (ni)' },
      multipleLabel: 'Show all polyphone readings',
      emptyHint: 'Annotation appears as you type',
      copy: 'Copy pinyin',
      copyHtml: 'Copy HTML',
      copied: 'Copied',
      copyFailed: 'Copy failed — please select and copy manually',
      htmlNote:
        'Standard ruby/rp/rt markup ready to embed in HTML; tags and special characters from the input are escaped.',
      note: 'Non-Chinese text is kept as-is; readings follow context unless “all readings” is checked. Text and exports stay in your browser.',
      share: 'Copy options link',
      shared: 'Options link copied',
      shareFailed: 'State or clipboard unavailable',
      invalidShare: 'Invalid shared options — defaults restored',
    },
  },
})

const model = ref('')
const format = ref<PinyinFormat>('symbol')
const multiple = ref(false)
const formatOptions = computed<Array<{ value: PinyinFormat; label: string }>>(() => [
  { value: 'symbol', label: t('formats.symbol') },
  { value: 'num', label: t('formats.num') },
  { value: 'none', label: t('formats.none') },
])
const { status: shareState, copyUrl: shareOptions } = useHashShareState({
  validate: isPinyinShareState,
  read: () => ({ format: format.value, multiple: multiple.value }),
  apply: (shared) => {
    format.value = shared.format
    multiple.value = shared.multiple
  },
})
const shareLabel = computed(() => {
  if (shareState.value === 'copied') return t('shared')
  if (shareState.value === 'failed') return t('shareFailed')
  return t('share')
})

const output = computed(() => {
  const text = model.value
  if (text.trim() === '') return ''
  return toPinyin(text, { format: format.value, multiple: multiple.value })
})
const options = computed(() => ({ format: format.value, multiple: multiple.value }))
const rubySegments = computed(() => toRubySegments(model.value, options.value))
const rubyHtml = computed(() => toRubyHtml(model.value, options.value))

type CopyTarget = 'text' | 'html'
type CopyStatus = 'idle' | 'copied' | 'failed'
const copyState = reactive<Record<CopyTarget, CopyStatus>>({ text: 'idle', html: 'idle' })
const copyTimers: Partial<Record<CopyTarget, ReturnType<typeof setTimeout>>> = {}

async function copyResult(target: CopyTarget): Promise<void> {
  const value = target === 'text' ? output.value : rubyHtml.value
  if (value === '') return
  try {
    await navigator.clipboard.writeText(value)
    copyState[target] = 'copied'
  } catch {
    copyState[target] = 'failed'
  }
  clearTimeout(copyTimers[target])
  copyTimers[target] = setTimeout(() => (copyState[target] = 'idle'), 1500)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <UiTextarea v-model="model" :label="t('inputLabel')" :placeholder="t('inputPlaceholder')" />

    <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
      <fieldset class="flex flex-wrap items-center gap-x-4 gap-y-1">
        <legend class="sr-only">{{ t('formatLabel') }}</legend>
        <label
          v-for="option in formatOptions"
          :key="option.value"
          class="flex cursor-pointer items-center gap-1.5 text-sm text-foreground"
        >
          <input
            v-model="format"
            type="radio"
            name="pinyin-format"
            :value="option.value"
            class="ui-choice-input"
          />
          {{ option.label }}
        </label>
      </fieldset>

      <UiCheckbox v-model="multiple" :label="t('multipleLabel')" />
      <UiButton @click="shareOptions">{{ shareLabel }}</UiButton>
    </div>
    <p v-if="shareState === 'invalid'" class="text-xs text-danger">
      {{ t('invalidShare') }}
    </p>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <UiCard :title="t('resultTitle')">
        <p v-if="output === ''" class="text-sm text-muted-foreground">
          {{ t('emptyHint') }}
        </p>
        <p
          v-else
          class="text-lg leading-loose break-all text-foreground"
          data-testid="pinyin-result"
        >
          {{ output }}
        </p>
        <div v-if="output !== ''" class="mt-3 flex items-center gap-3">
          <UiButton variant="primary" @click="copyResult('text')">
            {{ copyState.text === 'copied' ? t('copied') : t('copy') }}
          </UiButton>
          <span v-if="copyState.text === 'failed'" class="text-xs text-danger">
            {{ t('copyFailed') }}
          </span>
        </div>
      </UiCard>

      <UiCard :title="t('rubyTitle')">
        <p v-if="rubySegments.length === 0" class="text-sm text-muted-foreground">
          {{ t('emptyHint') }}
        </p>
        <p
          v-else
          class="text-xl leading-[3] break-all whitespace-pre-wrap text-foreground"
          data-testid="pinyin-ruby-preview"
        >
          <template v-for="(segment, index) in rubySegments" :key="index">
            <ruby v-if="segment.reading" class="[ruby-align:center]">
              {{ segment.text }}<rp>(</rp><rt>{{ segment.reading }}</rt
              ><rp>)</rp>
            </ruby>
            <span v-else>{{ segment.text }}</span>
          </template>
        </p>
      </UiCard>
    </div>

    <UiCard :title="t('htmlTitle')">
      <p v-if="rubyHtml === ''" class="text-sm text-muted-foreground">
        {{ t('emptyHint') }}
      </p>
      <template v-else>
        <pre
          class="max-h-64 overflow-auto rounded-lg border border-border bg-muted p-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground"
        ><code data-testid="pinyin-ruby-html">{{ rubyHtml }}</code></pre>
        <div class="mt-3 flex items-center gap-3">
          <UiButton variant="primary" @click="copyResult('html')">
            {{ copyState.html === 'copied' ? t('copied') : t('copyHtml') }}
          </UiButton>
          <span v-if="copyState.html === 'failed'" class="text-xs text-danger">
            {{ t('copyFailed') }}
          </span>
        </div>
        <p class="mt-3 text-xs leading-relaxed text-muted-foreground">{{ t('htmlNote') }}</p>
      </template>
    </UiCard>

    <p class="text-xs leading-relaxed text-muted-foreground">{{ t('note') }}</p>
  </div>
</template>
