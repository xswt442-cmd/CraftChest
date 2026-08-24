<script setup lang="ts">
import { computed } from 'vue'
import { fallbackIcon, toolIcons } from '../icons'

const props = defineProps<{
  /** iconify 图标名，如 'lucide:banknote'；未登记的回退占位 */
  name: string
}>()

const component = computed(() => toolIcons[props.name] ?? fallbackIcon)
</script>

<template>
  <component :is="component" />
</template>
