import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ICON_OPTIONS,
  ICON_OUTPUTS,
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_PIXELS,
  MAX_PNG_FILE_BYTES,
  backgroundStrategyFor,
  buildHtmlLinks,
  buildManifest,
  createLayoutPlan,
  diagnoseImage,
  encodeIco,
  findAlphaBounds,
  generateIconPackage,
  iconLayoutFor,
  maskableSafeZone,
  shouldInvalidateGeneratedArtifacts,
  validatePngInput,
} from './service'

describe('app icon service', () => {
  it('finds visible alpha bounds and recognises an entirely transparent image', () => {
    const pixels = new Uint8ClampedArray(4 * 3 * 4)
    pixels[(1 * 4 + 1) * 4 + 3] = 128
    pixels[(2 * 4 + 2) * 4 + 3] = 255
    expect(findAlphaBounds(4, 3, pixels)).toEqual({
      left: 1,
      top: 1,
      right: 2,
      bottom: 2,
      width: 2,
      height: 2,
    })
    expect(diagnoseImage(4, 3, pixels)).toMatchObject({ aspectRatio: 4 / 3, hasAlpha: true })
    expect(findAlphaBounds(2, 2, new Uint8ClampedArray(16))).toBeNull()
  })

  it('uses a centred contain plan without stretching rectangular sources', () => {
    expect(createLayoutPlan(400, 200, 100)).toMatchObject({
      x: 0,
      y: 25,
      width: 100,
      height: 50,
      cropped: false,
    })
    expect(createLayoutPlan(200, 400, 100)).toMatchObject({
      x: 25,
      y: 0,
      width: 50,
      height: 100,
      cropped: false,
    })
    expect(createLayoutPlan(400, 200, 100, 1.5)).toMatchObject({
      width: 150,
      height: 75,
      cropped: true,
    })
  })

  it('insets maskable content while keeping the platform safe circle fixed', () => {
    const output = ICON_OUTPUTS.find((candidate) => candidate.id === 'pwa-maskable-192')!
    const plan = iconLayoutFor(output, 400, 200, DEFAULT_ICON_OPTIONS)
    expect(plan.width).toBeCloseTo(107.52)
    expect(plan.height).toBeCloseTo(53.76)
    expect(plan.y).toBeCloseTo(69.12)
    expect(maskableSafeZone(100)).toEqual({ x: 10, y: 10, size: 80 })
  })

  it('preserves transparency only for favicon and PWA any output', () => {
    expect(backgroundStrategyFor(ICON_OUTPUTS[0])).toBe('transparent')
    expect(backgroundStrategyFor(ICON_OUTPUTS[4])).toBe('transparent')
    expect(backgroundStrategyFor(ICON_OUTPUTS[3])).toBe('baked')
    expect(backgroundStrategyFor(ICON_OUTPUTS[6])).toBe('baked')
  })

  it('guards image bytes and decoded pixel allocations before Canvas readback', () => {
    expect(() => validatePngInput(MAX_PNG_FILE_BYTES)).not.toThrow()
    expect(() => validatePngInput(MAX_PNG_FILE_BYTES + 1)).toThrow(RangeError)
    expect(() => validatePngInput(1, MAX_IMAGE_DIMENSION, 4096)).not.toThrow()
    expect(() => validatePngInput(1, MAX_IMAGE_DIMENSION + 1, 1)).toThrow(RangeError)
    expect(() => validatePngInput(1, MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION)).toThrow(RangeError)
    expect(MAX_IMAGE_DIMENSION * 4096).toBe(MAX_IMAGE_PIXELS)
  })

  it('invalidates generated artifacts for every output-affecting option change', () => {
    expect(
      shouldInvalidateGeneratedArtifacts(DEFAULT_ICON_OPTIONS, { ...DEFAULT_ICON_OPTIONS }),
    ).toBe(false)
    expect(
      shouldInvalidateGeneratedArtifacts(DEFAULT_ICON_OPTIONS, {
        ...DEFAULT_ICON_OPTIONS,
        backgroundColor: '#000000',
      }),
    ).toBe(true)
    expect(
      shouldInvalidateGeneratedArtifacts(DEFAULT_ICON_OPTIONS, {
        ...DEFAULT_ICON_OPTIONS,
        scale: 1.1,
      }),
    ).toBe(true)
    expect(
      shouldInvalidateGeneratedArtifacts(DEFAULT_ICON_OPTIONS, {
        ...DEFAULT_ICON_OPTIONS,
        maskableInset: 0.23,
      }),
    ).toBe(true)
  })

  it('locks the complete output matrix and filenames', () => {
    expect(ICON_OUTPUTS.map((output) => output.filename)).toEqual([
      'favicon-16.png',
      'favicon-32.png',
      'favicon-48.png',
      'apple-touch-icon.png',
      'pwa-192.png',
      'pwa-512.png',
      'pwa-maskable-192.png',
      'pwa-maskable-512.png',
    ])
    expect(
      ICON_OUTPUTS.filter((output) => output.purpose === 'maskable').map((output) => output.size),
    ).toEqual([192, 512])
  })

  it('derives the manifest and HTML links from the output contract', () => {
    expect(buildManifest(DEFAULT_ICON_OPTIONS)).toEqual({
      background_color: '#ffffff',
      icons: [
        { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
        { src: 'pwa-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    })
    expect(buildHtmlLinks()).toContain(
      '<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">',
    )
    expect(buildHtmlLinks()).toContain('<link rel="manifest" href="site.webmanifest">')
  })

  it('omits references to icon files that failed to render', () => {
    const available = new Set(['favicon-32', 'favicon-48', 'pwa-192', 'pwa-512'])
    expect(buildManifest(DEFAULT_ICON_OPTIONS, available).icons.map((icon) => icon.src)).toEqual([
      'pwa-192.png',
      'pwa-512.png',
    ])
    const links = buildHtmlLinks(available, false)
    expect(links).not.toContain('favicon.ico')
    expect(links).not.toContain('favicon-16.png')
    expect(links).not.toContain('apple-touch-icon.png')
    expect(links).toContain('favicon-32.png')
  })

  it('writes a real ICO directory with 16, 32 and 48 PNG frame payloads', () => {
    const ico = encodeIco([
      { size: 16, data: new Uint8Array([137, 80, 78, 71]).buffer },
      { size: 32, data: new Uint8Array([1, 2, 3]).buffer },
      { size: 48, data: new Uint8Array([4, 5]).buffer },
    ])
    const view = new DataView(ico.buffer)
    expect(view.getUint16(0, true)).toBe(0)
    expect(view.getUint16(2, true)).toBe(1)
    expect(view.getUint16(4, true)).toBe(3)
    expect([ico[6], ico[22], ico[38]]).toEqual([16, 32, 48])
    expect(view.getUint32(18, true)).toBe(54)
    expect([...ico.slice(54, 58)]).toEqual([137, 80, 78, 71])
  })

  it('keeps successful artifacts when a single PNG renderer call fails', async () => {
    const result = await generateIconPackage(
      { width: 512, height: 512 },
      DEFAULT_ICON_OPTIONS,
      async (output) => {
        if (output.id === 'pwa-maskable-512') throw new Error('encoder unavailable')
        return new Blob([output.id], { type: 'image/png' })
      },
    )
    expect(result.status).toBe('partial-success')
    expect(result.artifacts.some((artifact) => artifact.filename === 'favicon-package.zip')).toBe(
      true,
    )
    expect(result.artifacts.some((artifact) => artifact.filename === 'pwa-maskable-512.png')).toBe(
      false,
    )
    const manifest = result.artifacts.find((artifact) => artifact.id === 'manifest')
    expect(manifest?.payload).not.toContain('pwa-maskable-512.png')
    expect(result.warnings).toContainEqual(expect.objectContaining({ code: 'icon-render-failed' }))
  })

  it('reports complete render failure and does not offer an empty ZIP', async () => {
    const result = await generateIconPackage(
      { width: 512, height: 512 },
      DEFAULT_ICON_OPTIONS,
      async () => {
        throw new Error('canvas unavailable')
      },
    )
    expect(result.status).toBe('failed')
    expect(result.artifacts.some((artifact) => artifact.id === 'favicon-package')).toBe(false)
    expect(result.artifacts.find((artifact) => artifact.id === 'manifest')?.payload).toContain(
      '"icons": []',
    )
  })
})
