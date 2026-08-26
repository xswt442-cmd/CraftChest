import { describe, expect, it } from 'vitest'
import { compareChinese, convertChinese } from './service'

// 断言值均经 opencc-js 1.4.2 实测（见仓库提交前的探测记录）
describe('convertChinese · 字级与词汇级', () => {
  it('cn2t 字级：简体→簡體', () => {
    expect(convertChinese('简体', 'cn2t')).toBe('簡體')
  })

  it('cn2t 字级不换词：内存保持 內存', () => {
    expect(convertChinese('内存', 'cn2t')).toBe('內存')
  })

  it('cn2tw 词汇级：内存→記憶體', () => {
    expect(convertChinese('内存', 'cn2tw')).toBe('記憶體')
  })

  it('cn2tw 词汇级：信息→資訊', () => {
    expect(convertChinese('信息', 'cn2tw')).toBe('資訊')
  })
})

describe('compareChinese · Unicode 差异统计', () => {
  it('字形替换同时表现为删除与新增', () => {
    expect(compareChinese('简体', '簡體')).toEqual({
      segments: [
        { type: 'delete', text: '简体' },
        { type: 'insert', text: '簡體' },
      ],
      changed: 2,
      inserted: 2,
      deleted: 2,
    })
  })

  it('词汇扩展按较长一侧计算变化字符数', () => {
    const diff = compareChinese('内存', '記憶體')
    expect(diff).toMatchObject({ changed: 3, inserted: 3, deleted: 2 })
  })

  it('保留共同文本并正确计算 emoji 等代理对', () => {
    const diff = compareChinese('A😀简B', 'A😀簡B')
    expect(diff.segments).toEqual([
      { type: 'equal', text: 'A😀' },
      { type: 'delete', text: '简' },
      { type: 'insert', text: '簡' },
      { type: 'equal', text: 'B' },
    ])
    expect(diff.changed).toBe(1)
  })

  it('相同内容没有变化', () => {
    expect(compareChinese('不变', '不变')).toMatchObject({ changed: 0, inserted: 0, deleted: 0 })
  })
})

describe('convertChinese · 地区变体差异', () => {
  it('里：台湾词汇级作 裡，香港变体作 裏', () => {
    expect(convertChinese('里面', 'cn2tw')).toBe('裡面')
    expect(convertChinese('里面', 'cn2hk')).toBe('裏面')
  })
})

describe('convertChinese · 反向与非中文', () => {
  it('t2cn 字级反向；词汇不还原（滑鼠保持原样）', () => {
    expect(convertChinese('用滑鼠點擊', 't2cn')).toBe('用滑鼠点击')
  })

  it('空串原样返回', () => {
    expect(convertChinese('', 'cn2t')).toBe('')
  })

  it('非中文字符不受影响', () => {
    expect(convertChinese('OpenCC v1.4.2 (2024)', 'cn2tw')).toBe('OpenCC v1.4.2 (2024)')
  })
})
