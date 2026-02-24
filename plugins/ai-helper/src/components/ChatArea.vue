<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useChat } from '../useChat'

const { currentMessages, isLoading, selectedModel, models, sendMessage, stopGeneration, renderMarkdown, loadModels, setSelectedModel, currentConv } = useChat()

const inputText = ref('')
const messagesRef = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()
const isMultiline = ref(false)
const autoScroll = ref(true)

function onUserScrollIntent(e: WheelEvent | TouchEvent) {
  if (e instanceof WheelEvent && e.deltaY < 0) {
    autoScroll.value = false
  }
}

let touchStartY = 0
function onTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0].clientY
}
function onTouchMove(e: TouchEvent) {
  if (e.touches[0].clientY > touchStartY) {
    autoScroll.value = false
  }
}

function onMessagesScroll() {
  const el = messagesRef.value
  if (!el) return
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 30) {
    autoScroll.value = true
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value && autoScroll.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = '0'
  const h = Math.min(el.scrollHeight, 120)
  el.style.height = h + 'px'
  isMultiline.value = h > 32
}

watch(inputText, () => nextTick(autoResize))

watch(currentMessages, scrollToBottom, { deep: true })

async function handleSend() {
  if (!inputText.value.trim() || isLoading.value) return
  const text = inputText.value
  inputText.value = ''
  isMultiline.value = false
  autoScroll.value = true
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  })
  await sendMessage(text)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function getModelName(m: any): string {
  return m?.name || m?.id || m
}

function getModelId(m: any): string {
  return m?.id || m
}

onMounted(() => {
  loadModels()
  scrollToBottom()
})
</script>

<template>
  <div class="chat-area">
    <div class="messages" ref="messagesRef" @scroll="onMessagesScroll" @wheel="onUserScrollIntent" @touchstart="onTouchStart" @touchmove="onTouchMove">
      <div v-if="!currentMessages.length" class="empty-state">
        <svg class="empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg>
        <div>开始一段新对话吧</div>
      </div>
      <div v-for="msg in currentMessages" :key="msg.id" class="msg-row" :class="msg.role">
        <div class="msg-bubble" :class="{ 'cursor-blink': isLoading && msg.role === 'assistant' && msg === currentMessages[currentMessages.length - 1] && !msg.content && !msg.reasoning }">
          <div v-if="msg.role === 'user'">{{ msg.content }}</div>
          <template v-else>
            <details v-if="msg.reasoning" class="reasoning-block" :open="isLoading && msg === currentMessages[currentMessages.length - 1] && !msg.content">
              <summary>思考过程</summary>
              <div class="reasoning-content" v-html="renderMarkdown(msg.reasoning)"></div>
            </details>
            <div v-html="renderMarkdown(msg.content)"></div>
          </template>
        </div>
      </div>
    </div>
    <div class="toolbar">
      <select class="model-select" :value="selectedModel" @change="setSelectedModel(($event.target as HTMLSelectElement).value)" v-if="models.length">
        <option v-for="m in models" :key="getModelId(m)" :value="getModelId(m)">{{ getModelName(m) }}</option>
      </select>
    </div>
    <div class="input-area">
      <div class="input-wrapper" :class="{ multiline: isMultiline }">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          @keydown="handleKeydown"
          @input="autoResize"
          placeholder="输入消息，Enter 发送，Shift+Enter 换行"
          rows="1"
        ></textarea>
        <div class="btn-row">
          <button v-if="isLoading" class="btn-stop" @click="stopGeneration" title="停止生成">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          </button>
          <button v-else class="btn-send" @click="handleSend" :disabled="!inputText.trim()" title="发送">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 14px;
  gap: 8px;
}
.empty-icon { font-size: 36px; opacity: 0.4; }
.msg-row {
  display: flex;
  margin-bottom: 16px;
}
.msg-row.user { justify-content: flex-end; }
.msg-row.assistant { justify-content: flex-start; }
.msg-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.6;
  word-break: break-word;
}
.msg-row.user .msg-bubble {
  background: var(--primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.msg-row.assistant .msg-bubble {
  background: var(--msg-ai-bg);
  color: var(--text);
  border-bottom-left-radius: 4px;
}
.msg-bubble :deep(p) { margin: 0 0 8px; }
.msg-bubble :deep(p:last-child) { margin-bottom: 0; }
.msg-bubble :deep(pre) {
  background: var(--code-bg);
  padding: 10px 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12.5px;
  margin: 8px 0;
}
.msg-bubble :deep(code) {
  font-family: 'SF Mono', Monaco, Menlo, monospace;
  font-size: 12.5px;
}
.msg-bubble :deep(p code) {
  background: var(--code-bg);
  padding: 1px 5px;
  border-radius: 3px;
}
.cursor-blink::after {
  content: '▍';
  animation: blink 1s infinite;
  color: var(--text-secondary);
}
@keyframes blink { 50% { opacity: 0; } }

.reasoning-block {
  margin-bottom: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}
.reasoning-block summary {
  padding: 4px 8px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
}
.reasoning-block summary:hover {
  background: var(--hover);
}
.reasoning-content {
  padding: 6px 10px;
  font-size: 12.5px;
  color: var(--text-secondary);
  border-top: 1px solid var(--border);
  max-height: 200px;
  overflow-y: auto;
}

.input-area {
  padding: 0 20px 12px;
}
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 12px;
  background: var(--input-bg);
  transition: border-color 0.15s;
}
.input-wrapper.multiline {
  flex-direction: column;
  align-items: stretch;
}
.input-wrapper:focus-within { border-color: var(--primary); }
.input-wrapper textarea {
  flex: 1;
  border: none;
  background: none;
  color: var(--text);
  font-size: 13.5px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  overflow-y: hidden;
}
.input-wrapper.multiline textarea {
  flex: none;
  overflow-y: auto;
  max-height: 120px;
}
.btn-row {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
.btn-send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.btn-send:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-send:not(:disabled):hover { opacity: 0.85; }
.btn-stop {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--hover);
  color: var(--text);
  cursor: pointer;
  flex-shrink: 0;
}
.toolbar {
  display: flex;
  align-items: center;
  padding: 4px 20px 8px;
  gap: 8px;
}
.model-select {
  font-size: 12px;
  padding: 3px 6px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text);
  outline: none;
  max-width: 200px;
}
</style>
