import { describe, expect, it } from 'vitest'
import { addSpacing } from './service'

describe('addSpacing · 中英边界加空格', () => {
  it.each([
    ['中文English混合', '中文 English 混合'],
    ['第1章第2节', '第 1 章第 2 节'],
    ['ABC株式会社', 'ABC 株式会社'],
    ['版本号v2更新了100次', '版本号 v2 更新了 100 次'],
    ['使用TypeScript编写，测试覆盖率100%', '使用 TypeScript 编写，测试覆盖率 100%'],
  ])('%s → %s', (input, expected) => {
    expect(addSpacing(input)).toBe(expected)
  })
})

describe('addSpacing · 幂等与既有空白保护', () => {
  it.each([
    ['中文 English 混合', '中文 English 混合'],
    ['中文  English', '中文  English'], // 已有双空格不合并
    ['中文\nEnglish\t2024 年', '中文\nEnglish\t2024 年'], // 各类空白原样
  ])('%s 保持不变', (input, expected) => {
    expect(addSpacing(input)).toBe(expected)
  })
})

describe('addSpacing · 标点不转换', () => {
  it.each([
    ['中文，English。2024年！', '中文，English。2024 年！'],
    ['价格：99元/件（含税）', '价格：99 元/件（含税）'],
    ['e.g. 例如this', 'e.g. 例如 this'],
  ])('%s → %s', (input, expected) => {
    expect(addSpacing(input)).toBe(expected)
  })
})

describe('addSpacing · 其他 CJK 文字与边界', () => {
  it('假名与西文之间也加空格', () => {
    expect(addSpacing('これはAPIです')).toBe('これは API です')
  })

  it('空串与纯西文原样返回', () => {
    expect(addSpacing('')).toBe('')
    expect(addSpacing('plain english 42')).toBe('plain english 42')
  })

  it('交替密集边界全部命中', () => {
    // 西文连续串（A1、2b、3C）内部不加空格
    expect(addSpacing('A1中2b文3C')).toBe('A1 中 2b 文 3C')
  })
})
