/**
 * 中文排版规范化 —— 纯函数逻辑层。
 *
 * 保留原有 addSpacing 的克制语义；扩展规范化也只执行确定性、低歧义规则。
 */

/** 参与盘古规则的 CJK 侧字符：汉字（含扩展A/兼容）、假名、谚文 */
export const CJK_PATTERN = String.raw`[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF]`

/** 西文侧：半角字母与数字 */
export const ALNUM_PATTERN = String.raw`[A-Za-z0-9]`

const LEADING = new RegExp(`(${CJK_PATTERN})(?=${ALNUM_PATTERN})`, 'g')
const TRAILING = new RegExp(`(?<=${ALNUM_PATTERN})(${CJK_PATTERN})`, 'g')

const FULLWIDTH_DIGIT = /[０-９]/g
const FULLWIDTH_PUNCTUATION = '，。！？；：、（）《》【】「」『』'
const SPACE_BEFORE_FULLWIDTH_PUNCTUATION = new RegExp(`[ \\t]+(?=[${FULLWIDTH_PUNCTUATION}])`, 'g')
const SPACE_AFTER_FULLWIDTH_PUNCTUATION = new RegExp(`(?<=[${FULLWIDTH_PUNCTUATION}])[ \\t]+`, 'g')
// 只收录歧义较低的常见单位；不会把 3D、10am 等普通词组拆开。
const NUMBER_UNIT =
  /(\d)(?=(?:[kmgtpezy]?i?b|[kmgtpezy]?bps|[kmgt]?hz|px|pt|rem|vh|vw|vmin|vmax|ms|mm|cm|km|kg|mg|ml|kw|ma)\b)/gi

export type NormalizationRule =
  'fullwidth-digit' | 'cjk-spacing' | 'number-unit-spacing' | 'punctuation-spacing'

export interface NormalizationChange {
  rule: NormalizationRule
  count: number
}

export interface NormalizationResult {
  text: string
  changes: NormalizationChange[]
  totalChanges: number
}

export { diffText } from '../shared/text-diff'
export type { DiffKind, DiffSegment } from '../shared/text-diff'

/**
 * 在 CJK 与西文字母/数字的紧邻处插入一个空格。
 * - 幂等：已规范化的文本原样返回
 * - 只插入，从不删除或合并既有空白
 * - 标点（中英皆然）一律保持原样
 */
export function addSpacing(text: string): string {
  return text.replace(LEADING, '$1 ').replace(TRAILING, ' $1')
}

function applyRule(
  text: string,
  pattern: RegExp,
  replacement: string | ((substring: string, ...args: unknown[]) => string),
): { text: string; count: number } {
  let count = 0
  const next = text.replace(pattern, (...args: [string, ...unknown[]]) => {
    count += 1
    return typeof replacement === 'string'
      ? replacement.replace('$1', String(args[1] ?? ''))
      : replacement(...args)
  })
  return { text: next, count }
}

/**
 * 执行确定性、低语义风险的中文排版规则。
 * 不转换半角标点、不合并重复标点，也不改写专有名词或句子。
 */
export function normalizeCopywriting(text: string): NormalizationResult {
  let current = text
  const changes: NormalizationChange[] = []

  const fullwidthDigits = applyRule(current, FULLWIDTH_DIGIT, (digit) =>
    String.fromCharCode(digit.charCodeAt(0) - 0xfee0),
  )
  current = fullwidthDigits.text
  if (fullwidthDigits.count > 0) {
    changes.push({ rule: 'fullwidth-digit', count: fullwidthDigits.count })
  }

  const spaced = addSpacing(current)
  const cjkSpacingCount = spaced.length - current.length
  current = spaced
  if (cjkSpacingCount > 0) {
    changes.push({ rule: 'cjk-spacing', count: cjkSpacingCount })
  }

  const units = applyRule(current, NUMBER_UNIT, '$1 ')
  current = units.text
  if (units.count > 0) {
    changes.push({ rule: 'number-unit-spacing', count: units.count })
  }

  const beforePunctuation = applyRule(current, SPACE_BEFORE_FULLWIDTH_PUNCTUATION, '')
  const afterPunctuation = applyRule(beforePunctuation.text, SPACE_AFTER_FULLWIDTH_PUNCTUATION, '')
  current = afterPunctuation.text
  const punctuationCount = beforePunctuation.count + afterPunctuation.count
  if (punctuationCount > 0) {
    changes.push({ rule: 'punctuation-spacing', count: punctuationCount })
  }

  return {
    text: current,
    changes,
    totalChanges: changes.reduce((total, change) => total + change.count, 0),
  }
}
