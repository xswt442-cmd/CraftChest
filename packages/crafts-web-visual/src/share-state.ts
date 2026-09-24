import { isCraftShareOptions, type CraftShareOptions } from '@craftchest/craft-core'
import type { GradientKind } from '@craftchest/color-core/gradient'
import { normalizeHex } from '@craftchest/color-core/contrast'
import type { WebVisualOptions } from './service'

export type WebVisualShareOptions = WebVisualOptions & CraftShareOptions

export function isWebVisualShareOptions(value: unknown): value is WebVisualShareOptions {
  if (!isCraftShareOptions(value) || Object.keys(value).length !== 4) return false
  const candidate = value as Partial<WebVisualOptions>
  return (
    typeof candidate.brandColor === 'string' &&
    normalizeHex(candidate.brandColor) !== null &&
    typeof candidate.accentColor === 'string' &&
    normalizeHex(candidate.accentColor) !== null &&
    (candidate.gradientKind === 'linear' ||
      candidate.gradientKind === 'radial' ||
      candidate.gradientKind === 'conic') &&
    typeof candidate.gradientAngle === 'number' &&
    Number.isInteger(candidate.gradientAngle) &&
    candidate.gradientAngle >= 0 &&
    candidate.gradientAngle <= 359
  )
}

export function toWebVisualShareOptions(options: WebVisualOptions): WebVisualShareOptions {
  return {
    brandColor: normalizeHex(options.brandColor) ?? options.brandColor,
    accentColor: normalizeHex(options.accentColor) ?? options.accentColor,
    gradientKind: options.gradientKind as GradientKind,
    gradientAngle: options.gradientAngle,
  }
}
