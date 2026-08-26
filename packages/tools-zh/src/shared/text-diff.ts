export type DiffKind = 'equal' | 'insert' | 'delete'

export interface DiffSegment {
  type: DiffKind
  text: string
}

function appendSegment(segments: DiffSegment[], type: DiffKind, text: string): void {
  if (text === '') return
  const previous = segments.at(-1)
  if (previous?.type === type) previous.text += text
  else segments.push({ type, text })
}

function diffMiddle(before: string[], after: string[]): DiffSegment[] {
  if (before.length === 0) return [{ type: 'insert', text: after.join('') }]
  if (after.length === 0) return [{ type: 'delete', text: before.join('') }]

  // 长文本仍返回正确变换，但在矩阵过大时用较粗的整段 diff 控制内存。
  if (before.length * after.length > 250_000) {
    return [
      { type: 'delete', text: before.join('') },
      { type: 'insert', text: after.join('') },
    ]
  }

  const width = after.length + 1
  const table = new Uint32Array((before.length + 1) * width)
  for (let i = before.length - 1; i >= 0; i -= 1) {
    for (let j = after.length - 1; j >= 0; j -= 1) {
      const index = i * width + j
      table[index] =
        before[i] === after[j]
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[index + 1])
    }
  }

  const segments: DiffSegment[] = []
  let i = 0
  let j = 0
  while (i < before.length && j < after.length) {
    if (before[i] === after[j]) {
      appendSegment(segments, 'equal', before[i]!)
      i += 1
      j += 1
    } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
      appendSegment(segments, 'delete', before[i]!)
      i += 1
    } else {
      appendSegment(segments, 'insert', after[j]!)
      j += 1
    }
  }
  appendSegment(segments, 'delete', before.slice(i).join(''))
  appendSegment(segments, 'insert', after.slice(j).join(''))
  return segments
}

/** 生成可直接渲染为 ins/del 的 Unicode 字符级 diff。 */
export function diffText(beforeText: string, afterText: string): DiffSegment[] {
  if (beforeText === afterText) {
    return beforeText === '' ? [] : [{ type: 'equal', text: beforeText }]
  }

  const before = Array.from(beforeText)
  const after = Array.from(afterText)
  let prefixLength = 0
  while (
    prefixLength < before.length &&
    prefixLength < after.length &&
    before[prefixLength] === after[prefixLength]
  ) {
    prefixLength += 1
  }

  let suffixLength = 0
  while (
    suffixLength < before.length - prefixLength &&
    suffixLength < after.length - prefixLength &&
    before[before.length - suffixLength - 1] === after[after.length - suffixLength - 1]
  ) {
    suffixLength += 1
  }

  const segments: DiffSegment[] = []
  appendSegment(segments, 'equal', before.slice(0, prefixLength).join(''))
  for (const segment of diffMiddle(
    before.slice(prefixLength, before.length - suffixLength),
    after.slice(prefixLength, after.length - suffixLength),
  )) {
    appendSegment(segments, segment.type, segment.text)
  }
  appendSegment(
    segments,
    'equal',
    suffixLength === 0 ? '' : before.slice(before.length - suffixLength).join(''),
  )
  return segments
}
