import { describe, expect, it } from 'vitest'
import { contrastRatio, normalizeHex } from '@craftchest/tools-fe/contrast-checker/service'
import { buildGradient } from '@craftchest/tools-fe/gradient-gen/service'
import { COLOR_SHADES, createColorPalette, createWebVisualBundle } from './service'

describe('web visual recipe service', () => {
  it('creates a stable 11-step ramp and preserves the selected brand color at 500', () => {
    const palette = createColorPalette(' #369 ')
    expect(COLOR_SHADES).toHaveLength(11)
    expect(palette[50]).toMatch(/^#[\da-f]{6}$/)
    expect(palette[500]).toBe('#336699')
    expect(palette[950]).toMatch(/^#[\da-f]{6}$/)
  })

  it('reuses Chest contrast and gradient services to build usable deliverables', () => {
    const bundle = createWebVisualBundle({
      brandColor: '#336699',
      accentColor: '#c45b3f',
      gradientKind: 'linear',
      gradientAngle: 125,
    })

    expect(bundle.gradient).toBe(
      buildGradient({
        kind: 'linear',
        angle: 125,
        centerX: 50,
        centerY: 50,
        stops: [
          { color: '#336699', position: 0 },
          { color: '#c45b3f', position: 100 },
        ],
      }),
    )
    expect(bundle.css).toContain('--brand-500: #336699;')
    expect(bundle.tailwindTheme).toContain('--color-brand-500: #336699;')
    expect(JSON.parse(bundle.dtcgJson).color.brand['500']).toEqual({
      $type: 'color',
      $value: '#336699',
    })
    expect(bundle.gradientCss).toContain(bundle.gradient)
    expect(bundle.contrastChecks.find((check) => check.id === 'brand-on-white')?.ratio).toBe(
      contrastRatio('#336699', '#ffffff'),
    )
    expect(
      bundle.contrastChecks.every(
        (check) => contrastRatio(check.suggestedForeground, check.backgroundColor) >= 4.5,
      ),
    ).toBe(true)
    expect(normalizeHex(bundle.options.brandColor)).toBe('#336699')
  })

  it('rejects malformed colors and out-of-range gradient settings', () => {
    expect(() => createColorPalette('not-a-color')).toThrow(TypeError)
    expect(() =>
      createWebVisualBundle({
        brandColor: '#123456',
        accentColor: '#abcdef',
        gradientKind: 'linear',
        gradientAngle: 360,
      }),
    ).toThrow(RangeError)
  })
})
