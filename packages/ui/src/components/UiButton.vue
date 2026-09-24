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
    'border border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/15 hover:border-primary-hover hover:bg-primary-hover hover:shadow-md hover:shadow-primary/15 active:translate-y-px disabled:border-workshop-border disabled:bg-surface-muted disabled:text-muted-foreground',
  secondary:
    'border border-workshop-border bg-surface-raised text-foreground shadow-sm hover:border-workshop-border-strong hover:bg-surface-muted active:translate-y-px disabled:text-muted-foreground',
}
</script>

<template>
  <Primitive
    as="button"
    :type="type"
    :disabled="disabled"
    class="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:shadow-none"
    :class="variantClasses[variant]"
  >
    <slot />
  </Primitive>
</template>
