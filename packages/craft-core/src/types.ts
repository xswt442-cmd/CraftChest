/**
 * Craft 的最小领域契约。它有意不导入 Vue、路由或任何 Tool.vue：Craft 只通过
 * Chest service 的稳定标识和纯函数签名复用能力。
 */

export type CraftStatus =
  | 'idle'
  | 'input-invalid'
  | 'processing'
  | 'preview-ready'
  | 'partial-success'
  | 'completed'
  | 'failed'

export type CraftMaterialKind = 'file' | 'text' | 'value'

/** 可安全呈现的材料描述；不包含实际内容。 */
export interface CraftMaterialMeta {
  id: string
  kind: CraftMaterialKind
  label: string
  mediaType?: string
  byteLength?: number
}

/**
 * 一次 Craft 运行中的材料。payload 是仅内存运行数据，绝不能传给分享 API、
 * localStorage、日志或遥测。
 */
export interface CraftInputMaterial<TPayload = unknown> {
  meta: CraftMaterialMeta
  payload: TPayload
}

/** Craft 所声明的材料槽位，用于在运行前说明所需输入。 */
export interface CraftInputSpec {
  id: string
  kind: CraftMaterialKind
  label: { zh: string; en: string }
  required: boolean
  acceptedMediaTypes?: readonly string[]
}

/** Chest 能力只以纯 service 的稳定标识被 Craft 引用，不引用视图或路由。 */
export interface ChestServiceRef {
  kind: 'chest-service'
  id: string
  version?: number
}

/** 用于 service 适配层的纯函数形状；不规定或提供通用 runner。 */
export type ChestService<TInput, TOutput> = (input: TInput) => TOutput | Promise<TOutput>

export interface CraftStepRef {
  id: string
  label: { zh: string; en: string }
  service: ChestServiceRef
  consumes: readonly string[]
  produces: readonly string[]
}

export type CraftPhaseStatus = 'pending' | 'succeeded' | 'failed' | 'skipped'

export interface CraftFailure {
  code: string
  message: string
  recoverable: boolean
}

/**
 * 一个步骤的可解释运行记录。usedMaterialIds、artifactIds 和 failure 使 UI 能解释
 * 输入、产出及失败原因，而无需窥探 service 的内部实现。
 */
export interface CraftPhaseResult {
  stepId: string
  status: CraftPhaseStatus
  usedMaterialIds: readonly string[]
  artifactIds: readonly string[]
  summary: string
  warnings: readonly CraftWarning[]
  failure?: CraftFailure
}

export interface CraftWarning {
  code: string
  message: string
  stepId?: string
}

export type CraftArtifactKind = 'file' | 'text' | 'structured-data'

/**
 * 最终或中间的可导出产物。payload 同样只属于当前内存运行，不能进入分享状态。
 */
export interface CraftArtifact<TPayload = unknown> {
  id: string
  kind: CraftArtifactKind
  label: string
  filename?: string
  mediaType?: string
  payload: TPayload
}

export interface CraftMeta {
  /** 全局唯一 kebab-case recipe id。 */
  id: string
  /** 配方/分享格式的兼容版本；改变可分享选项语义时递增。 */
  recipeVersion: number
  title: { zh: string; en: string }
  description: { zh: string; en: string }
  inputs: readonly CraftInputSpec[]
  steps: readonly CraftStepRef[]
}

export interface CraftState {
  status: CraftStatus
  phaseResults: readonly CraftPhaseResult[]
  warnings: readonly CraftWarning[]
  artifacts: readonly CraftArtifact[]
  failure?: CraftFailure
}

/** 与 defineTool 保持一致：它仅保留类型信息，不注册路由或加载组件。 */
export function defineCraft(meta: CraftMeta): CraftMeta {
  return meta
}
