<script setup lang="ts">
import { computed, ref } from 'vue'
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport, SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'

import Tip from '@/components/ui/Tip.vue'
import { toast } from '@/utils/toast'

// ── Types ─────────────────────────────────────────────────────────────────────

type Section = 'Colors' | 'Typography' | 'Effects' | 'Components' | 'Icons'

interface ColorToken { id: string; name: string; value: string; group: string }
interface TypographyToken { id: string; name: string; font: string; size: string; weight: string; lineHeight: string }
interface EffectToken { id: string; name: string; description: string; value: string }
interface ComponentItem { id: string; name: string; description: string; usages: number; color: string }
interface IconItem { id: string; name: string; icon: string }

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_COLORS: ColorToken[] = [
  { id: 'c1', name: 'Primary/500', value: '#3b82f6', group: 'Primary' },
  { id: 'c2', name: 'Primary/400', value: '#60a5fa', group: 'Primary' },
  { id: 'c3', name: 'Primary/600', value: '#2563eb', group: 'Primary' },
  { id: 'c4', name: 'Neutral/900', value: '#111827', group: 'Neutral' },
  { id: 'c5', name: 'Neutral/500', value: '#6b7280', group: 'Neutral' },
  { id: 'c6', name: 'Neutral/100', value: '#f3f4f6', group: 'Neutral' },
  { id: 'c7', name: 'Success/500', value: '#10b981', group: 'Semantic' },
  { id: 'c8', name: 'Error/500', value: '#ef4444', group: 'Semantic' },
  { id: 'c9', name: 'Warning/500', value: '#f59e0b', group: 'Semantic' },
]

const MOCK_TYPOGRAPHY: TypographyToken[] = [
  { id: 't1', name: 'Heading/H1', font: 'Inter', size: '32px', weight: '700', lineHeight: '40px' },
  { id: 't2', name: 'Heading/H2', font: 'Inter', size: '24px', weight: '600', lineHeight: '32px' },
  { id: 't3', name: 'Heading/H3', font: 'Inter', size: '20px', weight: '600', lineHeight: '28px' },
  { id: 't4', name: 'Body/Regular', font: 'Inter', size: '14px', weight: '400', lineHeight: '22px' },
  { id: 't5', name: 'Body/Small', font: 'Inter', size: '12px', weight: '400', lineHeight: '18px' },
  { id: 't6', name: 'Label/Medium', font: 'Inter', size: '13px', weight: '500', lineHeight: '20px' },
]

const MOCK_EFFECTS: EffectToken[] = [
  { id: 'e1', name: 'Shadow/SM', description: 'Малая тень', value: '0 1px 2px rgba(0,0,0,0.12)' },
  { id: 'e2', name: 'Shadow/MD', description: 'Средняя тень', value: '0 4px 12px rgba(0,0,0,0.18)' },
  { id: 'e3', name: 'Shadow/LG', description: 'Большая тень', value: '0 8px 24px rgba(0,0,0,0.24)' },
  { id: 'e4', name: 'Blur/Background', description: 'Размытие фона', value: 'blur(12px)' },
]

const MOCK_COMPONENTS: ComponentItem[] = [
  { id: 'comp1', name: 'Button', description: 'Основная кнопка с вариантами', usages: 142, color: '#3b82f6' },
  { id: 'comp2', name: 'Input', description: 'Поле ввода текста', usages: 89, color: '#8b5cf6' },
  { id: 'comp3', name: 'Card', description: 'Карточка-контейнер', usages: 54, color: '#10b981' },
  { id: 'comp4', name: 'Modal', description: 'Диалоговое окно', usages: 31, color: '#f59e0b' },
  { id: 'comp5', name: 'Badge', description: 'Бейдж / метка', usages: 67, color: '#ef4444' },
  { id: 'comp6', name: 'Avatar', description: 'Аватар пользователя', usages: 28, color: '#06b6d4' },
  { id: 'comp7', name: 'Tabs', description: 'Навигационные табы', usages: 19, color: '#ec4899' },
  { id: 'comp8', name: 'Dropdown', description: 'Выпадающий список', usages: 44, color: '#84cc16' },
]

