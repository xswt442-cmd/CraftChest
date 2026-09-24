import { describe, expect, it } from 'vitest'
import { executeRegex, REGEX_LIMITS, validateRegexInput } from './service'

describe('regex playground service', () => {
  it('returns all global matches, numbered/named groups and a replacement preview', () => {
    const result = executeRegex({
      pattern: '(?<word>\\w+)',
      flags: 'dg',
      testText: 'CraftChest stays local',
      replacement: '<$<word>>',
    })

    expect(result).toMatchObject({ ok: true, matchesTruncated: false, replacementTruncated: false })
    if (!result.ok) return
    expect(result.matches.map(({ value, index }) => [value, index])).toEqual([
      ['CraftChest', 0],
      ['stays', 11],
      ['local', 17],
    ])
    expect(result.matches[0]?.captures).toEqual([
      { number: 1, value: 'CraftChest', truncated: false, range: [0, 10] },
    ])
    expect(result.matches[0]?.namedCaptures).toEqual([
      { name: 'word', value: 'CraftChest', truncated: false, range: [0, 10] },
    ])
    expect(result.replacementPreview).toBe('<CraftChest> <stays> <local>')
  })

  it('uses native-style replacement tokens, including prefix and suffix', () => {
    const result = executeRegex({
      pattern: '(?<part>bc)',
      flags: '',
      testText: 'abcd',
      replacement: "$$|$&|$1|$<part>|$`|$'",
    })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.replacementPreview).toBe('a$|bc|bc|bc|a|dd')
  })

  it('only replaces the first match when the global flag is absent', () => {
    const result = executeRegex({
      pattern: '(\\w)',
      flags: '',
      testText: 'abc',
      replacement: '[$1]',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.matches).toHaveLength(1)
      expect(result.replacementPreview).toBe('[a]bc')
    }
  })

  it('advances empty global matches and completes without looping forever', () => {
    const result = executeRegex({ pattern: '', flags: 'g', testText: 'abc', replacement: '-' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.matches.map(({ index }) => index)).toEqual([0, 1, 2, 3])
      expect(result.replacementPreview).toBe('-a-b-c-')
    }
  })

  it('advances zero-width Unicode matches by code point when Unicode mode is enabled', () => {
    const result = executeRegex({
      pattern: '(?=.)',
      flags: 'gu',
      testText: '😀x',
      replacement: null,
    })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.matches.map(({ index }) => index)).toEqual([0, 2])
  })

  it('reports malformed patterns and unsupported flag combinations without throwing', () => {
    expect(executeRegex({ pattern: '(', flags: '', testText: '', replacement: null })).toEqual({
      ok: false,
      error: 'invalid-pattern',
    })
    expect(executeRegex({ pattern: '.', flags: 'gg', testText: '', replacement: null })).toEqual({
      ok: false,
      error: 'invalid-flags',
    })
    expect(executeRegex({ pattern: '.', flags: 'uv', testText: '', replacement: null })).toEqual({
      ok: false,
      error: 'incompatible-flags',
    })
  })

  it('rejects inputs beyond documented limits', () => {
    expect(
      validateRegexInput({
        pattern: 'a'.repeat(REGEX_LIMITS.patternLength + 1),
        flags: '',
        testText: '',
        replacement: null,
      }),
    ).toBe('pattern-too-long')
    expect(
      validateRegexInput({
        pattern: 'a',
        flags: '',
        testText: 'a'.repeat(REGEX_LIMITS.testTextLength + 1),
        replacement: null,
      }),
    ).toBe('test-text-too-long')
    expect(
      validateRegexInput({
        pattern: 'a',
        flags: '',
        testText: '',
        replacement: 'x'.repeat(REGEX_LIMITS.replacementLength + 1),
      }),
    ).toBe('replacement-too-long')
  })

  it('caps returned matches and replacement output', () => {
    const result = executeRegex({
      pattern: 'a',
      flags: 'g',
      testText: 'a'.repeat(REGEX_LIMITS.matches + 2),
      replacement: 'x'.repeat(300),
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.matches).toHaveLength(REGEX_LIMITS.matches)
      expect(result.matchesTruncated).toBe(true)
      expect(result.replacementTruncated).toBe(true)
      expect(result.replacementPreview?.length).toBeLessThanOrEqual(
        REGEX_LIMITS.replacementPreviewLength,
      )
    }
  })
})
