<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiCard, UiCheckbox, UiTextarea } from '@craftchest/ui'
import type { PinyinFormat } from './service'
import { toPinyin } from './service'

// 视图层只做交互编排；算法在 service.ts（SPEC §4）
const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      inputLabel: '文本',
      inputPlaceholder: '输入或粘贴中文，例如：银行利率又调整了',
      resultTitle: '注音结果',
      formatLabel: '声调格式',
      formats: { symbol: '带调（nǐ）', num: '数字（ni3）', none: '无声调（ni）' },
      multipleLabel: '多音字标注全部读音',
      emptyHint: '输入文本后自动注音',
      copy: '复制结果',
      copied: '已复制',
      copyFailed: '复制失败，请手动选择复制',
      note: '非中文字符原样保留；默认按上下文选取读音，勾选后列出多音字全部读音。',
    },
    en: {
      inputLabel: 'Text',
      inputPlaceholder: 'Type or paste Chinese, e.g. 银行利率又调整了',
      resultTitle: 'Annotation',
      formatLabel: 'Tone format',
      formats: { symbol: 'Marks (nǐ)', num: 'Numbers (ni3)', none: 'Plain (ni)' },
      multipleLabel: 'Show all polyphone readings',
      emptyHint: 'Annotation appears as you type',
      copy: 'Copy result',
      copied: 'Copied',
      copyFailed: 'Copy failed — please select and copy manually',
      note: 'Non-Chinese text is kept as-is; readings follow context unless “all readings” is checked.',
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

const output = computed(() => {
  const text = model.value
  if (text.trim() === '') return ''
  return toPinyin(text, { format: format.value, multiple: multiple.value })
})

const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
let copyTimer: ReturnType<typeof setTimeout> | undefined

async function copyResult(): Promise<void> {
  if (output.value === '') return
  try {
    await navigator.clipboard.writeText(output.value)
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
    <UiTextarea v-model="model" :label="t('inputLabel')" :placeholder="t('inputPlaceholder')" />

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
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
    </div>

    <UiCard :title="t('resultTitle')">
      <p v-if="output === ''" class="text-sm text-muted-foreground">
        {{ t('emptyHint') }}
      </p>
      <p v-else class="text-lg leading-loose break-all text-foreground" data-testid="pinyin-result">
        {{ output }}
      </p>
      <div v-if="output !== ''" class="mt-3 flex items-center gap-3">
        <UiButton variant="primary" @click="copyResult">
          {{ copyState === 'copied' ? t('copied') : t('copy') }}
        </UiButton>
        <span v-if="copyState === 'failed'" class="text-xs text-danger">
          {{ t('copyFailed') }}
        </span>
      </div>
    </UiCard>

    <p class="text-xs leading-relaxed text-muted-foreground">{{ t('note') }}</p>
  </div>
</template>
