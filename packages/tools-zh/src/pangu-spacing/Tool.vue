<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiCard, UiTextarea } from '@craftchest/ui'
import { addSpacing } from './service'

// 视图层只做交互编排；算法在 service.ts（SPEC §4）
const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      inputLabel: '原文',
      inputPlaceholder: '粘贴中英混排文本，例如：使用TypeScript编写，测试覆盖率100%',
      beforeTitle: '处理前',
      afterTitle: '处理后（盘古之白）',
      emptyHint: '输入文本后自动规范化',
      copy: '复制结果',
      copied: '已复制',
      copyFailed: '复制失败，请手动选择复制',
      note: '只在中文与西文字母/数字的紧邻边界插入一个空格；已有空白不动，标点不转换。',
    },
    en: {
      inputLabel: 'Input',
      inputPlaceholder: 'Paste mixed CJK/Latin text, e.g. 使用TypeScript编写，测试覆盖率100%',
      beforeTitle: 'Before',
      afterTitle: 'After (pangu spacing)',
      emptyHint: 'Text is normalized automatically as you type',
      copy: 'Copy result',
      copied: 'Copied',
      copyFailed: 'Copy failed — please select and copy manually',
      note: 'Inserts a single space at direct CJK ↔ Latin/digit boundaries; existing whitespace untouched, punctuation never converted.',
    },
  },
})

const model = ref('')

const output = computed(() => (model.value.trim() === '' ? '' : addSpacing(model.value)))

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

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <UiCard :title="t('beforeTitle')">
        <p
          class="min-h-16 text-sm leading-relaxed break-all whitespace-pre-wrap text-muted-foreground"
        >
          {{ model || t('emptyHint') }}
        </p>
      </UiCard>

      <UiCard :title="t('afterTitle')">
        <p
          class="min-h-16 text-sm leading-relaxed break-all whitespace-pre-wrap text-foreground"
          data-testid="pangu-result"
        >
          {{ output || t('emptyHint') }}
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
    </div>

    <p class="text-xs leading-relaxed text-muted-foreground">{{ t('note') }}</p>
  </div>
</template>
