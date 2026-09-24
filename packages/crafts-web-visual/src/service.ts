import {
  normalizeHex,
  rateContrast,
  suggestColor,
} from '@craftchest/color-core/contrast'
import { buildGradient, type GradientKind } from '@craftchest/color-core/gradient'

export const COLOR_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type ColorShade = (typeof COLOR_SHADES)[number]
export type Palette = Record<ColorShade, string>

export interface WebVisualOptions {
  brandColor: string
  accentColor: string
  gradientKind: GradientKind
  gradientAngle: number
}

export const DEFAULT_WEB_VISUAL_OPTIONS: WebVisualOptions = {
  brandColor: '#bd8740',
  accentColor: '#5e7881',
  gradientKind: 'linear',
  gradientAngle: 135,
}

export interface ContrastCheck {
  id: 'brand-on-white' | 'brand-on-ink' | 'accent-on-white' | 'accent-on-ink'
  label: 'brand' | 'accent'
  background: 'white' | 'ink'
  foreground: string
  backgroundColor: string
  ratio: number
  normalAA: boolean
  largeAA: boolean
  suggestedForeground: string
}

export interface WebVisualBundle {
  options: WebVisualOptions
  brandPalette: Palette
  accentPalette: Palette
  gradient: string
  contrastChecks: ContrastCheck[]
  css: string
  tailwindTheme: string
  dtcgJson: string
  gradientCss: string
}

const TINTS: Partial<Record<ColorShade, number>> = {
  50: 0.94,
  100: 0.86,
  200: 0.7,
  300: 0.5,
  400: 0.25,
}
const SHADES: Partial<Record<ColorShade, number>> = {
  600: 0.12,
  700: 0.24,
  800: 0.4,
  900: 0.58,
  950: 0.76,
}

function normalizedColor(input: string): string {
  const color = normalizeHex(input)
  if (!color) throw new TypeError(`Invalid color: ${input}`)
  return color
}

function mixHex(from: string, to: string, amount: number): string {
  const left = normalizedColor(from)
  const right = normalizedColor(to)
  const channels = [1, 3, 5].map((offset) => {
    const start = Number.parseInt(left.slice(offset, offset + 2), 16)
    const end = Number.parseInt(right.slice(offset, offset + 2), 16)
    return Math.round(start + (end - start) * amount)
      .toString(16)
      .padStart(2, '0')
  })
  return `#${channels.join('')}`
}

/** Builds a straightforward RGB tint/shade ramp; it is a practical starting palette, not perceptually uniform. */
export function createColorPalette(input: string): Palette {
  const base = normalizedColor(input)
  const entries = COLOR_SHADES.map((shade) => {
    if (shade === 500) return [shade, base] as const
    const tint = TINTS[shade]
    if (tint !== undefined) return [shade, mixHex(base, '#ffffff', tint)] as const
    const shadow = SHADES[shade]
    if (shadow !== undefined) return [shade, mixHex(base, '#000000', shadow)] as const
    throw new RangeError(`Unsupported color shade: ${shade}`)
  })
  return Object.fromEntries(entries) as Palette
}

function buildContrastChecks(brandColor: string, accentColor: string): ContrastCheck[] {
  const checks = [
    {
      id: 'brand-on-white',
      label: 'brand',
      background: 'white',
      foreground: brandColor,
      backgroundColor: '#ffffff',
    },
    {
      id: 'brand-on-ink',
      label: 'brand',
      background: 'ink',
      foreground: brandColor,
      backgroundColor: '#111827',
    },
    {
      id: 'accent-on-white',
      label: 'accent',
      background: 'white',
      foreground: accentColor,
      backgroundColor: '#ffffff',
    },
    {
      id: 'accent-on-ink',
      label: 'accent',
      background: 'ink',
      foreground: accentColor,
      backgroundColor: '#111827',
    },
  ] as const
  return checks.map((check) => {
    const rating = rateContrast(check.foreground, check.backgroundColor)
    return {
      ...check,
      ...rating,
      suggestedForeground: rating.normalAA
        ? check.foreground
        : suggestColor(check.foreground, check.backgroundColor, 4.5),
    }
  })
}

function tokenEntries(prefix: string, palette: Palette): Array<[string, string]> {
  return COLOR_SHADES.map((shade) => [`${prefix}-${shade}`, palette[shade]])
}

function buildCssVariables(
  brandColor: string,
  accentColor: string,
  brandPalette: Palette,
  accentPalette: Palette,
  gradient: string,
): string {
  const variables = [
    ['brand', brandColor],
    ...tokenEntries('brand', brandPalette),
    ['accent', accentColor],
    ...tokenEntries('accent', accentPalette),
    ['gradient-brand', gradient],
  ]
  return `:root {\n${variables.map(([name, value]) => `  --${name}: ${value};`).join('\n')}\n}\n`
}

function buildTailwindTheme(
  brandColor: string,
  accentColor: string,
  brandPalette: Palette,
  accentPalette: Palette,
  gradient: string,
): string {
  const colors = [
    ['brand', brandColor],
    ...tokenEntries('brand', brandPalette),
    ['accent', accentColor],
    ...tokenEntries('accent', accentPalette),
  ]
  return [
    '@theme {',
    ...colors.map(([name, value]) => `  --color-${name}: ${value};`),
    '}',
    '',
    ':root {',
    `  --gradient-brand: ${gradient};`,
    '}',
    '',
  ].join('\n')
}

function buildDtcgTokens(brandPalette: Palette, accentPalette: Palette, gradient: string): string {
  function colorTokens(palette: Palette): Record<string, { $type: 'color'; $value: string }> {
    return Object.fromEntries(
      COLOR_SHADES.map((shade) => [shade, { $type: 'color', $value: palette[shade] }]),
    )
  }
  return `${JSON.stringify(
    {
      color: { brand: colorTokens(brandPalette), accent: colorTokens(accentPalette) },
      gradient: { brand: { $type: 'string', $value: gradient } },
    },
    null,
    2,
  )}\n`
}

export function createWebVisualBundle(options: WebVisualOptions): WebVisualBundle {
  const brandColor = normalizedColor(options.brandColor)
  const accentColor = normalizedColor(options.accentColor)
  if (!['linear', 'radial', 'conic'].includes(options.gradientKind)) {
    throw new TypeError('Invalid gradient kind')
  }
  if (
    !Number.isInteger(options.gradientAngle) ||
    options.gradientAngle < 0 ||
    options.gradientAngle > 359
  ) {
    throw new RangeError('Gradient angle must be an integer from 0 to 359')
  }
  const normalizedOptions = { ...options, brandColor, accentColor }
  const brandPalette = createColorPalette(brandColor)
  const accentPalette = createColorPalette(accentColor)
  const gradient = buildGradient({
    kind: options.gradientKind,
    angle: options.gradientAngle,
    centerX: 50,
    centerY: 50,
    stops: [
      { color: brandColor, position: 0 },
      { color: accentColor, position: 100 },
    ],
  })
  return {
    options: normalizedOptions,
    brandPalette,
    accentPalette,
    gradient,
    contrastChecks: buildContrastChecks(brandColor, accentColor),
    css: buildCssVariables(brandColor, accentColor, brandPalette, accentPalette, gradient),
    tailwindTheme: buildTailwindTheme(
      brandColor,
      accentColor,
      brandPalette,
      accentPalette,
      gradient,
    ),
    dtcgJson: buildDtcgTokens(brandPalette, accentPalette, gradient),
    gradientCss: `background: ${gradient};\n`,
  }
}
