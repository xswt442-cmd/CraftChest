/**
 * 拼音标注 —— 纯函数逻辑层，封装 pinyin-pro。
 * service 只做参数收敛与输出整形，框架无关。
 */
import { pinyin } from 'pinyin-pro'

export type PinyinFormat = 'symbol' | 'num' | 'none'

export interface PinyinOptions {
  /** 声调呈现：带调符号 / 数字后缀 / 无声调 */
  format: PinyinFormat
  /** 多音字标注全部读音（读音间以 / 分隔） */
  multiple?: boolean
}

/** 中文逐字注音；非中文字符原样保留，音节以空格分隔，空输入返回空串 */
export function toPinyin(text: string, opts: PinyinOptions): string {
  if (text.trim() === '') return ''
  return pinyin(text, {
    toneType: opts.format,
    type: 'string',
    multiple: opts.multiple ?? false,
    nonZh: 'consecutive',
    separator: ' ',
  })
}
