import type { PinyinFormat } from './service'

export interface PinyinShareState {
  format: PinyinFormat
  multiple: boolean
}

const FORMATS: readonly PinyinFormat[] = ['symbol', 'num', 'none']

export function isPinyinShareState(value: unknown): value is PinyinShareState {
  if (typeof value !== 'object' || value === null) return false
  const state = value as Partial<PinyinShareState>
  return FORMATS.includes(state.format as PinyinFormat) && typeof state.multiple === 'boolean'
}
