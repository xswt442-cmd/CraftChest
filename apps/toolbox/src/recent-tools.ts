const STORAGE_KEY = 'craftchest.recent-tools'
const DEFAULT_LIMIT = 5

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function browserStorage(storage?: StorageLike): StorageLike | undefined {
  if (storage) return storage
  try {
    return localStorage
  } catch {
    return undefined
  }
}

export function loadRecentToolIds(storage?: StorageLike): string[] {
  try {
    const raw = browserStorage(storage)?.getItem(STORAGE_KEY)
    if (!raw) return []
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return [
      ...new Set(value.filter((item): item is string => typeof item === 'string' && item !== '')),
    ]
  } catch {
    return []
  }
}

export function recordRecentToolId(
  id: string,
  storage?: StorageLike,
  limit = DEFAULT_LIMIT,
): string[] {
  const ids = [id, ...loadRecentToolIds(storage).filter((item) => item !== id)].slice(
    0,
    Math.max(0, limit),
  )
  try {
    browserStorage(storage)?.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // 隐私模式或存储配额异常不应阻塞导航
  }
  return ids
}
