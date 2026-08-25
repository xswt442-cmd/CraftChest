import { describe, expect, it } from 'vitest'
import { isPinyinShareState } from './share-state'

describe('pinyin share state', () => {
  it.each([
    { format: 'symbol', multiple: false },
    { format: 'num', multiple: true },
    { format: 'none', multiple: false },
  ])('接受合法选项态 %#', (value) => {
    expect(isPinyinShareState(value)).toBe(true)
  })

  it.each([
    { format: 'tone', multiple: false },
    { format: 'symbol', multiple: 1 },
    { format: 'symbol' },
  ])('拒绝非法选项态 %#', (value) => {
    expect(isPinyinShareState(value)).toBe(false)
  })
})
