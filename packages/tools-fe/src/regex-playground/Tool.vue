<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { writeClipboardText } from '@craftchest/toolkit-core'
import { UiButton, UiCard, UiTextarea } from '@craftchest/ui'
import {
  REGEX_FLAG_OPTIONS,
  REGEX_LIMITS,
  supportedRegexFlags,
  validateRegexInput,
  type RegexErrorCode,
  type RegexRunInput,
  type RegexRunResult,
  type RegexSuccess,
} from './service'

const { t } = useI18n({
  inheritLocale: true,
  messages: {
    zh: {
      engine: 'ECMAScript · JavaScript 正则',
      pattern: '正则表达式',
      patternPlaceholder: '输入正则模式（不需要包裹 /.../）',
      flags: '匹配选项',
      testText: '测试文本',
      testPlaceholder: '粘贴或输入要检查的文本…',
      examples: '试试样例',
      copyCode: '复制 JS 代码',
      codeCopied: '代码已复制',
      copyFailed: '复制失败',
      matchPreview: '匹配预览',
      matchCount: '找到 {count} 个匹配',
      matchCountCapped: '已显示前 {count} 个匹配',
      noMatches: '没有匹配结果',
      noInput: '输入正则与测试文本后，这里会显示匹配结果。',
      matches: '匹配项',
      position: '位置 {index}',
      emptyMatch: '空匹配',
      numberedGroups: '捕获组',
      namedGroups: '命名组',
      noGroups: '无捕获组',
      replacement: '替换预览',
      replacementPlaceholder: '替换文本，可用 $1、$&、$$',
      copyReplacement: '复制结果',
      replacementCopied: '结果已复制',
      replacementTruncated: '预览已截断，只展示安全上限内的结果。',
      examplesNumbers: '提取编号',
      examplesWords: '捕获单词',
      examplesSpaces: '合并空白',
      examplesDates: '重排日期',
      syntax: '语法速查',
      syntaxDescription:
        '这里使用浏览器原生 JavaScript RegExp，不模拟 PCRE、Python 等其他 flavor。',
      syntaxAny: '. 匹配单个字符（默认不含换行）',
      syntaxClass: '\\d 数字 · \\w 单词 · \\s 空白',
      syntaxAnchor: '^ 行首 · $ 行尾',
      syntaxGroup: '捕获内容、仅分组，或按名称引用捕获内容',
      syntaxRepeat: '* 零或多 · + 一或多 · ? 可选 · 指定次数范围',
      syntaxLook: '(?=...) 正向预查 · (?!...) 负向预查',
      stateIdle: '等待输入',
      stateRunning: '正在安全地检查…',
      stateSuccess: '检查完成',
      stateInvalid: '正则表达式无效',
      stateTimeout: '检查超时，已停止本次计算',
      stateLimit: '输入超过安全上限',
      stateFailed: '无法完成检查，请重试',
      errorPattern: '请检查括号、字符类或转义符号。',
      errorFlags: '匹配选项无效或重复。',
      errorUnsupportedFlag: '当前浏览器不支持所选匹配选项。',
      errorIncompatibleFlags: 'Unicode（u）与 Unicode 集合（v）不能同时启用。',
      errorPatternTooLong: '正则表达式过长（上限 {limit} 个字符）。',
      errorTextTooLong: '测试文本过长（上限 {limit} 个字符）。',
      errorReplacementTooLong: '替换文本过长（上限 {limit} 个字符）。',
      errorEvaluation: '本地检查发生错误，请稍后重试。',
      flagD: '提供匹配位置索引',
      flagG: '查找全部匹配',
      flagI: '忽略大小写',
      flagM: '多行锚点',
      flagS: '点号匹配换行',
      flagU: 'Unicode 模式',
      flagV: 'Unicode 集合',
      flagY: '从当前位置匹配',
    },
    en: {
      engine: 'ECMAScript · JavaScript RegExp',
      pattern: 'Regular expression',
      patternPlaceholder: 'Enter a pattern (without /.../ delimiters)',
      flags: 'Flags',
      testText: 'Test text',
      testPlaceholder: 'Paste or type text to inspect…',
      examples: 'Try an example',
      copyCode: 'Copy JS snippet',
      codeCopied: 'Code copied',
      copyFailed: 'Copy failed',
      matchPreview: 'Match preview',
      matchCount: '{count} matches found',
      matchCountCapped: 'Showing the first {count} matches',
      noMatches: 'No matches found',
      noInput: 'Matches will appear here once you enter a pattern and test text.',
      matches: 'Matches',
      position: 'Position {index}',
      emptyMatch: 'Empty match',
      numberedGroups: 'Capture groups',
      namedGroups: 'Named groups',
      noGroups: 'No capture groups',
      replacement: 'Replacement preview',
      replacementPlaceholder: 'Replacement text: $1, $&, $$',
      copyReplacement: 'Copy output',
      replacementCopied: 'Output copied',
      replacementTruncated: 'Preview truncated at the safe output limit.',
      examplesNumbers: 'Extract IDs',
      examplesWords: 'Capture words',
      examplesSpaces: 'Collapse whitespace',
      examplesDates: 'Reorder dates',
      syntax: 'Syntax quick reference',
      syntaxDescription:
        'Uses the browser’s native JavaScript RegExp engine; other flavors are not emulated.',
      syntaxAny: '. matches one character (except line breaks by default)',
      syntaxClass: '\\d digit · \\w word · \\s whitespace',
      syntaxAnchor: '^ line start · $ line end',
      syntaxGroup: 'Capture content, group without capturing, or reference a capture by name',
      syntaxRepeat: '* zero or more · + one or more · ? optional · a specific count range',
      syntaxLook: '(?=...) positive lookahead · (?!...) negative lookahead',
      stateIdle: 'Ready',
      stateRunning: 'Checking safely…',
      stateSuccess: 'Complete',
      stateInvalid: 'Invalid regular expression',
      stateTimeout: 'Timed out; this run was stopped',
      stateLimit: 'Input exceeds a safety limit',
      stateFailed: 'Could not complete the check. Try again.',
      errorPattern: 'Check your parentheses, character classes, or escapes.',
      errorFlags: 'One or more flags are invalid or duplicated.',
      errorUnsupportedFlag: 'This browser does not support a selected flag.',
      errorIncompatibleFlags: 'Unicode (u) and Unicode sets (v) cannot be used together.',
      errorPatternTooLong: 'Pattern is too long (limit: {limit} characters).',
      errorTextTooLong: 'Test text is too long (limit: {limit} characters).',
      errorReplacementTooLong: 'Replacement is too long (limit: {limit} characters).',
      errorEvaluation: 'The local check failed. Please try again.',
      flagD: 'Report match indices',
      flagG: 'Find all matches',
      flagI: 'Ignore case',
      flagM: 'Multiline anchors',
      flagS: 'Dot matches line breaks',
      flagU: 'Unicode mode',
      flagV: 'Unicode sets',
      flagY: 'Sticky matching',
    },
  },
})

