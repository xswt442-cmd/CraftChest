export type GradientKind = 'linear' | 'radial' | 'conic'

export interface ColorStop {
  color: string
  position: number
}

export interface GradientOptions {
  kind: GradientKind
  angle: number
  centerX: number
  centerY: number
  stops: readonly ColorStop[]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
}

function formatNumber(value: number): string {
  return Number(value.toFixed(2)).toString()
}

/** 生成稳定、可直接粘贴的 CSS gradient() 值。 */
export function buildGradient(options: GradientOptions): string {
  if (options.stops.length < 2) throw new Error('渐变至少需要两个色标')

  const angle = formatNumber(((options.angle % 360) + 360) % 360)
  const x = formatNumber(clamp(options.centerX, 0, 100))
  const y = formatNumber(clamp(options.centerY, 0, 100))
  const stops = [...options.stops]
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${stop.color} ${formatNumber(clamp(stop.position, 0, 100))}%`)
    .join(', ')

  if (options.kind === 'linear') return `linear-gradient(${angle}deg, ${stops})`
  if (options.kind === 'radial') return `radial-gradient(circle at ${x}% ${y}%, ${stops})`
  return `conic-gradient(from ${angle}deg at ${x}% ${y}%, ${stops})`
}

export function toBackgroundDeclaration(options: GradientOptions): string {
  return `background: ${buildGradient(options)};`
}
