<script setup lang="ts">
import { computed, ref } from 'vue'
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport, SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'

import Tip from '@/components/ui/Tip.vue'
import { toast } from '@/utils/toast'
import { useProjects } from '@/composables/use-projects'
import { useWorkspaceFs, writeFeatureFile } from '@/composables/use-workspace-fs'

const { context, workspacePath } = useProjects()
const { isDesktop } = useWorkspaceFs()

async function saveDiscussionMd() {
  if (!workspacePath.value || !context.value) {
    toast.error('Нет рабочей папки или контекста фичи')
    return
  }
  const lines: string[] = ['# Discussion\n']
  for (const c of comments.value) {
    lines.push(`## #${c.number} [${c.resolved ? 'resolved' : 'open'}] — ${c.author} (${c.time})`)
    lines.push(`**Page:** ${c.page}\n`)
    lines.push(c.text)
    if (c.replies.length) {
      for (const r of c.replies) {
        lines.push(`\n> **${r.author}** (${r.time}): ${r.text}`)
      }
    }
    lines.push('')
  }
  const { productId, screenId, featureId } = context.value
  await writeFeatureFile(workspacePath.value, productId, screenId, featureId, 'discussion.md', lines.join('\n'))
  toast.success('discussion.md сохранён')
}

// ── Mock data ─────────────────────────────────────────────────────────────────

interface Reply {
  id: string
  author: string
  avatar: string
  text: string
  time: string
}

interface Comment {
  id: string
  number: number
  author: string
  avatar: string
  text: string
  time: string
  page: string
  top: number   // % position on mock canvas
  left: number  // % position on mock canvas
  resolved: boolean
  replies: Reply[]
}

const MOCK_TEAM = [
  { name: 'Алексей К.', avatar: 'АК', color: 'bg-violet-500' },
  { name: 'Марина С.', avatar: 'МС', color: 'bg-blue-500' },
  { name: 'Дмитрий Л.', avatar: 'ДЛ', color: 'bg-emerald-500' },
]

const comments = ref<Comment[]>([
  {
    id: 'c1', number: 1,
    author: 'Алексей К.', avatar: 'АК', page: 'Главная',
    text: 'Кнопка "Продолжить" слишком маленькая для мобильного. Минимум 44px по высоте.',
    time: '10:14', resolved: false,
    top: 38, left: 62,
    replies: [
      { id: 'r1', author: 'Марина С.', avatar: 'МС', text: 'Согласна, поправлю сегодня.', time: '10:22' },
      { id: 'r2', author: 'Алексей К.', avatar: 'АК', text: 'Спасибо!', time: '10:23' },
    ],
  },
  {
    id: 'c2', number: 2,
    author: 'Марина С.', avatar: 'МС', page: 'Главная',
    text: 'Отступ между блоками 24px или 32px? Надо унифицировать с дизайн-системой.',
    time: '11:05', resolved: false,
    top: 18, left: 40,
    replies: [],
  },
  {
    id: 'c3', number: 3,
    author: 'Дмитрий Л.', avatar: 'ДЛ', page: 'Онбординг',
    text: 'Анимация перехода слишком резкая. Стоит добавить ease-out 200ms.',
    time: '12:30', resolved: true,
    top: 55, left: 25,
    replies: [
      { id: 'r3', author: 'Марина С.', avatar: 'МС', text: 'Исправлено в последнем коммите.', time: '13:01' },
    ],
  },
  {
    id: 'c4', number: 4,
    author: 'Алексей К.', avatar: 'АК', page: 'Онбординг',
    text: 'Нужен пустой стейт для этого блока — что показываем когда нет данных?',
    time: '14:10', resolved: false,
    top: 72, left: 55,
    replies: [],
  },
  {
    id: 'c5', number: 5,
    author: 'Марина С.', avatar: 'МС', page: 'Профиль',
    text: 'Аватар пользователя должен быть круглым, сейчас квадратный.',
    time: '15:45', resolved: true,
    top: 30, left: 70,
    replies: [
      { id: 'r4', author: 'Дмитрий Л.', avatar: 'ДЛ', text: 'Поправлено, проверь.', time: '15:52' },
      { id: 'r5', author: 'Марина С.', avatar: 'МС', text: 'Отлично, спасибо!', time: '15:55' },
    ],
  },
])

