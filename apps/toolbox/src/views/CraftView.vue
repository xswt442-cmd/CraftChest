<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '../components/AppIcon.vue'
import ToolSkeleton from '../components/ToolSkeleton.vue'
import NotFoundView from './NotFoundView.vue'
import { findCraft } from '../craft-registry'

const props = defineProps<{ id: string }>()
const { locale } = useI18n()
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
  <div v-else class="flex flex-col gap-7">
    <header class="relative flex items-start gap-4 border-b border-workshop-border pb-5">
      <span
        class="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"
        ><AppIcon :name="craft.icon" class="size-5"
      /></span>
      <div class="min-w-0">
        <span class="block text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase"
          >Craft</span
        >
        <h1 class="mt-0.5 text-2xl font-bold tracking-[-0.02em] text-foreground">
          {{ craft.meta.title[lang] }}
        </h1>
        <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
          {{ craft.meta.description[lang] }}
        </p>
      </div>
    </header>
    <component :is="asyncCraft" :key="craft.meta.id" />
  </div>
</template>