interface Example {
  id: string
  title: string
  pattern: string
  flags: string[]
  testText: string
  replacement: string
}

const examples: Example[] = [
  {
    id: 'numbers',
    title: 'examplesNumbers',
    pattern: '(?<number>\\d+)',
    flags: ['g'],
    testText: 'Ticket #1042 is linked to order 27.',
    replacement: '[$<number>]',
  },
  {
    id: 'words',
    title: 'examplesWords',
    pattern: '(?<word>\\b[A-Za-z]+\\b)',
    flags: ['g', 'i'],
    testText: 'CraftChest keeps useful tools close.',
    replacement: '<$<word>>',
  },
  {
    id: 'spaces',
    title: 'examplesSpaces',
    pattern: '\\s+',
    flags: ['g'],
    testText: 'Keep   this\ntext    tidy.',
    replacement: ' ',
  },
  {
    id: 'dates',
    title: 'examplesDates',
    pattern: '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})',
    flags: ['g'],
    testText: '2026-09-24\n2025-12-01',
    replacement: '$<day>/$<month>/$<year>',
  },
]

const supportedFlags = new Set(supportedRegexFlags())
const pattern = ref('(?<word>\\w+)')
const flags = ref<string[]>(['g'])
const testText = ref('CraftChest keeps useful tools close.')
const replacement = ref('<$<word>>')
const result = ref<RegexSuccess | null>(null)
const runState = ref<'idle' | 'running' | 'success' | 'invalid' | 'limit' | 'timeout' | 'failed'>(
  'idle',
)
const errorCode = ref<RegexErrorCode | null>(null)
const copyNotice = ref<'idle' | 'copied' | 'failed'>('idle')
const replacementCopyNotice = ref<'idle' | 'copied' | 'failed'>('idle')

