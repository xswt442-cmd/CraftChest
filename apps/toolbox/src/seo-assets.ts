export interface PublicToolRoute {
  id: string
  section: 'zh' | 'fe'
}

/** Node 构建配置不能导入含 Vue loader 的运行时注册表；单测负责防止此镜像漂移。 */
export const PUBLIC_TOOL_ROUTES: readonly PublicToolRoute[] = [
  { section: 'zh', id: 'rmb-uppercase' },
  { section: 'zh', id: 'pinyin' },
  { section: 'zh', id: 'opencc' },
  { section: 'zh', id: 'lunar-calendar' },
  { section: 'zh', id: 'pangu-spacing' },
  { section: 'zh', id: 'zh-char-count' },
  { section: 'fe', id: 'gradient-gen' },
  { section: 'fe', id: 'flex-grid-play' },
  { section: 'fe', id: 'easing-curves' },
  { section: 'fe', id: 'contrast-checker' },
]

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

export function buildSitemap(siteUrl: URL, tools: readonly PublicToolRoute[]): string {
  const routes = ['/', ...tools.map((tool) => `/${tool.section}/${tool.id}`)]
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
