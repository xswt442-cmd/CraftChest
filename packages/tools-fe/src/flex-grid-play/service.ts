export type LayoutMode = 'flex' | 'grid'

export interface LayoutOptions {
  mode: LayoutMode
  gap: number
  direction: 'row' | 'column'
  justify: 'flex-start' | 'center' | 'space-between' | 'space-around'
  align: 'stretch' | 'flex-start' | 'center' | 'flex-end'
  wrap: boolean
  columns: number
  itemGrow: number
  itemSpan: number
}

export type CssStyles = Record<string, string>

function integer(value: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, Number.isFinite(value) ? value : min)))
}

export function buildContainerStyle(options: LayoutOptions): CssStyles {
  const gap = `${integer(options.gap, 0, 64)}px`
  if (options.mode === 'grid') {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${integer(options.columns, 1, 6)}, minmax(0, 1fr))`,
      gap,
      alignItems: options.align,
      justifyContent: options.justify,
    }
  }
  return {
    display: 'flex',
    flexDirection: options.direction,
    flexWrap: options.wrap ? 'wrap' : 'nowrap',
    gap,
    alignItems: options.align,
    justifyContent: options.justify,
  }
}

export function buildItemStyle(options: LayoutOptions): CssStyles {
  return options.mode === 'grid'
    ? { gridColumn: `span ${integer(options.itemSpan, 1, options.columns)}` }
    : { flexGrow: integer(options.itemGrow, 0, 5).toString() }
}

function kebab(property: string): string {
  return property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

export function stylesToCss(selector: string, styles: CssStyles): string {
  const body = Object.entries(styles)
    .map(([key, value]) => `  ${kebab(key)}: ${value};`)
    .join('\n')
  return `${selector} {\n${body}\n}`
}
