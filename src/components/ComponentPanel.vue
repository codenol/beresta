<script setup lang="ts">
/**
 * ComponentPanel.vue
 *
 * Shown in the right panel when a COMPONENT node is selected.
 * Three tabs: Tokens · Rules · Code
 *
 * - Tokens: lists ArchetypeTokenBinding variable values with color swatches
 *   + "Download SCSS" button
 * - Rules: CRUD list of ComponentRule entries (markdown body, collapsible)
 * - Code: import statement + usage example + "Download .tsx" and ".scss" buttons
 */

import { ref, computed } from 'vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

import {
  libraryRegistry,
  BUILT_IN_ARCHETYPES,
  BERESTA_STANDARD_LIBRARY_ID,
  exportComponentSCSS,
  exportComponentReact,
  colorToCSS,
} from '@beresta/core'
import type { SceneNode, ArchetypeTokenBinding, ArchetypeCodeBinding } from '@beresta/core'

import { useEditorStore } from '@/stores/editor'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const { node } = defineProps<{
  node: SceneNode
}>()

const editor = useEditorStore()
const graph = computed(() => editor.graph)

type PanelTab = 'tokens' | 'rules' | 'code'
const activeTab = ref<PanelTab>('tokens')

// ---------------------------------------------------------------------------
// Archetype info
// ---------------------------------------------------------------------------

const archetypeId = computed(() => node.archetypeId ?? null)

const archetype = computed(() =>
  archetypeId.value
    ? BUILT_IN_ARCHETYPES.find((a) => a.id === archetypeId.value) ?? null
    : null
)

// ---------------------------------------------------------------------------
// Token bindings
// ---------------------------------------------------------------------------

const tokenBinding = computed<ArchetypeTokenBinding | null>(() => {
  if (!archetypeId.value) return null
  return (
    graph.value.archetypeTokenBindings.find(
      (b) => b.archetypeId === archetypeId.value
    ) ?? null
  )
})

interface TokenRow {
  cssProp: string
  variantKey: string | null
  value: string | null
  isColor: boolean
}

function resolveVar(varId: string): string | null {
  const variable = graph.value.variables.get(varId)
  if (!variable) {
    // Try looking up in the Beresta Standard library graph
    const libGraph = libraryRegistry.getGraph(BERESTA_STANDARD_LIBRARY_ID)
    if (!libGraph) return null
    const v = libGraph.variables.get(varId)
    if (!v) return null
    const col = libGraph.variableCollections.get(v.collectionId)
    if (!col) return null
    const raw = v.valuesByMode[col.defaultModeId]
    if (!raw) return null
    if (typeof raw === 'object' && 'r' in raw) return colorToCSS(raw)
    if (typeof raw === 'number') return `${raw}px`
    if (typeof raw === 'string') return raw
    return null
  }
  const col = graph.value.variableCollections.get(variable.collectionId)
  if (!col) return null
  const raw = variable.valuesByMode[col.defaultModeId]
  if (!raw) return null
  if (typeof raw === 'object' && 'r' in raw) return colorToCSS(raw)
  if (typeof raw === 'number') return `${raw}px`
  if (typeof raw === 'string') return raw
  return null
}

function isColorValue(val: string | null): boolean {
  if (!val) return false
  return val.startsWith('#') || val.startsWith('rgb')
}

const tokenRows = computed<Array<{ group: string; rows: TokenRow[] }>>(() => {
  const binding = tokenBinding.value
  if (!binding) return []

  const groups = new Map<string, TokenRow[]>()

  // Global tokens (no variant)
  if (binding.globalTokens) {
    const rows: TokenRow[] = []
    for (const [cssProp, varId] of Object.entries(binding.globalTokens)) {
      const val = resolveVar(varId)
      rows.push({ cssProp, variantKey: null, value: val, isColor: isColorValue(val) })
    }
    if (rows.length > 0) groups.set('global', rows)
  }

  // Variant tokens
  if (binding.variantTokens) {
    for (const [variantKey, props] of Object.entries(binding.variantTokens)) {
      const rows: TokenRow[] = []
      for (const [cssProp, varId] of Object.entries(props)) {
        const val = resolveVar(varId)
        rows.push({ cssProp, variantKey, value: val, isColor: isColorValue(val) })
      }
      if (rows.length > 0) groups.set(variantKey, rows)
    }
  }

  return [...groups.entries()].map(([group, rows]) => ({ group, rows }))
})

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

