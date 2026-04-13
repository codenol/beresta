<script setup lang="ts">
import { onMounted } from 'vue'

import WorkspaceBar from '@/components/WorkspaceBar.vue'

onMounted(() => {
  const loader = document.getElementById('loader')
  if (loader) {
    loader.classList.add('fade-out')
    setTimeout(() => loader.remove(), 300)
  }
})
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden">
    <WorkspaceBar />
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <RouterView />
    </div>
  </div>
</template>