const MOCK_ICONS: IconItem[] = [
  { id: 'i1', name: 'arrow-right', icon: 'arrow-right' },
  { id: 'i2', name: 'check', icon: 'check' },
  { id: 'i3', name: 'close', icon: 'x' },
  { id: 'i4', name: 'search', icon: 'search' },
  { id: 'i5', name: 'user', icon: 'user' },
  { id: 'i6', name: 'settings', icon: 'settings' },
  { id: 'i7', name: 'bell', icon: 'bell' },
  { id: 'i8', name: 'star', icon: 'star' },
  { id: 'i9', name: 'heart', icon: 'heart' },
  { id: 'i10', name: 'home', icon: 'home' },
  { id: 'i11', name: 'mail', icon: 'mail' },
  { id: 'i12', name: 'phone', icon: 'phone' },
]

const SECTIONS: Section[] = ['Colors', 'Typography', 'Effects', 'Components', 'Icons']
const SECTION_LABELS: Record<Section, string> = {
  Colors: 'Цвета',
  Typography: 'Типографика',
  Effects: 'Эффекты',
  Components: 'Компоненты',
  Icons: 'Иконки',
}

// ── State ─────────────────────────────────────────────────────────────────────

const activeSection = ref<Section>('Colors')
const activeItemId = ref<string | null>('c1')
const collapsedSections = ref<Set<Section>>(new Set())
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')
const isDirty = ref(false)

// Edit form state
const editName = ref('')
const editValue = ref('')

const activeItem = computed(() => {
  if (!activeItemId.value) return null
  switch (activeSection.value) {
    case 'Colors': return MOCK_COLORS.find(c => c.id === activeItemId.value) ?? null
    case 'Typography': return MOCK_TYPOGRAPHY.find(t => t.id === activeItemId.value) ?? null
    case 'Effects': return MOCK_EFFECTS.find(e => e.id === activeItemId.value) ?? null
    case 'Components': return MOCK_COMPONENTS.find(c => c.id === activeItemId.value) ?? null
    case 'Icons': return MOCK_ICONS.find(i => i.id === activeItemId.value) ?? null
    default: return null
  }
})

function selectItem(id: string) {
  activeItemId.value = id
  isDirty.value = false
  const item = activeItem.value as any
  if (item) {
    editName.value = item.name
    editValue.value = item.value ?? item.font ?? item.description ?? ''
  }
}

function toggleSection(s: Section) {
  if (collapsedSections.value.has(s)) collapsedSections.value.delete(s)
  else collapsedSections.value.add(s)
}

function selectSection(s: Section) {
  activeSection.value = s
  activeItemId.value = null
  isDirty.value = false
}

function markDirty() {
  isDirty.value = true
}

function saveChanges() {
  isDirty.value = false
  toast.info('Изменения сохранены')
}

function publish() {
  toast.info('Библиотека опубликована v1.5.0')
}

const sectionCounts: Record<Section, number> = {
  Colors: MOCK_COLORS.length,
  Typography: MOCK_TYPOGRAPHY.length,
  Effects: MOCK_EFFECTS.length,
  Components: MOCK_COMPONENTS.length,
  Icons: MOCK_ICONS.length,
}

