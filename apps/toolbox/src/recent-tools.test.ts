import { describe, expect, it } from 'vitest'
import { loadRecentToolIds, recordRecentToolId, type StorageLike } from './recent-tools'

function memoryStorage(initial: string | null = null): StorageLike {
  let value = initial
  return { getItem: () => value, setItem: (_key, next) => (value = next) }
}

describe('recent tools', () => {
  it('无记录或损坏记录时返回空数组', () => {
    expect(loadRecentToolIds(memoryStorage())).toEqual([])
    expect(loadRecentToolIds(memoryStorage('{bad json'))).toEqual([])
    expect(loadRecentToolIds(memoryStorage('{}'))).toEqual([])
  })

  it('过滤非法值并去重', () => {
    expect(loadRecentToolIds(memoryStorage('["zh/pinyin", 1, "", "zh/pinyin"]'))).toEqual([
      'zh/pinyin',
    ])
  })

  it('最新工具置顶且不重复', () => {
    const storage = memoryStorage('["zh/pinyin","fe/gradient-gen"]')
    expect(recordRecentToolId('fe/gradient-gen', storage)).toEqual(['fe/gradient-gen', 'zh/pinyin'])
  })

  it('默认只保留五项', () => {
    const storage = memoryStorage('["a","b","c","d","e"]')
    expect(recordRecentToolId('new', storage)).toEqual(['new', 'a', 'b', 'c', 'd'])
  })

  it('写入失败时仍返回内存结果', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota')
      },
    }
    expect(recordRecentToolId('zh/opencc', storage)).toEqual(['zh/opencc'])
  })
})
