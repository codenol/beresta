<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport, SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'

import Tip from '@/components/ui/Tip.vue'

// ── Types ─────────────────────────────────────────────────────────────────────

type Skill = 'Discovery' | 'PRD' | 'User Story' | 'Spec'
type MessageRole = 'user' | 'assistant'

interface Message {
  id: string
  role: MessageRole
  text: string
  time: string
}

interface Session {
  id: string
  title: string
  skill: Skill
  date: string
  status: 'Draft' | 'Complete'
  messages: Message[]
  document: DocumentSection[]
}

interface DocumentSection {
  id: string
  title: string
  content: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_SESSIONS: Session[] = [
  {
    id: 's1',
    title: 'Онбординг пользователей',
    skill: 'Discovery',
    date: '12 апр',
    status: 'Draft',
    messages: [
      { id: 'm1', role: 'assistant', text: 'Привет! Я помогу вам исследовать задачу онбординга. Расскажите — для каких пользователей вы проектируете онбординг? Новые регистрации, возвращающиеся или оба типа?', time: '10:01' },
      { id: 'm2', role: 'user', text: 'В первую очередь новые пользователи — те, кто только зарегистрировался.', time: '10:03' },
      { id: 'm3', role: 'assistant', text: 'Понял. Какова главная цель онбординга? Что пользователь должен сделать или понять к его завершению?', time: '10:03' },
      { id: 'm4', role: 'user', text: 'Нам нужно чтобы они создали свой первый проект и пригласили хотя бы одного коллегу.', time: '10:05' },
      { id: 'm5', role: 'assistant', text: 'Отлично. Два чётких «момента активации»: создание проекта и приглашение коллеги. Сколько шагов максимально допустимо? Есть ли ограничения по количеству экранов?', time: '10:05' },
      { id: 'm6', role: 'user', text: 'Желательно не больше 5 шагов. Пользователи уходят если слишком долго.', time: '10:07' },
    ],
    document: [
      { id: 'd1', title: 'Описание', content: 'Онбординг для новых пользователей, направленный на достижение двух ключевых действий активации: создание первого проекта и приглашение коллеги.' },
      { id: 'd2', title: 'Цели', content: '• Довести пользователя до создания проекта\n• Обеспечить приглашение минимум одного коллеги\n• Уложиться в ≤5 шагов' },
      { id: 'd3', title: 'Пользователи', content: 'Новые зарегистрированные пользователи, впервые открывающие продукт после регистрации.' },
      { id: 'd4', title: 'Требования', content: '• Максимум 5 шагов онбординга\n• Прогресс-бар или индикатор шагов\n• Возможность пропустить онбординг\n• Сохранение прогресса при прерывании' },
    ],
  },
  {
    id: 's2',
    title: 'Платёжный флоу',
    skill: 'PRD',
    date: '11 апр',
    status: 'Complete',
    messages: [
      { id: 'm7', role: 'assistant', text: 'Давайте опишем PRD для платёжного флоу. С какими платёжными методами нужно работать?', time: '14:20' },
      { id: 'm8', role: 'user', text: 'Карты (Visa/MC), СБП и ЮMoney.', time: '14:22' },
      { id: 'm9', role: 'assistant', text: 'Хорошо. Какой сценарий основной — разовая оплата или подписка?', time: '14:22' },
      { id: 'm10', role: 'user', text: 'Оба, но разовая — приоритет для MVP.', time: '14:24' },
      { id: 'm11', role: 'assistant', text: 'Понял. Нужна ли сохранённая карта / кошелёк для повторных покупок?', time: '14:24' },
      { id: 'm12', role: 'user', text: 'Да, обязательно — у нас много возвратных пользователей.', time: '14:26' },
    ],
    document: [
      { id: 'd5', title: 'Описание', content: 'Платёжный флоу для покупки товаров и подписок. MVP фокус — разовая оплата с поддержкой Visa/MC, СБП и ЮMoney.' },
      { id: 'd6', title: 'Цели', content: '• Минимальное трение при оплате\n• Поддержка 3 платёжных методов\n• Сохранение карты для повторных покупок' },
      { id: 'd7', title: 'Функциональные требования', content: '• Экран выбора метода оплаты\n• Ввод и валидация карты\n• Сохранение способа оплаты\n• Экран подтверждения / ошибки\n• Email-квитанция' },
      { id: 'd8', title: 'Нефункциональные требования', content: '• PCI DSS compliance\n• Время отклика ≤ 2с\n• Поддержка 3DS 2.0' },
    ],
  },
  {
    id: 's3',
    title: 'Дашборд аналитики',
    skill: 'User Story',
    date: '10 апр',
    status: 'Draft',
    messages: [
      { id: 'm13', role: 'assistant', text: 'Начнём со сторис для дашборда аналитики. Кто основная аудитория — менеджеры, аналитики, разработчики?', time: '09:15' },
      { id: 'm14', role: 'user', text: 'Менеджеры продукта — они смотрят метрики каждое утро.', time: '09:17' },
      { id: 'm15', role: 'assistant', text: 'Какие метрики им наиболее важны прямо сейчас?', time: '09:17' },
      { id: 'm16', role: 'user', text: 'DAU/MAU, конверсия регистрации, retention по когортам.', time: '09:19' },
    ],
    document: [
      { id: 'd9', title: 'Описание', content: 'Дашборд аналитики для product-менеджеров с акцентом на ключевые метрики роста.' },
      { id: 'd10', title: 'User Stories', content: '• Как PM, я хочу видеть DAU/MAU на главном экране\n• Как PM, я хочу фильтровать данные по периоду\n• Как PM, я хочу видеть retention по когортам в табличном виде' },
      { id: 'd11', title: 'Acceptance Criteria', content: 'В разработке…' },
    ],
  },
]

const SKILLS: Skill[] = ['Discovery', 'PRD', 'User Story', 'Spec']
const SKILL_LABELS: Record<Skill, string> = {
  Discovery: 'Discovery',
  PRD: 'PRD',
  'User Story': 'User Story',
  Spec: 'Spec',
}

// ── State ─────────────────────────────────────────────────────────────────────

const activeSessionId = ref('s1')
const activeSkill = ref<Skill>('Discovery')
const inputText = ref('')
const expandedSections = ref<Set<string>>(new Set())
const messagesEndRef = ref<HTMLDivElement>()
const skillMenuOpen = ref(false)

const sessions = ref<Session[]>(MOCK_SESSIONS)

const activeSession = computed(() =>
  sessions.value.find(s => s.id === activeSessionId.value)!
)

function selectSession(id: string) {
  activeSessionId.value = id
  const s = sessions.value.find(s => s.id === id)
  if (s) activeSkill.value = s.skill
}

function createSession() {
  const id = `s-${Date.now()}`
  sessions.value.push({
    id,
    title: 'Новая сессия',
    skill: activeSkill.value,
    date: 'Сегодня',
    status: 'Draft',
    messages: [
      { id: `m-${Date.now()}`, role: 'assistant', text: `Привет! Я готов помочь с ${SKILL_LABELS[activeSkill.value]}. С чего начнём?`, time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) },
    ],
    document: [],
  })
  activeSessionId.value = id
}

