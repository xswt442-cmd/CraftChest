<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <section
    class="rounded-xl border border-workshop-border bg-surface-raised/95 p-5 shadow-[0_1px_2px_var(--shadow-color),0_10px_30px_color-mix(in_oklch,var(--shadow-color),transparent_52%)] md:p-6"
  >
    <h2 v-if="title" class="mb-4 text-sm font-semibold tracking-tight text-foreground">
      {{ title }}
    </h2>
    <slot />
  </section>
</template>
