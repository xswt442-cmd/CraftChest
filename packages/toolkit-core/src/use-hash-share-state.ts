import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { buildHashStateUrl, decodeHashState, hasHashState } from './hash-state'

export type HashShareStatus = 'idle' | 'copied' | 'failed' | 'invalid'

export interface HashShareOptions<T> {
  validate: (value: unknown) => value is T
  read: () => T
  apply: (state: T) => void
}

export interface HashShareController {
  status: Ref<HashShareStatus>
  copyUrl: () => Promise<void>
}

const RESET_DELAY_MS = 1800

/**
 * 统一工具状态分享行为：挂载时安全解码，复制时再次校验，并保留损坏链接的显式回退状态。
 */
export function useHashShareState<T>(options: HashShareOptions<T>): HashShareController {
  const status = ref<HashShareStatus>('idle')
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  onMounted(() => {
    if (!hasHashState(window.location.hash)) return
    const shared = decodeHashState(window.location.hash, options.validate)
    if (!shared) {
      status.value = 'invalid'
      return
    }
    options.apply(shared)
  })

  onBeforeUnmount(() => clearTimeout(resetTimer))

  async function copyUrl(): Promise<void> {
    const shared = options.read()
    if (!options.validate(shared)) {
      status.value = 'failed'
      return
    }

    const url = buildHashStateUrl(window.location.href, shared)
    window.history.replaceState(window.history.state, '', url)
    try {
      await navigator.clipboard.writeText(url)
      status.value = 'copied'
    } catch {
      status.value = 'failed'
    }
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => (status.value = 'idle'), RESET_DELAY_MS)
  }

  return { status, copyUrl }
}
