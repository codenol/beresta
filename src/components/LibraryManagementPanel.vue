<script setup lang="ts">
/**
 * LibraryManagementPanel.vue
 *
 * Manages connected libraries + component ↔ archetype mapping.
 *
 * Sections:
 *  1. Connected Libraries  — list of all registered libraries (built-in + user)
 *  2. Component Mapping    — for a selected library: which components map to which archetypes
 */

import { ref, computed } from 'vue'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

import { libraryRegistry, BUILT_IN_ARCHETYPES, BERESTA_STANDARD_LIBRARY_ID } from '@beresta/core'
import type { LibraryManifest } from '@beresta/core'

import { useEditorStore } from '@/stores/editor'
import { useLibraryStore } from '@/stores/library'
import { useDialogUI } from '@/components/ui/dialog'

const open = defineModel<boolean>('open', { default: false })
const cls = useDialogUI({ content: 'flex h-[70vh] w-[640px] max-w-[92vw] flex-col' })

const editor = useEditorStore()
const libraryStore = useLibraryStore()

// ---------------------------------------------------------------------------
// Library list
// ---------------------------------------------------------------------------

const allManifests = computed<LibraryManifest[]>(() => libraryRegistry.getAll())

const selectedLibraryId = ref<string | null>(null)

const selectedLibrary = computed(() =>
  selectedLibraryId.value
    ? allManifests.value.find((m) => m.id === selectedLibraryId.value) ?? null
    : null
)

function selectLibrary(id: string) {
  selectedLibraryId.value = selectedLibraryId.value === id ? null : id
}

function isBuiltIn(id: string) {
  return id === BERESTA_STANDARD_LIBRARY_ID
}

function removeLibrary(id: string) {
  if (selectedLibraryId.value === id) selectedLibraryId.value = null
  libraryStore.removeLibrary(id)
}

// ---------------------------------------------------------------------------
// Component mapping (for selected library)
// ---------------------------------------------------------------------------

interface MappingRow {
  componentId: string
  componentName: string
  autoArchetypeId: string | null
  overrideArchetypeId: string | null
}

const mappingRows = computed<MappingRow[]>(() => {
  if (!selectedLibraryId.value) return []
  const libGraph = libraryRegistry.getGraph(selectedLibraryId.value)
  if (!libGraph) return []

  return libraryRegistry
    .getComponents(selectedLibraryId.value)
    .map(({ node }) => ({
      componentId: node.id,
      componentName: node.name,
      autoArchetypeId: node.archetypeId ?? null,
      overrideArchetypeId: node.archetypeId ?? null,
    }))
})

const archetypeOptions = computed(() => [
  { id: '', name: '— unassigned —' },
  ...BUILT_IN_ARCHETYPES.map((a) => ({ id: a.id, name: a.name })),
])

