export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface ContrastRating {
  ratio: number
  normalAA: boolean
  normalAAA: boolean
  largeAA: boolean
  largeAAA: boolean
}

export function normalizeHex(input: string): string | null {
  const value = input.trim()
  const short = /^#([\da-f]{3})$/i.exec(value)
  if (short)
    return `#${[...short[1]!]
      .map((digit) => digit + digit)
      .join('')
      .toLowerCase()}`
  const full = /^#([\da-f]{6})$/i.exec(value)
  return full ? `#${full[1]!.toLowerCase()}` : null
}

export function hexToRgb(input: string): RgbColor {
  const value = normalizeHex(input)
  if (!value) throw new Error(`无效颜色：${input}`)
  return {
    r: parseInt(value.slice(1, 3), 16),
    g: parseInt(value.slice(3, 5), 16),
    b: parseInt(value.slice(5, 7), 16),
  }
}

function channelLuminance(channel: number): number {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(input: string): number {
  const { r, g, b } = hexToRgb(input)
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

export function contrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground)
  const second = relativeLuminance(background)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

export function rateContrast(foreground: string, background: string): ContrastRating {
  const ratio = contrastRatio(foreground, background)
  return {
    ratio,
    normalAA: ratio >= 4.5,
    normalAAA: ratio >= 7,
    largeAA: ratio >= 3,
    largeAAA: ratio >= 4.5,
  }
}

function rgbToHex(color: RgbColor): string {
  return `#${[color.r, color.g, color.b].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`
}

function mix(from: RgbColor, to: RgbColor, amount: number): RgbColor {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
  }
}

/** 调整一个颜色，寻找达到目标对比度所需的最小黑/白混色量。 */
export function suggestColor(adjustable: string, fixed: string, target = 4.5): string {
  const normalized = normalizeHex(adjustable)
  if (!normalized) throw new Error(`无效颜色：${adjustable}`)
  if (contrastRatio(normalized, fixed) >= target) return normalized

  const source = hexToRgb(normalized)
  for (let step = 1; step <= 100; step += 1) {
    const amount = step / 100
    for (const destination of [
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
    ]) {
      const candidate = rgbToHex(mix(source, destination, amount))
      if (contrastRatio(candidate, fixed) >= target) return candidate
    }
  }
  return contrastRatio('#000000', fixed) >= contrastRatio('#ffffff', fixed) ? '#000000' : '#ffffff'
}
