/**
 * 共享 UI 组件：reka-ui（headless）二次封装。
 * 封装层即练习目标（SPEC §2）——样式归这里，行为归 reka-ui，业务归工具包。
 */
export { default as UiButton } from './components/UiButton.vue'
export { default as UiCard } from './components/UiCard.vue'
export { default as UiCmdPalette } from './components/UiCmdPalette.vue'
export { default as UiTextField } from './components/UiTextField.vue'
export type { CmdPaletteGroup, CmdPaletteItem } from './components/cmd-palette'
