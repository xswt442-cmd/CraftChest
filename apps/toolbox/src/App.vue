<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppIcon from './components/AppIcon.vue'
import LocaleToggle from './components/LocaleToggle.vue'
import SidebarNav from './components/SidebarNav.vue'
import { findTool } from './registry'

const route = useRoute()
const { locale, t } = useI18n()

const navOpen = ref(false)
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
    if (typeof route.params.section === 'string' && typeof route.params.id === 'string') {
      const tool = findTool(route.params.section as 'zh' | 'fe', route.params.id)
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
</script>

<template>
  <div class="min-h-dvh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
    <SidebarNav v-model="navOpen" />

    <div class="flex min-h-dvh flex-col md:pl-64">
      <!-- 移动端顶栏 -->
      <header
        class="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-900/90"
      >
        <button
          type="button"
          class="cursor-pointer rounded p-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          aria-label="Menu"
          @click="navOpen = true"
        >
          <AppIcon name="lucide:menu" class="size-5" />
        </button>
        <span class="text-base font-semibold tracking-tight">📦 CraftChest</span>
        <span class="ml-auto"><LocaleToggle /></span>
      </header>

      <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-10">
        <RouterView />
      </main>
    </div>
  </div>
</template>
