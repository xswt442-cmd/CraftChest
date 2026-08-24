<script setup lang="ts">
import { Primitive } from 'reka-ui'

type Variant = 'primary' | 'secondary'

withDefaults(
  defineProps<{
    variant?: Variant
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'secondary', type: 'button', disabled: false },
)

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700',
  secondary:
    'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200 disabled:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800',
}
</script>

<template>
  <Primitive
    as="button"
    :type="type"
    :disabled="disabled"
    class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed"
    :class="variantClasses[variant]"
  >
    <slot />
  </Primitive>
</template>
