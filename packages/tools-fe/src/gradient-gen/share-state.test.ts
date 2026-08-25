import { describe, expect, it } from 'vitest'
import { isGradientShareState, toGradientShareState } from './share-state'

const valid = {
  kind: 'conic' as const,
  angle: 270,
  centerX: 25,
  centerY: 75,
  colors: ['#abc', '#123456'] as [string, string],
}

describe('gradient share state', () => {
  it('接受完整合法状态', () => {
    expect(isGradientShareState(valid)).toBe(true)
  })

  it.each([
    { ...valid, kind: 'mesh' },
    { ...valid, angle: 360 },
    { ...valid, centerX: -1 },
    { ...valid, colors: ['red', '#fff'] },
    { ...valid, colors: ['#fff'] },
  ])('拒绝非法或越界状态 %#', (value) => {
    expect(isGradientShareState(value)).toBe(false)
  })

  it('从渐变选项提取最小分享状态', () => {
    expect(
      toGradientShareState({
        kind: 'radial',
        angle: 10,
        centerX: 20,
        centerY: 30,
        stops: [
          { color: '#000000', position: 0 },
          { color: '#ffffff', position: 100 },
        ],
      }),
    ).toEqual({
      kind: 'radial',
      angle: 10,
      centerX: 20,
      centerY: 30,
      colors: ['#000000', '#ffffff'],
    })
  })
})
