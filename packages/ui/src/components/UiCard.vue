<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <section class="rounded-lg border border-workshop-border bg-surface-raised p-5 shadow-sm">
    <h2
      v-if="title"
      class="mb-4 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase"
    >
      {{ title }}
    </h2>
    <slot />
  </section>
</template>