const rules = computed(() =>
  graph.value.componentRules.filter((r) => r.archetypeId === archetypeId.value)
)

const newRuleTitle = ref('')
const newRuleBody = ref('')
const addingRule = ref(false)

function addRule() {
  if (!archetypeId.value || !newRuleTitle.value.trim()) return
  const now = new Date().toISOString()
  const rule = {
    id: crypto.randomUUID(),
    archetypeId: archetypeId.value,
    title: newRuleTitle.value.trim(),
    body: newRuleBody.value.trim(),
    createdAt: now,
    updatedAt: now,
  }
  editor.pushUndoEntry({
    label: 'Add component rule',
    forward: () => { graph.value.componentRules.push(rule) },
    inverse: () => {
      const idx = graph.value.componentRules.findIndex((r) => r.id === rule.id)
      if (idx !== -1) graph.value.componentRules.splice(idx, 1)
    },
  })
  graph.value.componentRules.push(rule)
  newRuleTitle.value = ''
  newRuleBody.value = ''
  addingRule.value = false
}

function removeRule(id: string) {
  const idx = graph.value.componentRules.findIndex((r) => r.id === id)
  if (idx === -1) return
  const rule = graph.value.componentRules[idx]
  editor.pushUndoEntry({
    label: 'Remove component rule',
    forward: () => {
      const i = graph.value.componentRules.findIndex((r) => r.id === id)
      if (i !== -1) graph.value.componentRules.splice(i, 1)
    },
    inverse: () => { graph.value.componentRules.splice(idx, 0, rule) },
  })
  graph.value.componentRules.splice(idx, 1)
}

// ---------------------------------------------------------------------------
// Code binding
// ---------------------------------------------------------------------------

const codeBinding = computed<ArchetypeCodeBinding | null>(() => {
  if (!archetypeId.value) return null
  return (
    graph.value.archetypeCodeBindings.find(
      (b) => b.archetypeId === archetypeId.value
    ) ?? null
  )
})

const generatedUsageExample = computed(() => {
  if (codeBinding.value) return codeBinding.value.usageExample
  if (!archetype.value) return null
  const n = archetype.value.name
  const props = archetype.value.props
    .filter((p) => p.required)
    .map((p) => {
      const val = p.default !== undefined ? String(p.default) : `"…"`
      return `${p.name}={${val}}`
    })
    .join(' ')
  return `<${n}${props ? ' ' + props : ''} />`
})

// ---------------------------------------------------------------------------
// Downloads
// ---------------------------------------------------------------------------

