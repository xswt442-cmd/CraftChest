import { executeRegex, type RegexRunInput } from './service'

interface RegexWorkerRequest {
  requestId: number
  input: RegexRunInput
}

interface RegexWorkerResponse {
  requestId: number
  result: ReturnType<typeof executeRegex>
}

interface RegexWorkerScope {
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent<RegexWorkerRequest>) => void,
  ): void
  postMessage(response: RegexWorkerResponse): void
}

// Vite bundles this module as a Worker; keep the package's general DOM types unchanged.
const workerScope = self as unknown as RegexWorkerScope

workerScope.addEventListener('message', (event: MessageEvent<RegexWorkerRequest>) => {
  const { requestId, input } = event.data
  try {
    const response: RegexWorkerResponse = { requestId, result: executeRegex(input) }
    workerScope.postMessage(response)
  } catch {
    workerScope.postMessage({ requestId, result: { ok: false, error: 'evaluation-failed' } })
  }
})
