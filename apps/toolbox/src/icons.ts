import type { Component } from 'vue'
import IconActivity from '~icons/lucide/activity'
import IconAlignLeft from '~icons/lucide/align-left'
import IconArrowDownRight from '~icons/lucide/arrow-down-right'
import IconArrowLeftRight from '~icons/lucide/arrow-left-right'
import IconArrowUpRight from '~icons/lucide/arrow-up-right'
import IconBanknote from '~icons/lucide/banknote'
import IconContrast from '~icons/lucide/contrast'
import IconHash from '~icons/lucide/hash'
import IconHouse from '~icons/lucide/house'
import IconImage from '~icons/lucide/image'
import IconLanguages from '~icons/lucide/languages'
import IconLayoutGrid from '~icons/lucide/layout-grid'
import IconMenu from '~icons/lucide/menu'
import IconMoonStar from '~icons/lucide/moon-star'
import IconPalette from '~icons/lucide/palette'
import IconPuzzle from '~icons/lucide/puzzle'
import IconRegex from '~icons/lucide/regex'
import IconSearch from '~icons/lucide/search'
import IconShapes from '~icons/lucide/shapes'
import IconShieldCheck from '~icons/lucide/shield-check'
import IconSlidersHorizontal from '~icons/lucide/sliders-horizontal'
import IconSpeech from '~icons/lucide/speech'
import IconX from '~icons/lucide/x'

/**
 * 图标名 → 组件映射。
 * 图标在构建期从 @iconify-json/lucide 内联进产物，运行时零外部请求；
 * 新工具引入新图标时在此登记，未登记的名字回退为拼图占位。
 */
export const toolIcons: Record<string, Component> = {
  'lucide:activity': IconActivity,
  'lucide:align-left': IconAlignLeft,
  'lucide:arrow-left-right': IconArrowLeftRight,
  'lucide:arrow-down-right': IconArrowDownRight,
  'lucide:arrow-up-right': IconArrowUpRight,
  'lucide:banknote': IconBanknote,
  'lucide:contrast': IconContrast,
  'lucide:hash': IconHash,
  'lucide:house': IconHouse,
  'lucide:image': IconImage,
  'lucide:languages': IconLanguages,
  'lucide:layout-grid': IconLayoutGrid,
  'lucide:menu': IconMenu,
  'lucide:moon-star': IconMoonStar,
  'lucide:palette': IconPalette,
  'lucide:puzzle': IconPuzzle,
  'lucide:regex': IconRegex,
  'lucide:speech': IconSpeech,
  'lucide:search': IconSearch,
  'lucide:shapes': IconShapes,
  'lucide:sliders-horizontal': IconSlidersHorizontal,
  'lucide:shield-check': IconShieldCheck,
  'lucide:x': IconX,
}

export const fallbackIcon: Component = IconPuzzle
