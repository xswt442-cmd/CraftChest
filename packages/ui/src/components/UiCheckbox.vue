<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot, Label, useId } from 'reka-ui'

withDefaults(
  defineProps<{
    label: string
    disabled?: boolean
  }>(),
  { disabled: false },
)

const model = defineModel<boolean>({ default: false })
const checkboxId = useId()
</script>

<template>
  <div class="inline-flex min-h-10 items-center gap-2">
    <CheckboxRoot
      :id="checkboxId"
      v-model="model"
      :disabled="disabled"
      class="flex size-5 shrink-0 items-center justify-center rounded-sm border border-workshop-border-strong bg-surface-raised text-primary-foreground shadow-sm outline-none data-[state=checked]:border-primary data-[state=checked]:bg-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <CheckboxIndicator class="text-sm leading-none" aria-hidden="true">✓</CheckboxIndicator>
    </CheckboxRoot>
    <Label
      :for="checkboxId"
      class="cursor-pointer text-sm font-medium text-foreground select-none"
      :class="disabled ? 'cursor-not-allowed opacity-50' : ''"
    >
      {{ label }}
    </Label>
  </div>
</template>
