import { describe, expect, it } from 'vitest'
import { applyDocumentMetadata, resolveDocumentMetadata } from './document-meta'

const copy = {
  homeTitle: '合成你的小工具箱',
  homeDescription: '数据只存本地。',
  fallbackDescription: '纯前端工具箱。',
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
    expect(document.title).toBe('合成你的小工具箱 · CraftChest')
    expect(document.documentElement.lang).toBe('en')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      copy.homeDescription,
    )
    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe(
      'en_US',
    )
  })
})
