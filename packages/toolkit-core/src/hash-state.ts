import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

const HASH_PREFIX = '#s='
const STATE_VERSION = 1

interface StateEnvelope {
  v: number
  data: unknown
}

/** 将工具状态压缩为可直接放进 URL 的版本化 hash。 */
export function encodeHashState(state: unknown): string {
  const envelope: StateEnvelope = { v: STATE_VERSION, data: state }
  return `${HASH_PREFIX}${compressToEncodedURIComponent(JSON.stringify(envelope))}`
}

/** 解码并由调用方校验工具自己的状态结构；损坏或未知版本统一返回 null。 */
export function decodeHashState<T>(
  hash: string,
  validate: (value: unknown) => value is T,
): T | null {
  if (!hash.startsWith(HASH_PREFIX)) return null
  try {
    const json = decompressFromEncodedURIComponent(hash.slice(HASH_PREFIX.length))
    if (!json) return null
    const envelope: unknown = JSON.parse(json)
    if (typeof envelope !== 'object' || envelope === null) return null
    const { v, data } = envelope as Partial<StateEnvelope>
    return v === STATE_VERSION && validate(data) ? data : null
  } catch {
    return null
  }
}

/** 保留当前路径和 query，仅替换 hash，生成完整分享 URL。 */
export function buildHashStateUrl(baseUrl: string, state: unknown): string {
  const url = new URL(baseUrl)
  url.hash = encodeHashState(state).slice(1)
  return url.toString()
}

export function hasHashState(hash: string): boolean {
  return hash.startsWith(HASH_PREFIX)
}
