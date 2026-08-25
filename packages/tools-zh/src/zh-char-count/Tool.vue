<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiCard, UiTextarea } from '@craftchest/ui'
import { countChars } from './service'

// 视图层只做交互编排；算法在 service.ts（SPEC §4）
const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      inputLabel: '文本',
      inputPlaceholder: '粘贴要统计的文本…',
      statsTitle: '统计结果',
      emptyHint: '输入文本后实时统计',
      copy: '复制统计',
      copied: '已复制',
      copyFailed: '复制失败',
      note: '所有计数按 Unicode 码点；「混合口径」≈ Word 字数：汉字与中文标点各计 1，西文按词计 1。',
      metrics: {
        totalChars: '总字符（含空白）',
        charsNoSpaces: '字符（不含空白）',
        cjkChars: '汉字',
        cjkPunct: '中文/全角标点',
        asciiWords: '西文单词',
        asciiLettersDigits: '西文字母数字',
        spaces: '空白字符',
        wordCountMixed: '字数（混合口径）',
      },
    },
    en: {
      inputLabel: 'Text',
      inputPlaceholder: 'Paste text to count…',
      statsTitle: 'Statistics',
      emptyHint: 'Counts update as you type',
      copy: 'Copy summary',
      copied: 'Copied',
      copyFailed: 'Copy failed',
      note: 'All counts are Unicode code points; “mixed” ≈ Word’s word count: each Han char / CJK punct = 1, Latin words = 1.',
      metrics: {
        totalChars: 'Total (with spaces)',
        charsNoSpaces: 'Chars (no spaces)',
        cjkChars: 'Han characters',
        cjkPunct: 'CJK punctuation',
        asciiWords: 'Latin words',
        asciiLettersDigits: 'Latin letters/digits',
        spaces: 'Whitespace',
        wordCountMixed: 'Word count (mixed)',
      },
    },
  },
})

const model = ref('')
const stats = computed(() =>
  model.value.trim() === ''
    ? null
    : Object.entries(countChars(model.value)).map(
        ([key, value]) => ({ key, value }) as { key: string; value: number },
      ),
)

const summary = computed(() =>
  stats.value === null
    ? ''
    : stats.value.map(({ key, value }) => `${t(`metrics.${key}`)}：${value}`).join('\n'),
)

const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
let copyTimer: ReturnType<typeof setTimeout> | undefined

async function copySummary(): Promise<void> {
  try {
    await navigator.clipboard.writeText(summary.value)
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

    <UiCard :title="t('statsTitle')">
      <p v-if="stats === null" class="text-sm text-muted-foreground">{{ t('emptyHint') }}</p>
      <template v-else>
        <dl class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div
            v-for="{ key, value } in stats"
            :key="key"
            class="rounded-md bg-surface-muted p-3"
            :data-testid="`count-${key}`"
          >
            <dt class="text-xs leading-snug text-muted-foreground">
              {{ t(`metrics.${key}`) }}
            </dt>
            <dd class="mt-1 text-xl font-semibold text-foreground tabular-nums">
              {{ value }}
            </dd>
          </div>
        </dl>
        <div class="mt-4 flex items-center gap-3">
          <UiButton variant="primary" @click="copySummary">
            {{ copyState === 'copied' ? t('copied') : t('copy') }}
          </UiButton>
          <span v-if="copyState === 'failed'" class="text-xs text-danger">
            {{ t('copyFailed') }}
          </span>
        </div>
      </template>
    </UiCard>

    <p class="text-xs leading-relaxed text-muted-foreground">{{ t('note') }}</p>
  </div>
</template>
