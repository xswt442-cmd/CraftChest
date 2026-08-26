<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiCard, UiTextarea } from '@craftchest/ui'
import type { OpenccPreset } from './service'
import { compareChinese, convertChinese } from './service'

// 视图层只做交互编排；算法在 service.ts（SPEC §4）
const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      inputLabel: '原文',
      inputPlaceholder: '输入或粘贴文本…',
      outputLabel: '可编辑结果',
      outputPlaceholder: '转换结果会显示在这里，也可以继续手工修改',
      presetLabel: '转换方向',
      presets: {
        cn2t: '简 → 繁（字级）',
        cn2tw: '简 → 繁（台湾词汇）',
        cn2hk: '简 → 繁（香港变体）',
        t2cn: '繁 → 简',
      },
      diffTitle: '差异视图',
      emptyHint: '输入文本后实时转换',
      noChanges: '原文与结果没有差异',
      changeSummary: '{changed} 处变化 · 删除 {deleted} 字符 · 新增 {inserted} 字符',
      inserted: '新增：{text}',
      deleted: '删除：{text}',
      copy: '复制结果',
      copied: '已复制',
      regenerate: '重新转换',
      copyFailed: '复制失败，请手动选择复制',
      note: '结果可继续编辑，差异视图会同步更新；修改原文或方向会重新生成结果。「台湾词汇」「香港变体」还会转换地区用词。词典已内嵌，运行时零外部请求。',
    },
    en: {
      inputLabel: 'Source',
      inputPlaceholder: 'Type or paste text…',
      outputLabel: 'Editable result',
      outputPlaceholder: 'The conversion appears here and remains editable',
      presetLabel: 'Direction',
      presets: {
        cn2t: 'S → T (char)',
        cn2tw: 'S → T (Taiwan phrases)',
        cn2hk: 'S → T (Hong Kong variants)',
        t2cn: 'T → S',
      },
      diffTitle: 'Difference view',
      emptyHint: 'Conversion happens as you type',
      noChanges: 'Source and result are identical',
      changeSummary:
        '{changed} changes · {deleted} characters deleted · {inserted} characters inserted',
      inserted: 'Inserted: {text}',
      deleted: 'Deleted: {text}',
      copy: 'Copy result',
      copied: 'Copied',
      regenerate: 'Convert again',
      copyFailed: 'Copy failed — please select and copy manually',
      note: 'The result remains editable and the diff updates with it; changing the source or direction regenerates the result. Taiwan/Hong Kong presets also convert regional vocabulary. Dictionaries are bundled with zero runtime requests.',
    },
  },
})

const model = ref('')
const preset = ref<OpenccPreset>('cn2t')
const presetOptions = computed<Array<{ value: OpenccPreset; label: string }>>(() => [
  { value: 'cn2t', label: t('presets.cn2t') },
  { value: 'cn2tw', label: t('presets.cn2tw') },
  { value: 'cn2hk', label: t('presets.cn2hk') },
  { value: 't2cn', label: t('presets.t2cn') },
])

const output = ref('')

function regenerate(): void {
  output.value = model.value === '' ? '' : convertChinese(model.value, preset.value)
}

watch([model, preset], regenerate, { immediate: true })

const difference = computed(() => compareChinese(model.value, output.value))

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
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-foreground">{{ t('presetLabel') }}</span>
      <div class="flex flex-wrap gap-x-5 gap-y-2">
        <label
          v-for="option in presetOptions"
          :key="option.value"
          class="flex cursor-pointer items-center gap-1.5 text-sm text-foreground"
        >
          <input
            v-model="preset"
            type="radio"
            name="opencc-preset"
            :value="option.value"
            class="ui-choice-input"
          />
          {{ option.label }}
        </label>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <UiTextarea v-model="model" :label="t('inputLabel')" :placeholder="t('inputPlaceholder')" />
      <div data-testid="opencc-result">
        <UiTextarea
          v-model="output"
          :label="t('outputLabel')"
          :placeholder="t('outputPlaceholder')"
        />
      </div>
    </div>

    <div v-if="model !== ''" class="flex flex-wrap items-center gap-3">
      <UiButton variant="primary" :disabled="output === ''" @click="copyResult">
        {{ copyState === 'copied' ? t('copied') : t('copy') }}
      </UiButton>
      <UiButton @click="regenerate">{{ t('regenerate') }}</UiButton>
      <span v-if="copyState === 'failed'" class="text-xs text-danger">
        {{ t('copyFailed') }}
      </span>
    </div>

    <UiCard :title="t('diffTitle')">
      <p v-if="model === ''" class="min-h-16 text-sm text-muted-foreground">
        {{ t('emptyHint') }}
      </p>
      <template v-else>
        <p class="mb-3 text-xs font-medium text-muted-foreground" aria-live="polite">
          {{
            difference.changed === 0
              ? t('noChanges')
              : t('changeSummary', {
                  changed: difference.changed,
                  deleted: difference.deleted,
                  inserted: difference.inserted,
                })
          }}
        </p>
        <p
          class="min-h-16 text-base leading-relaxed break-all whitespace-pre-wrap text-foreground"
          data-testid="opencc-diff"
        >
          <template
            v-for="(segment, index) in difference.segments"
            :key="`${segment.type}-${index}`"
          >
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
      </template>
    </UiCard>

    <p class="text-xs leading-relaxed text-muted-foreground">{{ t('note') }}</p>
  </div>
</template>
