<script setup lang="ts">
import { Label, useId } from 'reka-ui'

withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    rows?: number
  }>(),
  { label: undefined, placeholder: undefined, rows: 5 },
)

const model = defineModel<string>({ default: '' })
const textareaId = useId()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <Label v-if="label" :for="textareaId" class="text-sm font-semibold text-foreground">
      {{ label }}
    </Label>
    <textarea
      :id="textareaId"
      v-model="model"
      :rows="rows"
      :placeholder="placeholder"
      class="min-h-28 w-full resize-y rounded-md border border-workshop-border bg-surface-raised px-3.5 py-2.5 text-base leading-relaxed text-foreground shadow-sm placeholder:text-muted-foreground/65 focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none"
    />
  </div>
</template>
