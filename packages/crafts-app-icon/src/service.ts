import type {
  CraftArtifact,
  CraftPhaseResult,
  CraftStatus,
  CraftWarning,
} from '@craftchest/craft-core'
import { createZip, type ZipEntry } from '@craftchest/toolkit-core/zip'

export { createZip }
export type { ZipEntry }

export const ICON_OUTPUTS = [
  { id: 'favicon-16', filename: 'favicon-16.png', size: 16, purpose: 'any' },
  { id: 'favicon-32', filename: 'favicon-32.png', size: 32, purpose: 'any' },
  { id: 'favicon-48', filename: 'favicon-48.png', size: 48, purpose: 'any' },
  { id: 'apple-touch', filename: 'apple-touch-icon.png', size: 180, purpose: 'apple' },
  { id: 'pwa-192', filename: 'pwa-192.png', size: 192, purpose: 'any' },
  { id: 'pwa-512', filename: 'pwa-512.png', size: 512, purpose: 'any' },
  { id: 'pwa-maskable-192', filename: 'pwa-maskable-192.png', size: 192, purpose: 'maskable' },
  { id: 'pwa-maskable-512', filename: 'pwa-maskable-512.png', size: 512, purpose: 'maskable' },
] as const

export type IconOutput = (typeof ICON_OUTPUTS)[number]
export type IconPurpose = IconOutput['purpose']

export const MAX_PNG_FILE_BYTES = 25 * 1024 * 1024
export const MAX_IMAGE_DIMENSION = 8192
export const MAX_IMAGE_PIXELS = 32 * 1024 * 1024
/** Android's visible safe circle is an 80% diameter circle centred in the icon. */
export const MASKABLE_SAFE_ZONE_INSET = 0.1
/** A square fits within that circle only at (1 - 0.8 / √2) / 2 ≈ 21.72% per edge. */
export const MIN_MASKABLE_INSET = 0.22
export const MAX_MASKABLE_INSET = 0.4

export interface IconOptions {
  backgroundColor: string
  scale: number
  maskableInset: number
}

export const DEFAULT_ICON_OPTIONS: IconOptions = {
  backgroundColor: '#ffffff',
  scale: 1,
  maskableInset: MIN_MASKABLE_INSET,
}

export type IconBackgroundStrategy = 'transparent' | 'baked'

/** Favicon and PWA `any` icons preserve source transparency; maskable and Apple icons bake a background. */
export function backgroundStrategyFor(output: IconOutput): IconBackgroundStrategy {
  return output.purpose === 'any' ? 'transparent' : 'baked'
}

export function shouldInvalidateGeneratedArtifacts(
  previous: IconOptions,
  next: IconOptions,
): boolean {
  return (
    previous.backgroundColor !== next.backgroundColor ||
    previous.scale !== next.scale ||
    previous.maskableInset !== next.maskableInset
  )
}

/** Guards Canvas allocation before decoding pixels into an ImageData buffer. */
export function validatePngInput(fileBytes: number, width?: number, height?: number): void {
  if (!Number.isSafeInteger(fileBytes) || fileBytes < 0 || fileBytes > MAX_PNG_FILE_BYTES) {
    throw new RangeError('PNG file size exceeds the local processing limit')
  }
  if (width === undefined || height === undefined) return
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > MAX_IMAGE_DIMENSION ||
    height > MAX_IMAGE_DIMENSION ||
    width * height > MAX_IMAGE_PIXELS
  ) {
    throw new RangeError('PNG dimensions exceed the local processing limit')
  }
}

export interface AlphaBounds {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export interface ImageDiagnostics {
  width: number
  height: number
  aspectRatio: number
  hasAlpha: boolean
  alphaBounds: AlphaBounds | null
}

/** Finds the visible alpha rectangle without treating transparent RGB values as content. */
export function findAlphaBounds(
  width: number,
  height: number,
  rgba: Uint8ClampedArray,
): AlphaBounds | null {
  let left = width
  let top = height
  let right = -1
  let bottom = -1
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (rgba[(y * width + x) * 4 + 3] === 0) continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x)
      bottom = Math.max(bottom, y)
    }
  }
  if (right < 0) return null
  return { left, top, right, bottom, width: right - left + 1, height: bottom - top + 1 }
}

export function diagnoseImage(
  width: number,
  height: number,
  rgba: Uint8ClampedArray,
): ImageDiagnostics {
  const alphaBounds = findAlphaBounds(width, height, rgba)
  let hasAlpha = false
  for (let index = 3; index < rgba.length; index += 4) {
    if (rgba[index] !== 255) {
      hasAlpha = true
      break
    }
  }
  return { width, height, aspectRatio: width / height, hasAlpha, alphaBounds }
}

export interface LayoutPlan {
  x: number
  y: number
  width: number
  height: number
  sourceScale: number
  cropped: boolean
}

