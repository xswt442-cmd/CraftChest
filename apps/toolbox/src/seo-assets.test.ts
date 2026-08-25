import { describe, expect, it } from 'vitest'
import { allTools } from './registry'
import { buildRobots, buildSitemap, parseSiteUrl, PUBLIC_TOOL_ROUTES } from './seo-assets'

describe('static SEO assets', () => {
  it('从注册表生成首页与全部工具的绝对 URL', () => {
    const siteUrl = parseSiteUrl('https://tools.example.com/')
    expect(siteUrl).not.toBeNull()
    const sitemap = buildSitemap(siteUrl!, PUBLIC_TOOL_ROUTES)
    expect(sitemap).toContain('<loc>https://tools.example.com/</loc>')
    expect(sitemap).toContain('<loc>https://tools.example.com/fe/gradient-gen</loc>')
    expect(sitemap.match(/<url>/g)).toHaveLength(allTools.length + 1)
  })

  it('支持部署在固定子路径', () => {
    const siteUrl = parseSiteUrl('https://example.com/tools/')
    expect(buildRobots(siteUrl)).toContain('https://example.com/tools/sitemap.xml')
    expect(buildSitemap(siteUrl!, PUBLIC_TOOL_ROUTES)).toContain(
      '<loc>https://example.com/tools/zh/pinyin</loc>',
    )
  })

  it('静态路由镜像与运行时注册表保持一致', () => {
    const registered = allTools.map(({ section, id }) => `${section}/${id}`).sort()
    const publicRoutes = PUBLIC_TOOL_ROUTES.map(({ section, id }) => `${section}/${id}`).sort()
    expect(publicRoutes).toEqual(registered)
  })

  it('拒绝非 HTTP 协议和带凭据的站点 URL', () => {
    expect(() => parseSiteUrl('javascript:alert(1)')).toThrow()
    expect(() => parseSiteUrl('https://user:secret@example.com')).toThrow()
  })
})
