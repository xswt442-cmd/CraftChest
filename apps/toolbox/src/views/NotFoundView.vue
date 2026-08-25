<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-20 text-center">
    <p class="text-5xl" aria-hidden="true">🗃️</p>
    <h1 class="text-2xl font-bold tracking-tight text-foreground">
      {{ t('notFound.title') }}
    </h1>
    <p class="text-sm text-muted-foreground">{{ t('notFound.message') }}</p>
    <RouterLink
      to="/"
      class="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:border-primary-hover hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {{ t('notFound.backHome') }}
    </RouterLink>
  </div>
</template>
