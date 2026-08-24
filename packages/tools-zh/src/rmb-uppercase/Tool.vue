<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiCard, UiTextField } from '@craftchest/ui'
import { RmbFormatError, toRmbUppercase } from './service'

// 视图层只做交互编排；算法全部在 service.ts（SPEC §4）
const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      amountLabel: '金额',
      placeholder: '例如 1234567.89，可含 ￥ 与千分位逗号，支持负数',
      resultTitle: '大写结果',
      emptyHint: '输入金额后自动转换',
      errFormat: '无法识别的金额，请检查格式（只接受十进制数字）',
      errRange: '整数部分超出 16 位上限（至万亿位）',
      copy: '复制结果',
      copied: '已复制',
      copyFailed: '复制失败，请手动选择复制',
      note: '超过两位的小数按四舍五入进到分；全程字符串运算，不经浮点数。',
    },
    en: {
      amountLabel: 'Amount',
      placeholder: 'e.g. 1234567.89 — ￥ and thousand separators allowed, negatives supported',
      resultTitle: 'Uppercase result',
      emptyHint: 'Type an amount to convert instantly',
      errFormat: 'Unrecognizable amount — decimal digits only',
      errRange: 'Integer part exceeds the 16-digit limit',
      copy: 'Copy result',
      copied: 'Copied',
      copyFailed: 'Copy failed — please select and copy manually',
      note: 'Decimals beyond two places are rounded to cents; exact string arithmetic, no floating point.',
    },
  },
})

const amount = ref('')

const result = computed<{ ok: boolean; text: string } | null>(() => {
  const trimmed = amount.value.trim()
  if (trimmed === '') return null
  try {
    return { ok: true, text: toRmbUppercase(trimmed) }
  } catch (err) {
    if (err instanceof RmbFormatError) {
      return { ok: false, text: t(err.code === 'range' ? 'errRange' : 'errFormat') }
    }
    throw err
  }
})

const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
let copyTimer: ReturnType<typeof setTimeout> | undefined

async function copyResult(): Promise<void> {
  if (!result.value?.ok) return
  try {
    await navigator.clipboard.writeText(result.value.text)
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
    <UiTextField v-model="amount" :label="t('amountLabel')" :placeholder="t('placeholder')" />

    <UiCard :title="t('resultTitle')">
      <p
        v-if="result === null"
        class="text-sm text-neutral-400"
      >
        {{ t('emptyHint') }}
      </p>
      <p
        v-else-if="!result.ok"
        class="text-sm text-red-600 dark:text-red-400"
        role="alert"
      >
        {{ result.text }}
      </p>
      <p
        v-else
        class="font-serif text-2xl leading-relaxed break-all text-neutral-900 tabular-nums select-all dark:text-neutral-100"
        data-testid="rmb-result"
      >
        {{ result.text }}
      </p>

      <div
        v-if="result !== null && result.ok"
        class="mt-4 flex items-center gap-3"
      >
        <UiButton variant="primary" @click="copyResult">
          {{ copyState === 'copied' ? t('copied') : t('copy') }}
        </UiButton>
        <span
          v-if="copyState === 'failed'"
          class="text-xs text-red-600 dark:text-red-400"
        >
          {{ t('copyFailed') }}
        </span>
      </div>
    </UiCard>

    <p class="text-xs leading-relaxed text-neutral-400">{{ t('note') }}</p>
  </div>
</template>