/** A contain plan preserves aspect ratio; zoom may intentionally crop but never stretch. */
export function createLayoutPlan(
  sourceWidth: number,
  sourceHeight: number,
  targetSize: number,
  scale = 1,
  inset = 0,
): LayoutPlan {
  if (
    ![sourceWidth, sourceHeight, targetSize, scale].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  ) {
    throw new RangeError('Image and target dimensions must be positive finite numbers')
  }
  if (!Number.isFinite(inset) || inset < 0 || inset >= 0.5)
    throw new RangeError('Inset must be in [0, 0.5)')
  const available = targetSize * (1 - inset * 2)
  const sourceScale = Math.min(available / sourceWidth, available / sourceHeight) * scale
  const width = sourceWidth * sourceScale
  const height = sourceHeight * sourceScale
  const x = (targetSize - width) / 2
  const y = (targetSize - height) / 2
  return { x, y, width, height, sourceScale, cropped: width > targetSize || height > targetSize }
}

export function iconLayoutFor(
  output: IconOutput,
  sourceWidth: number,
  sourceHeight: number,
  options: IconOptions,
): LayoutPlan {
  return createLayoutPlan(
    sourceWidth,
    sourceHeight,
    output.size,
    options.scale,
    output.purpose === 'maskable' ? options.maskableInset : 0,
  )
}

export function maskableSafeZone(size: number): { x: number; y: number; size: number } {
  const safeSize = size * (1 - MASKABLE_SAFE_ZONE_INSET * 2)
  return { x: size * MASKABLE_SAFE_ZONE_INSET, y: size * MASKABLE_SAFE_ZONE_INSET, size: safeSize }
}

export interface ManifestIcon {
  src: string
  sizes: string
  type: 'image/png'
  purpose?: 'maskable'
}

export function buildManifest(
  options: IconOptions,
  availableOutputIds: ReadonlySet<string> = new Set(ICON_OUTPUTS.map((output) => output.id)),
): {
  icons: ManifestIcon[]
  background_color: string
} {
  return {
    background_color: options.backgroundColor,
    icons: ICON_OUTPUTS.filter(
      (output) => output.size >= 192 && availableOutputIds.has(output.id),
    ).map((output) => ({
      src: output.filename,
      sizes: `${output.size}x${output.size}`,
      type: 'image/png',
      ...(output.purpose === 'maskable' ? { purpose: 'maskable' as const } : {}),
    })),
  }
}

export function buildHtmlLinks(
  availableOutputIds: ReadonlySet<string> = new Set(ICON_OUTPUTS.map((output) => output.id)),
  hasIco = true,
): string {
  const links: string[] = []
  if (hasIco) links.push('<link rel="icon" href="favicon.ico" sizes="any">')
  for (const output of ICON_OUTPUTS) {
    if (!availableOutputIds.has(output.id)) continue
    if (output.purpose === 'any' && output.size <= 48) {
      links.push(
        `<link rel="icon" type="image/png" sizes="${output.size}x${output.size}" href="${output.filename}">`,
      )
    }
    if (output.purpose === 'apple') {
      links.push(
        `<link rel="apple-touch-icon" sizes="${output.size}x${output.size}" href="${output.filename}">`,
      )
    }
  }
  links.push('<link rel="manifest" href="site.webmanifest">')
  return links.join('\n')
}

function writeUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true)
}

function writeUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true)
}

export interface IcoFrame {
  size: number
  data: ArrayBuffer
}

/** Encodes PNG frames into a standards-compliant ICO directory; no image codec dependency is required. */
export function encodeIco(frames: readonly IcoFrame[]): Uint8Array {
  if (frames.length === 0) throw new RangeError('ICO needs at least one frame')
  const directoryLength = 6 + frames.length * 16
  const totalLength =
    directoryLength + frames.reduce((total, frame) => total + frame.data.byteLength, 0)
  const result = new Uint8Array(totalLength)
  const view = new DataView(result.buffer)
  writeUint16(view, 0, 0)
  writeUint16(view, 2, 1)
  writeUint16(view, 4, frames.length)
  let dataOffset = directoryLength
  frames.forEach((frame, index) => {
    if (!Number.isInteger(frame.size) || frame.size < 1 || frame.size > 256) {
      throw new RangeError('ICO frame size must be an integer from 1 to 256')
    }
    const entryOffset = 6 + index * 16
    result[entryOffset] = frame.size === 256 ? 0 : frame.size
    result[entryOffset + 1] = frame.size === 256 ? 0 : frame.size
    result[entryOffset + 2] = 0
    result[entryOffset + 3] = 0
    writeUint16(view, entryOffset + 4, 1)
    writeUint16(view, entryOffset + 6, 32)
    writeUint32(view, entryOffset + 8, frame.data.byteLength)
    writeUint32(view, entryOffset + 12, dataOffset)
    result.set(new Uint8Array(frame.data), dataOffset)
    dataOffset += frame.data.byteLength
  })
  return result
}

