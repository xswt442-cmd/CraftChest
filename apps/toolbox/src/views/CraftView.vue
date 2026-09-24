<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '../components/AppIcon.vue'
import ToolSkeleton from '../components/ToolSkeleton.vue'
import NotFoundView from './NotFoundView.vue'
import { findCraft } from '../craft-registry'

const props = defineProps<{ id: string }>()
const { locale, t } = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'zh') as 'zh' | 'en')
const craft = computed(() => findCraft(props.id))
const asyncCraft = computed(() =>
  craft.value
    ? defineAsyncComponent({
        loader: craft.value.component,
        loadingComponent: ToolSkeleton,
        delay: 80,
      })
    : null,
)
</script>

<template>
  <NotFoundView v-if="craft === undefined" />
  <div v-else class="flex flex-col gap-8">
    <header class="relative flex items-start gap-4 border-b border-workshop-border/80 pb-6">
      <span
        class="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary shadow-sm"
        ><AppIcon :name="craft.icon" class="size-5"
      /></span>
      <div class="min-w-0">
        <p class="text-xs font-semibold tracking-wide text-primary">{{ t('nav.crafts') }}</p>
        <h1 class="mt-1 text-3xl font-bold tracking-[-0.035em] text-foreground md:text-4xl">
          {{ craft.meta.title[lang] }}
        </h1>
        <p class="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {{ craft.meta.description[lang] }}
        </p>
      </div>
    </header>
    <component :is="asyncCraft" :key="craft.meta.id" />
  </div>
</template>
