export const REGEX_LIMITS = {
  patternLength: 4096,
  testTextLength: 50_000,
  replacementLength: 1024,
  matches: 250,
  excerptLength: 240,
  replacementPreviewLength: 50_000,
  executionTimeoutMs: 500,
} as const

const FLAG_ORDER = 'dgimsuvy'

export type RegexErrorCode =
  | 'invalid-pattern'
  | 'invalid-flags'
  | 'unsupported-flag'
  | 'incompatible-flags'
  | 'pattern-too-long'
  | 'test-text-too-long'
  | 'replacement-too-long'
  | 'evaluation-failed'

export interface RegexRunInput {
  pattern: string
  flags: string
  testText: string
  replacement: string | null
}

export interface RegexCapture {
  number: number
  value: string
  truncated: boolean
  range: [number, number] | null
}

export interface RegexNamedCapture {
  name: string
  value: string
  truncated: boolean
  range: [number, number] | null
}

export interface RegexMatch {
  index: number
  end: number
  value: string
  truncated: boolean
  captures: RegexCapture[]
  namedCaptures: RegexNamedCapture[]
}

export interface RegexSuccess {
  ok: true
  flags: string
  matches: RegexMatch[]
  matchesTruncated: boolean
  replacementPreview: string | null
  replacementTruncated: boolean
}

export interface RegexFailure {
  ok: false
  error: RegexErrorCode
}

export type RegexRunResult = RegexSuccess | RegexFailure

export interface RegexFlagOption {
  flag: string
  title: { zh: string; en: string }
}

export const REGEX_FLAG_OPTIONS: readonly RegexFlagOption[] = [
  { flag: 'd', title: { zh: '匹配位置索引', en: 'Match indices' } },
  { flag: 'g', title: { zh: '查找所有匹配', en: 'Global matches' } },
  { flag: 'i', title: { zh: '忽略大小写', en: 'Ignore case' } },
  { flag: 'm', title: { zh: '多行锚点', en: 'Multiline anchors' } },
  { flag: 's', title: { zh: '点号匹配换行', en: 'Dot matches line breaks' } },
  { flag: 'u', title: { zh: 'Unicode 模式', en: 'Unicode mode' } },
  { flag: 'v', title: { zh: 'Unicode 集合', en: 'Unicode sets' } },
  { flag: 'y', title: { zh: '从当前位置匹配', en: 'Sticky matching' } },
]

export function supportedRegexFlags(): string[] {
  return [...FLAG_ORDER].filter((flag) => {
    try {
      new RegExp('', flag)
      return true
    } catch {
      return false
    }
  })
}

export function validateRegexInput(input: RegexRunInput): RegexErrorCode | null {
  if (input.pattern.length > REGEX_LIMITS.patternLength) return 'pattern-too-long'
  if (input.testText.length > REGEX_LIMITS.testTextLength) return 'test-text-too-long'
  if (input.replacement !== null && input.replacement.length > REGEX_LIMITS.replacementLength) {
    return 'replacement-too-long'
  }

  if (
    new Set(input.flags).size !== input.flags.length ||
    [...input.flags].some((flag) => !FLAG_ORDER.includes(flag))
  ) {
    return 'invalid-flags'
  }
  if (input.flags.includes('u') && input.flags.includes('v')) return 'incompatible-flags'
  if ([...input.flags].some((flag) => !supportedRegexFlags().includes(flag)))
    return 'unsupported-flag'
  return null
}

function excerpt(value: string): { value: string; truncated: boolean } {
  if (value.length <= REGEX_LIMITS.excerptLength) return { value, truncated: false }
  return {
    value: `${value.slice(0, REGEX_LIMITS.excerptLength)}…`,
    truncated: true,
  }
}

function isDigit(value: string | undefined): value is string {
  return value !== undefined && value >= '0' && value <= '9'
}

