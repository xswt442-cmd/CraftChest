export interface ZipEntry {
  name: string
  data: Blob | string
}

function writeUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true)
}

function writeUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true)
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function concatBytes(chunks: readonly Uint8Array[]): Uint8Array {
  const result = new Uint8Array(chunks.reduce((length, chunk) => length + chunk.length, 0))
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}

/** Creates an uncompressed ZIP using only browser-native APIs. */
export async function createZip(entries: readonly ZipEntry[]): Promise<Blob> {
  if (entries.length > 0xffff) throw new RangeError('ZIP supports at most 65,535 entries')
  const encoder = new TextEncoder()
  const prepared = await Promise.all(
    entries.map(async (entry) => ({
      name: encoder.encode(entry.name),
      data:
        typeof entry.data === 'string'
          ? encoder.encode(entry.data)
          : new Uint8Array(await entry.data.arrayBuffer()),
    })),
  )
  const local: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0
  for (const entry of prepared) {
    if (entry.name.length > 0xffff) throw new RangeError('ZIP entry name is too long')
    const checksum = crc32(entry.data)
    const header = new Uint8Array(30 + entry.name.length)
    const view = new DataView(header.buffer)
    writeUint32(view, 0, 0x04034b50)
    writeUint16(view, 4, 20)
    writeUint16(view, 6, 0x0800)
    writeUint32(view, 14, checksum)
    writeUint32(view, 18, entry.data.length)
    writeUint32(view, 22, entry.data.length)
    writeUint16(view, 26, entry.name.length)
    header.set(entry.name, 30)
    local.push(header, entry.data)

    const directory = new Uint8Array(46 + entry.name.length)
    const directoryView = new DataView(directory.buffer)
    writeUint32(directoryView, 0, 0x02014b50)
    writeUint16(directoryView, 4, 20)
    writeUint16(directoryView, 6, 20)
    writeUint16(directoryView, 8, 0x0800)
    writeUint32(directoryView, 16, checksum)
    writeUint32(directoryView, 20, entry.data.length)
    writeUint32(directoryView, 24, entry.data.length)
    writeUint16(directoryView, 28, entry.name.length)
    writeUint32(directoryView, 42, offset)
    directory.set(entry.name, 46)
    central.push(directory)
    offset += header.length + entry.data.length
  }
  const centralData = concatBytes(central)
  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  writeUint32(endView, 0, 0x06054b50)
  writeUint16(endView, 8, prepared.length)
  writeUint16(endView, 10, prepared.length)
  writeUint32(endView, 12, centralData.length)
  writeUint32(endView, 16, offset)
  return new Blob([concatBytes([...local, centralData, end])], { type: 'application/zip' })
}
