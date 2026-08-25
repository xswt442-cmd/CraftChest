import { describe, expect, it } from 'vitest'
import { isFlexGridShareState, toFlexGridShareState } from './share-state'

const valid = {
  mode: 'grid' as const,
  gap: 12,
  direction: 'row' as const,
  justify: 'space-between' as const,
  align: 'center' as const,
  wrap: true,
  columns: 3,
  itemGrow: 1,
  itemSpan: 2,
}

describe('flex/grid share state', () => {
  it('接受完整合法状态并生成快照', () => {
    expect(isFlexGridShareState(valid)).toBe(true)
    expect(toFlexGridShareState(valid)).toEqual(valid)
  })

  it.each([
    { ...valid, mode: 'table' },
    { ...valid, gap: 12.5 },
    { ...valid, columns: 7 },
    { ...valid, itemSpan: 4 },
    { ...valid, wrap: 'yes' },
  ])('拒绝非法或不一致状态 %#', (value) => {
    expect(isFlexGridShareState(value)).toBe(false)
  })
})
