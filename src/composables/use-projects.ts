import { computed, ref, watch } from 'vue'
import {
  workspacePath,
  readBerestaJson,
  writeBerestaJson,
  ensureWorkspaceStructure,
} from './use-workspace-fs'

// ── Types ─────────────────────────────────────────────────────────────────────

export type PipelineStep = 'analytics' | 'design' | 'discussion' | 'handoff'

export const PIPELINE_STEPS: { key: PipelineStep; label: string; index: number }[] = [
  { key: 'analytics',  label: 'Аналитика',  index: 0 },
  { key: 'design',     label: 'Макеты',     index: 1 },
  { key: 'discussion', label: 'Обсуждение', index: 2 },
  { key: 'handoff',    label: 'Передача',   index: 3 },
]

export interface Feature {
  id: string
  title: string
  completedSteps: PipelineStep[]
}

export interface Screen {
  id: string
  title: string
  features: Feature[]
}

export interface Product {
  id: string
  title: string
  screens: Screen[]
}

export interface ProjectContext {
  productId: string
  screenId: string
  featureId: string
}

// ── Singleton state ────────────────────────────────────────────────────────────

const LS_PRODUCTS = 'bereста:products'
const LS_CONTEXT  = 'bereста:context'

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LS_PRODUCTS)
    return raw ? (JSON.parse(raw) as Product[]) : defaultProducts()
  } catch {
    return defaultProducts()
  }
}

function loadContext(): ProjectContext | null {
  try {
    const raw = localStorage.getItem(LS_CONTEXT)
    return raw ? (JSON.parse(raw) as ProjectContext) : null
  } catch {
    return null
  }
}

function defaultProducts(): Product[] {
  return [
    {
      id: 'p1',
      title: 'Мобильное приложение',
      screens: [
        {
          id: 's1',
          title: 'Каталог',
          features: [
            { id: 'f1', title: 'Карточка товара',                    completedSteps: ['analytics', 'design'] },
            { id: 'f2', title: 'Фильтры и сортировка',               completedSteps: ['analytics', 'design', 'discussion', 'handoff'] },
            { id: 'f3', title: 'Пагинация / бесконечная прокрутка',  completedSteps: [] },
          ],
        },
        {
          id: 's2',
          title: 'Корзина',
          features: [
            { id: 'f4', title: 'Список товаров', completedSteps: ['analytics'] },
            { id: 'f5', title: 'Промокод',       completedSteps: [] },
          ],
        },
      ],
    },
    {
      id: 'p2',
      title: 'Веб-дашборд',
      screens: [
        {
          id: 's3',
          title: 'Главная',
          features: [
            { id: 'f6', title: 'Метрики DAU/MAU',   completedSteps: [] },
            { id: 'f7', title: 'Когортный retention', completedSteps: [] },
          ],
        },
      ],
    },
  ]
}

const products = ref<Product[]>(loadProducts())
const context  = ref<ProjectContext | null>(loadContext())

// Persist to localStorage
watch(products, (val) => localStorage.setItem(LS_PRODUCTS, JSON.stringify(val)), { deep: true })
watch(context,  (val) => localStorage.setItem(LS_CONTEXT,  JSON.stringify(val)))

// ── Disk sync (Tauri only) ────────────────────────────────────────────────────

let saveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleDiskSave() {
  if (!workspacePath.value) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    const root = workspacePath.value
    if (!root) return
    await writeBerestaJson(root, products.value)
    await ensureWorkspaceStructure(root, products.value)
  }, 800)
}

watch(products, scheduleDiskSave, { deep: true })

/** Load products from disk into the store (call after setting workspacePath) */
async function loadFromDisk(rootPath: string): Promise<boolean> {
  const loaded = await readBerestaJson(rootPath)
  if (!loaded) return false
  products.value = loaded
  return true
}

/** Open a workspace folder (sets workspacePath and loads data) */

// ── Composable ────────────────────────────────────────────────────────────────

