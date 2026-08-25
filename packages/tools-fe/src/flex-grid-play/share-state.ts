import type { LayoutOptions } from './service'

export type FlexGridShareState = LayoutOptions

const MODES = ['flex', 'grid'] as const
const DIRECTIONS = ['row', 'column'] as const
const JUSTIFY_VALUES = ['flex-start', 'center', 'space-between', 'space-around'] as const
const ALIGN_VALUES = ['stretch', 'flex-start', 'center', 'flex-end'] as const

function isIntegerIn(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max
}

export function isFlexGridShareState(value: unknown): value is FlexGridShareState {
  if (typeof value !== 'object' || value === null) return false
  const state = value as Partial<FlexGridShareState>
  return (
    MODES.includes(state.mode as FlexGridShareState['mode']) &&
    DIRECTIONS.includes(state.direction as FlexGridShareState['direction']) &&
    JUSTIFY_VALUES.includes(state.justify as FlexGridShareState['justify']) &&
    ALIGN_VALUES.includes(state.align as FlexGridShareState['align']) &&
    typeof state.wrap === 'boolean' &&
    isIntegerIn(state.gap, 0, 40) &&
    isIntegerIn(state.columns, 1, 6) &&
    isIntegerIn(state.itemGrow, 0, 5) &&
    isIntegerIn(state.itemSpan, 1, state.columns)
  )
}

export function toFlexGridShareState(options: LayoutOptions): FlexGridShareState {
  return { ...options }
}
