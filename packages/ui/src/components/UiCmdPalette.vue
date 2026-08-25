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
        class="fixed inset-0 z-70 bg-neutral-950/55 backdrop-blur-[2px] data-[state=open]:animate-in"
      />
      <DialogContent
        class="fixed top-[12vh] left-1/2 z-80 flex max-h-[76vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl outline-none dark:border-neutral-700 dark:bg-neutral-900"
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
          <div
            class="flex items-center gap-3 border-b border-neutral-200 px-4 dark:border-neutral-700"
          >
            <span aria-hidden="true" class="text-lg text-neutral-400">⌕</span>
            <ComboboxInput
              :auto-focus="true"
              :placeholder="placeholder"
              class="h-14 min-w-0 flex-1 bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
            />
            <kbd
              class="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800"
              >Esc</kbd
            >
          </div>

          <ComboboxContent force-mount class="min-h-0 flex-1">
            <ComboboxViewport class="max-h-[56vh] p-2">
              <ComboboxEmpty class="px-4 py-12 text-center text-sm text-neutral-400">{{
                emptyText
              }}</ComboboxEmpty>
              <ComboboxGroup v-for="group in groups" :key="group.id">
                <ComboboxLabel
                  class="px-2 pt-3 pb-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase"
                  >{{ group.label }}</ComboboxLabel
                >
                <ComboboxItem
                  v-for="item in group.items"
                  :key="item.value"
                  :value="item.value"
                  :text-value="item.searchText"
                  class="group flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 outline-none data-[highlighted]:bg-amber-50 data-[highlighted]:text-amber-950 dark:text-neutral-200 dark:data-[highlighted]:bg-amber-500/15 dark:data-[highlighted]:text-amber-100"
                >
                  <slot name="item" :item="item">
                    <span class="min-w-0 flex-1">
                      <b class="block truncate font-medium">{{ item.label }}</b>
                      <span
                        v-if="item.description"
                        class="mt-0.5 block truncate text-xs text-neutral-400 group-data-[highlighted]:text-amber-700/70 dark:group-data-[highlighted]:text-amber-300/70"
                        >{{ item.description }}</span
                      >
                    </span>
                    <span
                      aria-hidden="true"
                      class="text-neutral-300 opacity-0 group-data-[highlighted]:opacity-100 dark:text-neutral-600"
                      >↵</span
                    >
                  </slot>
                </ComboboxItem>
              </ComboboxGroup>
            </ComboboxViewport>
          </ComboboxContent>
        </ComboboxRoot>

        <footer
          class="flex items-center gap-4 border-t border-neutral-200 px-4 py-2 text-[11px] text-neutral-400 dark:border-neutral-700"
        >
          <span><kbd>↑↓</kbd> {{ selectHint }}</span>
          <span><kbd>Esc</kbd> {{ closeHint }}</span>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
