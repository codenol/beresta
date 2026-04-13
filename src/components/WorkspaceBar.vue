<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

import Tip from '@/components/ui/Tip.vue'

const route = useRoute()

const workspaces = [
  { label: 'Аналитика', href: '/workspace/analytics', icon: 'brain-circuit' },
  { label: 'Макеты', href: '/workspace/design', icon: 'pen-tool' },
  { label: 'Библиотека', href: '/workspace/library', icon: 'library' },
  { label: 'Preview', href: '/workspace/preview', icon: 'monitor-play' },
  { label: 'Обсуждение', href: '/workspace/discussion', icon: 'message-circle' },
  { label: 'Передача', href: '/workspace/handoff', icon: 'send' },
] as const

function isActive(href: string) {
  return route.path.startsWith(href)
}
</script>

<template>
  <nav class="flex h-full w-12 shrink-0 flex-col items-center gap-0.5 border-r border-border bg-canvas py-2">
    <Tip
      v-for="ws in workspaces"
      :key="ws.href"
      :label="ws.label"
      side="right"
    >
      <RouterLink
        :to="ws.href"
        class="flex size-9 items-center justify-center rounded-lg transition-colors"
        :class="isActive(ws.href)
          ? 'bg-accent/15 text-accent'
          : 'text-muted hover:bg-hover hover:text-surface'"
      >
        <component :is="`icon-lucide-${ws.icon}`" class="size-4" />
      </RouterLink>
    </Tip>
  </nav>
</template>