const MOCK_PAGES = ['Главная', 'Онбординг', 'Профиль']

// ── State ─────────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'open' | 'resolved' | 'mine'

const activeFilter = ref<FilterType>('all')
const activePageFilter = ref<string | null>(null)
const activeAuthorFilter = ref<string | null>(null)
const activeCommentId = ref<string | null>(null)
const replyText = ref('')

const visibleComments = computed(() => {
  return comments.value.filter((c) => {
    if (activeFilter.value === 'open' && c.resolved) return false
    if (activeFilter.value === 'resolved' && !c.resolved) return false
    if (activeFilter.value === 'mine' && c.author !== 'Алексей К.') return false
    if (activePageFilter.value && c.page !== activePageFilter.value) return false
    if (activeAuthorFilter.value && c.author !== activeAuthorFilter.value) return false
    return true
  })
})

const activeComment = computed(() =>
  comments.value.find((c) => c.id === activeCommentId.value) ?? null
)

function selectComment(id: string) {
  activeCommentId.value = id
}

function sendReply() {
  if (!replyText.value.trim() || !activeComment.value) return
  activeComment.value.replies.push({
    id: `r-${Date.now()}`,
    author: 'Алексей К.',
    avatar: 'АК',
    text: replyText.value.trim(),
    time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
  })
  replyText.value = ''
}

function resolveComment() {
  if (!activeComment.value) return
  activeComment.value.resolved = true
  toast.info('Комментарий отмечен как решённый')
}

function countByFilter(f: FilterType) {
  if (f === 'all') return comments.value.length
  if (f === 'open') return comments.value.filter((c) => !c.resolved).length
  if (f === 'resolved') return comments.value.filter((c) => c.resolved).length
  if (f === 'mine') return comments.value.filter((c) => c.author === 'Алексей К.').length
  return 0
}
</script>

