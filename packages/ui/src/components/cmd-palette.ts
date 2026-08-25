export interface CmdPaletteItem {
  value: string
  label: string
  description?: string
  searchText: string
  icon?: string
}

export interface CmdPaletteGroup {
  id: string
  label: string
  items: readonly CmdPaletteItem[]
}
