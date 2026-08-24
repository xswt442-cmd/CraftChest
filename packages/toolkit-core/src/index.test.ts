import { describe, expect, it } from 'vitest'
import {
  assertUniqueToolIds,
  defineTool,
  groupBySection,
  searchTools,
  sortTools,
} from './index'
import type { ToolMeta } from './index'

function makeTool(overrides: Partial<ToolMeta> & Pick<ToolMeta, 'id'>): ToolMeta {
  return defineTool({
    section: 'zh',
    title: { zh: overrides.id, en: overrides.id },
    description: { zh: '', en: '' },
    icon: 'lucide:puzzle',
    keywords: [],
    component: async () => ({}) as never,
    ...overrides,
  })
}

describe('defineTool', () => {
  it('原样返回元数据', () => {
    const meta = makeTool({ id: 'a' })
    expect(defineTool(meta)).toBe(meta)
  })
})

describe('sortTools', () => {
  it('order 缺省视为 100，小的在前', () => {
    const sorted = sortTools([
      makeTool({ id: 'b' }),
      makeTool({ id: 'a', order: 1 }),
      makeTool({ id: 'c' }),
    ])
    expect(sorted.map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })

  it('同序按 id 字典序', () => {
    const sorted = sortTools([
      makeTool({ id: 'pinyin' }),
      makeTool({ id: 'opencc' }),
      makeTool({ id: 'lunar-calendar' }),
    ])
    expect(sorted.map((t) => t.id)).toEqual(['lunar-calendar', 'opencc', 'pinyin'])
  })

  it('不修改入参数组', () => {
    const input = [makeTool({ id: 'b' }), makeTool({ id: 'a' })]
    sortTools(input)
    expect(input.map((t) => t.id)).toEqual(['b', 'a'])
  })
})

describe('groupBySection', () => {
  it('按分区分组且各组分区内排序，空分区保留键', () => {
    const grouped = groupBySection([makeTool({ id: 'z2' }), makeTool({ id: 'f1', section: 'fe' })])
    expect(grouped.zh.map((t) => t.id)).toEqual(['z2'])
    expect(grouped.fe.map((t) => t.id)).toEqual(['f1'])
  })
})

describe('searchTools', () => {
  const tools = [
    makeTool({
      id: 'rmb-uppercase',
      title: { zh: '人民币大写', en: 'RMB Uppercase' },
      description: { zh: '数字转中文大写金额', en: 'Amount in Chinese words' },
      keywords: ['rmb', '金额', '大写'],
    }),
    makeTool({
      id: 'pinyin',
      title: { zh: '拼音标注', en: 'Pinyin' },
      keywords: ['pin yin'],
    }),
  ]

  it('空白查询返回空数组', () => {
    expect(searchTools(tools, '')).toEqual([])
    expect(searchTools(tools, '   ')).toEqual([])
  })

  it('命中中文标题与描述', () => {
    expect(searchTools(tools, '人民币').map((t) => t.id)).toEqual(['rmb-uppercase'])
    expect(searchTools(tools, '大写金额').map((t) => t.id)).toEqual(['rmb-uppercase'])
  })

  it('命中英文标题（大小写不敏感）', () => {
    expect(searchTools(tools, 'PINYIN').map((t) => t.id)).toEqual(['pinyin'])
  })

  it('命中关键词', () => {
    expect(searchTools(tools, 'RMB').map((t) => t.id)).toEqual(['rmb-uppercase'])
  })

  it('无命中返回空数组', () => {
    expect(searchTools(tools, 'base64')).toEqual([])
  })
})

describe('assertUniqueToolIds', () => {
  it('重复 id 抛错并列出冲突项', () => {
    expect(() =>
      assertUniqueToolIds([makeTool({ id: 'x' }), makeTool({ id: 'x' })]),
    ).toThrow('x')
  })

  it('唯一 id 不抛错', () => {
    expect(() =>
      assertUniqueToolIds([makeTool({ id: 'x' }), makeTool({ id: 'y' })]),
    ).not.toThrow()
  })
})
