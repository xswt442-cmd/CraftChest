import type { GradientKind, GradientOptions } from './service'

export interface GradientShareState {
  kind: GradientKind
  angle: number
  centerX: number
  centerY: number
  colors: [string, string]
}

const KINDS: readonly GradientKind[] = ['linear', 'radial', 'conic']
const HEX_COLOR = /^#[\da-f]{3}(?:[\da-f]{3})?$/i

function isNumberIn(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
}

export function isGradientShareState(value: unknown): value is GradientShareState {
  if (typeof value !== 'object' || value === null) return false
  const state = value as Partial<GradientShareState>
  return (
    KINDS.includes(state.kind as GradientKind) &&
    isNumberIn(state.angle, 0, 359) &&
    isNumberIn(state.centerX, 0, 100) &&
    isNumberIn(state.centerY, 0, 100) &&
    Array.isArray(state.colors) &&
    state.colors.length === 2 &&
    state.colors.every((color) => typeof color === 'string' && HEX_COLOR.test(color))
  )
}

export function toGradientShareState(options: GradientOptions): GradientShareState {
  return {
    kind: options.kind,
    angle: options.angle,
    centerX: options.centerX,
    centerY: options.centerY,
    colors: [options.stops[0]?.color ?? '', options.stops[1]?.color ?? ''],
  }
}
