import { describe, expect, it } from 'vitest'
import { isEasingShareState, toEasingShareState } from './share-state'

const valid = { curve: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 }, duration: 1200 }

describe('easing share state', () => {
  it('接受合法状态并生成不可变快照', () => {
    expect(isEasingShareState(valid)).toBe(true)
    const curve = { ...valid.curve }
    const state = toEasingShareState(curve, valid.duration)
    curve.x1 = 0.8
    expect(state).toEqual(valid)
  })

  it.each([
    { ...valid, duration: 299 },
    { ...valid, duration: Number.NaN },
    { ...valid, curve: { ...valid.curve, x1: -0.01 } },
    { ...valid, curve: { ...valid.curve, y2: 1.51 } },
    { ...valid, curve: null },
  ])('拒绝非法或越界状态 %#', (value) => {
    expect(isEasingShareState(value)).toBe(false)
  })
})
