import { describe, expect, it } from 'vitest'
import { decodeCraftShareHash, encodeCraftShareHash } from '@craftchest/craft-core'
import { appIconCraft } from './meta'
import { isIconShareOptions, toIconShareOptions } from './share-state'

describe('app icon share options', () => {
  it('shares only versioned visual options', () => {
    const options = toIconShareOptions({
      backgroundColor: '#112233',
      scale: 1.1,
      maskableInset: 0.22,
    })
    const hash = encodeCraftShareHash(appIconCraft, options)
    expect(decodeCraftShareHash(hash, appIconCraft, isIconShareOptions)?.options).toEqual(options)
  })

  it.each([
    { backgroundColor: '#fff', scale: 1, maskableInset: 0.1 },
    { backgroundColor: '#112233', scale: 2, maskableInset: 0.22 },
    { backgroundColor: '#112233', scale: 1, maskableInset: 0.22, sourcePng: 'private' },
    {
      backgroundColor: '#112233',
      scale: 1,
      maskableInset: 0.22,
      material: { payload: 'private' },
    },
  ])('rejects invalid or sensitive option shapes %#', (value) => {
    expect(isIconShareOptions(value)).toBe(false)
  })
})
