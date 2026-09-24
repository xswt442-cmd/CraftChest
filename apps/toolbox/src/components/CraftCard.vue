<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CraftEntry } from '../craft-registry'
import AppIcon from './AppIcon.vue'

defineProps<{ craft: CraftEntry }>()
const { locale } = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'zh') as 'zh' | 'en')
</script>

<template>
  <RouterLink
    :to="`/craft/${craft.meta.id}`"
    class="group relative flex min-h-40 flex-col gap-4 overflow-hidden rounded-xl border border-primary/20 bg-surface-raised/90 p-5 shadow-sm transition-[transform,border-color,box-shadow,background-color] duration-150 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary/70 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-raised hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
  >
    <div class="flex items-start gap-3">
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
        ><AppIcon :name="craft.icon" class="size-5"
      /></span>
      <div class="min-w-0 flex-1">
        <span
          class="inline-flex rounded bg-primary-soft px-1.5 py-0.5 text-[9px] font-bold tracking-[0.14em] text-primary uppercase"
          >Craft</span
        >
        <h3 class="mt-1 font-semibold tracking-tight text-foreground">
          {{ craft.meta.title[lang] }}
        </h3>
      </div>
      <AppIcon
        name="lucide:arrow-up-right"
        class="size-4 text-muted-foreground/45 transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
      />
    </div>
    <p class="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
      {{ craft.meta.description[lang] }}
    </p>
  </RouterLink>
</template>
