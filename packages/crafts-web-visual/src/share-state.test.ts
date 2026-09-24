import { describe, expect, it } from 'vitest'
import { decodeCraftShareHash, encodeCraftShareHash } from '@craftchest/craft-core'
import { webVisualCraft } from './meta'
import { isWebVisualShareOptions, toWebVisualShareOptions } from './share-state'

describe('web visual share options', () => {
  it('shares only normalized colors and explicit gradient settings', () => {
    const options = toWebVisualShareOptions({
      brandColor: '#369',
      accentColor: '#C45B3F',
      gradientKind: 'linear',
      gradientAngle: 135,
    })
    const hash = encodeCraftShareHash(webVisualCraft, options)
    expect(options).toEqual({
      brandColor: '#336699',
      accentColor: '#c45b3f',
      gradientKind: 'linear',
      gradientAngle: 135,
    })
    expect(decodeCraftShareHash(hash, webVisualCraft, isWebVisualShareOptions)?.options).toEqual(
      options,
    )
  })

  it.each([
    { brandColor: 'red', accentColor: '#c45b3f', gradientKind: 'linear', gradientAngle: 135 },
    { brandColor: '#336699', accentColor: '#c45b3f', gradientKind: 'foo', gradientAngle: 135 },
    { brandColor: '#336699', accentColor: '#c45b3f', gradientKind: 'linear', gradientAngle: 360 },
    {
      brandColor: '#336699',
      accentColor: '#c45b3f',
      gradientKind: 'linear',
      gradientAngle: 135,
      material: 'private',
    },
  ])('rejects invalid or sensitive settings %#', (value) => {
    expect(isWebVisualShareOptions(value)).toBe(false)
  })
})