function sendMessage() {
  if (!inputText.value.trim()) return
  const text = inputText.value.trim()
  inputText.value = ''
  activeSession.value.messages.push({
    id: `m-${Date.now()}`,
    role: 'user',
    text,
    time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
  })
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

function toggleSection(id: string) {
  if (expandedSections.value.has(id)) expandedSections.value.delete(id)
  else expandedSections.value.add(id)
}

const statusColors: Record<string, string> = {
  Draft: 'text-yellow-400 bg-yellow-400/10',
  Complete: 'text-emerald-400 bg-emerald-400/10',
}
</script>

<template>
  <div class="flex h-full w-full flex-col overflow-hidden select-text">
    <!-- Top bar -->
    <header class="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
      <!-- Skill selector -->
      <div class="relative">
        <button
          class="flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-surface hover:bg-hover transition-colors"
          @click="skillMenuOpen = !skillMenuOpen"
        >
          <icon-lucide-brain-circuit class="size-3.5 text-accent" />
          {{ SKILL_LABELS[activeSkill] }}
          <icon-lucide-chevron-down class="size-3 text-muted" />
        </button>
        <div
          v-if="skillMenuOpen"
          class="absolute left-0 top-full z-50 mt-1 min-w-[120px] rounded-lg border border-border bg-panel p-1 shadow-xl"
        >
          <button
            v-for="skill in SKILLS"
            :key="skill"
            class="w-full rounded px-2.5 py-1.5 text-left text-xs transition-colors"
            :class="activeSkill === skill ? 'bg-accent/15 text-accent' : 'text-muted hover:bg-hover hover:text-surface'"
            @click="activeSkill = skill; skillMenuOpen = false"
          >
            {{ SKILL_LABELS[skill] }}
          </button>
        </div>
      </div>

      <div class="h-4 w-px bg-border" />

      <span class="text-xs font-medium text-surface">{{ activeSession?.title }}</span>

      <div class="flex-1" />

      <button
        class="flex items-center gap-1.5 rounded border border-border px-2.5 py-1 text-xs text-muted hover:bg-hover hover:text-surface transition-colors"
        @click="createSession"
      >
        <icon-lucide-plus class="size-3.5" />
        Новая сессия
      </button>
    </header>

    <SplitterGroup direction="horizontal" auto-save-id="analytics-layout" class="flex-1 overflow-hidden">
      <!-- Left: Session list -->
      <SplitterPanel :default-size="18" :min-size="14" :max-size="28" class="flex flex-col overflow-hidden border-r border-border bg-panel">
        <header class="shrink-0 px-3 py-2 text-[11px] uppercase tracking-wider text-muted">Сессии</header>
        <ScrollAreaRoot class="flex-1">
          <ScrollAreaViewport class="h-full px-2 pb-2">
            <div class="flex flex-col gap-0.5">
              <button
                v-for="session in sessions"
                :key="session.id"
                class="flex flex-col gap-0.5 rounded-lg px-2 py-2 text-left transition-colors"
                :class="activeSessionId === session.id
                  ? 'bg-hover text-surface'
                  : 'text-muted hover:bg-hover/70 hover:text-surface'"
                @click="selectSession(session.id)"
              >
                <div class="flex items-center gap-1.5">
                  <icon-lucide-message-square class="size-3 shrink-0 text-accent" />
                  <span class="truncate text-[11px] font-medium">{{ session.title }}</span>
                </div>
                <div class="flex items-center gap-1.5 pl-4.5">
                  <span
                    class="rounded px-1.5 py-0.5 text-[10px]"
                    :class="statusColors[session.status]"
                  >{{ session.status }}</span>
                  <span class="text-[10px]">{{ session.date }}</span>
                </div>
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

      <!-- Center: Chat -->
      <SplitterPanel :default-size="50" :min-size="30" class="flex flex-col overflow-hidden bg-canvas">
        <!-- Messages -->
        <ScrollAreaRoot class="flex-1">
          <ScrollAreaViewport class="h-full px-4 py-4">
            <div class="flex flex-col gap-4">
              <div
                v-for="msg in activeSession.messages"
                :key="msg.id"
                class="flex gap-3"
                :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
              >
                <!-- Avatar -->
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  :class="msg.role === 'assistant'
                    ? 'bg-accent/20 text-accent'
                    : 'bg-muted/20 text-muted'"
                >
                  {{ msg.role === 'assistant' ? 'AI' : 'Я' }}
                </div>

                <!-- Bubble -->
                <div
                  class="max-w-[75%] rounded-2xl px-4 py-2.5"
                  :class="msg.role === 'assistant'
                    ? 'rounded-tl-sm bg-panel text-surface'
                    : 'rounded-tr-sm bg-accent/15 text-surface'"
                >
                  <p class="text-sm leading-relaxed">{{ msg.text }}</p>
                  <span class="mt-1 block text-[10px] text-muted">{{ msg.time }}</span>
                </div>
              </div>
              <div ref="messagesEndRef" />
            </div>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical" class="w-1.5">
            <ScrollAreaThumb class="rounded-full bg-border" />
          </ScrollAreaScrollbar>
        </ScrollAreaRoot>

        <!-- Input -->
        <div class="shrink-0 border-t border-border p-3">
          <div class="flex items-end gap-2 rounded-xl border border-border bg-panel px-3 py-2 focus-within:border-accent/50 transition-colors">
            <textarea
              v-model="inputText"
              rows="2"
              placeholder="Ответьте на вопрос AI…"
              class="flex-1 resize-none bg-transparent text-sm text-surface outline-none placeholder:text-muted"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button
              class="flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors"
              :class="inputText.trim() ? 'bg-accent text-white hover:bg-accent/80' : 'bg-hover text-muted cursor-not-allowed'"
              @click="sendMessage"
            >
              <icon-lucide-arrow-up class="size-4" />
            </button>
          </div>
          <p class="mt-1 text-[10px] text-muted">Enter — отправить</p>
        </div>
      </SplitterPanel>

      <SplitterResizeHandle class="group relative z-10 -mx-1 w-2 cursor-col-resize">
        <div class="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
      </SplitterResizeHandle>

      <!-- Right: Document preview -->
      <SplitterPanel :default-size="32" :min-size="22" :max-size="45" class="flex flex-col overflow-hidden border-l border-border bg-panel">
        <div class="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
          <icon-lucide-file-text class="size-3.5 shrink-0 text-accent" />
          <span class="flex-1 text-xs font-medium text-surface">PRD</span>
          <span
            class="rounded px-1.5 py-0.5 text-[10px]"
            :class="statusColors[activeSession.status]"
          >{{ activeSession.status }}</span>
          <Tip label="Скопировать документ">
            <button class="flex size-6 items-center justify-center rounded text-muted hover:bg-hover hover:text-surface transition-colors">
              <icon-lucide-copy class="size-3.5" />
            </button>
          </Tip>
        </div>

        <div v-if="activeSession.document.length === 0" class="flex flex-1 flex-col items-center justify-center gap-3 text-muted">
          <icon-lucide-file-text class="size-8 opacity-30" />
          <p class="text-center text-xs px-4">Документ формируется по мере диалога…</p>
        </div>

        <ScrollAreaRoot v-else class="flex-1">
          <ScrollAreaViewport class="h-full p-3">
            <div class="flex flex-col gap-1">
              <div
                v-for="section in activeSession.document"
                :key="section.id"
                class="overflow-hidden rounded-lg border border-border transition-colors hover:border-border/80"
              >
                <button
                  class="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-hover/50"
                  :class="expandedSections.has(section.id) ? 'bg-hover/30' : ''"
                  @click="toggleSection(section.id)"
                >
                  <icon-lucide-chevron-right
                    class="size-3 shrink-0 text-muted transition-transform"
                    :class="expandedSections.has(section.id) ? 'rotate-90' : ''"
                  />
                  <span class="text-xs font-medium text-surface">{{ section.title }}</span>
                </button>
                <div
                  v-if="expandedSections.has(section.id)"
                  class="border-t border-border bg-canvas/50 px-3 py-2"
                >
                  <p class="whitespace-pre-wrap text-xs leading-relaxed text-surface/80">{{ section.content }}</p>
                </div>
              </div>
            </div>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical" class="w-1.5">
            <ScrollAreaThumb class="rounded-full bg-border" />
          </ScrollAreaScrollbar>
        </ScrollAreaRoot>
      </SplitterPanel>
    </SplitterGroup>
  </div>
</template>
