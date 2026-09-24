import { describe, expect, it } from 'vitest'
import { allCrafts, findCraft, searchCrafts } from './craft-registry'

describe('Craft registry', () => {
  it('registers the available Crafts and makes them discoverable', () => {
    expect(allCrafts.map((craft) => craft.meta.id)).toEqual(['app-icon', 'web-visual'])
    expect(findCraft('app-icon')?.meta.recipeVersion).toBe(2)
    expect(searchCrafts('maskable').map((craft) => craft.meta.id)).toEqual(['app-icon'])
    expect(searchCrafts('design tokens').map((craft) => craft.meta.id)).toEqual(['web-visual'])
  })
})
