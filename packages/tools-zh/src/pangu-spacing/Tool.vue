<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiCard, UiTextarea } from '@craftchest/ui'
import { diffText, normalizeCopywriting, type NormalizationRule } from './service'

// 视图层只做交互编排；算法在 service.ts（SPEC §4）
const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      inputLabel: '原文',
      inputPlaceholder: '例如：使用TypeScript编写，硬盘有20GB， 测试覆盖率１００%',
      resultTitle: '规范化结果',
      diffTitle: '变化预览',
      emptyHint: '输入文本后自动规范化',
      noChanges: '排版已经符合当前规则',
      changes: '共 {count} 处调整',
      rules: {
        'fullwidth-digit': '全角数字',
        'cjk-spacing': '中英/数字间距',
        'number-unit-spacing': '数字与单位间距',
        'punctuation-spacing': '全角标点空格',
      },
      inserted: '新增：{text}',
      deleted: '删除：{text}',
      copy: '复制结果',
      copied: '已复制',
      copyFailed: '复制失败，请手动选择复制',
      note: '自动处理低歧义规则：中英/数字间距、常见数字单位、全角数字和全角标点旁的多余空格。不会改写英文标点、重复标点或文案语义。',
    },
    en: {
      inputLabel: 'Input',
      inputPlaceholder: 'e.g. 使用TypeScript编写，硬盘有20GB， 测试覆盖率１００%',
      resultTitle: 'Normalized result',
      diffTitle: 'Change preview',
      emptyHint: 'Text is normalized automatically as you type',
      noChanges: 'Typography already matches the current rules',
      changes: '{count} adjustments',
      rules: {
        'fullwidth-digit': 'Fullwidth digits',
        'cjk-spacing': 'CJK / Latin spacing',
        'number-unit-spacing': 'Number / unit spacing',
        'punctuation-spacing': 'Fullwidth punctuation spacing',
      },
      inserted: 'Inserted: {text}',
      deleted: 'Deleted: {text}',
      copy: 'Copy result',
      copied: 'Copied',
      copyFailed: 'Copy failed — please select and copy manually',
      note: 'Applies low-ambiguity rules for CJK/Latin spacing, common units, fullwidth digits, and stray spaces around fullwidth punctuation. English punctuation, repeated punctuation, and wording are left unchanged.',
    },
  },
})

const model = ref('')

const result = computed(() => normalizeCopywriting(model.value))
const output = computed(() => (model.value.trim() === '' ? '' : result.value.text))
const diff = computed(() => (output.value === '' ? [] : diffText(model.value, output.value)))

function ruleLabel(rule: NormalizationRule): string {
  return t(`rules.${rule}`)
}

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

    <div v-if="output !== ''" class="flex flex-wrap items-center gap-2 text-xs" aria-live="polite">
      <span class="font-medium text-foreground">
        {{
          result.totalChanges === 0 ? t('noChanges') : t('changes', { count: result.totalChanges })
        }}
      </span>
      <span
        v-for="change in result.changes"
        :key="change.rule"
        class="rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground"
      >
        {{ ruleLabel(change.rule) }} · {{ change.count }}
      </span>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <UiCard :title="t('resultTitle')">
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

      <UiCard :title="t('diffTitle')">
        <p
          v-if="diff.length > 0"
          class="min-h-16 text-sm leading-relaxed break-all whitespace-pre-wrap text-foreground"
          data-testid="pangu-diff"
        >
          <template v-for="(segment, index) in diff" :key="`${segment.type}-${index}`">
            <ins
              v-if="segment.type === 'insert'"
              class="rounded-sm bg-success/15 text-success no-underline"
              :aria-label="t('inserted', { text: segment.text })"
              >{{ segment.text }}</ins
            >
            <del
              v-else-if="segment.type === 'delete'"
              class="rounded-sm bg-danger/15 text-danger"
              :aria-label="t('deleted', { text: segment.text })"
              >{{ segment.text }}</del
            >
            <span v-else>{{ segment.text }}</span>
          </template>
        </p>
        <p v-else class="min-h-16 text-sm leading-relaxed text-muted-foreground">
          {{ t('emptyHint') }}
        </p>
      </UiCard>
    </div>

    <p class="text-xs leading-relaxed text-muted-foreground">{{ t('note') }}</p>
  </div>
</template>
