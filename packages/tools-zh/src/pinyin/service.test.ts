import { describe, expect, it } from 'vitest'
import { toPinyin } from './service'

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