const currentInput = computed<RegexRunInput>(() => ({
  pattern: pattern.value,
  flags: REGEX_FLAG_OPTIONS.filter((option) => flags.value.includes(option.flag))
    .map((option) => option.flag)
    .join(''),
  testText: testText.value,
  replacement: replacement.value,
}))

const availableFlags = computed(() =>
  REGEX_FLAG_OPTIONS.filter((option) => supportedFlags.has(option.flag)),
)
const namedGroupSyntax = '(?<name>...)'

const statusText = computed(() => {
  if (runState.value === 'running') return t('stateRunning')
  if (runState.value === 'invalid') return t('stateInvalid')
  if (runState.value === 'limit') return t('stateLimit')
  if (runState.value === 'timeout') return t('stateTimeout')
  if (runState.value === 'failed') return t('stateFailed')
  if (runState.value === 'success') return t('stateSuccess')
  return t('stateIdle')
})

const errorText = computed(() => {
  if (!errorCode.value) return ''
  const key: Record<RegexErrorCode, string> = {
    'invalid-pattern': 'errorPattern',
    'invalid-flags': 'errorFlags',
    'unsupported-flag': 'errorUnsupportedFlag',
    'incompatible-flags': 'errorIncompatibleFlags',
    'pattern-too-long': 'errorPatternTooLong',
    'test-text-too-long': 'errorTextTooLong',
    'replacement-too-long': 'errorReplacementTooLong',
    'evaluation-failed': 'errorEvaluation',
  }
  const limit =
    errorCode.value === 'pattern-too-long'
      ? REGEX_LIMITS.patternLength
      : errorCode.value === 'test-text-too-long'
        ? REGEX_LIMITS.testTextLength
        : REGEX_LIMITS.replacementLength
  return t(key[errorCode.value], { limit })
})

const matchCountText = computed(() => {
  if (!result.value) return ''
  return result.value.matchesTruncated
    ? t('matchCountCapped', { count: REGEX_LIMITS.matches })
    : t('matchCount', { count: result.value.matches.length })
})

interface PreviewSegment {
  text: string
  matched: boolean
  empty?: boolean
}

const previewSegments = computed<PreviewSegment[]>(() => {
  const text = testText.value
  if (!result.value || result.value.matches.length === 0) return [{ text, matched: false }]

  const segments: PreviewSegment[] = []
  let cursor = 0
  for (const match of result.value.matches) {
    const start = Math.max(cursor, Math.min(match.index, text.length))
    const end = Math.max(start, Math.min(match.end, text.length))
    if (start > cursor) segments.push({ text: text.slice(cursor, start), matched: false })
    if (end === start) {
      segments.push({ text: '', matched: true, empty: true })
      cursor = start
    } else {
      segments.push({ text: text.slice(start, end), matched: true })
      cursor = end
    }
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), matched: false })
  return segments.length > 0 ? segments : [{ text, matched: false }]
})

let runId = 0
let debounceTimer: ReturnType<typeof setTimeout> | undefined
let timeoutTimer: ReturnType<typeof setTimeout> | undefined
let copyTimer: ReturnType<typeof setTimeout> | undefined
let replacementCopyTimer: ReturnType<typeof setTimeout> | undefined
let activeWorker: Worker | undefined

function stopActiveRun(): void {
  if (timeoutTimer !== undefined) clearTimeout(timeoutTimer)
  timeoutTimer = undefined
  activeWorker?.terminate()
  activeWorker = undefined
}

function scheduleRun(): void {
  runId += 1
  const requestId = runId
  if (debounceTimer !== undefined) clearTimeout(debounceTimer)
  stopActiveRun()
  result.value = null
  errorCode.value = null

  const validationError = validateRegexInput(currentInput.value)
  if (validationError) {
    errorCode.value = validationError
    runState.value = 'limit'
    return
  }

  runState.value = 'running'
  const input = currentInput.value
  debounceTimer = setTimeout(() => startRun(requestId, input), 140)
}

