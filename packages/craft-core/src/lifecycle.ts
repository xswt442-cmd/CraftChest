import type { CraftState, CraftStatus } from './types'

const TRANSITIONS: Readonly<Record<CraftStatus, readonly CraftStatus[]>> = {
  idle: ['input-invalid', 'processing'],
  'input-invalid': ['idle', 'processing'],
  processing: ['preview-ready', 'partial-success', 'completed', 'failed'],
  'preview-ready': ['idle', 'processing', 'partial-success', 'completed', 'failed'],
  'partial-success': ['idle', 'processing', 'preview-ready', 'completed', 'failed'],
  completed: ['idle', 'processing'],
  failed: ['idle', 'input-invalid', 'processing'],
}

/** 查询一次状态变化是否属于 Craft 的最小生命周期。 */
export function canTransitionCraftStatus(from: CraftStatus, to: CraftStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

/**
 * 只执行状态标签的不可变转换；不会运行步骤、清理材料或伪造产物。这些职责留给
 * 每个真实 Craft 的具体 service 编排，直到存在两份实现再提炼 runner。
 */
export function transitionCraftState(
  state: CraftState,
  nextStatus: CraftStatus,
): CraftState | null {
  if (!canTransitionCraftStatus(state.status, nextStatus)) return null
  return { ...state, status: nextStatus }
}
