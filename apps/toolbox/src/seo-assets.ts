import routeCatalog from '../route-catalog.json' with { type: 'json' }

export interface PublicToolRoute {
  id: string
  section: 'zh' | 'fe'
}

/** Shared by sitemap generation and the local QA matrix; registry parity is checked in tests. */
export const PUBLIC_TOOL_ROUTES: readonly PublicToolRoute[] = routeCatalog.tools.map(
  ({ section, id }) => {
    if (section !== 'zh' && section !== 'fe') {
      throw new Error(`无效工具路由类别：${section}`)
    }
    return { section, id }
  },
)

export interface PublicCraftRoute {
  id: string
}

/** Shared by sitemap generation and the local QA matrix; registry parity is checked in tests. */
export const PUBLIC_CRAFT_ROUTES: readonly PublicCraftRoute[] = routeCatalog.crafts

export function parseSiteUrl(rawSiteUrl: string | undefined): URL | null {
  if (!rawSiteUrl) return null
  const siteUrl = new URL(rawSiteUrl)
  if (!['http:', 'https:'].includes(siteUrl.protocol)) {
    throw new Error('CRAFTCHEST_SITE_URL / CF_PAGES_URL 必须使用 http 或 https')
  }
  if (siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash) {
    throw new Error('站点 URL 不得包含凭据、query 或 hash')
  }
  siteUrl.pathname = siteUrl.pathname.replace(/\/+$/, '') || '/'
  return siteUrl
}

function routeUrl(siteUrl: URL, routePath: string): string {
  const basePath = siteUrl.pathname === '/' ? '' : siteUrl.pathname
  return new URL(`${basePath}${routePath}`, siteUrl.origin).toString()
}

export function buildSitemap(
  siteUrl: URL,
  tools: readonly PublicToolRoute[],
  crafts: readonly PublicCraftRoute[] = PUBLIC_CRAFT_ROUTES,
): string {
  const routes = [
    '/',
    ...tools.map((tool) => `/${tool.section}/${tool.id}`),
    ...crafts.map((craft) => `/craft/${craft.id}`),
  ]
  const entries = routes.map((route) => `  <url><loc>${routeUrl(siteUrl, route)}</loc></url>`)
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')
}

export function buildRobots(siteUrl: URL | null): string {
  return [
    'User-agent: *',
    'Allow: /',
    ...(siteUrl ? [`Sitemap: ${routeUrl(siteUrl, '/sitemap.xml')}`] : []),
    '',
  ].join('\n')
}