export type IconRenderer = (output: IconOutput, plan: LayoutPlan) => Promise<Blob>

export interface IconGenerationResult {
  artifacts: CraftArtifact<Blob | string>[]
  phaseResults: CraftPhaseResult[]
  warnings: CraftWarning[]
  status: Extract<CraftStatus, 'completed' | 'partial-success' | 'failed'>
}

/** Concrete icon-package orchestration. Failures are recorded per file and never discard successes. */
export async function generateIconPackage(
  source: { width: number; height: number },
  options: IconOptions,
  render: IconRenderer,
): Promise<IconGenerationResult> {
  const artifacts: CraftArtifact<Blob | string>[] = []
  const phaseResults: CraftPhaseResult[] = []
  const warnings: CraftWarning[] = []
  const pngFrames = new Map<string, Blob>()
  for (const output of ICON_OUTPUTS) {
    try {
      const blob = await render(output, iconLayoutFor(output, source.width, source.height, options))
      pngFrames.set(output.id, blob)
      artifacts.push({
        id: output.id,
        kind: 'file',
        label: output.filename,
        filename: output.filename,
        mediaType: 'image/png',
        payload: blob,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      warnings.push({ code: 'icon-render-failed', message, stepId: 'render-icons' })
      phaseResults.push({
        stepId: output.id,
        status: 'failed',
        usedMaterialIds: ['source-png'],
        artifactIds: [],
        summary: message,
        warnings: [],
        failure: { code: 'icon-render-failed', message, recoverable: true },
      })
    }
  }
  const icoFrames = ['favicon-16', 'favicon-32', 'favicon-48'].flatMap((id) => {
    const output = ICON_OUTPUTS.find((candidate) => candidate.id === id)
    const blob = pngFrames.get(id)
    return output && blob ? [{ output, blob }] : []
  })
  let icoGenerated = false
  if (icoFrames.length === 3) {
    try {
      const data = await Promise.all(
        icoFrames.map(async ({ output, blob }) => ({
          size: output.size,
          data: await blob.arrayBuffer(),
        })),
      )
      artifacts.push({
        id: 'favicon-ico',
        kind: 'file',
        label: 'favicon.ico',
        filename: 'favicon.ico',
        mediaType: 'image/x-icon',
        payload: new Blob([encodeIco(data)], { type: 'image/x-icon' }),
      })
      icoGenerated = true
    } catch (error) {
      warnings.push({
        code: 'ico-failed',
        message: error instanceof Error ? error.message : String(error),
        stepId: 'assemble-package',
      })
    }
  } else {
    warnings.push({
      code: 'ico-skipped',
      message: 'ICO needs successful 16, 32, and 48 PNG frames.',
      stepId: 'assemble-package',
    })
  }
  const availableOutputIds = new Set(pngFrames.keys())
  const manifest = JSON.stringify(buildManifest(options, availableOutputIds), null, 2) + '\n'
  artifacts.push({
    id: 'manifest',
    kind: 'text',
    label: 'site.webmanifest',
    filename: 'site.webmanifest',
    mediaType: 'application/manifest+json',
    payload: manifest,
  })
  artifacts.push({
    id: 'html-links',
    kind: 'text',
    label: 'icon-links.html',
    filename: 'icon-links.html',
    mediaType: 'text/html',
    payload: buildHtmlLinks(availableOutputIds, icoGenerated) + '\n',
  })
  if (pngFrames.size === 0) {
    warnings.push({
      code: 'zip-skipped',
      message: 'ZIP was not created because no PNG icon was generated.',
      stepId: 'assemble-package',
    })
  } else {
    try {
      const zip = await createZip(
        artifacts
          .filter((artifact) => artifact.filename)
          .map((artifact) => ({ name: artifact.filename!, data: artifact.payload })),
      )
      artifacts.push({
        id: 'favicon-package',
        kind: 'file',
        label: 'favicon-package.zip',
        filename: 'favicon-package.zip',
        mediaType: 'application/zip',
        payload: zip,
      })
    } catch (error) {
      warnings.push({
        code: 'zip-failed',
        message: error instanceof Error ? error.message : String(error),
        stepId: 'assemble-package',
      })
    }
  }
  const failed = warnings.length > 0
  phaseResults.unshift({
    stepId: 'render-icons',
    status: failed ? 'failed' : 'succeeded',
    usedMaterialIds: ['source-png'],
    artifactIds: artifacts.map((artifact) => artifact.id),
    summary: failed ? 'Some assets could not be generated.' : 'All icon assets were generated.',
    warnings,
  })
  return {
    artifacts,
    phaseResults,
    warnings,
    status: pngFrames.size === 0 ? 'failed' : failed ? 'partial-success' : 'completed',
  }
}
