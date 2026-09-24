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
  <div class="flex flex-col gap-2">
    <Label v-if="label" :for="textareaId" class="text-sm font-medium text-foreground">
      {{ label }}
    </Label>
    <textarea
      :id="textareaId"
      v-model="model"
      :rows="rows"
      :placeholder="placeholder"
      class="min-h-28 w-full resize-y rounded-lg border border-workshop-border bg-surface-raised px-3.5 py-2.5 text-base leading-relaxed text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/65 focus:border-ring focus:ring-4 focus:ring-ring/15 focus:outline-none"
    />
  </div>
</template>
