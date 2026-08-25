import { describe, expect, it } from 'vitest'
import { buildGradient, toBackgroundDeclaration, type GradientOptions } from './service'

const base: GradientOptions = {
  kind: 'linear',
  angle: 135,
  centerX: 50,
  centerY: 50,
  stops: [
    { color: '#f59e0b', position: 0 },
    { color: '#ec4899', position: 100 },
  ],
}

describe('buildGradient', () => {
  it('生成线性渐变', () => {
    expect(buildGradient(base)).toBe('linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)')
  })

  it('生成径向渐变并夹取中心点', () => {
    expect(buildGradient({ ...base, kind: 'radial', centerX: -2, centerY: 120 })).toBe(
      'radial-gradient(circle at 0% 100%, #f59e0b 0%, #ec4899 100%)',
    )
  })

  it('生成锥形渐变并归一化角度', () => {
    expect(buildGradient({ ...base, kind: 'conic', angle: -45 })).toBe(
      'conic-gradient(from 315deg at 50% 50%, #f59e0b 0%, #ec4899 100%)',
    )
  })

  it('按位置排序且不修改原色标数组', () => {
    const stops = [
      { color: '#fff', position: 90 },
      { color: '#000', position: 10 },
    ]
    expect(buildGradient({ ...base, stops })).toContain('#000 10%, #fff 90%')
    expect(stops[0]?.color).toBe('#fff')
  })

  it('夹取色标位置并格式化小数', () => {
    expect(
      buildGradient({
        ...base,
        angle: 22.345,
        stops: [
          { color: 'red', position: -1 },
          { color: 'blue', position: 100.8 },
        ],
      }),
    ).toBe('linear-gradient(22.35deg, red 0%, blue 100%)')
  })

  it('拒绝不足两个色标', () => {
    expect(() => buildGradient({ ...base, stops: [{ color: 'red', position: 0 }] })).toThrow()
  })

  it('生成完整 background 声明', () => {
    expect(toBackgroundDeclaration(base)).toBe(
      'background: linear-gradient(135deg, #f59e0b 0%, #ec4899 100%);',
    )
  })
})
