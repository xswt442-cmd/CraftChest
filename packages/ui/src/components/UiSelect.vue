<script setup lang="ts">
import {
  Label,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  useId,
} from 'reka-ui'

export interface UiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

defineProps<{
  label?: string
  options: readonly UiSelectOption[]
  placeholder?: string
}>()

const model = defineModel<string>({ required: true })
const selectId = useId()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <Label v-if="label" :for="selectId" class="text-sm font-semibold text-foreground">
      {{ label }}
    </Label>
    <SelectRoot v-model="model">
      <SelectTrigger
        :id="selectId"
        class="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-workshop-border bg-surface-raised px-3.5 py-2 text-left text-base text-foreground shadow-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none data-[placeholder]:text-muted-foreground"
      >
        <SelectValue :placeholder="placeholder" />
        <span aria-hidden="true" class="text-xs text-muted-foreground">▾</span>
      </SelectTrigger>
      <SelectPortal>
        <SelectContent
          position="popper"
          :side-offset="6"
          class="z-90 min-w-[var(--reka-select-trigger-width)] overflow-hidden rounded-md border border-workshop-border bg-surface-raised p-1 text-foreground shadow-lg"
        >
          <SelectViewport>
            <SelectItem
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              :disabled="option.disabled"
              class="relative flex min-h-9 cursor-default items-center rounded-sm py-1.5 pr-8 pl-3 text-sm outline-none select-none data-[disabled]:opacity-45 data-[highlighted]:bg-primary-soft"
            >
              <SelectItemText>{{ option.label }}</SelectItemText>
              <SelectItemIndicator class="absolute right-2 text-primary" aria-hidden="true">
                ✓
              </SelectItemIndicator>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>
