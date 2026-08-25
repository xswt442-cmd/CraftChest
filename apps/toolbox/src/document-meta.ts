import type { Locale } from './i18n'
import { findTool } from './registry'

const SITE_NAME = 'CraftChest'

export interface DocumentMetadata {
  title: string
  description: string
  lang: 'zh-CN' | 'en'
  ogLocale: 'zh_CN' | 'en_US'
}

export interface DocumentMetaCopy {
  homeTitle: string
  homeDescription: string
  fallbackDescription: string
}

export function resolveDocumentMetadata(
  routeName: unknown,
  toolId: unknown,
  locale: Locale,
  copy: DocumentMetaCopy,
): DocumentMetadata {
  const languageKey = locale === 'en' ? 'en' : 'zh'
  const languageMeta =
    locale === 'en'
      ? ({ lang: 'en', ogLocale: 'en_US' } as const)
      : ({ lang: 'zh-CN', ogLocale: 'zh_CN' } as const)

  if (routeName === 'home') {
    return {
      title: `${copy.homeTitle} · ${SITE_NAME}`,
      description: copy.homeDescription,
      ...languageMeta,
    }
  }

  const section = routeName === 'tool-zh' ? 'zh' : routeName === 'tool-fe' ? 'fe' : undefined
  if (section && typeof toolId === 'string') {
    const tool = findTool(section, toolId)
    if (tool) {
      return {
        title: `${tool.title[languageKey]} · ${SITE_NAME}`,
        description: tool.description[languageKey],
        ...languageMeta,
      }
    }
  }

  return {
    title: SITE_NAME,
    description: copy.fallbackDescription,
    ...languageMeta,
  }
}

function setMetaContent(documentNode: Document, selector: string, content: string): void {
  documentNode.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content)
}

export function applyDocumentMetadata(
  metadata: DocumentMetadata,
  documentNode: Document = document,
): void {
  documentNode.title = metadata.title
  documentNode.documentElement.lang = metadata.lang
  setMetaContent(documentNode, 'meta[name="description"]', metadata.description)
  setMetaContent(documentNode, 'meta[property="og:title"]', metadata.title)
  setMetaContent(documentNode, 'meta[property="og:description"]', metadata.description)
  setMetaContent(documentNode, 'meta[property="og:locale"]', metadata.ogLocale)
}
