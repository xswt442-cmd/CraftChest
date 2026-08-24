<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <section
    class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
  >
    <h2
      v-if="title"
      class="mb-3 text-sm font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
    >
      {{ title }}
    </h2>
    <slot />
  </section>
</template>
