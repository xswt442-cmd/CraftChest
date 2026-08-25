<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiCard, UiTextField } from '@craftchest/ui'
import type { OpenccPreset } from './service'
import { convertChinese } from './service'

// 视图层只做交互编排；算法在 service.ts（SPEC §4）
const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      inputLabel: '原文',
      inputPlaceholder: '输入或粘贴文本…',
      presetLabel: '转换方向',
      presets: {
        cn2t: '简 → 繁（字级）',
        cn2tw: '简 → 繁（台湾词汇）',
        cn2hk: '简 → 繁（香港变体）',
        t2cn: '繁 → 简',
      },
      resultTitle: '转换结果',
      emptyHint: '输入文本后实时转换',
      copy: '复制结果',
      copied: '已复制',
      copyFailed: '复制失败，请手动选择复制',
      note: '「台湾词汇」「香港变体」除字形外还做地区用词转换（如 内存→記憶體）；词典构建期内嵌，运行时零外部请求。',
    },
    en: {
      inputLabel: 'Source',
      inputPlaceholder: 'Type or paste text…',
      presetLabel: 'Direction',
      presets: {
        cn2t: 'S → T (char)',
        cn2tw: 'S → T (Taiwan phrases)',
        cn2hk: 'S → T (Hong Kong variants)',
        t2cn: 'T → S',
      },
      resultTitle: 'Result',
      emptyHint: 'Conversion happens as you type',
      copy: 'Copy result',
      copied: 'Copied',
      copyFailed: 'Copy failed — please select and copy manually',
      note: 'Taiwan/Hong Kong presets also convert regional vocabulary (e.g. 内存→記憶體); dictionaries are bundled at build time — zero runtime requests.',
    },
  },
})

const model = ref('')
const preset = ref<OpenccPreset>('cn2t')

const output = computed(() =>
  model.value === '' ? '' : convertChinese(model.value, preset.value),
)

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
    <UiTextField v-model="model" :label="t('inputLabel')" :placeholder="t('inputPlaceholder')" />

    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{{ t('presetLabel') }}</span>
      <div class="flex flex-wrap gap-x-5 gap-y-2">
        <label
          v-for="(label, value) in t('presets')"
          :key="value"
          class="flex cursor-pointer items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-300"
        >
          <input
            v-model="preset"
            type="radio"
            name="opencc-preset"
            :value="value"
            class="accent-amber-500"
          />
          {{ label }}
        </label>
      </div>
    </div>

    <UiCard :title="t('resultTitle')">
      <p
        v-if="output === ''"
        class="min-h-16 text-sm leading-relaxed break-all whitespace-pre-wrap text-neutral-400"
      >
        {{ t('emptyHint') }}
      </p>
      <p
        v-else
        class="min-h-16 text-base leading-relaxed break-all whitespace-pre-wrap text-neutral-900 dark:text-neutral-100"
        data-testid="opencc-result"
      >
        {{ output }}
      </p>
      <div v-if="output !== ''" class="mt-3 flex items-center gap-3">
        <UiButton variant="primary" @click="copyResult">
          {{ copyState === 'copied' ? t('copied') : t('copy') }}
        </UiButton>
        <span v-if="copyState === 'failed'" class="text-xs text-red-600 dark:text-red-400">
          {{ t('copyFailed') }}
        </span>
      </div>
    </UiCard>

    <p class="text-xs leading-relaxed text-neutral-400">{{ t('note') }}</p>
  </div>
</template>
