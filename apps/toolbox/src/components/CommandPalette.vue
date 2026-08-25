<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { UiCmdPalette, type CmdPaletteGroup, type CmdPaletteItem } from '@craftchest/ui'
import AppIcon from './AppIcon.vue'
import { allTools } from '../registry'
import { loadRecentToolIds, recordRecentToolId } from '../recent-tools'

const open = defineModel<boolean>('open', { default: false })
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const recentIds = ref(loadRecentToolIds())
const lang = computed(() => (locale.value === 'en' ? 'en' : 'zh') as 'zh' | 'en')

function toolValue(tool: (typeof allTools)[number]): string {
  return `${tool.section}/${tool.id}`
}

function toItem(tool: (typeof allTools)[number]): CmdPaletteItem {
  return {
    value: toolValue(tool),
    label: tool.title[lang.value],
    description: tool.description[lang.value],
    icon: tool.icon,
    searchText: [
      tool.title.zh,
      tool.title.en,
      tool.description.zh,
      tool.description.en,
      ...tool.keywords,
    ].join(' '),
  }
}

const groups = computed<CmdPaletteGroup[]>(() => {
  const recent = recentIds.value.flatMap((id) => {
    const tool = allTools.find((candidate) => toolValue(candidate) === id)
    return tool ? [toItem(tool)] : []
  })
  const recentSet = new Set(recent.map((item) => item.value))
  const result: CmdPaletteGroup[] = []
  if (recent.length > 0) result.push({ id: 'recent', label: t('command.recent'), items: recent })
  for (const section of ['zh', 'fe'] as const) {
    result.push({
      id: section,
      label: t(`nav.sections.${section}`),
      items: allTools
        .filter((tool) => tool.section === section && !recentSet.has(toolValue(tool)))
        .map(toItem),
    })
  }
  return result.filter((group) => group.items.length > 0)
})

watch(
  () => [route.name, route.params.id],
  ([name, id]) => {
    const section = name === 'tool-zh' ? 'zh' : name === 'tool-fe' ? 'fe' : undefined
    if (section && typeof id === 'string') {
      const value = `${section}/${id}`
      if (allTools.some((tool) => toolValue(tool) === value))
        recentIds.value = recordRecentToolId(value)
    }
  },
  { immediate: true },
)

function selectTool(value: string): void {
  void router.push(`/${value}`)
}
</script>

<template>
  <UiCmdPalette
    v-model:open="open"
    :groups="groups"
    :title="t('command.title')"
    :description="t('command.description')"
    :placeholder="t('command.placeholder')"
    :empty-text="t('command.empty')"
    :select-hint="t('command.navigateHint')"
    :close-hint="t('command.closeHint')"
    @select="selectTool"
  >
    <template #item="{ item }">
      <span
        class="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-muted-foreground group-data-[highlighted]:bg-primary group-data-[highlighted]:text-primary-foreground"
      >
        <AppIcon :name="item.icon ?? 'lucide:puzzle'" class="size-4" />
      </span>
      <span class="min-w-0 flex-1">
        <b class="block truncate font-medium">{{ item.label }}</b>
        <span class="mt-0.5 block truncate text-xs text-muted-foreground">{{
          item.description
        }}</span>
      </span>
      <span
        aria-hidden="true"
        class="text-muted-foreground opacity-0 group-data-[highlighted]:opacity-100"
        >↵</span
      >
    </template>
  </UiCmdPalette>
</template>
