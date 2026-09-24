import { describe, expect, it } from 'vitest'
import { applyDocumentMetadata, resolveDocumentMetadata } from './document-meta'

const copy = {
  homeTitle: 'Craft 把材料做成成品',
  homeDescription: 'Craft 成品工坊与 Chest 单项工具都在浏览器本地处理。',
  fallbackDescription: 'CraftChest 的所有处理都在浏览器本地完成。',
}

describe('document metadata', () => {
  it('从注册表解析工具的本地化标题与描述', () => {
    expect(resolveDocumentMetadata('tool-fe', 'contrast-checker', 'en', copy)).toMatchObject({
      title: 'Contrast Checker · CraftChest',
      description: 'Check WCAG AA/AAA contrast and get foreground or background adjustments.',
      lang: 'en',
      ogLocale: 'en_US',
    })
  })

  it('从 Craft 注册表解析工坊的本地化元信息', () => {
    expect(resolveDocumentMetadata('craft', 'app-icon', 'zh', copy)).toMatchObject({
      title: '应用图标工坊 · CraftChest',
      description: '把一张 PNG 在本地生成 favicon、PWA、maskable、Apple 图标与交付包。',
    })
  })

  it('从 Craft 注册表解析 Web 视觉配方元信息', () => {
    expect(resolveDocumentMetadata('craft', 'web-visual', 'en', copy)).toMatchObject({
      title: 'Web Visual Recipe · CraftChest',
      description:
        'Turn brand colors into contrast checks, color ramps, a gradient, and ready-to-use token files.',
      lang: 'en',
      ogLocale: 'en_US',
    })
  })

  it('未知路由回退站点元信息', () => {
    expect(resolveDocumentMetadata('not-found', undefined, 'zh', copy)).toEqual({
      title: 'CraftChest',
      description: copy.fallbackDescription,
      lang: 'zh-CN',
      ogLocale: 'zh_CN',
    })
  })

  it('同步更新 title、description、OG 与文档语言', () => {
    document.head.innerHTML = `
      <meta name="description" content="old">
      <meta property="og:title" content="old">
      <meta property="og:description" content="old">
      <meta property="og:locale" content="zh_CN">
    `
    const metadata = resolveDocumentMetadata('home', undefined, 'en', copy)
    applyDocumentMetadata(metadata)
    expect(document.title).toBe('Craft 把材料做成成品 · CraftChest')
    expect(document.documentElement.lang).toBe('en')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      copy.homeDescription,
    )
    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe(
      'en_US',
    )
  })
})
