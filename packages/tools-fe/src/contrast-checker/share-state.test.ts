import { describe, expect, it } from 'vitest'
import { isContrastShareState } from './share-state'

const valid = { foreground: '#111827', background: '#fff' }

describe('contrast share state', () => {
  it('接受合法的三位或六位十六进制颜色', () => {
    expect(isContrastShareState(valid)).toBe(true)
  })

  it.each([
    { ...valid, foreground: 'red' },
    { ...valid, background: '#ffff' },
    { ...valid, foreground: '#12345678' },
    { ...valid, background: null },
  ])('拒绝非法颜色 %#', (value) => {
    expect(isContrastShareState(value)).toBe(false)
  })
})
