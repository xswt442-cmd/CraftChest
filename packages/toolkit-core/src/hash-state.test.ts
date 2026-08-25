import { describe, expect, it } from 'vitest'
import { buildHashStateUrl, decodeHashState, encodeHashState, hasHashState } from './hash-state'

interface ExampleState {
  title: string
  angle: number
}

function isExampleState(value: unknown): value is ExampleState {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ExampleState).title === 'string' &&
    typeof (value as ExampleState).angle === 'number'
  )
}

describe('hash state', () => {
  it('压缩并还原 Unicode 状态', () => {
    const state = { title: '渐变🎨', angle: 135 }
    const hash = encodeHashState(state)
    expect(hash).toMatch(/^#s=[\w+\-$]+$/)
    expect(decodeHashState(hash, isExampleState)).toEqual(state)
  })

  it('损坏、无关和未知版本 hash 均安全失败', () => {
    expect(decodeHashState('#section-fe', isExampleState)).toBeNull()
    expect(decodeHashState('#s=broken', isExampleState)).toBeNull()
  })

  it('拒绝超长 hash，避免无界解压输入', () => {
    expect(decodeHashState(`#s=${'a'.repeat(8192)}`, isExampleState)).toBeNull()
  })

  it('调用方校验失败时拒绝状态', () => {
    expect(decodeHashState(encodeHashState({ angle: 'bad' }), isExampleState)).toBeNull()
  })

  it('生成 URL 时保留路径和 query 并替换旧 hash', () => {
    const url = buildHashStateUrl('https://example.com/fe/gradient-gen?lang=zh#old', {
      title: 'x',
      angle: 2,
    })
    expect(url).toContain('https://example.com/fe/gradient-gen?lang=zh#s=')
    expect(decodeHashState(new URL(url).hash, isExampleState)).toEqual({ title: 'x', angle: 2 })
  })

  it('识别状态 hash', () => {
    expect(hasHashState(encodeHashState({}))).toBe(true)
    expect(hasHashState('#section-fe')).toBe(false)
  })
})
