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
  <div class="flex flex-col gap-1.5">
    <Label v-if="label" :for="inputId" class="text-sm font-semibold text-foreground">
      {{ label }}
    </Label>
    <input
      :id="inputId"
      v-model="model"
      type="text"
      :placeholder="placeholder"
      class="min-h-11 w-full rounded-md border border-workshop-border bg-surface-raised px-3.5 py-2 text-base text-foreground shadow-sm placeholder:text-muted-foreground/65 focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none"
    />
  </div>
</template>
