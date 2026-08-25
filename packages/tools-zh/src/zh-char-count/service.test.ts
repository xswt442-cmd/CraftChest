import { describe, expect, it } from 'vitest'
import { countChars } from './service'

describe('countChars · 混合文本多口径', () => {
  const r = countChars('你好，世界！hello world 42')
  it('汉字数', () => expect(r.cjkChars).toBe(4))
  it('中文标点数', () => expect(r.cjkPunct).toBe(2))
  it('西文单词数', () => expect(r.asciiWords).toBe(3)) // hello / world / 42
  it('西文字母数字符数', () => expect(r.asciiLettersDigits).toBe(12))
  it('总字符（按码点）与去空白', () => {
    expect(r.totalChars).toBe(20)
    expect(r.charsNoSpaces).toBe(18)
    expect(r.spaces).toBe(2)
  })
  it('混合口径字数 = 汉字+中文标点+西文词', () => expect(r.wordCountMixed).toBe(9))
})

describe('countChars · 边界', () => {
  it('空串全零', () => {
    const r = countChars('')
    expect(r.totalChars).toBe(0)
    expect(r.wordCountMixed).toBe(0)
  })

  it('纯汉字', () => {
    const r = countChars('春眠不觉晓')
    expect(r.totalChars).toBe(5)
    expect(r.cjkChars).toBe(5)
    expect(r.asciiWords).toBe(0)
    expect(r.spaces).toBe(0)
  })

  it('扩展区汉字按码点计且计入汉字数', () => {
    const r = countChars('𠀀𠀁中')
    expect(r.totalChars).toBe(3) // 代理对长度会是 5，码点口径必须是 3
    expect(r.cjkChars).toBe(3)
  })
})

describe('countChars · 口径细节', () => {
  it('换行制表符计入空白', () => {
    const r = countChars('a\nb\tc d')
    expect(r.spaces).toBe(3)
    expect(r.asciiWords).toBe(4)
    expect(r.charsNoSpaces).toBe(4)
  })

  it("撇号连字符词算一个词", () => {
    const r = countChars("don't stop-me now")
    expect(r.asciiWords).toBe(3)
    expect(r.asciiLettersDigits).toBe(13) // dont + stopme + now
  })

  it('全角冒号感叹号计入中文标点', () => {
    const r = countChars('注意：安全！')
    expect(r.cjkPunct).toBe(2)
    expect(r.cjkChars).toBe(4)
  })
})
