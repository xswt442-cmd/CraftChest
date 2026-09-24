<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'
import LocaleToggle from './LocaleToggle.vue'
import ThemeToggle from './ThemeToggle.vue'
import { sections } from '../registry'
import { allCrafts } from '../craft-registry'

// 移动端抽屉开关；桌面端常驻（md: 起静态布局）
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ command: [] }>()

const { t, locale } = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'zh') as 'zh' | 'en')
const desktop = ref(false)
const navInteractive = computed(() => desktop.value || open.value)

let desktopMedia: MediaQueryList | undefined
function syncDesktop(event: MediaQueryList | MediaQueryListEvent): void {
  desktop.value = event.matches
}

onMounted(() => {
  desktopMedia = window.matchMedia('(min-width: 768px)')
  syncDesktop(desktopMedia)
  desktopMedia.addEventListener('change', syncDesktop)
})

onBeforeUnmount(() => desktopMedia?.removeEventListener('change', syncDesktop))

const groups = [
  { section: 'zh' as const, icon: 'lucide:languages' },
  { section: 'fe' as const, icon: 'lucide:puzzle' },
]
</script>

<template>
  <!-- 移动端遮罩 -->
  <div
    v-if="open"
    class="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] md:hidden"
    @click="open = false"
  />

  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-workshop-border/80 bg-surface/94 shadow-[0_12px_40px_color-mix(in_oklch,var(--shadow-color),transparent_35%)] backdrop-blur-xl transition-transform duration-200 md:translate-x-0 md:shadow-none"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
    :aria-hidden="!navInteractive"
    :inert="!navInteractive"
  >
    <div class="flex h-[4.25rem] items-center gap-3 border-b border-workshop-border/80 px-4">
      <span
        class="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20"
        aria-hidden="true"
      >
        <AppIcon name="lucide:package-open" class="size-5" />
      </span>
      <div class="min-w-0">
        <RouterLink to="/" class="block font-semibold tracking-tight text-foreground">
          CraftChest
        </RouterLink>
        <span
          class="block text-[9px] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
          >Workbench</span
        >
      </div>
      <button
        type="button"
        class="ml-auto cursor-pointer rounded-md p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
        :aria-label="t('nav.closeMenu')"
        @click="open = false"
      >
        <AppIcon name="lucide:x" class="size-5" />
      </button>
    </div>

    <nav class="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      <button
        type="button"
        class="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg border border-workshop-border/90 bg-surface-raised px-3.5 py-2 text-sm text-muted-foreground shadow-sm transition-[border-color,background-color,color,box-shadow] hover:border-primary/35 hover:bg-primary-soft/70 hover:text-foreground hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        @click="emit('command')"
      >
        <AppIcon name="lucide:search" class="size-4" />
        <span>{{ t('command.shortcut') }}</span>
        <kbd
          class="ml-auto rounded border border-workshop-border bg-surface-muted px-1.5 py-0.5 text-[9px] text-muted-foreground"
          >Ctrl K</kbd
        >
      </button>

      <RouterLink
        to="/"
        class="flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&.router-link-exact-active]:bg-primary-soft [&.router-link-exact-active]:text-primary"
      >
        <AppIcon name="lucide:house" class="size-4" />
        {{ t('nav.home') }}
      </RouterLink>

      <div>
        <p
          class="flex items-center gap-2 px-3 pb-2 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
        >
          <span class="size-1.5 rounded-full bg-primary" /><span>Craft</span
          ><span class="tracking-normal">·</span>{{ t('nav.crafts') }}
        </p>
        <ul>
          <li v-for="craft in allCrafts" :key="craft.meta.id">
            <RouterLink
              :to="`/craft/${craft.meta.id}`"
              class="flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&.router-link-active]:bg-primary-soft/75 [&.router-link-active]:font-medium [&.router-link-active]:text-primary"
              ><AppIcon :name="craft.icon" class="size-4 shrink-0 opacity-70" /><span
                class="truncate"
                >{{ craft.meta.title[lang] }}</span
              ></RouterLink
            >
          </li>
        </ul>
      </div>

      <div>
        <p
          class="flex items-center gap-2 px-3 pb-2 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
        >
          <span class="size-1.5 rounded-full bg-surface-muted" />
          <span>Chest</span>
          <span class="tracking-normal">·</span>
          {{ t('nav.chest') }}
        </p>
        <div v-for="group in groups" :key="group.section" class="mb-3">
          <p
            class="flex items-center gap-2 px-3 pb-1.5 text-[9px] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
          >
            <span
              class="size-1.5 rounded-full"
              :class="group.section === 'zh' ? 'bg-section-zh' : 'bg-section-fe'"
            />
            <span>{{ group.section.toUpperCase() }}</span>
            <span class="tracking-normal">·</span>
            {{ t(`nav.sections.${group.section}`) }}
          </p>
          <ul>
            <li v-for="tool in sections[group.section]" :key="tool.id">
              <RouterLink
                :to="`/${tool.section}/${tool.id}`"
                class="flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&.router-link-active]:bg-primary-soft/75 [&.router-link-active]:font-medium [&.router-link-active]:text-primary"
              >
                <AppIcon :name="tool.icon" class="size-4 shrink-0 opacity-70" />
                <span class="truncate">{{ tool.title[lang] }}</span>
              </RouterLink>
            </li>
            <li
              v-if="sections[group.section].length === 0"
              class="px-3 py-1.5 text-xs text-muted-foreground/45"
            >
              ···
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div
      class="flex items-center justify-between border-t border-workshop-border/80 bg-surface/70 px-3 py-3"
    >
      <div class="flex items-center gap-1">
        <ThemeToggle />
        <LocaleToggle />
      </div>
      <span
        class="rounded border border-workshop-border px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-muted-foreground/60"
        >MIT</span
      >
    </div>
  </aside>
</template>
