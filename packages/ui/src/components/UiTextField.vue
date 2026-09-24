<script setup lang="ts">
import { Label, useId } from 'reka-ui'

defineProps<{
  label?: string
  placeholder?: string
}>()

const model = defineModel<string>({ default: '' })
const inputId = useId()
</script>

<template>
  <div class="flex flex-col gap-2">
    <Label v-if="label" :for="inputId" class="text-sm font-medium text-foreground">
      {{ label }}
    </Label>
    <input
      :id="inputId"
      v-model="model"
      type="text"
      :placeholder="placeholder"
      class="min-h-11 w-full rounded-lg border border-workshop-border bg-surface-raised px-3.5 py-2 text-base text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/65 focus:border-ring focus:ring-4 focus:ring-ring/15 focus:outline-none"
    />
  </div>
</template>
