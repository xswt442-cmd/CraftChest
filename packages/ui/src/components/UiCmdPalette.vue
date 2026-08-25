<script setup lang="ts">
import {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxRoot,
  ComboboxViewport,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import type { CmdPaletteGroup } from './cmd-palette'

defineProps<{
  groups: readonly CmdPaletteGroup[]
  title: string
  description: string
  placeholder: string
  emptyText: string
  selectHint: string
  closeHint: string
}>()

const emit = defineEmits<{
  select: [value: string]
}>()

const open = defineModel<boolean>('open', { default: false })

function selectValue(value: unknown): void {
  if (typeof value !== 'string') return
  emit('select', value)
  open.value = false
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-70 bg-black/55 backdrop-blur-[2px] data-[state=open]:animate-in"
      />
      <DialogContent
        class="workshop-shadow fixed top-[12vh] left-1/2 z-80 flex max-h-[76vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden rounded-lg border border-workshop-border bg-surface-raised outline-none"
        @open-auto-focus.prevent
      >
        <DialogTitle class="sr-only">{{ title }}</DialogTitle>
        <DialogDescription class="sr-only">{{ description }}</DialogDescription>

        <ComboboxRoot
          :open="true"
          :reset-search-term-on-select="false"
          open-on-focus
          @update:model-value="selectValue"
        >
          <div class="flex items-center gap-3 border-b border-workshop-border px-4">
            <span aria-hidden="true" class="text-lg text-muted-foreground">⌕</span>
            <ComboboxInput
              :auto-focus="true"
              :placeholder="placeholder"
              class="h-14 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/65"
            />
            <kbd
              class="rounded border border-workshop-border bg-surface-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >Esc</kbd
            >
          </div>

          <ComboboxContent force-mount class="min-h-0 flex-1">
            <ComboboxViewport class="max-h-[56vh] p-2">
              <ComboboxEmpty class="px-4 py-12 text-center text-sm text-muted-foreground">{{
                emptyText
              }}</ComboboxEmpty>
              <ComboboxGroup v-for="group in groups" :key="group.id">
                <ComboboxLabel
                  class="px-2 pt-3 pb-1.5 text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase"
                  >{{ group.label }}</ComboboxLabel
                >
                <ComboboxItem
                  v-for="item in group.items"
                  :key="item.value"
                  :value="item.value"
                  :text-value="item.searchText"
                  class="group flex cursor-default items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground outline-none data-[highlighted]:bg-primary-soft data-[highlighted]:text-foreground"
                >
                  <slot name="item" :item="item">
                    <span class="min-w-0 flex-1">
                      <b class="block truncate font-medium">{{ item.label }}</b>
                      <span
                        v-if="item.description"
                        class="mt-0.5 block truncate text-xs text-muted-foreground"
                        >{{ item.description }}</span
                      >
                    </span>
                    <span
                      aria-hidden="true"
                      class="text-muted-foreground opacity-0 group-data-[highlighted]:opacity-100"
                      >↵</span
                    >
                  </slot>
                </ComboboxItem>
              </ComboboxGroup>
            </ComboboxViewport>
          </ComboboxContent>
        </ComboboxRoot>

        <footer
          class="flex items-center gap-4 border-t border-workshop-border px-4 py-2 text-[11px] text-muted-foreground"
        >
          <span><kbd>↑↓</kbd> {{ selectHint }}</span>
          <span><kbd>Esc</kbd> {{ closeHint }}</span>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
