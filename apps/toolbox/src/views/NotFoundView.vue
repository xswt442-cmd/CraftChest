<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-20 text-center">
    <p class="text-5xl" aria-hidden="true">🗃️</p>
    <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
      {{ t('notFound.title') }}
    </h1>
    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ t('notFound.message') }}</p>
    <RouterLink
      to="/"
      class="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
    >
      {{ t('notFound.backHome') }}
    </RouterLink>
  </div>
</template>
