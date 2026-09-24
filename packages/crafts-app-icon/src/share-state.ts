import { isCraftShareOptions, type CraftShareOptions } from '@craftchest/craft-core'
import { MAX_MASKABLE_INSET, MIN_MASKABLE_INSET, type IconOptions } from './service'

export type IconShareOptions = IconOptions & CraftShareOptions

/** The only shareable fields are visual controls; file data and diagnostics cannot enter this schema. */
export function isIconShareOptions(value: unknown): value is IconShareOptions {
  if (!isCraftShareOptions(value)) return false
  const candidate = value as Partial<IconShareOptions>
  return (
    Object.keys(value).length === 3 &&
    typeof candidate.backgroundColor === 'string' &&
    /^#[\da-f]{6}$/i.test(candidate.backgroundColor) &&
    typeof candidate.scale === 'number' &&
    candidate.scale >= 0.5 &&
    candidate.scale <= 1.5 &&
    typeof candidate.maskableInset === 'number' &&
    candidate.maskableInset >= MIN_MASKABLE_INSET &&
    candidate.maskableInset <= MAX_MASKABLE_INSET
  )
}

export function toIconShareOptions(options: IconOptions): IconShareOptions {
  return {
    backgroundColor: options.backgroundColor,
    scale: options.scale,
    maskableInset: options.maskableInset,
  }
}
