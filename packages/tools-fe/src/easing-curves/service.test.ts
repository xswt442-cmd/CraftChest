import { describe, expect, it } from 'vitest'
import { EASING_PRESETS, normalizeCurve, toCubicBezier, toSvgPath } from './service'

describe('easing curve service', () => {
  it('生成 cubic-bezier CSS', () => {
    expect(toCubicBezier(EASING_PRESETS.ease)).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)')
  })

  it('x 控制点夹取到 CSS 合法范围', () => {
    expect(normalizeCurve({ x1: -1, y1: 0, x2: 3, y2: 1 })).toEqual({ x1: 0, y1: 0, x2: 1, y2: 1 })
  })

  it('y 控制点允许超调但限制极端值', () => {
    expect(normalizeCurve({ x1: 0, y1: -9, x2: 1, y2: 8 })).toEqual({ x1: 0, y1: -2, x2: 1, y2: 2 })
  })

  it('处理非有限数值', () => {
    expect(normalizeCurve({ x1: Number.NaN, y1: Infinity, x2: 0.5, y2: 1 })).toEqual({
      x1: 0,
      y1: -2,
      x2: 0.5,
      y2: 1,
    })
  })

  it('生成 SVG 三次贝塞尔路径', () => {
    expect(toSvgPath({ x1: 0.25, y1: 0, x2: 0.75, y2: 1 }, 100)).toBe(
      'M 0 100 C 25 100, 75 0, 100 0',
    )
  })
})
