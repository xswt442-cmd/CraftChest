<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppIcon from '../components/AppIcon.vue'

const { t } = useI18n()
</script>

<template>
  <div
    class="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-workshop-border bg-surface/80 px-6 py-14 text-center shadow-sm md:py-20"
  >
    <span class="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
      <AppIcon name="lucide:puzzle" class="size-7" />
    </span>
    <span class="font-mono text-xs font-semibold tracking-widest text-muted-foreground">404</span>
    <h1 class="text-2xl font-bold tracking-tight text-foreground">{{ t('notFound.title') }}</h1>
    <p class="text-sm leading-relaxed text-muted-foreground">{{ t('notFound.message') }}</p>
    <RouterLink
      to="/"
      class="mt-2 rounded-lg border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:border-primary-hover hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {{ t('notFound.backHome') }}
    </RouterLink>
  </div>
</template>