export function useProjects() {
  // ── Lookup helpers ──────────────────────────────────────────────────────────

  function findProduct(id: string) {
    return products.value.find(p => p.id === id) ?? null
  }
  function findScreen(productId: string, screenId: string) {
    return findProduct(productId)?.screens.find(s => s.id === screenId) ?? null
  }
  function findFeature(productId: string, screenId: string, featureId: string) {
    return findScreen(productId, screenId)?.features.find(f => f.id === featureId) ?? null
  }

  // ── Current context ─────────────────────────────────────────────────────────

  const currentProduct = computed(() =>
    context.value ? findProduct(context.value.productId) : null
  )
  const currentScreen = computed(() =>
    context.value ? findScreen(context.value.productId, context.value.screenId) : null
  )
  const currentFeature = computed(() =>
    context.value
      ? findFeature(context.value.productId, context.value.screenId, context.value.featureId)
      : null
  )

  function setContext(productId: string, screenId: string, featureId: string) {
    context.value = { productId, screenId, featureId }
  }

  function clearContext() {
    context.value = null
  }

  // ── Step helpers ────────────────────────────────────────────────────────────

  function stepIndex(step: PipelineStep): number {
    return PIPELINE_STEPS.find(s => s.key === step)?.index ?? -1
  }

  function lastCompletedStep(feature: Feature): PipelineStep | null {
    if (feature.completedSteps.length === 0) return null
    return feature.completedSteps.reduce((a, b) =>
      stepIndex(a) > stepIndex(b) ? a : b
    )
  }

  function stepProgress(feature: Feature): number {
    const last = lastCompletedStep(feature)
    if (!last) return 0
    return (stepIndex(last) + 1) / PIPELINE_STEPS.length
  }

  function isStepCompleted(feature: Feature, step: PipelineStep): boolean {
    return feature.completedSteps.includes(step)
  }

  /** Mark a step as visited/completed (only advances, never removes) */
  function markStepVisited(productId: string, screenId: string, featureId: string, step: PipelineStep) {
    const feature = findFeature(productId, screenId, featureId)
    if (!feature) return
    if (!feature.completedSteps.includes(step)) {
      feature.completedSteps.push(step)
    }
  }

  // ── CRUD ────────────────────────────────────────────────────────────────────

  function addProduct(title: string): Product {
    const product: Product = { id: `p-${Date.now()}`, title, screens: [] }
    products.value.push(product)
    return product
  }

  function addScreen(productId: string, title: string): Screen | null {
    const product = findProduct(productId)
    if (!product) return null
    const screen: Screen = { id: `s-${Date.now()}`, title, features: [] }
    product.screens.push(screen)
    return screen
  }

  function addFeature(productId: string, screenId: string, title: string): Feature | null {
    const screen = findScreen(productId, screenId)
    if (!screen) return null
    const feature: Feature = { id: `f-${Date.now()}`, title, completedSteps: [] }
    screen.features.push(feature)
    return feature
  }

  function deleteProduct(productId: string) {
    const i = products.value.findIndex(p => p.id === productId)
    if (i !== -1) products.value.splice(i, 1)
    if (context.value?.productId === productId) context.value = null
  }

  function deleteScreen(productId: string, screenId: string) {
    const product = findProduct(productId)
    if (!product) return
    const i = product.screens.findIndex(s => s.id === screenId)
    if (i !== -1) product.screens.splice(i, 1)
    if (context.value?.productId === productId && context.value.screenId === screenId) {
      context.value = null
    }
  }

  function deleteFeature(productId: string, screenId: string, featureId: string) {
    const screen = findScreen(productId, screenId)
    if (!screen) return
    const i = screen.features.findIndex(f => f.id === featureId)
    if (i !== -1) screen.features.splice(i, 1)
    if (context.value?.featureId === featureId) context.value = null
  }

  return {
    products,
    context,
    workspacePath,
    currentProduct,
    currentScreen,
    currentFeature,
    setContext,
    clearContext,
    findProduct,
    findScreen,
    findFeature,
    lastCompletedStep,
    stepProgress,
    isStepCompleted,
    markStepVisited,
    addProduct,
    addScreen,
    addFeature,
    deleteProduct,
    deleteScreen,
    deleteFeature,
    loadFromDisk,
    PIPELINE_STEPS,
  }
}
