<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CraftEntry } from '../craft-registry'
import AppIcon from './AppIcon.vue'

withDefaults(defineProps<{ craft: CraftEntry; compact?: boolean }>(), {
  compact: false,
})

const { locale } = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'zh') as 'zh' | 'en')
</script>

<template>
  <RouterLink
    :to="`/craft/${craft.meta.id}`"
    class="group relative isolate overflow-hidden rounded-[1.4rem] border border-workshop-border bg-surface-raised shadow-sm transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    :class="
      compact
        ? 'min-h-40'
        : 'grid min-h-[17rem] grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,0.72fr)]'
    "
  >
    <div class="relative z-10 flex min-w-0 flex-col items-start p-5 md:p-6">
      <div class="flex w-full items-start gap-3">
        <span
          class="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-transform duration-200 group-hover:scale-105"
        >
          <AppIcon :name="craft.icon" class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <span class="text-[10px] font-semibold tracking-[0.17em] text-primary uppercase">
            CRAFT / RECIPE
          </span>
          <h3 class="mt-1 text-base font-semibold tracking-tight text-foreground md:text-lg">
            {{ craft.meta.title[lang] }}
          </h3>
        </div>
        <span
          class="grid size-8 shrink-0 place-items-center rounded-full border border-workshop-border text-muted-foreground transition-[background-color,color,border-color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-primary/20 group-hover:bg-primary-soft group-hover:text-primary"
        >
          <AppIcon name="lucide:arrow-up-right" class="size-4" />
        </span>
      </div>

      <p class="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
        {{ craft.meta.description[lang] }}
      </p>

      <div class="mt-auto flex items-center gap-2 pt-5 text-xs font-semibold text-foreground/75">
        <span>{{
          craft.meta.id === 'app-icon' ? 'PNG · ICO · PWA' : 'CSS · TAILWIND · DTCG'
        }}</span>
      </div>
    </div>

    <div
      v-if="!compact"
      class="craft-card-art relative flex min-h-36 items-center justify-center overflow-hidden sm:min-h-full"
      aria-hidden="true"
    >
      <template v-if="craft.meta.id === 'app-icon'">
        <div
          class="absolute top-[18%] left-[18%] size-16 rotate-[-12deg] rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 opacity-50 shadow-lg"
        />
        <div
          class="absolute right-[16%] bottom-[17%] size-20 rotate-[12deg] rounded-[1.6rem] bg-gradient-to-br from-rose-300 to-orange-400 opacity-55 shadow-xl"
        />
        <div
          class="relative grid size-24 place-items-center rounded-[1.8rem] bg-gradient-to-br from-orange-400 via-orange-500 to-rose-600 text-white shadow-2xl shadow-orange-900/20 ring-1 ring-white/35 transition-transform duration-300 group-hover:rotate-[-5deg] group-hover:scale-105"
        >
          <AppIcon :name="craft.icon" class="size-11 drop-shadow-md" />
          <span
            class="absolute -right-3 -bottom-2 rounded-lg border border-white/60 bg-white/90 px-2 py-1 font-mono text-[9px] font-semibold text-slate-700 shadow-lg"
            >512 PX</span
          >
        </div>
      </template>

      <template v-else>
        <div
          class="craft-art-grid flex w-[82%] flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-3 shadow-xl shadow-slate-900/5 backdrop-blur-sm transition-transform duration-300 group-hover:rotate-[-2deg] group-hover:scale-[1.03]"
        >
          <div class="grid grid-cols-6 gap-1.5">
            <span class="h-7 rounded-md bg-[#f4e6d2]" />
            <span class="h-7 rounded-md bg-[#e9cba8]" />
            <span class="h-7 rounded-md bg-[#dba96c]" />
            <span class="h-7 rounded-md bg-[#bf813f]" />
            <span class="h-7 rounded-md bg-[#80512f]" />
            <span class="h-7 rounded-md bg-[#412c27]" />
          </div>
          <div
            class="h-14 rounded-xl bg-gradient-to-r from-orange-400 via-rose-400 to-violet-500 shadow-inner"
          />
          <div class="flex items-center justify-between px-0.5">
            <span class="h-1.5 w-12 rounded-full bg-slate-300" />
            <span class="flex gap-1.5">
              <i class="size-3 rounded-full bg-orange-400" />
              <i class="size-3 rounded-full bg-rose-400" />
              <i class="size-3 rounded-full bg-violet-400" />
            </span>
          </div>
        </div>
        <span
          class="absolute right-3 bottom-4 rounded-md border border-white/50 bg-white/75 px-2 py-1 font-mono text-[8px] tracking-wider text-slate-500 shadow-sm"
          >COLOR SYSTEM</span
        >
      </template>
    </div>
  </RouterLink>
</template>
