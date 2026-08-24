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
    <Label
      v-if="label"
      :for="inputId"
      class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
    >
      {{ label }}
    </Label>
    <input
      :id="inputId"
      v-model="model"
      type="text"
      :placeholder="placeholder"
      class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    />
  </div>
</template>