<template>
  <div class="flex h-full w-full flex-col overflow-hidden">
    <!-- Top bar -->
    <header class="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
      <button
        class="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors"
        :class="activeComment && !activeComment.resolved
          ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
          : 'cursor-not-allowed text-muted opacity-50'"
        :disabled="!activeComment || activeComment.resolved"
        @click="resolveComment"
      >
        <icon-lucide-check class="size-3.5" />
        Отметить решённым
      </button>

      <div class="h-4 w-px bg-border" />

      <!-- Filter chips -->
      <div class="flex items-center gap-1">
        <button
          v-for="(f, label) in { all: 'Все', open: 'Открытые', resolved: 'Решённые', mine: 'Мои' }"
          :key="f"
          class="rounded px-2 py-0.5 text-[11px] transition-colors"
          :class="activeFilter === f
            ? 'bg-accent/15 text-accent'
            : 'text-muted hover:bg-hover hover:text-surface'"
          @click="activeFilter = f as FilterType"
        >
          {{ label }}
        </button>
      </div>

      <div class="flex-1" />

      <!-- Team avatars -->
      <div class="flex items-center gap-1">
        <Tip v-for="m in MOCK_TEAM" :key="m.name" :label="m.name">
          <button
            class="flex size-6 items-center justify-center rounded-full text-[10px] font-medium text-white transition-all"
            :class="[m.color, activeAuthorFilter === m.name ? 'ring-2 ring-accent ring-offset-1 ring-offset-canvas' : 'opacity-70 hover:opacity-100']"
            @click="activeAuthorFilter = activeAuthorFilter === m.name ? null : m.name"
          >
            {{ m.avatar }}
          </button>
        </Tip>
      </div>

      <Tip label="Уведомления">
        <button class="flex size-7 items-center justify-center rounded text-muted hover:bg-hover hover:text-surface">
          <icon-lucide-bell class="size-4" />
        </button>
      </Tip>

      <Tip v-if="isDesktop" label="Сохранить discussion.md" side="bottom">
        <button
          class="flex items-center gap-1.5 rounded border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:bg-hover hover:text-surface"
          @click="saveDiscussionMd"
        >
          <icon-lucide-save class="size-3.5" />
          Сохранить
        </button>
      </Tip>
    </header>

    <!-- Body -->
    <SplitterGroup direction="horizontal" auto-save-id="discussion-layout" class="flex-1 overflow-hidden">
      <!-- Left: Filters -->
      <SplitterPanel :default-size="18" :min-size="12" :max-size="28" class="flex flex-col overflow-hidden border-r border-border bg-panel">
        <ScrollAreaRoot class="flex-1">
          <ScrollAreaViewport class="h-full p-2">
            <div class="mb-3">
              <header class="px-1 py-1.5 text-[11px] uppercase tracking-wider text-muted">Статус</header>
              <div class="flex flex-col gap-0.5">
                <button
                  v-for="(label, f) in { all: 'Все', open: 'Открытые', resolved: 'Решённые', mine: 'Мои' }"
                  :key="f"
                  class="flex items-center justify-between rounded px-2 py-1 text-xs transition-colors"
                  :class="activeFilter === f
                    ? 'bg-hover text-surface'
                    : 'text-muted hover:bg-hover hover:text-surface'"
                  @click="activeFilter = f as FilterType; activePageFilter = null"
                >
                  <span>{{ label }}</span>
                  <span class="rounded bg-canvas px-1.5 py-0.5 text-[10px] text-muted">{{ countByFilter(f as FilterType) }}</span>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <header class="px-1 py-1.5 text-[11px] uppercase tracking-wider text-muted">Страница</header>
              <div class="flex flex-col gap-0.5">
                <button
                  v-for="page in MOCK_PAGES"
                  :key="page"
                  class="flex items-center justify-between rounded px-2 py-1 text-xs transition-colors"
                  :class="activePageFilter === page
                    ? 'bg-hover text-surface'
                    : 'text-muted hover:bg-hover hover:text-surface'"
                  @click="activePageFilter = activePageFilter === page ? null : page"
                >
                  <span>{{ page }}</span>
                  <span class="rounded bg-canvas px-1.5 py-0.5 text-[10px] text-muted">
                    {{ comments.filter(c => c.page === page).length }}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <header class="px-1 py-1.5 text-[11px] uppercase tracking-wider text-muted">Автор</header>
              <div class="flex flex-col gap-0.5">
                <button
                  v-for="m in MOCK_TEAM"
                  :key="m.name"
                  class="flex items-center gap-2 rounded px-2 py-1 text-xs transition-colors"
                  :class="activeAuthorFilter === m.name
                    ? 'bg-hover text-surface'
                    : 'text-muted hover:bg-hover hover:text-surface'"
                  @click="activeAuthorFilter = activeAuthorFilter === m.name ? null : m.name"
                >
                  <span
                    class="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-medium text-white"
                    :class="m.color"
                  >{{ m.avatar }}</span>
                  <span class="truncate">{{ m.name }}</span>
                </button>
              </div>
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

      <!-- Center: Canvas with comment pins -->
      <SplitterPanel :default-size="56" :min-size="30" class="flex flex-col overflow-hidden bg-canvas">
        <div class="relative flex flex-1 items-center justify-center overflow-hidden p-8">
          <!-- Mock artboard -->
          <div class="relative h-full w-full max-h-[600px] max-w-[900px] rounded-lg border border-border/50 bg-panel/60 shadow-xl">
            <!-- Artboard label -->
            <div class="absolute -top-6 left-0 text-[11px] text-muted">Главная</div>

            <!-- Mock UI content inside artboard -->
            <div class="flex h-full flex-col gap-4 p-6 opacity-40">
              <div class="h-8 w-40 rounded bg-surface/20" />
              <div class="flex gap-3">
                <div class="h-32 flex-1 rounded bg-surface/10" />
                <div class="h-32 flex-1 rounded bg-surface/10" />
                <div class="h-32 flex-1 rounded bg-surface/10" />
              </div>
              <div class="h-4 w-3/4 rounded bg-surface/10" />
              <div class="h-4 w-1/2 rounded bg-surface/10" />
              <div class="mt-2 h-10 w-32 rounded bg-accent/30" />
            </div>

            <!-- Comment pins -->
            <div
              v-for="c in visibleComments"
              :key="c.id"
              class="absolute flex size-6 cursor-pointer items-center justify-center rounded-full text-[10px] font-bold text-white shadow-lg transition-all hover:scale-110"
              :class="[
                c.resolved ? 'bg-emerald-600' : 'bg-accent',
                activeCommentId === c.id ? 'ring-2 ring-white ring-offset-1 ring-offset-canvas scale-110' : '',
              ]"
              :style="{ top: c.top + '%', left: c.left + '%' }"
              @click="selectComment(c.id)"
            >
              {{ c.number }}
            </div>
          </div>
        </div>
      </SplitterPanel>

      <SplitterResizeHandle class="group relative z-10 -mx-1 w-2 cursor-col-resize">
        <div class="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
      </SplitterResizeHandle>

      <!-- Right: Thread -->
      <SplitterPanel :default-size="26" :min-size="18" :max-size="40" class="flex flex-col overflow-hidden border-l border-border bg-panel">
        <!-- Empty state -->
        <div
          v-if="!activeComment"
          class="flex flex-1 flex-col items-center justify-center gap-3 text-muted"
        >
          <icon-lucide-message-circle class="size-8 opacity-30" />
          <p class="text-center text-xs px-4">Выберите комментарий на канвасе</p>
        </div>

        <!-- Thread -->
        <template v-else>
          <!-- Thread header -->
          <div class="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
            <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
              {{ activeComment.number }}
            </span>
            <span class="flex-1 truncate text-xs text-surface">{{ activeComment.author }}</span>
            <span class="text-[10px] text-muted">{{ activeComment.time }}</span>
            <Tip label="Отметить как решённый">
              <button
                class="flex size-6 items-center justify-center rounded transition-colors"
                :class="activeComment.resolved
                  ? 'text-emerald-400 hover:bg-hover'
                  : 'text-muted hover:bg-hover hover:text-emerald-400'"
                @click="resolveComment"
              >
                <icon-lucide-check-circle class="size-3.5" />
              </button>
            </Tip>
          </div>

          <!-- Messages -->
          <ScrollAreaRoot class="min-h-0 flex-1">
            <ScrollAreaViewport class="h-full p-3">
              <div class="flex flex-col gap-3">
                <!-- Original comment -->
                <div class="flex gap-2">
                  <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/20 text-[10px] font-bold text-muted">
                    {{ activeComment.avatar }}
                  </span>
                  <div>
                    <div class="flex items-baseline gap-1.5">
                      <span class="text-[11px] font-medium text-surface">{{ activeComment.author }}</span>
                      <span class="text-[10px] text-muted">{{ activeComment.time }}</span>
                    </div>
                    <p class="mt-0.5 text-xs leading-relaxed text-surface/80">{{ activeComment.text }}</p>
                  </div>
                </div>

                <!-- Replies -->
                <div
                  v-for="reply in activeComment.replies"
                  :key="reply.id"
                  class="flex gap-2"
                >
                  <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/20 text-[10px] font-bold text-muted">
                    {{ reply.avatar }}
                  </span>
                  <div>
                    <div class="flex items-baseline gap-1.5">
                      <span class="text-[11px] font-medium text-surface">{{ reply.author }}</span>
                      <span class="text-[10px] text-muted">{{ reply.time }}</span>
                    </div>
                    <p class="mt-0.5 text-xs leading-relaxed text-surface/80">{{ reply.text }}</p>
                  </div>
                </div>
              </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation="vertical" class="w-1.5">
              <ScrollAreaThumb class="rounded-full bg-border" />
            </ScrollAreaScrollbar>
          </ScrollAreaRoot>

          <!-- Reply input -->
          <div class="shrink-0 border-t border-border p-2">
            <div class="flex gap-2 rounded-lg border border-border bg-canvas px-2 py-1.5 focus-within:border-accent/50">
              <textarea
                v-model="replyText"
                rows="2"
                placeholder="Ответить…"
                class="flex-1 resize-none bg-transparent text-xs text-surface outline-none placeholder:text-muted"
                @keydown.enter.exact.prevent="sendReply"
              />
              <button
                class="flex size-6 shrink-0 items-center justify-center self-end rounded text-muted transition-colors hover:bg-hover hover:text-surface"
                :class="replyText.trim() ? 'text-accent hover:text-accent' : ''"
                @click="sendReply"
              >
                <icon-lucide-send class="size-3.5" />
              </button>
            </div>
            <p class="mt-1 text-[10px] text-muted">Enter — отправить</p>
          </div>
        </template>
      </SplitterPanel>
    </SplitterGroup>
  </div>
</template>
