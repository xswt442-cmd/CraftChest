/**
 * 中文字数统计 —— 纯函数逻辑层。
 *
 * 多口径并列（SPEC §5）：不裁决唯一「正确」数字，
 * 汉字/标点/西文词等口径全部给出，由使用者按场景取用。
 */

export interface CharCount {
  /** 全部字符（按码点计，含空白） */
  totalChars: number
  /** 不含任何空白的字符数 */
  charsNoSpaces: number
  /** 汉字数（\p{Script=Han}，含扩展区） */
  cjkChars: number
  /** 中文/全角标点数 */
  cjkPunct: number
  /** 西文单词数（字母数字连续串，容忍撇号连字符） */
  asciiWords: number
  /** 西文字母与数字字符总数 */
  asciiLettersDigits: number
  /** 空白字符数（空格、换行、制表符） */
  spaces: number
  /** 混合口径字数：汉字与中文标点各计 1，西文按词计 1（Word「字数」近似口径） */
  wordCountMixed: number
}

const HAN = /\p{Script=Han}/gu
const CJK_PUNCT = /[\u3000-\u303F\uFF01-\uFF0F\uFF1A-\uFF1F\uFF3B-\uFF40\uFF5B-\uFF65]/g
const WORDS = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g
const LETTERS_DIGITS = /[A-Za-z0-9]/g
const SPACES = /\s/g

function matchCount(text: string, re: RegExp): number {
  return text.match(re)?.length ?? 0
}

/** 统计一段文本的多口径字符指标；所有计数以 Unicode 码点为单位 */
export function countChars(text: string): CharCount {
  const cps = Array.from(text)
  const cjkChars = matchCount(text, HAN)
  const cjkPunct = matchCount(text, CJK_PUNCT)
  const asciiWords = matchCount(text, WORDS)

  return {
    totalChars: cps.length,
    charsNoSpaces: cps.filter((c) => !SPACES.test(c)).length,
    cjkChars,
    cjkPunct,
    asciiWords,
    asciiLettersDigits: matchCount(text, LETTERS_DIGITS),
    spaces: matchCount(text, SPACES),
    wordCountMixed: cjkChars + cjkPunct + asciiWords,
  }
}
