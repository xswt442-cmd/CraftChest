import { describe, expect, it } from 'vitest'
import { canTransitionCraftStatus, transitionCraftState } from './lifecycle'
import type { CraftState, CraftStatus } from './types'

const emptyState: CraftState = {
  status: 'idle',
  phaseResults: [],
  warnings: [],
  artifacts: [],
}

describe('Craft lifecycle', () => {
  it.each([
    ['idle', 'input-invalid'],
    ['input-invalid', 'processing'],
    ['processing', 'preview-ready'],
    ['processing', 'partial-success'],
    ['processing', 'completed'],
    ['processing', 'failed'],
    ['preview-ready', 'processing'],
    ['partial-success', 'completed'],
    ['completed', 'idle'],
    ['failed', 'input-invalid'],
  ] satisfies readonly [CraftStatus, CraftStatus][])('allows %s -> %s', (from, to) => {
    expect(canTransitionCraftStatus(from, to)).toBe(true)
  })

  it.each([
    ['idle', 'completed'],
    ['input-invalid', 'preview-ready'],
    ['preview-ready', 'input-invalid'],
    ['completed', 'failed'],
    ['failed', 'completed'],
  ] satisfies readonly [CraftStatus, CraftStatus][])('rejects %s -> %s', (from, to) => {
    expect(canTransitionCraftStatus(from, to)).toBe(false)
  })

  it('changes only the lifecycle label and preserves concrete phase results and artifacts', () => {
    const state: CraftState = {
      ...emptyState,
      status: 'processing',
      phaseResults: [
        {
          stepId: 'diagnose-image',
          status: 'succeeded',
          usedMaterialIds: ['source-image'],
          artifactIds: ['image-diagnostics'],
          summary: 'PNG is square and has alpha.',
          warnings: [],
        },
      ],
      artifacts: [
        {
          id: 'image-diagnostics',
          kind: 'structured-data',
          label: 'Image diagnostics',
          payload: { width: 1024, height: 1024, hasAlpha: true },
        },
      ],
    }

    expect(transitionCraftState(state, 'preview-ready')).toEqual({
      ...state,
      status: 'preview-ready',
    })
    expect(transitionCraftState(state, 'idle')).toBeNull()
  })
})
