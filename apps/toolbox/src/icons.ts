import type { Component } from 'vue'
import IconBanknote from '~icons/lucide/banknote'
import IconHouse from '~icons/lucide/house'
import IconLanguages from '~icons/lucide/languages'
import IconMenu from '~icons/lucide/menu'
import IconPuzzle from '~icons/lucide/puzzle'
import IconSearch from '~icons/lucide/search'
import IconX from '~icons/lucide/x'

/**
 * 图标名 → 组件映射。
 * 图标在构建期从 @iconify-json/lucide 内联进产物，运行时零外部请求；
 * 新工具引入新图标时在此登记，未登记的名字回退为拼图占位。
 */
export const toolIcons: Record<string, Component> = {
  'lucide:banknote': IconBanknote,
  'lucide:house': IconHouse,
  'lucide:languages': IconLanguages,
  'lucide:menu': IconMenu,
  'lucide:puzzle': IconPuzzle,
  'lucide:search': IconSearch,
  'lucide:x': IconX,
}

export const fallbackIcon: Component = IconPuzzle