function downloadText(content: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadSCSS() {
  if (!archetypeId.value) return
  // Use library graph if available (has Semantic collection), else document graph
  const libGraph = libraryRegistry.getGraph(BERESTA_STANDARD_LIBRARY_ID)
  const targetGraph = libGraph ?? graph.value
  const scss = exportComponentSCSS(archetypeId.value, targetGraph)
  downloadText(scss, `${archetypeId.value}.scss`, 'text/css')
}

function downloadTSX() {
  if (!archetype.value) return
  const tsx = exportComponentReact(archetype.value)
  downloadText(tsx, `${archetypeId.value}.tsx`, 'text/plain')
}

function downloadBundle() {
  downloadSCSS()
  downloadTSX()
}
</script>

<template>
  <div class="flex flex-col border-t border-border">
    <!-- Archetype badge -->
    <div class="flex items-center gap-1.5 px-3 py-2">
      <icon-lucide-component class="size-3 shrink-0 text-component" />
      <span class="text-[10px] font-semibold uppercase tracking-wide text-component">
        {{ archetype?.name ?? node.name }}
      </span>
      <span v-if="archetype" class="ml-auto text-[9px] text-muted">
        {{ archetype.category }}
      </span>
    </div>

    <!-- Tabs -->
    <TabsRoot v-model="activeTab" class="flex flex-col">
      <TabsList class="flex gap-0 border-b border-border px-3">
        <TabsTrigger
          value="tokens"
          class="border-b-2 border-transparent px-2 py-1.5 text-[10px] text-muted data-[state=active]:border-accent data-[state=active]:font-medium data-[state=active]:text-surface"
        >
          Tokens
        </TabsTrigger>
        <TabsTrigger
          value="rules"
          class="border-b-2 border-transparent px-2 py-1.5 text-[10px] text-muted data-[state=active]:border-accent data-[state=active]:font-medium data-[state=active]:text-surface"
        >
          Rules
          <span
            v-if="rules.length"
            class="ml-1 rounded-full bg-accent/20 px-1 text-[9px] text-accent"
          >
            {{ rules.length }}
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="code"
          class="border-b-2 border-transparent px-2 py-1.5 text-[10px] text-muted data-[state=active]:border-accent data-[state=active]:font-medium data-[state=active]:text-surface"
        >
          Code
        </TabsTrigger>
      </TabsList>

      <!-- ── Tokens tab ─────────────────────────────────────────────────── -->
      <TabsContent value="tokens" class="flex flex-col outline-none">
        <div v-if="tokenRows.length === 0" class="px-3 py-4 text-center text-[10px] text-muted">
          No design tokens mapped for this component.
        </div>
        <div v-else class="flex flex-col">
          <div v-for="{ group, rows } in tokenRows" :key="group">
            <!-- Group header -->
            <div class="sticky top-0 bg-surface px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-muted">
              {{ group === 'global' ? 'Global' : group }}
            </div>
            <!-- Token rows -->
            <div
              v-for="row in rows"
              :key="row.cssProp"
              class="flex items-center gap-2 px-3 py-0.5"
            >
              <!-- Color swatch -->
              <div
                v-if="row.isColor && row.value"
                class="size-3 shrink-0 rounded-sm border border-border/50"
                :style="{ background: row.value }"
              />
              <icon-lucide-hash v-else class="size-3 shrink-0 text-muted/40" />
              <span class="flex-1 truncate text-[10px] text-muted">{{ row.cssProp }}</span>
              <span class="shrink-0 text-[10px] tabular-nums text-surface">
                {{ row.value ?? '—' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Download SCSS -->
        <button
          v-if="archetypeId"
          class="mx-3 my-2 flex cursor-pointer items-center justify-center gap-1.5 rounded border border-border bg-transparent py-1.5 text-[10px] text-muted hover:bg-hover hover:text-surface"
          @click="downloadSCSS()"
        >
          <icon-lucide-download class="size-3" />
          Download {{ archetypeId }}.scss
        </button>
      </TabsContent>

      <!-- ── Rules tab ──────────────────────────────────────────────────── -->
      <TabsContent value="rules" class="flex flex-col gap-0 outline-none">
        <!-- Existing rules -->
        <div
          v-for="rule in rules"
          :key="rule.id"
          class="group border-b border-border/40 px-3 py-2"
        >
          <div class="flex items-start justify-between gap-1">
            <span class="text-[11px] font-medium text-surface">{{ rule.title }}</span>
            <button
              class="mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-transparent hover:bg-hover hover:text-error group-hover:text-muted/50"
              @click="removeRule(rule.id)"
            >
              <icon-lucide-x class="size-3" />
            </button>
          </div>
          <p v-if="rule.body" class="mt-0.5 whitespace-pre-wrap text-[10px] text-muted">
            {{ rule.body }}
          </p>
        </div>

        <!-- Empty state -->
        <div v-if="rules.length === 0 && !addingRule" class="px-3 py-4 text-center text-[10px] text-muted">
          No rules yet. Rules guide designers and LLMs on correct usage.
        </div>

        <!-- Add rule form -->
        <div v-if="addingRule" class="border-b border-border/40 px-3 py-2">
          <input
            v-model="newRuleTitle"
            class="mb-1.5 w-full rounded border border-border bg-transparent px-2 py-1 text-[11px] text-surface outline-none focus:border-accent"
            placeholder="Rule title…"
          />
          <textarea
            v-model="newRuleBody"
            class="w-full resize-none rounded border border-border bg-transparent px-2 py-1 text-[10px] text-muted outline-none focus:border-accent"
            rows="3"
            placeholder="Markdown description (optional)…"
          />
          <div class="mt-1.5 flex gap-1.5">
            <button
              class="cursor-pointer rounded bg-accent px-2.5 py-1 text-[10px] text-white hover:bg-accent/80"
              @click="addRule()"
            >
              Add
            </button>
            <button
              class="cursor-pointer rounded border border-border bg-transparent px-2.5 py-1 text-[10px] text-muted hover:bg-hover"
              @click="addingRule = false; newRuleTitle = ''; newRuleBody = ''"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Add rule button -->
        <button
          v-if="!addingRule"
          class="flex cursor-pointer items-center gap-1.5 border-none bg-transparent px-3 py-2 text-[10px] text-muted hover:text-accent"
          @click="addingRule = true"
        >
          <icon-lucide-plus class="size-3" />
          Add rule
        </button>
      </TabsContent>

      <!-- ── Code tab ───────────────────────────────────────────────────── -->
      <TabsContent value="code" class="flex flex-col gap-0 outline-none">
        <!-- Import / usage -->
        <div v-if="generatedUsageExample" class="border-b border-border/40 px-3 py-2">
          <p class="mb-1 text-[9px] font-semibold uppercase tracking-wide text-muted">Usage</p>
          <pre class="overflow-x-auto whitespace-pre-wrap rounded bg-hover px-2 py-1.5 text-[10px] text-surface">{{ generatedUsageExample }}</pre>
        </div>

        <div v-if="codeBinding" class="border-b border-border/40 px-3 py-2">
          <p class="mb-1 text-[9px] font-semibold uppercase tracking-wide text-muted">Import</p>
          <pre class="overflow-x-auto whitespace-pre-wrap rounded bg-hover px-2 py-1.5 text-[10px] text-surface">{{ codeBinding.importStatement }}</pre>
        </div>

        <div v-if="!archetypeId" class="px-3 py-4 text-center text-[10px] text-muted">
          This component is not mapped to an archetype. No code export available.
        </div>

        <!-- Download buttons -->
        <div v-if="archetypeId" class="flex flex-col gap-1.5 px-3 py-2">
          <button
            class="flex cursor-pointer items-center justify-center gap-1.5 rounded border border-border bg-transparent py-1.5 text-[10px] text-muted hover:bg-hover hover:text-surface"
            @click="downloadTSX()"
          >
            <icon-lucide-download class="size-3" />
            Download {{ archetypeId }}.tsx
          </button>
          <button
            class="flex cursor-pointer items-center justify-center gap-1.5 rounded border border-border bg-transparent py-1.5 text-[10px] text-muted hover:bg-hover hover:text-surface"
            @click="downloadSCSS()"
          >
            <icon-lucide-download class="size-3" />
            Download {{ archetypeId }}.scss
          </button>
          <button
            class="flex cursor-pointer items-center justify-center gap-1.5 rounded bg-accent/10 py-1.5 text-[10px] font-medium text-accent hover:bg-accent/20"
            @click="downloadBundle()"
          >
            <icon-lucide-archive class="size-3" />
            Download bundle (.tsx + .scss)
          </button>
        </div>
      </TabsContent>
    </TabsRoot>
  </div>
</template>
