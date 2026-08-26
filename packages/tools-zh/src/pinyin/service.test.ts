import { describe, expect, it } from 'vitest'
import { toPinyin, toRubyHtml, toRubySegments } from './service'

describe('toPinyin · 三种声调格式', () => {
  it.each([
    ['symbol', 'nǐ hǎo'],
    ['num', 'ni3 hao3'],
    ['none', 'ni hao'],
  ])('你好（%s）→ %s', (format, expected) => {
    expect(toPinyin('你好', { format: format as never })).toBe(expected)
  })
})

describe('toPinyin · 多音字', () => {
  it('上下文消歧：重庆读 chóng', () => {
    expect(toPinyin('重庆', { format: 'symbol' })).toContain('chóng')
  })

  it('上下文消歧：重要读 zhòng', () => {
    expect(toPinyin('重要', { format: 'symbol' })).toContain('zhòng')
  })

  it('multiple=true 时给出行的全部读音', () => {
    const out = toPinyin('行', { format: 'symbol', multiple: true })
    expect(out).toContain('xíng')
    expect(out).toContain('háng')
  })

  it('默认只给上下文单一读音', () => {
    const out = toPinyin('银行', { format: 'none' })
    expect(out).toBe('yin hang')
  })
})

describe('toPinyin · 非中文与边界', () => {
  it('英文原样保留', () => {
    expect(toPinyin('用Vue写中国风', { format: 'symbol' })).toContain('Vue')
    expect(toPinyin('用Vue写中国风', { format: 'symbol' })).toContain('zhōng guó')
  })

  it('空串与纯空白返回空串', () => {
    expect(toPinyin('', { format: 'symbol' })).toBe('')
    expect(toPinyin('   \n ', { format: 'symbol' })).toBe('')
  })

  it('数字与标点原样保留', () => {
    expect(toPinyin('第1名！', { format: 'symbol' })).toContain('1')
    expect(toPinyin('第1名！', { format: 'symbol' })).toContain('！')
  })
})

describe('toRubySegments · 语义化注音数据', () => {
  it('逐字返回上下文读音并保留连续非中文片段', () => {
    expect(toRubySegments('银行 & Vue', { format: 'symbol' })).toEqual([
      { text: '银', reading: 'yín' },
      { text: '行', reading: 'háng' },
      { text: ' & Vue' },
    ])
  })

  it('沿用声调格式并可列出全部读音', () => {
    expect(toRubySegments('行', { format: 'num', multiple: true })).toEqual([
      { text: '行', reading: 'xing2/hang2/hang4/heng2' },
    ])
  })

  it('空白输入不生成片段', () => {
    expect(toRubySegments(' \n ', { format: 'symbol' })).toEqual([])
  })
})

describe('toRubyHtml · HTML ruby 导出', () => {
  it('生成包含回退括号的最小 ruby 标签', () => {
    expect(toRubyHtml('你好', { format: 'symbol' })).toBe(
      '<ruby>你<rp>(</rp><rt>nǐ</rt><rp>)</rp></ruby>' +
        '<ruby>好<rp>(</rp><rt>hǎo</rt><rp>)</rp></ruby>',
    )
  })

  it('转义非中文 HTML 与特殊字符，不把输入当作标签', () => {
    expect(toRubyHtml('用<Vue> & "好"', { format: 'none' })).toBe(
      '<ruby>用<rp>(</rp><rt>yong</rt><rp>)</rp></ruby>' +
        '&lt;Vue&gt; &amp; &quot;' +
        '<ruby>好<rp>(</rp><rt>hao</rt><rp>)</rp></ruby>' +
        '&quot;',
    )
  })

  it('空白输入返回空串', () => {
    expect(toRubyHtml('   ', { format: 'symbol' })).toBe('')
  })
})
