/**
 * 人民币大写转换 —— 纯函数逻辑层。
 *
 * 约束（SPEC §5）：合同级严谨；全程字符串运算，不经 float；
 * 框架无关、无副作用、可独立单测。
 */

const DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'] as const
/** 组内位权：仟佰拾个 */
const INNER_UNITS = ['仟', '佰', '拾', ''] as const
/** 4 位一组的组后缀，下标 = 组序（从最低组起） */
const GROUP_UNITS = ['', '万', '亿', '万亿'] as const

/** 整数部分最大位数：4 组 × 4 位 = 16 位（最高到「万亿」组），超出拒绝 */
export const MAX_INTEGER_DIGITS = 16

export type RmbErrorCode = 'format' | 'range'

export class RmbFormatError extends Error {
  readonly code: RmbErrorCode

  constructor(code: RmbErrorCode) {
    super(
      code === 'format'
        ? '无法识别的金额格式'
        : `整数部分超出 ${MAX_INTEGER_DIGITS} 位上限`,
    )
    this.name = 'RmbFormatError'
    this.code = code
  }
}

interface AmountParts {
  negative: boolean
  /** 不含符号、去前导零后的整数部分；'0' 表示零 */
  intDigits: string
  /** 恰好两位的小数部分（角、分） */
  fracDigits: string
}

function addOneDigitString(digits: string): string {
  const arr = digits.split('')
  for (let i = arr.length - 1; i >= 0; i--) {
    const d = arr[i]
    if (d === '9') {
      arr[i] = '0'
      continue
    }
    arr[i] = String(Number(d) + 1)
    return arr.join('')
  }
  return '1' + arr.join('')
}

/** 小数截取到两位，第三位四舍五入，进位可能波及整数部分 */
function roundToCents(intDigits: string, fracRaw: string): { intDigits: string; frac: string } {
  let frac = fracRaw.slice(0, 2).padEnd(2, '0')
  let carried = intDigits
  const third = fracRaw[2]
  if (third !== undefined && third >= '5') {
    if (frac === '99') {
      frac = '00'
      carried = addOneDigitString(carried)
    } else {
      frac = String(Number(frac) + 1).padStart(2, '0')
    }
  }
  return { intDigits: carried, frac }
}

function parseAmount(raw: string): AmountParts {
  if (typeof raw !== 'string') throw new RmbFormatError('format')
  const cleaned = raw.trim().replace(/[￥¥,\s_]/g, '')
  const m = /^([+-]?)(\d*)(?:\.(\d+))?$/.exec(cleaned)
  if (!m || (m[2] === '' && m[3] === undefined)) throw new RmbFormatError('format')

  const negativeSign = m[1] === '-'
  // 去前导零（'007' → '7'，全零 → '0'）
  const intRaw = m[2].replace(/^0+(?=\d)/, '') || '0'
  if (intRaw.length > MAX_INTEGER_DIGITS) throw new RmbFormatError('range')

  const rounded = roundToCents(intRaw, m[3] ?? '')
  const isZero = rounded.intDigits === '0' && rounded.frac === '00'
  return {
    negative: negativeSign && !isZero,
    intDigits: rounded.intDigits,
    fracDigits: rounded.frac,
  }
}

/** 单个 4 位组 → 大写；组内零合并为一个「零」，末尾零不发音 */
function groupToWords(g4: string): string {
  let out = ''
  let pendingZero = false
  for (let i = 0; i < 4; i++) {
    const d = g4[i]
    if (d === '0') {
      if (out !== '') pendingZero = true
      continue
    }
    if (pendingZero) {
      out += '零'
      pendingZero = false
    }
    out += DIGITS[Number(d)] + INNER_UNITS[i]
  }
  return out
}

/** 整数部分 → 大写（不含「元」）；跨组零规则：低位组非全零且最高位为零时补一个「零」 */
function intToWords(intDigits: string): string {
  const padded = intDigits.padStart(Math.ceil(intDigits.length / 4) * 4, '0')
  const groupCount = padded.length / 4
  let out = ''
  for (let gi = 0; gi < groupCount; gi++) {
    const g = padded.slice(gi * 4, gi * 4 + 4)
    if (g === '0000') continue
    if (out !== '' && g[0] === '0') out += '零'
    out += groupToWords(g) + GROUP_UNITS[groupCount - 1 - gi]
  }
  return out
}

/**
 * 数字字符串 → 中文大写金额。
 *
 * 规则要点：
 * - 输入为十进制数字字符串，容忍 ￥/¥ 前缀、千分位逗号与空白；不接受科学计数法
 * - 超过两位的小数按四舍五入进到分
 * - 整数为零但有角分时省略「元」（如 0.05 → 伍分）；纯零 → 零元整
 * - 有角的场合以「整」收尾；有分的场合不写「整」
 * - 负数冠以「负」，但数值为零时负号丢弃
 * - 整数部分上限 16 位（至万亿组），超出抛 RmbFormatError('range')
 */
export function toRmbUppercase(input: string): string {
  const { negative, intDigits, fracDigits } = parseAmount(input)

  if (intDigits === '0' && fracDigits === '00') return '零元整'

  let out = negative ? '负' : ''
  if (intDigits !== '0') out += intToWords(intDigits) + '元'

  const jiao = fracDigits[0]
  const fen = fracDigits[1]
  if (jiao !== '0') {
    out += DIGITS[Number(jiao)] + '角'
    if (fen === '0') {
      out += '整'
    } else {
      out += DIGITS[Number(fen)] + '分'
    }
  } else if (fen !== '0') {
    out += (intDigits !== '0' ? '零' : '') + DIGITS[Number(fen)] + '分'
  } else {
    out += '整'
  }
  return out
}
