import { decodeHashState, encodeHashState } from '@craftchest/toolkit-core/hash-state'
import type { CraftMeta } from './types'

export type CraftSharePrimitive = boolean | number | string | null
export type CraftShareValue =
  CraftSharePrimitive | readonly CraftShareValue[] | { readonly [key: string]: CraftShareValue }
export type CraftShareOptions = { readonly [key: string]: CraftShareValue }

/** 分享载荷刻意只包含 recipe 身份、兼容版本和经投影的非敏感选项。 */
export interface CraftShareState<TOptions extends CraftShareOptions = CraftShareOptions> {
  craftId: string
  recipeVersion: number
  options: TOptions
}

const SENSITIVE_OPTION_KEYS = new Set([
  'artifact',
  'artifacts',
  'blob',
  'body',
  'bytes',
  'content',
  'contents',
  'data',
  'file',
  'files',
  'material',
  'materials',
  'payload',
  'result',
  'results',
  'text',
])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function isSafeShareValue(value: unknown): value is CraftShareValue {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(isSafeShareValue)
  if (!isPlainObject(value)) return false

  return Object.entries(value).every(
    ([key, nested]) => !SENSITIVE_OPTION_KEYS.has(key.toLowerCase()) && isSafeShareValue(nested),
  )
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actualKeys = Object.keys(value)
  return actualKeys.length === keys.length && actualKeys.every((key) => keys.includes(key))
}

function isValidCraftIdentity(id: unknown, recipeVersion: unknown): boolean {
  return (
    typeof id === 'string' &&
    /^[a-z][a-z0-9-]*$/.test(id) &&
    typeof recipeVersion === 'number' &&
    Number.isSafeInteger(recipeVersion) &&
    recipeVersion > 0
  )
}

/** 防御性校验：拒绝文件、Blob、NaN 和敏感内容字段，即使调用者遗漏了自己的 schema 校验。 */
export function isCraftShareOptions(value: unknown): value is CraftShareOptions {
  return isPlainObject(value) && isSafeShareValue(value)
}

/**
 * 明确的分享边界：此函数不能接收材料、步骤结果或 artifact，只能接收已投影的选项。
 * 具体 Craft 应由自己的 toShareOptions() 从完整 UI 状态选取允许公开的字段。
 */
export function createCraftShareState<TOptions extends CraftShareOptions>(
  meta: Pick<CraftMeta, 'id' | 'recipeVersion'>,
  options: TOptions,
): CraftShareState<TOptions> {
  if (!isValidCraftIdentity(meta.id, meta.recipeVersion)) {
    throw new TypeError('无效 Craft 身份或 recipe 版本')
  }
  if (!isCraftShareOptions(options)) throw new TypeError('分享选项必须是非敏感的 JSON 值')
  return { craftId: meta.id, recipeVersion: meta.recipeVersion, options }
}

export function isCraftShareState<TOptions extends CraftShareOptions>(
  value: unknown,
  isOptions: (value: unknown) => value is TOptions,
): value is CraftShareState<TOptions> {
  if (!isPlainObject(value) || !hasExactKeys(value, ['craftId', 'recipeVersion', 'options']))
    return false
  return (
    isValidCraftIdentity(value.craftId, value.recipeVersion) &&
    isCraftShareOptions(value.options) &&
    isOptions(value.options)
  )
}

/** 使用现有 #s= hash 编码；其中仍保留 recipeVersion 以便各 Craft 独立演进。 */
export function encodeCraftShareHash<TOptions extends CraftShareOptions>(
  meta: Pick<CraftMeta, 'id' | 'recipeVersion'>,
  options: TOptions,
): string {
  return encodeHashState(createCraftShareState(meta, options))
}

/** 只接受当前 Craft 和当前 recipe 版本的分享链接；旧版本必须由对应 Craft 显式迁移。 */
export function decodeCraftShareHash<TOptions extends CraftShareOptions>(
  hash: string,
  meta: Pick<CraftMeta, 'id' | 'recipeVersion'>,
  isOptions: (value: unknown) => value is TOptions,
): CraftShareState<TOptions> | null {
  return decodeHashState(hash, (value): value is CraftShareState<TOptions> => {
    if (!isCraftShareState(value, isOptions)) return false
    return value.craftId === meta.id && value.recipeVersion === meta.recipeVersion
  })
}
