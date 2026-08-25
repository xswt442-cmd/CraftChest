import { describe, expect, it } from 'vitest'
import { lunarToSolar, solarToLunar, yearJieQiTable } from './service'

describe('solarToLunar · 历史锚点', () => {
  it('2024 春节：甲辰年正月初一，属龙', () => {
    const r = solarToLunar('2024-02-10')
    expect(r.fullZh).toBe('二〇二四年正月初一')
    expect(r.yearGanZhi).toBe('甲辰')
    expect(r.yearShengXiao).toBe('龙')
    expect(r.monthZh).toBe('正')
    expect(r.dayZh).toBe('初一')
  })

  it('2025 春节：乙巳年正月初一，属蛇（干支以正月初一为界）', () => {
    const r = solarToLunar('2025-01-29')
    expect(r.yearGanZhi).toBe('乙巳')
    expect(r.yearShengXiao).toBe('蛇')
    expect(r.dayZh).toBe('初一')
  })
})

describe('solarToLunar · 节气', () => {
  it('2024-02-04 当天立春', () => {
    expect(solarToLunar('2024-02-04').jieQi).toBe('立春')
  })

  it('无节气的日子返回 null', () => {
    expect(solarToLunar('2024-03-15').jieQi).toBeNull()
  })

  it('冬至', () => {
    expect(solarToLunar('2024-12-21').jieQi).toBe('冬至')
  })
})

describe('lunarToSolar · 往返', () => {
  it('甲辰年正月初一 → 2024-02-10', () => {
    expect(lunarToSolar(2024, 1, 1, false)).toBe('2024-02-10')
  })

  it('闰月换算不抛错且落在当年', () => {
    // 2023 闰二月：闰二月初一应在公历 2023 年内
    const iso = lunarToSolar(2023, 2, 1, true)
    expect(iso).toMatch(/^2023-/)
  })

  it('非法农历日期抛 RangeError', () => {
    expect(() => lunarToSolar(2024, 13, 1, false)).toThrow(RangeError)
  })
})

describe('yearJieQiTable · 全年节气', () => {
  const table = yearJieQiTable('2024-06-01')

  it('覆盖全年且升序', () => {
    expect(table.length).toBeGreaterThanOrEqual(24)
    expect(table.length).toBeLessThanOrEqual(26)
    const isos = table.map((e) => e.iso)
    const sorted = [...isos].sort()
    expect(isos).toEqual(sorted)
    expect(isos[0]?.startsWith('2024')).toBe(true)
  })

  it('含立春 2024-02-04 与冬至', () => {
    expect(table.find((e) => e.name === '立春')?.iso).toBe('2024-02-04')
    expect(table.find((e) => e.name === '冬至')).toBeDefined()
  })
})

describe('输入校验', () => {
  it.each(['2024-2-10', 'abc', '2024-02-30'])('%j 抛 RangeError', (iso) => {
    expect(() => solarToLunar(iso)).toThrow(RangeError)
  })

  it('非整数输入抛 RangeError', () => {
    expect(() => lunarToSolar(2024.5, 1, 1, false)).toThrow(RangeError)
  })
})
