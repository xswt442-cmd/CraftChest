/**
 * 盘古之白 · 中英文排版规范化 —— 纯函数逻辑层。
 *
 * 范围克制（SPEC §5）：只在 CJK 与西文字母/数字的**紧邻边界**插入一个空格；
 * 已有的空白不增不减，任何标点不做转换。
 */

/** 参与盘古规则的 CJK 侧字符：汉字（含扩展A/兼容）、假名、谚文 */
export const CJK_PATTERN = String.raw`[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF]`

/** 西文侧：半角字母与数字 */
export const ALNUM_PATTERN = String.raw`[A-Za-z0-9]`

const LEADING = new RegExp(`(${CJK_PATTERN})(?=${ALNUM_PATTERN})`, 'g')
const TRAILING = new RegExp(`(?<=${ALNUM_PATTERN})(${CJK_PATTERN})`, 'g')

/**
 * 在 CJK 与西文字母/数字的紧邻处插入一个空格。
 * - 幂等：已规范化的文本原样返回
 * - 只插入，从不删除或合并既有空白
 * - 标点（中英皆然）一律保持原样
 */
export function addSpacing(text: string): string {
  return text.replace(LEADING, '$1 ').replace(TRAILING, ' $1')
}
