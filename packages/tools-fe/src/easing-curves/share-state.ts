import type { BezierCurve } from './service'

export interface EasingShareState {
  curve: BezierCurve
  duration: number
}

function isNumberIn(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
}

export function isEasingShareState(value: unknown): value is EasingShareState {
  if (typeof value !== 'object' || value === null) return false
  const state = value as Partial<EasingShareState>
  if (typeof state.curve !== 'object' || state.curve === null) return false
  const curve = state.curve as Partial<BezierCurve>
  return (
    isNumberIn(curve.x1, 0, 1) &&
    isNumberIn(curve.y1, -0.5, 1.5) &&
    isNumberIn(curve.x2, 0, 1) &&
    isNumberIn(curve.y2, -0.5, 1.5) &&
    isNumberIn(state.duration, 300, 3000)
  )
}

export function toEasingShareState(curve: BezierCurve, duration: number): EasingShareState {
  return { curve: { ...curve }, duration }
}