function setOverride(componentId: string, archetypeId: string) {
  // Update archetypeId directly on the node in the library graph
  const libGraph = libraryRegistry.getGraph(selectedLibraryId.value!)
  if (!libGraph) return
  const node = libGraph.getNode(componentId)
  if (node) {
    libGraph.updateNode(componentId, { archetypeId: archetypeId || undefined })
  }
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay :class="cls.overlay" />
      <DialogContent :class="cls.content">

        <!-- Header -->
        <div class="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
          <DialogTitle class="text-sm font-semibold text-surface">
            Library Management
          </DialogTitle>
          <DialogClose
            class="flex size-6 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted hover:bg-hover hover:text-surface"
          >
            <icon-lucide-x class="size-4" />
          </DialogClose>
        </div>

        <div class="flex min-h-0 flex-1 overflow-hidden">

          <!-- ── Left: Library list ──────────────────────────────────────── -->
          <div class="flex w-56 shrink-0 flex-col border-r border-border">
            <p class="shrink-0 px-4 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-wider text-muted">
              Connected Libraries
            </p>

            <!-- Empty state -->
            <div
              v-if="allManifests.length === 0"
              class="flex flex-1 items-center justify-center px-4 py-6 text-center"
            >
              <p class="text-[10px] text-muted">No libraries connected</p>
            </div>

            <!-- Library rows -->
            <div class="min-h-0 flex-1 overflow-y-auto">
              <div
                v-for="manifest in allManifests"
                :key="manifest.id"
                class="group flex cursor-pointer flex-col border-b border-border/30 px-4 py-2 hover:bg-hover/40"
                :class="{ 'bg-hover/60': selectedLibraryId === manifest.id }"
                @click="selectLibrary(manifest.id)"
              >
                <div class="flex items-center gap-1.5">
                  <icon-lucide-lock
                    v-if="isBuiltIn(manifest.id)"
                    class="size-2.5 shrink-0 text-muted/50"
                  />
                  <icon-lucide-library v-else class="size-2.5 shrink-0 text-muted/50" />
                  <span class="flex-1 truncate text-[11px] font-medium text-surface">
                    {{ manifest.name }}
                  </span>
                  <!-- Remove (non-builtin only) -->
                  <button
                    v-if="!isBuiltIn(manifest.id)"
                    class="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-transparent hover:bg-hover hover:text-error group-hover:text-muted/50"
                    @click.stop="removeLibrary(manifest.id)"
                  >
                    <icon-lucide-x class="size-3" />
                  </button>
                </div>
                <div class="flex gap-2 text-[9px] text-muted">
                  <span v-if="isBuiltIn(manifest.id)" class="font-medium text-accent/70">built-in</span>
                  <span>{{ manifest.componentCount }} components</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Right: Component mapping ───────────────────────────────── -->
          <div class="flex min-h-0 flex-1 flex-col">
            <div v-if="!selectedLibrary" class="flex flex-1 items-center justify-center">
              <p class="text-[11px] text-muted">Select a library to map components</p>
            </div>

            <template v-else>
              <div class="shrink-0 border-b border-border px-4 py-2">
                <p class="text-[11px] font-semibold text-surface">{{ selectedLibrary.name }}</p>
                <p class="text-[10px] text-muted">
                  Map components to archetypes so Beresta can reference them in AI sessions and code export.
                </p>
              </div>

              <!-- Table header -->
              <div class="grid shrink-0 grid-cols-[1fr_140px] border-b border-border/50 px-4 py-1">
                <span class="text-[9px] font-semibold uppercase tracking-wider text-muted">Component</span>
                <span class="text-[9px] font-semibold uppercase tracking-wider text-muted">Archetype</span>
              </div>

              <!-- Table rows -->
              <div class="min-h-0 flex-1 overflow-y-auto">
                <div
                  v-for="row in mappingRows"
                  :key="row.componentId"
                  class="grid grid-cols-[1fr_140px] items-center border-b border-border/30 px-4 py-1.5"
                >
                  <!-- Component name + auto-match indicator -->
                  <div class="flex min-w-0 items-center gap-1.5 pr-3">
                    <span
                      class="size-1.5 shrink-0 rounded-full"
                      :class="row.autoArchetypeId ? 'bg-green-500' : 'bg-border'"
                    />
                    <span class="truncate text-[11px] text-surface">{{ row.componentName }}</span>
                  </div>

                  <!-- Archetype select -->
                  <select
                    :value="row.overrideArchetypeId ?? ''"
                    class="w-full rounded border border-border bg-transparent px-1.5 py-0.5 text-[10px] text-surface outline-none focus:border-accent"
                    @change="(e) => setOverride(row.componentId, (e.target as HTMLSelectElement).value)"
                  >
                    <option v-for="opt in archetypeOptions" :key="opt.id" :value="opt.id">
                      {{ opt.name }}
                    </option>
                  </select>
                </div>

                <div v-if="mappingRows.length === 0" class="px-4 py-6 text-center text-[10px] text-muted">
                  No components found in this library.
                </div>
              </div>

              <!-- Legend -->
              <div class="shrink-0 border-t border-border/30 px-4 py-2">
                <div class="flex items-center gap-3 text-[9px] text-muted">
                  <span class="flex items-center gap-1">
                    <span class="size-1.5 rounded-full bg-green-500" /> auto-matched
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="size-1.5 rounded-full bg-border" /> unmatched
                  </span>
                </div>
              </div>
            </template>
          </div>

        </div>

      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
