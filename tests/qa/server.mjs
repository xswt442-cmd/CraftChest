import { createReadStream } from 'node:fs'
import { access, readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const dist = path.join(root, 'apps/toolbox/dist')
const harness = path.join(here, 'harness.html')
const port = Number(process.env.CRAFTCHEST_QA_PORT || 4174)

const mime = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json'],
  ['.woff2', 'font/woff2'],
])

async function existingFile(requestPath) {
  const relative = decodeURIComponent(requestPath).replace(/^\/+/, '')
  const candidate = path.resolve(dist, relative)
  if (candidate !== dist && !candidate.startsWith(`${dist}${path.sep}`)) return null
  try {
    return (await stat(candidate)).isFile() ? candidate : null
  } catch {
    return null
  }
}

await access(path.join(dist, 'index.html')).catch(() => {
  throw new Error('缺少 apps/toolbox/dist/index.html；请先运行 pnpm build')
})

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`)
  if (url.pathname === '/__qa' || url.pathname === '/__qa/') {
    response.setHeader('content-type', 'text/html; charset=utf-8')
    response.end(await readFile(harness))
    return
  }

  const file = (await existingFile(url.pathname)) ?? path.join(dist, 'index.html')
  response.setHeader('content-type', mime.get(path.extname(file)) ?? 'application/octet-stream')
  response.setHeader('cache-control', 'no-store')
  createReadStream(file).pipe(response)
})

server.listen(port, '127.0.0.1', () => {
  console.log(`CraftChest QA: http://127.0.0.1:${port}/__qa`)
  console.log('Ctrl+C 结束')
})
