import { describe, expect, it } from 'vitest'
import { addSpacing, diffText, normalizeCopywriting } from './service'

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

describe('normalizeCopywriting · 中文排版规范化', () => {
  it('组合执行全角数字、CJK 边界和常见单位规则', () => {
    expect(normalizeCopywriting('今天花了１００元买SSD，硬盘有20GB。')).toEqual({
      text: '今天花了 100 元买 SSD，硬盘有 20 GB。',
      changes: [
        { rule: 'fullwidth-digit', count: 3 },
        { rule: 'cjk-spacing', count: 4 },
        { rule: 'number-unit-spacing', count: 1 },
      ],
      totalChanges: 8,
    })
  })

  it('百分号、温度符号不拆分，常见单位会加空格', () => {
    expect(normalizeCopywriting('角度90°，提升15%，延迟10ms')).toMatchObject({
      text: '角度 90°，提升 15%，延迟 10 ms',
    })
  })

  it('移除全角标点两侧的半角空格，但保留换行', () => {
    expect(normalizeCopywriting('你好 ， 世界！ 下一句\n（ 测试 ）')).toMatchObject({
      text: '你好，世界！下一句\n（测试）',
    })
  })

  it('不改写英文标点、URL 或有歧义的字母数字词组', () => {
    const input = 'README.md: https://example.com?q=1，支持3D和10am'
    expect(normalizeCopywriting(input).text).toBe(
      'README.md: https://example.com?q=1，支持 3D 和 10am',
    )
  })

  it('规范化结果保持幂等', () => {
    const once = normalizeCopywriting('全角１２３， 容量20GB').text
    expect(normalizeCopywriting(once).text).toBe(once)
  })
})

describe('diffText · 字符级差异', () => {
  it('以合并后的片段表示插入、删除与不变内容', () => {
    expect(diffText('中文Ａ版', '中文 A 版')).toEqual([
      { type: 'equal', text: '中文' },
      { type: 'delete', text: 'Ａ' },
      { type: 'insert', text: ' A ' },
      { type: 'equal', text: '版' },
    ])
  })

  it('正确处理 emoji 等代理对字符', () => {
    expect(diffText('你好😀世界', '你好 😀 世界')).toEqual([
      { type: 'equal', text: '你好' },
      { type: 'insert', text: ' ' },
      { type: 'equal', text: '😀' },
      { type: 'insert', text: ' ' },
      { type: 'equal', text: '世界' },
    ])
  })

  it('相同文本与空串返回紧凑结果', () => {
    expect(diffText('不变', '不变')).toEqual([{ type: 'equal', text: '不变' }])
    expect(diffText('', '')).toEqual([])
  })

  it('长文本降级为粗粒度 diff 时仍可精确重建结果', () => {
    const before = `开头${'甲'.repeat(600)}结尾`
    const after = `开头${'乙'.repeat(600)}结尾`
    const segments = diffText(before, after)
    expect(
      segments
        .filter(({ type }) => type !== 'delete')
        .map(({ text }) => text)
        .join(''),
    ).toBe(after)
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
