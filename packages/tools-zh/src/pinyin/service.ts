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

export interface RubySegment {
  text: string
  reading?: string
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

/** 将文本拆为适合安全渲染的逐字 ruby 数据；非中文片段不附读音。 */
export function toRubySegments(text: string, opts: PinyinOptions): RubySegment[] {
  if (text.trim() === '') return []
  return pinyin(text, {
    toneType: opts.format,
    type: 'all',
    multiple: false,
    nonZh: 'consecutive',
  }).map((item) => ({
    text: item.origin,
    ...(item.isZh
      ? {
          reading: opts.multiple
            ? pinyin(item.origin, {
                toneType: opts.format,
                type: 'array',
                multiple: true,
              }).join('/')
            : item.result,
        }
      : {}),
  }))
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!,
  )
}

/** 导出可直接嵌入页面的语义化、安全 HTML 片段。 */
export function toRubyHtml(text: string, opts: PinyinOptions): string {
  return toRubySegments(text, opts)
    .map((segment) => {
      const escapedText = escapeHtml(segment.text)
      if (segment.reading === undefined) return escapedText
      return `<ruby>${escapedText}<rp>(</rp><rt>${escapeHtml(segment.reading)}</rt><rp>)</rp></ruby>`
    })
    .join('')
}
