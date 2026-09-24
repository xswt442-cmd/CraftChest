import { describe, expect, it } from 'vitest'
import { createZip } from './zip'

describe('createZip', () => {
  it('writes local and central directory records for browser-native files', async () => {
    const zip = new Uint8Array(
      await (
        await createZip([
          { name: 'tokens.css', data: ':root { --brand: #123456; }' },
          { name: '图标.png', data: new Blob([new Uint8Array([1, 2, 3])]) },
        ])
      ).arrayBuffer(),
    )
    const view = new DataView(zip.buffer)
    expect(view.getUint32(0, true)).toBe(0x04034b50)
    expect(view.getUint16(6, true)).toBe(0x0800)
    expect(
      [...zip].some(
        (_, index) => index + 4 <= zip.length && view.getUint32(index, true) === 0x02014b50,
      ),
    ).toBe(true)
    expect(view.getUint32(zip.length - 22, true)).toBe(0x06054b50)
  })

  it('rejects more entries than a classic ZIP directory can represent', async () => {
    await expect(
      createZip(Array.from({ length: 0x10000 }, () => ({ name: 'x', data: '' }))),
    ).rejects.toThrow(RangeError)
  })
})
