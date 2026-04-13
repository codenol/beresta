<script setup lang="ts">
/**
 * LibraryMissingBanner.vue
 *
 * Shown when the current document references URL libraries that are not
 * currently registered in libraryRegistry.  Offers a "Connect all" action.
 */
import { computed, ref } from 'vue'
import { libraryRegistry } from '@beresta/core'
import { useEditorStore } from '@/stores/editor'
import { addLibraryFromUrl } from '@/stores/library-url'

const editor = useEditorStore()

const dismissed = ref(false)
const connecting = ref(false)

const missingRefs = computed(() => {
  const graph = editor.graph
  if (!graph?.libraryRefs?.length) return []
  return graph.libraryRefs.filter(
    (ref) => ref.type === 'url' && ref.url && !libraryRegistry.has(ref.id)
  )
})

const show = computed(() => !dismissed.value && missingRefs.value.length > 0)

async function connectAll() {
  connecting.value = true
  try {
    for (const ref of missingRefs.value) {
      if (ref.url) {
        await addLibraryFromUrl(ref.url, ref.name)
      }
    }
    dismissed.value = true
  } finally {
    connecting.value = false
  }
}
</script>

<template>
  <div
    v-if="show"
    class="flex items-center gap-3 border-b border-border bg-surface/80 px-4 py-2 backdrop-blur-sm"
    data-test-id="library-missing-banner"
  >
    <icon-lucide-library class="size-4 shrink-0 text-accent" />
    <span class="flex-1 text-[11px] text-surface">
      This document uses
      <span class="font-semibold">{{ missingRefs.length }}</span>
      {{ missingRefs.length === 1 ? 'library' : 'libraries' }} not connected to your workspace.
    </span>
    <button
      class="rounded bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-accent/25 disabled:opacity-50"
      :disabled="connecting"
      @click="connectAll"
    >
      {{ connecting ? 'Connecting…' : 'Connect all' }}
    </button>
    <button
      class="flex size-5 items-center justify-center rounded border-none bg-transparent text-muted hover:bg-hover hover:text-surface"
      @click="dismissed = true"
    >
      <icon-lucide-x class="size-3.5" />
    </button>
  </div>
</template>