function startRun(requestId: number, input: RegexRunInput): void {
  if (requestId !== runId) return

  try {
    activeWorker = new Worker(new URL('./regex.worker.ts', import.meta.url), { type: 'module' })
  } catch {
    runState.value = 'failed'
    errorCode.value = 'evaluation-failed'
    return
  }

  const worker = activeWorker
  worker.addEventListener(
    'message',
    (event: MessageEvent<{ requestId: number; result: RegexRunResult }>) => {
      if (event.data.requestId !== runId) return
      stopActiveRun()
      if (event.data.result.ok) {
        result.value = event.data.result
        runState.value = 'success'
      } else {
        result.value = null
        errorCode.value = event.data.result.error
        runState.value =
          event.data.result.error === 'pattern-too-long' ||
          event.data.result.error === 'test-text-too-long' ||
          event.data.result.error === 'replacement-too-long'
            ? 'limit'
            : 'invalid'
      }
    },
  )
  worker.addEventListener('error', (event) => {
    event.preventDefault()
    if (requestId !== runId) return
    stopActiveRun()
    runState.value = 'failed'
    errorCode.value = 'evaluation-failed'
  })

  timeoutTimer = setTimeout(() => {
    if (requestId !== runId) return
    stopActiveRun()
    runState.value = 'timeout'
    result.value = null
    errorCode.value = null
  }, REGEX_LIMITS.executionTimeoutMs)

  try {
    worker.postMessage({ requestId, input })
  } catch {
    stopActiveRun()
    runState.value = 'failed'
    errorCode.value = 'evaluation-failed'
  }
}

function toggleFlag(flag: string): void {
  const next = new Set(flags.value)
  if (next.has(flag)) {
    next.delete(flag)
  } else {
    if (flag === 'u') next.delete('v')
    if (flag === 'v') next.delete('u')
    next.add(flag)
  }
  flags.value = [...next]
}

function loadExample(example: Example): void {
  pattern.value = example.pattern
  flags.value = [...example.flags]
  testText.value = example.testText
  replacement.value = example.replacement
}

async function copyText(text: string, target: 'pattern' | 'replacement'): Promise<void> {
  const state = target === 'pattern' ? copyNotice : replacementCopyNotice
  const timer = target === 'pattern' ? copyTimer : replacementCopyTimer
  if (timer !== undefined) clearTimeout(timer)

  state.value = (await writeClipboardText(text)) ? 'copied' : 'failed'

  const nextTimer = setTimeout(() => (state.value = 'idle'), 1800)
  if (target === 'pattern') copyTimer = nextTimer
  else replacementCopyTimer = nextTimer
}

const patternSnippet = computed(
  () =>
    `const regex = new RegExp(${JSON.stringify(pattern.value)}, ${JSON.stringify(currentInput.value.flags)});`,
)
const patternCopyLabel = computed(() =>
  copyNotice.value === 'copied'
    ? t('codeCopied')
    : copyNotice.value === 'failed'
      ? t('copyFailed')
      : t('copyCode'),
)
const replacementCopyLabel = computed(() =>
  replacementCopyNotice.value === 'copied'
    ? t('replacementCopied')
    : replacementCopyNotice.value === 'failed'
      ? t('copyFailed')
      : t('copyReplacement'),
)

watch(
  () => [pattern.value, currentInput.value.flags, testText.value, replacement.value],
  scheduleRun,
  { immediate: true },
)

onBeforeUnmount(() => {
  runId += 1
  if (debounceTimer !== undefined) clearTimeout(debounceTimer)
  if (copyTimer !== undefined) clearTimeout(copyTimer)
  if (replacementCopyTimer !== undefined) clearTimeout(replacementCopyTimer)
  stopActiveRun()
})
</script>