const filteredColors = computed(() =>
  MOCK_COLORS.filter(c => !searchQuery.value || c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
)
const filteredTypography = computed(() =>
  MOCK_TYPOGRAPHY.filter(t => !searchQuery.value || t.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
)
const filteredComponents = computed(() =>
  MOCK_COMPONENTS.filter(c => !searchQuery.value || c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
)
const filteredIcons = computed(() =>
  MOCK_ICONS.filter(i => !searchQuery.value || i.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
)
const filteredEffects = computed(() =>
  MOCK_EFFECTS.filter(e => !searchQuery.value || e.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
)
</script>

<template>
  <div class="flex h-full w-full flex-col overflow-hidden">
    <!-- Top bar -->
    <header class="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
      <span class="rounded border border-border px-2 py-0.5 text-[11px] font-medium text-muted">v1.4.2</span>

      <button
        class="flex items-center gap-1.5 rounded bg-accent px-2.5 py-1 text-xs font-medium text-white hover:bg-accent/80 transition-colors"
        @click="publish"
      >
        <icon-lucide-upload class="size-3.5" />
        Опубликовать
      </button>

      <div class="h-4 w-px bg-border" />

      <Tip label="Импортировать библиотеку">
        <button class="flex size-7 items-center justify-center rounded text-muted hover:bg-hover hover:text-surface transition-colors">
          <icon-lucide-download class="size-4" />
        </button>
      </Tip>

      <Tip label="Экспортировать библиотеку">
        <button class="flex size-7 items-center justify-center rounded text-muted hover:bg-hover hover:text-surface transition-colors">
          <icon-lucide-share-2 class="size-4" />
        </button>
      </Tip>

      <div class="flex-1" />

      <!-- Search -->
      <div class="flex items-center gap-1.5 rounded border border-border bg-canvas px-2 py-1 focus-within:border-accent/50 w-48">
        <icon-lucide-search class="size-3.5 shrink-0 text-muted" />
        <input
          v-model="searchQuery"
          placeholder="Поиск…"
          class="flex-1 bg-transparent text-xs text-surface outline-none placeholder:text-muted"
        />
      </div>
    </header>

    <!-- Body -->
    <SplitterGroup direction="horizontal" auto-save-id="library-layout" class="flex-1 overflow-hidden">
      <!-- Left: Tree -->
      <SplitterPanel :default-size="20" :min-size="14" :max-size="30" class="flex flex-col overflow-hidden border-r border-border bg-panel">
        <ScrollAreaRoot class="flex-1">
          <ScrollAreaViewport class="h-full py-2">
            <div
              v-for="section in SECTIONS"
              :key="section"
            >
              <!-- Section header -->
              <button
                class="flex w-full items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors"
                :class="activeSection === section ? 'text-surface' : 'text-muted hover:text-surface'"
                @click="selectSection(section)"
              >
                <icon-lucide-chevron-right
                  class="size-3 shrink-0 transition-transform"
                  :class="!collapsedSections.has(section) ? 'rotate-90' : ''"
                  @click.stop="toggleSection(section)"
                />
                <span class="flex-1 text-left">{{ SECTION_LABELS[section] }}</span>
                <span class="rounded bg-canvas px-1.5 py-0.5 text-[10px]">{{ sectionCounts[section] }}</span>
              </button>
            </div>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical" class="w-1.5">
            <ScrollAreaThumb class="rounded-full bg-border" />
          </ScrollAreaScrollbar>
        </ScrollAreaRoot>
      </SplitterPanel>

      <SplitterResizeHandle class="group relative z-10 -mx-1 w-2 cursor-col-resize">
        <div class="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
      </SplitterResizeHandle>

      <!-- Center: Content browser -->
      <SplitterPanel :default-size="55" :min-size="30" class="flex flex-col overflow-hidden bg-canvas">
        <!-- Section header + view toggle -->
        <div class="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
          <span class="flex-1 text-xs font-medium text-surface">{{ SECTION_LABELS[activeSection] }}</span>
          <span class="text-[11px] text-muted">{{ sectionCounts[activeSection] }} элементов</span>
          <div class="flex items-center gap-0.5 rounded border border-border p-0.5">
            <button
              class="rounded p-0.5 transition-colors"
              :class="viewMode === 'grid' ? 'bg-hover text-surface' : 'text-muted hover:text-surface'"
              @click="viewMode = 'grid'"
            >
              <icon-lucide-layout-grid class="size-3.5" />
            </button>
            <button
              class="rounded p-0.5 transition-colors"
              :class="viewMode === 'list' ? 'bg-hover text-surface' : 'text-muted hover:text-surface'"
              @click="viewMode = 'list'"
            >
              <icon-lucide-list class="size-3.5" />
            </button>
          </div>
        </div>

        <ScrollAreaRoot class="flex-1">
          <ScrollAreaViewport class="h-full p-3">

            <!-- Colors grid -->
            <template v-if="activeSection === 'Colors'">
              <div
                :class="viewMode === 'grid'
                  ? 'grid grid-cols-3 gap-2'
                  : 'flex flex-col gap-1'"
              >
                <button
                  v-for="color in filteredColors"
                  :key="color.id"
                  class="group rounded-lg border transition-all"
                  :class="activeItemId === color.id
                    ? 'border-accent/50 bg-hover'
                    : 'border-border hover:border-border/80 hover:bg-hover/50'"
                  @click="selectItem(color.id)"
                >
                  <template v-if="viewMode === 'grid'">
                    <div class="h-12 w-full rounded-t-lg" :style="{ backgroundColor: color.value }" />
                    <div class="px-2 py-1.5 text-left">
                      <div class="truncate text-[11px] text-surface">{{ color.name.split('/')[1] }}</div>
                      <div class="text-[10px] text-muted">{{ color.value }}</div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="flex items-center gap-2.5 px-2.5 py-2">
                      <div class="size-5 shrink-0 rounded" :style="{ backgroundColor: color.value }" />
                      <span class="flex-1 text-left text-xs text-surface">{{ color.name }}</span>
                      <span class="text-[11px] text-muted">{{ color.value }}</span>
                    </div>
                  </template>
                </button>
              </div>
            </template>

            <!-- Typography table -->
            <template v-if="activeSection === 'Typography'">
              <div class="flex flex-col gap-1">
                <div class="mb-1 grid grid-cols-5 gap-2 px-2 text-[10px] uppercase tracking-wider text-muted">
                  <span>Название</span><span>Шрифт</span><span>Размер</span><span>Насыщ.</span><span>Высота</span>
                </div>
                <button
                  v-for="t in filteredTypography"
                  :key="t.id"
                  class="grid grid-cols-5 gap-2 rounded-lg border px-2 py-2 text-left transition-all"
                  :class="activeItemId === t.id
                    ? 'border-accent/50 bg-hover'
                    : 'border-transparent hover:border-border hover:bg-hover/50'"
                  @click="selectItem(t.id)"
                >
                  <span class="truncate text-xs text-surface">{{ t.name }}</span>
                  <span class="text-xs text-muted">{{ t.font }}</span>
                  <span class="text-xs text-muted">{{ t.size }}</span>
                  <span class="text-xs text-muted">{{ t.weight }}</span>
                  <span class="text-xs text-muted">{{ t.lineHeight }}</span>
                </button>
              </div>
            </template>

            <!-- Effects -->
            <template v-if="activeSection === 'Effects'">
              <div class="flex flex-col gap-2">
                <button
                  v-for="e in filteredEffects"
                  :key="e.id"
                  class="rounded-lg border p-3 text-left transition-all"
                  :class="activeItemId === e.id
                    ? 'border-accent/50 bg-hover'
                    : 'border-border hover:bg-hover/50'"
                  @click="selectItem(e.id)"
                >
                  <div class="text-xs font-medium text-surface">{{ e.name }}</div>
                  <div class="mt-0.5 text-[11px] text-muted">{{ e.description }}</div>
                  <div class="mt-1 font-mono text-[10px] text-muted/70">{{ e.value }}</div>
                </button>
              </div>
            </template>

            <!-- Components grid -->
            <template v-if="activeSection === 'Components'">
              <div
                :class="viewMode === 'grid'
                  ? 'grid grid-cols-3 gap-3'
                  : 'flex flex-col gap-1'"
              >
                <button
                  v-for="comp in filteredComponents"
                  :key="comp.id"
                  class="rounded-lg border transition-all"
                  :class="activeItemId === comp.id
                    ? 'border-accent/50 bg-hover'
                    : 'border-border hover:bg-hover/50'"
                  @click="selectItem(comp.id)"
                >
                  <template v-if="viewMode === 'grid'">
                    <div class="flex h-16 items-center justify-center rounded-t-lg bg-panel/60">
                      <div class="rounded px-4 py-2 text-xs font-medium text-white" :style="{ backgroundColor: comp.color }">
                        {{ comp.name }}
                      </div>
                    </div>
                    <div class="px-2 py-1.5 text-left">
                      <div class="text-xs text-surface">{{ comp.name }}</div>
                      <div class="text-[10px] text-muted">{{ comp.usages }} использований</div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="flex items-center gap-2.5 px-2.5 py-2">
                      <div class="flex size-6 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white" :style="{ backgroundColor: comp.color }">
                        {{ comp.name[0] }}
                      </div>
                      <div class="flex-1 text-left">
                        <div class="text-xs text-surface">{{ comp.name }}</div>
                        <div class="text-[10px] text-muted">{{ comp.description }}</div>
                      </div>
                      <span class="text-[10px] text-muted">{{ comp.usages }}</span>
                    </div>
                  </template>
                </button>
              </div>
            </template>

            <!-- Icons grid -->
            <template v-if="activeSection === 'Icons'">
              <div
                :class="viewMode === 'grid'
                  ? 'grid grid-cols-4 gap-2'
                  : 'flex flex-col gap-1'"
              >
                <button
                  v-for="ic in filteredIcons"
                  :key="ic.id"
                  class="rounded-lg border transition-all"
                  :class="activeItemId === ic.id
                    ? 'border-accent/50 bg-hover'
                    : 'border-border hover:bg-hover/50'"
                  @click="selectItem(ic.id)"
                >
                  <template v-if="viewMode === 'grid'">
                    <div class="flex flex-col items-center gap-1.5 py-3">
                      <component :is="`icon-lucide-${ic.icon}`" class="size-5 text-surface" />
                      <span class="text-[10px] text-muted">{{ ic.name }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="flex items-center gap-2.5 px-2.5 py-2">
                      <component :is="`icon-lucide-${ic.icon}`" class="size-4 shrink-0 text-surface" />
                      <span class="text-xs text-surface">{{ ic.name }}</span>
                    </div>
                  </template>
                </button>
              </div>
            </template>

          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical" class="w-1.5">
            <ScrollAreaThumb class="rounded-full bg-border" />
          </ScrollAreaScrollbar>
        </ScrollAreaRoot>
      </SplitterPanel>

      <SplitterResizeHandle class="group relative z-10 -mx-1 w-2 cursor-col-resize">
        <div class="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
      </SplitterResizeHandle>

      <!-- Right: Edit panel -->
      <SplitterPanel :default-size="25" :min-size="18" :max-size="38" class="flex flex-col overflow-hidden border-l border-border bg-panel">
        <div v-if="!activeItem" class="flex flex-1 flex-col items-center justify-center gap-3 text-muted">
          <icon-lucide-mouse-pointer-2 class="size-8 opacity-30" />
          <p class="text-center text-xs px-4">Выберите элемент для редактирования</p>
        </div>

        <template v-else>
          <header class="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
            <span class="flex-1 text-xs font-medium text-surface truncate">{{ (activeItem as any).name }}</span>
          </header>

          <ScrollAreaRoot class="flex-1">
            <ScrollAreaViewport class="h-full p-3">
              <div class="flex flex-col gap-3">

                <!-- Color editor -->
                <template v-if="activeSection === 'Colors'">
                  <div class="flex items-center justify-center">
                    <div
                      class="h-20 w-full rounded-lg border border-border shadow-inner"
                      :style="{ backgroundColor: (activeItem as ColorToken).value }"
                    />
                  </div>
                  <div>
                    <label class="mb-1 block text-[11px] text-muted">Hex</label>
                    <input
                      :value="(activeItem as ColorToken).value"
                      class="w-full rounded border border-border bg-canvas px-2 py-1.5 font-mono text-xs text-surface outline-none focus:border-accent/50"
                      @input="markDirty"
                    />
                  </div>
                  <div>
                    <label class="mb-1 block text-[11px] text-muted">Название токена</label>
                    <input
                      :value="(activeItem as ColorToken).name"
                      class="w-full rounded border border-border bg-canvas px-2 py-1.5 text-xs text-surface outline-none focus:border-accent/50"
                      @input="markDirty"
                    />
                  </div>
                  <div>
                    <label class="mb-1 block text-[11px] text-muted">Группа</label>
                    <input
                      :value="(activeItem as ColorToken).group"
                      class="w-full rounded border border-border bg-canvas px-2 py-1.5 text-xs text-surface outline-none focus:border-accent/50"
                      @input="markDirty"
                    />
                  </div>
                </template>

                <!-- Typography editor -->
                <template v-if="activeSection === 'Typography'">
                  <div>
                    <label class="mb-1 block text-[11px] text-muted">Название</label>
                    <input :value="(activeItem as TypographyToken).name" class="w-full rounded border border-border bg-canvas px-2 py-1.5 text-xs text-surface outline-none focus:border-accent/50" @input="markDirty" />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="mb-1 block text-[11px] text-muted">Размер</label>
                      <input :value="(activeItem as TypographyToken).size" class="w-full rounded border border-border bg-canvas px-2 py-1.5 text-xs text-surface outline-none focus:border-accent/50" @input="markDirty" />
                    </div>
                    <div>
                      <label class="mb-1 block text-[11px] text-muted">Насыщенность</label>
                      <input :value="(activeItem as TypographyToken).weight" class="w-full rounded border border-border bg-canvas px-2 py-1.5 text-xs text-surface outline-none focus:border-accent/50" @input="markDirty" />
                    </div>
                    <div>
                      <label class="mb-1 block text-[11px] text-muted">Шрифт</label>
                      <input :value="(activeItem as TypographyToken).font" class="w-full rounded border border-border bg-canvas px-2 py-1.5 text-xs text-surface outline-none focus:border-accent/50" @input="markDirty" />
                    </div>
                    <div>
                      <label class="mb-1 block text-[11px] text-muted">Межстрочный</label>
                      <input :value="(activeItem as TypographyToken).lineHeight" class="w-full rounded border border-border bg-canvas px-2 py-1.5 text-xs text-surface outline-none focus:border-accent/50" @input="markDirty" />
                    </div>
                  </div>
                </template>

                <!-- Effects editor -->
                <template v-if="activeSection === 'Effects'">
                  <div>
                    <label class="mb-1 block text-[11px] text-muted">Название</label>
                    <input :value="(activeItem as EffectToken).name" class="w-full rounded border border-border bg-canvas px-2 py-1.5 text-xs text-surface outline-none focus:border-accent/50" @input="markDirty" />
                  </div>
                  <div>
                    <label class="mb-1 block text-[11px] text-muted">Описание</label>
                    <input :value="(activeItem as EffectToken).description" class="w-full rounded border border-border bg-canvas px-2 py-1.5 text-xs text-surface outline-none focus:border-accent/50" @input="markDirty" />
                  </div>
                  <div>
                    <label class="mb-1 block text-[11px] text-muted">CSS значение</label>
                    <textarea :value="(activeItem as EffectToken).value" rows="2" class="w-full resize-none rounded border border-border bg-canvas px-2 py-1.5 font-mono text-xs text-surface outline-none focus:border-accent/50" @input="markDirty" />
                  </div>
                </template>

                <!-- Component editor -->
                <template v-if="activeSection === 'Components'">
                  <div>
                    <label class="mb-1 block text-[11px] text-muted">Название</label>
                    <input :value="(activeItem as ComponentItem).name" class="w-full rounded border border-border bg-canvas px-2 py-1.5 text-xs text-surface outline-none focus:border-accent/50" @input="markDirty" />
                  </div>
                  <div>
                    <label class="mb-1 block text-[11px] text-muted">Описание</label>
                    <textarea :value="(activeItem as ComponentItem).description" rows="2" class="w-full resize-none rounded border border-border bg-canvas px-2 py-1.5 text-xs text-surface outline-none focus:border-accent/50" @input="markDirty" />
                  </div>
                  <div class="flex items-center justify-between rounded border border-border px-3 py-2">
                    <span class="text-xs text-muted">Использований</span>
                    <span class="text-xs font-medium text-surface">{{ (activeItem as ComponentItem).usages }}</span>
                  </div>
                  <button class="flex w-full items-center justify-center gap-1.5 rounded border border-border px-3 py-2 text-xs text-muted hover:bg-hover hover:text-surface transition-colors">
                    <icon-lucide-external-link class="size-3.5" />
                    Перейти к компоненту
                  </button>
                </template>

                <!-- Icon editor -->
                <template v-if="activeSection === 'Icons'">
                  <div class="flex items-center justify-center rounded-lg border border-border bg-canvas py-6">
                    <component :is="`icon-lucide-${(activeItem as IconItem).icon}`" class="size-10 text-surface" />
                  </div>
                  <div>
                    <label class="mb-1 block text-[11px] text-muted">Название</label>
                    <input :value="(activeItem as IconItem).name" class="w-full rounded border border-border bg-canvas px-2 py-1.5 text-xs text-surface outline-none focus:border-accent/50" @input="markDirty" />
                  </div>
                </template>

              </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation="vertical" class="w-1.5">
              <ScrollAreaThumb class="rounded-full bg-border" />
            </ScrollAreaScrollbar>
          </ScrollAreaRoot>

          <!-- Save button -->
          <div class="shrink-0 border-t border-border p-2">
            <button
              class="relative flex w-full items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors"
              :class="isDirty
                ? 'bg-accent text-white hover:bg-accent/80'
                : 'bg-hover text-muted cursor-not-allowed'"
              @click="isDirty && saveChanges()"
            >
              Сохранить изменения
              <span v-if="isDirty" class="absolute right-2.5 size-1.5 rounded-full bg-white/80" />
            </button>
          </div>
        </template>
      </SplitterPanel>
    </SplitterGroup>
  </div>
</template>
