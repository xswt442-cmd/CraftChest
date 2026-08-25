export interface ContrastShareState {
  foreground: string
  background: string
}

const HEX_COLOR = /^#[\da-f]{3}(?:[\da-f]{3})?$/i

export function isContrastShareState(value: unknown): value is ContrastShareState {
  if (typeof value !== 'object' || value === null) return false
  const state = value as Partial<ContrastShareState>
  return (
    typeof state.foreground === 'string' &&
    HEX_COLOR.test(state.foreground) &&
    typeof state.background === 'string' &&
    HEX_COLOR.test(state.background)
  )
}