function appendSubstitution(
  template: string,
  match: RegExpExecArray,
  input: string,
  append: (part: string) => boolean,
): void {
  const captures = match.slice(1)
  const named = match.groups

  for (let index = 0; index < template.length; index += 1) {
    const current = template[index] ?? ''
    if (current !== '$' || index + 1 >= template.length) {
      if (!append(current)) return
      continue
    }

    const next = template[index + 1] ?? ''
    if (next === '$') {
      if (!append('$')) return
      index += 1
    } else if (next === '&') {
      if (!append(match[0])) return
      index += 1
    } else if (next === '`') {
      if (!append(input.slice(0, match.index))) return
      index += 1
    } else if (next === "'") {
      if (!append(input.slice(match.index + match[0].length))) return
      index += 1
    } else if (next === '<' && named) {
      const closeIndex = template.indexOf('>', index + 2)
      if (closeIndex === -1) {
        if (!append('$')) return
        continue
      }
      const name = template.slice(index + 2, closeIndex)
      if (Object.hasOwn(named, name)) {
        if (!append(named[name] ?? '')) return
      } else if (!append(template.slice(index, closeIndex + 1))) {
        return
      }
      index = closeIndex
    } else if (isDigit(next) && next !== '0') {
      const first = Number(next)
      const secondChar = template[index + 2]
      const second = isDigit(secondChar) ? Number(secondChar) : undefined
      const combined = second === undefined ? undefined : first * 10 + second

      if (combined !== undefined && combined <= captures.length) {
        if (!append(captures[combined - 1] ?? '')) return
        index += 2
      } else if (first <= captures.length) {
        if (!append(captures[first - 1] ?? '')) return
        index += 1
      } else if (!append(`$${next}`)) {
        return
      } else {
        index += 1
      }
    } else if (!append('$')) {
      return
    }
  }
}

function advanceStringIndex(input: string, index: number, unicode: boolean): number {
  if (!unicode || index + 1 >= input.length) return index + 1
  const first = input.charCodeAt(index)
  if (first < 0xd800 || first > 0xdbff) return index + 1
  const second = input.charCodeAt(index + 1)
  return second >= 0xdc00 && second <= 0xdfff ? index + 2 : index + 1
}

export function executeRegex(input: RegexRunInput): RegexRunResult {
  const validationError = validateRegexInput(input)
  if (validationError) return { ok: false, error: validationError }

  let expression: RegExp
  try {
    expression = new RegExp(input.pattern, input.flags)
  } catch {
    return { ok: false, error: 'invalid-pattern' }
  }

  const matches: RegexMatch[] = []
  const isGlobal = expression.global
  const unicode = input.flags.includes('u') || input.flags.includes('v')
  const canReplace = input.replacement !== null
  let replacementPreview = canReplace ? '' : null
  let replacementTruncated = false
  let replacementStopped = false
  let replacementLength = 0
  let replacementCursor = 0
  let matchesTruncated = false

  const appendReplacement = (part: string): boolean => {
    if (replacementPreview === null || replacementStopped) return false
    const remaining = REGEX_LIMITS.replacementPreviewLength - replacementLength
    if (part.length > remaining) {
      replacementPreview += part.slice(0, remaining)
      replacementLength += remaining
      replacementTruncated = true
      replacementStopped = true
      return false
    }
    replacementPreview += part
    replacementLength += part.length
    return true
  }

  while (true) {
    let match: RegExpExecArray | null
    try {
      match = expression.exec(input.testText)
    } catch {
      return { ok: false, error: 'invalid-pattern' }
    }
    if (!match) break

    if (matches.length >= REGEX_LIMITS.matches) {
      matchesTruncated = true
      replacementTruncated = canReplace
      break
    }

    const matchExcerpt = excerpt(match[0])
    const captures: RegexCapture[] = match.slice(1).map((value, index) => {
      const captureExcerpt = excerpt(value ?? '')
      const range = match.indices?.[index + 1]
      return {
        number: index + 1,
        value: captureExcerpt.value,
        truncated: captureExcerpt.truncated,
        range: range ? [range[0], range[1]] : null,
      }
    })
    const namedCaptures: RegexNamedCapture[] = Object.entries(match.groups ?? {}).map(
      ([name, value]) => {
        const captureExcerpt = excerpt(value ?? '')
        const range = match.indices?.groups?.[name]
        return {
          name,
          value: captureExcerpt.value,
          truncated: captureExcerpt.truncated,
          range: range ? [range[0], range[1]] : null,
        }
      },
    )

    matches.push({
      index: match.index,
      end: match.index + match[0].length,
      value: matchExcerpt.value,
      truncated: matchExcerpt.truncated,
      captures,
      namedCaptures,
    })

    if (canReplace && replacementPreview !== null && !replacementStopped) {
      appendReplacement(input.testText.slice(replacementCursor, match.index))
      if (!replacementStopped) {
        appendSubstitution(input.replacement ?? '', match, input.testText, appendReplacement)
      }
      replacementCursor = match.index + match[0].length
    }

    if (!isGlobal) break
    if (match[0].length === 0) {
      expression.lastIndex = advanceStringIndex(input.testText, expression.lastIndex, unicode)
    }
  }

  if (canReplace && replacementPreview !== null && !replacementStopped) {
    appendReplacement(input.testText.slice(replacementCursor))
  }

  return {
    ok: true,
    flags: input.flags,
    matches,
    matchesTruncated,
    replacementPreview,
    replacementTruncated,
  }
}
