export interface BezierCurve {
  x1: number
  y1: number
  x2: number
  y2: number
}

export const EASING_PRESETS = {
  ease: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
  'ease-in': { x1: 0.42, y1: 0, x2: 1, y2: 1 },
  'ease-out': { x1: 0, y1: 0, x2: 0.58, y2: 1 },
  'ease-in-out': { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
}

function format(value: number): string {
  return Number(value.toFixed(2)).toString()
}

export function normalizeCurve(curve: BezierCurve): BezierCurve {
  return {
    x1: clamp(curve.x1, 0, 1),
    y1: clamp(curve.y1, -2, 2),
    x2: clamp(curve.x2, 0, 1),
    y2: clamp(curve.y2, -2, 2),
  }
}

export function toCubicBezier(curve: BezierCurve): string {
  const value = normalizeCurve(curve)
  return `cubic-bezier(${format(value.x1)}, ${format(value.y1)}, ${format(value.x2)}, ${format(value.y2)})`
}

/** SVG 坐标系中的曲线路径，y 轴需翻转。 */
export function toSvgPath(curve: BezierCurve, size = 200): string {
  const value = normalizeCurve(curve)
  return `M 0 ${size} C ${format(value.x1 * size)} ${format(size - value.y1 * size)}, ${format(value.x2 * size)} ${format(size - value.y2 * size)}, ${size} 0`
}
