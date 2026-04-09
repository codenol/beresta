<script setup lang="ts">
import { ref } from 'vue'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

import { useI18n } from '@open-pencil/vue'

import { useLibraryStore } from '@/stores/library'
import { useDialogUI } from '@/components/ui/dialog'
import Tip from './ui/Tip.vue'

const open = defineModel<boolean>('open', { default: false })
const cls = useDialogUI({ content: 'flex h-[60vh] w-[520px] max-w-[90vw] flex-col' })

const { dialogs } = useI18n()
const libraryStore = useLibraryStore()

const fileInput = ref<HTMLInputElement | null>(null)
const adding = ref(false)

function triggerFileInput() {
  fileInput.value?.click()
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  adding.value = true
  await libraryStore.addLibraryFromFile(file)
  adding.value = false
  // Reset so the same file can be re-selected
  input.value = ''
}

function removeLibrary(id: string) {
  libraryStore.removeLibrary(id)
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
            {{ dialogs.designLibraries }}
          </DialogTitle>
          <DialogClose
            class="flex size-6 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted hover:bg-hover hover:text-surface"
          >
            <icon-lucide-x class="size-4" />
          </DialogClose>
        </div>

        <!-- Library list -->
        <div class="flex-1 overflow-y-auto">
          <!-- Empty state -->
          <div
            v-if="libraryStore.manifests.value.length === 0"
            class="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center"
          >
            <icon-lucide-library class="size-8 text-muted" />
            <p class="text-xs text-muted">{{ dialogs.noLibrariesYet }}</p>
          </div>

          <!-- Library rows -->
          <div
            v-for="manifest in libraryStore.manifests.value"
            :key="manifest.id"
            class="group flex items-center gap-3 border-b border-border/30 px-4 py-3 hover:bg-hover/40"
          >
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <span class="truncate text-xs font-medium text-surface">{{ manifest.name }}</span>
              <div class="flex gap-3 text-[10px] text-muted">
                <span>{{ manifest.componentCount }} {{ dialogs.libraryComponents.toLowerCase() }}</span>
                <span>{{ manifest.variableCount }} {{ dialogs.libraryVariables.toLowerCase() }}</span>
                <span>{{ manifest.styleCount }} {{ dialogs.libraryStyles.toLowerCase() }}</span>
              </div>
            </div>

            <Tip :label="dialogs.removeLibrary">
              <button
                class="flex size-6 cursor-pointer items-center justify-center rounded border-none bg-transparent text-transparent hover:bg-hover hover:text-error group-hover:text-muted"
                @click="removeLibrary(manifest.id)"
              >
                <icon-lucide-trash-2 class="size-3.5" />
              </button>
            </Tip>
          </div>
        </div>

        <!-- Error message -->
        <div
          v-if="libraryStore.error.value"
          class="shrink-0 border-t border-error/30 bg-error/10 px-4 py-2 text-xs text-error"
        >
          {{ libraryStore.error.value }}
        </div>

        <!-- Add library button -->
        <button
          class="flex w-full shrink-0 cursor-pointer items-center gap-1.5 border-t border-border bg-transparent px-4 py-2.5 text-xs text-muted hover:bg-hover hover:text-surface disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="adding"
          @click="triggerFileInput()"
        >
          <icon-lucide-loader-2 v-if="adding" class="size-3.5 animate-spin" />
          <icon-lucide-plus v-else class="size-3.5" />
          {{ dialogs.addLibrary }}
        </button>

        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept=".fig,.pen"
          class="hidden"
          @change="onFileSelected"
        />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
