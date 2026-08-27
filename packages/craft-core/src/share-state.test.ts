import { describe, expect, it } from 'vitest'
import {
  createCraftShareState,
  decodeCraftShareHash,
  encodeCraftShareHash,
  isCraftShareOptions,
  isCraftShareState,
} from './share-state'
import type { CraftMeta, CraftShareOptions } from './index'

type IconShareOptions = {
  background: string
  maskableInset: number
  scale: number
}

const meta: CraftMeta = {
  id: 'app-icon',
  recipeVersion: 1,
  title: { zh: '应用图标工坊', en: 'App icon workshop' },
  description: { zh: '本地生成图标包', en: 'Generate an icon pack locally' },
  inputs: [
    {
      id: 'source-image',
      kind: 'file',
      label: { zh: '源图', en: 'Source image' },
      required: true,
      acceptedMediaTypes: ['image/png'],
    },
  ],
  steps: [
    {
      id: 'diagnose-image',
      label: { zh: '诊断图片', en: 'Diagnose image' },
      service: { kind: 'chest-service', id: 'image-diagnostics', version: 1 },
      consumes: ['source-image'],
      produces: ['image-diagnostics'],
    },
  ],
}

const options: IconShareOptions = { background: '#ffffff', maskableInset: 0.1, scale: 1 }

function isIconShareOptions(value: unknown): value is IconShareOptions & CraftShareOptions {
  if (!isCraftShareOptions(value)) return false
  const option = value as Partial<IconShareOptions>
  return (
    Object.keys(value).length === 3 &&
    typeof option.background === 'string' &&
    typeof option.maskableInset === 'number' &&
    typeof option.scale === 'number'
  )
}

describe('Craft share state', () => {
  it('shares only a versioned recipe identity and explicit non-sensitive options', () => {
    const share = createCraftShareState(meta, options)

    expect(share).toEqual({ craftId: 'app-icon', recipeVersion: 1, options })
    expect(Object.keys(share).sort()).toEqual(['craftId', 'options', 'recipeVersion'])
  })

  it('round-trips a current version through the existing hash codec', () => {
    const hash = encodeCraftShareHash(meta, options)
    expect(hash).toMatch(/^#s=/)
    expect(decodeCraftShareHash(hash, meta, isIconShareOptions)).toEqual({
      craftId: 'app-icon',
      recipeVersion: 1,
      options,
    })
  })

  it('rejects a different recipe or version instead of silently applying incompatible settings', () => {
    const hash = encodeCraftShareHash(meta, options)
    expect(
      decodeCraftShareHash(hash, { ...meta, id: 'web-visual-recipe' }, isIconShareOptions),
    ).toBeNull()
    expect(decodeCraftShareHash(hash, { ...meta, recipeVersion: 2 }, isIconShareOptions)).toBeNull()
  })

  it.each([
    { background: '#fff', sourceImage: new Blob(['private image']) },
    { background: '#fff', material: { payload: 'private text' } },
    { background: '#fff', artifacts: [{ filename: 'icon.png' }] },
    { background: '#fff', nested: { body: 'private text' } },
    { background: '#fff', scale: Number.NaN },
  ])('rejects material, artifact, content and non-JSON fields %#', (value) => {
    expect(isCraftShareOptions(value)).toBe(false)
    expect(() => createCraftShareState(meta, value as unknown as CraftShareOptions)).toThrow(
      TypeError,
    )
  })

  it('rejects extra top-level fields even when options otherwise validate', () => {
    expect(
      isCraftShareState(
        { craftId: 'app-icon', recipeVersion: 1, options, material: { payload: 'private' } },
        isIconShareOptions,
      ),
    ).toBe(false)
  })
})