<template>
  <div class="grid gap-5 xl:grid-cols-2">
    <div class="grid content-start gap-5">
      <UiCard>
        <div class="grid gap-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-sm font-semibold text-foreground">{{ t('pattern') }}</h2>
            <span
              class="rounded-full border border-workshop-border bg-surface-muted px-2.5 py-1 font-mono text-[10px] text-muted-foreground"
              >{{ t('engine') }}</span
            >
          </div>

          <label class="grid gap-1.5 text-sm font-medium text-foreground">
            <span class="sr-only">{{ t('pattern') }}</span>
            <input
              v-model="pattern"
              data-testid="regex-pattern"
              spellcheck="false"
              autocomplete="off"
              autocapitalize="off"
              class="ui-native-field min-h-12 font-mono text-[15px]"
              :placeholder="t('patternPlaceholder')"
            />
          </label>

          <div class="grid gap-2">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {{ t('flags') }}
            </h3>
            <div class="flex flex-wrap gap-2" role="group" :aria-label="t('flags')">
              <button
                v-for="option in availableFlags"
                :key="option.flag"
                type="button"
                :aria-pressed="flags.includes(option.flag)"
                :aria-label="t(`flag${option.flag.toUpperCase()}`)"
                :title="t(`flag${option.flag.toUpperCase()}`)"
                class="inline-flex size-9 items-center justify-center rounded-md border font-mono text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                :class="
                  flags.includes(option.flag)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-workshop-border bg-surface-raised text-muted-foreground hover:border-workshop-border-strong hover:text-foreground'
                "
                @click="toggleFlag(option.flag)"
              >
                {{ option.flag }}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 border-t border-workshop-border pt-4">
            <UiButton @click="copyText(patternSnippet, 'pattern')">
              {{ patternCopyLabel }}
            </UiButton>
            <span
              class="self-center text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {{ statusText }}
            </span>
          </div>
          <p v-if="errorText" class="text-sm text-danger" role="alert">{{ errorText }}</p>
        </div>
      </UiCard>

      <UiCard>
        <UiTextarea
          v-model="testText"
          data-testid="regex-test-text"
          :label="t('testText')"
          :placeholder="t('testPlaceholder')"
          :rows="8"
        />
        <p class="mt-2 text-right font-mono text-[10px] text-muted-foreground">
          {{ testText.length.toLocaleString() }} /
          {{ REGEX_LIMITS.testTextLength.toLocaleString() }}
        </p>
      </UiCard>

      <UiCard :title="t('examples')">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="example in examples"
            :key="example.id"
            type="button"
            class="rounded-full border border-workshop-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary-soft hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            @click="loadExample(example)"
          >
            {{ t(example.title) }}
          </button>
        </div>
      </UiCard>

      <UiCard :title="t('syntax')">
        <p class="mb-3 text-xs leading-relaxed text-muted-foreground">
          {{ t('syntaxDescription') }}
        </p>
        <dl class="grid gap-2 text-xs leading-relaxed sm:grid-cols-2">
          <div class="rounded-md bg-surface-muted px-3 py-2">
            <dt class="font-mono font-semibold text-foreground">.</dt>
            <dd class="text-muted-foreground">{{ t('syntaxAny') }}</dd>
          </div>
          <div class="rounded-md bg-surface-muted px-3 py-2">
            <dt class="font-mono font-semibold text-foreground">\\d · \\w · \\s</dt>
            <dd class="text-muted-foreground">{{ t('syntaxClass') }}</dd>
          </div>
          <div class="rounded-md bg-surface-muted px-3 py-2">
            <dt class="font-mono font-semibold text-foreground">^ · $</dt>
            <dd class="text-muted-foreground">{{ t('syntaxAnchor') }}</dd>
          </div>
          <div class="rounded-md bg-surface-muted px-3 py-2">
            <dt class="font-mono font-semibold text-foreground">
              <code>(...)</code> · <code>(?:...)</code> · <code>{{ namedGroupSyntax }}</code>
            </dt>
            <dd class="text-muted-foreground">{{ t('syntaxGroup') }}</dd>
          </div>
          <div class="rounded-md bg-surface-muted px-3 py-2">
            <dt class="font-mono font-semibold text-foreground">* · + · ? · {n,m}</dt>
            <dd class="text-muted-foreground">{{ t('syntaxRepeat') }}</dd>
          </div>
          <div class="rounded-md bg-surface-muted px-3 py-2">
            <dt class="font-mono font-semibold text-foreground">(?=...) · (?!...)</dt>
            <dd class="text-muted-foreground">{{ t('syntaxLook') }}</dd>
          </div>
        </dl>
      </UiCard>
    </div>

    <div class="grid content-start gap-5">
      <UiCard :title="t('matchPreview')">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span
            v-if="result"
            class="rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success"
            data-testid="regex-match-count"
            role="status"
            aria-live="polite"
          >
            {{ matchCountText }}
          </span>
          <span
            v-else-if="runState === 'running'"
            class="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary"
            aria-live="polite"
          >
            {{ statusText }}
          </span>
          <span v-else class="text-xs text-muted-foreground">{{ statusText }}</span>
        </div>

        <pre
          class="max-h-72 min-h-28 overflow-auto rounded-md border border-workshop-border bg-surface-muted p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words"
          data-testid="regex-highlight-preview"
        ><template v-for="(segment, index) in previewSegments" :key="index"><mark v-if="segment.matched && !segment.empty" class="rounded-sm bg-primary-soft text-foreground ring-1 ring-primary/25">{{ segment.text }}</mark><span v-else-if="segment.empty" class="mx-px rounded-sm bg-primary-soft px-0.5 text-[10px] text-primary" :title="t('emptyMatch')">∅</span><span v-else>{{ segment.text }}</span></template></pre>

        <p
          v-if="runState === 'idle' || (runState === 'success' && !result?.matches.length)"
          class="mt-3 text-sm text-muted-foreground"
        >
          {{ runState === 'success' ? t('noMatches') : t('noInput') }}
        </p>
      </UiCard>

      <UiCard :title="t('matches')">
        <ol v-if="result && result.matches.length" class="grid max-h-[28rem] gap-2 overflow-y-auto">
          <li
            v-for="(match, index) in result.matches"
            :key="`${match.index}-${index}`"
            class="rounded-md border border-workshop-border bg-surface-raised p-3"
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <code class="min-w-0 break-all font-mono text-sm font-semibold text-foreground">
                <span v-if="match.value.length">{{ match.value }}</span>
                <span v-else class="text-primary">{{ t('emptyMatch') }}</span>
                <span v-if="match.truncated" class="text-muted-foreground">…</span>
              </code>
              <span class="shrink-0 font-mono text-[10px] text-muted-foreground">
                {{ t('position', { index: match.index }) }}
              </span>
            </div>

            <div
              v-if="match.captures.length || match.namedCaptures.length"
              class="mt-2 grid gap-1.5"
            >
              <span class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {{ t('numberedGroups') }}
              </span>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="capture in match.captures"
                  :key="capture.number"
                  class="rounded bg-surface-muted px-2 py-1 font-mono text-xs text-foreground"
                >
                  ${{ capture.number }} = {{ capture.value
                  }}<template v-if="capture.truncated">…</template
                  ><template v-if="capture.range">
                    @{{ capture.range[0] }}:{{ capture.range[1] }}</template
                  >
                </span>
              </div>
              <template v-if="match.namedCaptures.length">
                <span
                  class="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {{ t('namedGroups') }}
                </span>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="capture in match.namedCaptures"
                    :key="capture.name"
                    class="rounded bg-primary-soft px-2 py-1 font-mono text-xs text-foreground"
                  >
                    {{ capture.name }} = {{ capture.value
                    }}<template v-if="capture.truncated">…</template
                    ><template v-if="capture.range">
                      @{{ capture.range[0] }}:{{ capture.range[1] }}</template
                    >
                  </span>
                </div>
              </template>
            </div>
            <p v-else class="mt-2 text-xs text-muted-foreground">{{ t('noGroups') }}</p>
          </li>
        </ol>
        <p v-else class="text-sm text-muted-foreground">
          {{ result ? t('noMatches') : t('noInput') }}
        </p>
        <p v-if="result?.matchesTruncated" class="mt-3 text-xs text-muted-foreground">
          {{ matchCountText }}
        </p>
      </UiCard>

      <UiCard :title="t('replacement')">
        <div class="grid gap-3">
          <label class="grid gap-1.5 text-sm font-medium text-foreground">
            <span class="sr-only">{{ t('replacement') }}</span>
            <textarea
              v-model="replacement"
              data-testid="regex-replacement"
              spellcheck="false"
              class="ui-native-field min-h-20 resize-y font-mono text-sm"
              :placeholder="t('replacementPlaceholder')"
            />
          </label>
          <pre
            class="max-h-64 min-h-20 overflow-auto rounded-md border border-workshop-border bg-code-surface p-3 font-mono text-sm leading-relaxed text-code-foreground whitespace-pre-wrap break-words"
            data-testid="regex-replacement-preview"
            >{{ result?.replacementPreview ?? '' }}</pre>
          <p v-if="result?.replacementTruncated" class="text-xs text-muted-foreground">
            {{ t('replacementTruncated') }}
          </p>
          <div>
            <UiButton
              :disabled="!result || result.replacementPreview === null"
              @click="copyText(result?.replacementPreview ?? '', 'replacement')"
            >
              {{ replacementCopyLabel }}
            </UiButton>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
