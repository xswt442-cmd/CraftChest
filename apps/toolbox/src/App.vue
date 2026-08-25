<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppIcon from './components/AppIcon.vue'
import CommandPalette from './components/CommandPalette.vue'
import LocaleToggle from './components/LocaleToggle.vue'
import SidebarNav from './components/SidebarNav.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import { findTool } from './registry'

const route = useRoute()
const { locale, t } = useI18n()

const navOpen = ref(false)
const commandOpen = ref(false)
watch(
  () => route.fullPath,
  () => (navOpen.value = false),
)

// 文档标题随路由与语言更新
watch(
  [() => route.name, () => locale.value],
  () => {
    const base = 'CraftChest'
    if (route.name === 'home') {
      document.title = `${t('app.tagline')} · ${base}`
      return
    }
    const section = route.name === 'tool-zh' ? 'zh' : route.name === 'tool-fe' ? 'fe' : undefined
    if (section && typeof route.params.id === 'string') {
      const tool = findTool(section, route.params.id)
      if (tool) {
        const title = tool.title[locale.value === 'en' ? 'en' : 'zh']
        document.title = `${title} · ${base}`
        return
      }
    }
    document.title = base
  },
  { immediate: true },
)

function handleCommandShortcut(event: KeyboardEvent): void {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    commandOpen.value = !commandOpen.value
  }
}

onMounted(() => window.addEventListener('keydown', handleCommandShortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', handleCommandShortcut))
</script>

<template>
  <div class="app-canvas min-h-dvh bg-canvas text-foreground">
    <SidebarNav v-model="navOpen" @command="commandOpen = true" />
    <CommandPalette v-model:open="commandOpen" />

    <div class="flex min-h-dvh flex-col md:pl-64">
      <!-- 移动端顶栏 -->
      <header
        class="sticky top-0 z-30 flex h-13 items-center gap-3 border-b border-workshop-border bg-surface/92 px-4 backdrop-blur-md md:hidden"
      >
        <button
          type="button"
          class="cursor-pointer rounded-md p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label="Menu"
          @click="navOpen = true"
        >
          <AppIcon name="lucide:menu" class="size-5" />
        </button>
        <span class="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span
            class="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <AppIcon name="lucide:package-open" class="size-4" />
          </span>
          CraftChest
        </span>
        <button
          type="button"
          class="ml-auto cursor-pointer rounded-md p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :aria-label="t('command.title')"
          @click="commandOpen = true"
        >
          <AppIcon name="lucide:search" class="size-5" />
        </button>
        <ThemeToggle />
        <LocaleToggle />
      </header>

      <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10 lg:px-10">
        <RouterView />
      </main>
    </div>
  </div>
</template>
