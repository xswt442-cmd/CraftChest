import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  hexToRgb,
  normalizeHex,
  rateContrast,
  relativeLuminance,
  suggestColor,
} from './service'

describe('contrast checker service', () => {
  it('规范化三位与六位 hex', () => {
    expect(normalizeHex('#AbC')).toBe('#aabbcc')
    expect(normalizeHex('#F59E0B')).toBe('#f59e0b')
    expect(normalizeHex('bad')).toBeNull()
  })

  it('解析 RGB', () => {
    expect(hexToRgb('#ff8000')).toEqual({ r: 255, g: 128, b: 0 })
    expect(() => hexToRgb('#zzzzzz')).toThrow()
  })

  it('黑白亮度与对比度符合 WCAG', () => {
    expect(relativeLuminance('#000')).toBe(0)
    expect(relativeLuminance('#fff')).toBe(1)
    expect(contrastRatio('#000', '#fff')).toBe(21)
  })

  it('对比度与前背景顺序无关', () => {
    expect(contrastRatio('#123456', '#abcdef')).toBeCloseTo(contrastRatio('#abcdef', '#123456'))
  })

  it('给出 AA/AAA 分级', () => {
    expect(rateContrast('#000', '#fff')).toMatchObject({
      normalAA: true,
      normalAAA: true,
      largeAA: true,
      largeAAA: true,
    })
    expect(rateContrast('#777', '#fff').normalAA).toBe(false)
  })

  it('已达标颜色保持不变', () => {
    expect(suggestColor('#000', '#fff')).toBe('#000000')
  })

  it('建议颜色达到 4.5:1', () => {
    const suggestion = suggestColor('#aaaaaa', '#ffffff')
    expect(contrastRatio(suggestion, '#ffffff')).toBeGreaterThanOrEqual(4.5)
  })
})
