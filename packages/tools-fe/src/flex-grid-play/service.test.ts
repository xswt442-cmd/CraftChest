import { describe, expect, it } from 'vitest'
import { buildContainerStyle, buildItemStyle, stylesToCss, type LayoutOptions } from './service'

const base: LayoutOptions = {
  mode: 'flex',
  gap: 12,
  direction: 'row',
  justify: 'space-between',
  align: 'center',
  wrap: true,
  columns: 3,
  itemGrow: 2,
  itemSpan: 2,
}

describe('flex-grid service', () => {
  it('生成 flex 容器样式', () => {
    expect(buildContainerStyle(base)).toEqual({
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center',
      justifyContent: 'space-between',
    })
  })

  it('生成 grid 容器样式', () => {
    expect(buildContainerStyle({ ...base, mode: 'grid' })).toEqual({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '12px',
      alignItems: 'center',
      justifyContent: 'space-between',
    })
  })

  it('夹取列数和间距', () => {
    const style = buildContainerStyle({ ...base, mode: 'grid', columns: 99, gap: -2 })
    expect(style.gridTemplateColumns).toContain('repeat(6')
    expect(style.gap).toBe('0px')
  })

  it('生成 flex 子项样式', () => {
    expect(buildItemStyle(base)).toEqual({ flexGrow: '2' })
  })

  it('grid 子项跨度不超过列数', () => {
    expect(buildItemStyle({ ...base, mode: 'grid', columns: 2, itemSpan: 5 })).toEqual({
      gridColumn: 'span 2',
    })
  })

  it('将 camelCase 样式转成 CSS', () => {
    expect(stylesToCss('.box', { display: 'grid', gridTemplateColumns: '1fr 1fr' })).toBe(
      '.box {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n}',
    )
  })
})
