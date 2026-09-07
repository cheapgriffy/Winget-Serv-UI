<template>
  <div class="script-card" :class="{ expanded }">
    <!-- Header row -->
    <div class="card-header" @click="expanded = !expanded">
      <div class="card-left">
        <div class="card-icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.2" />
            <path d="M4 5.5 L6 7 L4 8.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"
              stroke-linejoin="round" />
            <path d="M7 8.5 H10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </div>
        <div>
          <div class="card-name">{{ script.name }}</div>
          <div v-if="script.description" class="card-desc">{{ script.description }}</div>
        </div>
      </div>
      <div class="card-right">
        <span class="tag tag-green">{{ script.content?.length || 0 }} lines</span>
        <span class="expand-icon">{{ expanded ? '▲' : '▼' }}</span>
      </div>
    </div>

    <!-- Expanded content -->
    <transition name="slide-up">
      <div v-if="expanded" class="card-body">
        <!-- Public link row -->
        <div v-if="script.public_id" class="link-row">
          <span class="link-label">EXEC CMD</span>
          <div class="link-box">
            <code class="link-text">{{ command }}</code>
            <button class="copy-btn" @click.stop="copyLink" :class="{ copied }">
              {{ copied ? '✓ COPIED' : 'COPY' }}
            </button>
          </div>
        </div>

        <!-- Script preview -->
        <div class="script-preview">
          <div class="preview-header">
            <span class="preview-label">CONTENT</span>
            <span class="preview-count">{{ script.content?.length || 0 }} lines</span>
          </div>
          <div class="preview-lines">
            <div v-for="(line, i) in script.content" :key="i" class="preview-line">
              <span class="line-num">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="line-text">{{ line }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <button class="action-btn edit" @click.stop="$emit('edit', script)">
            ✎ EDIT
          </button>
          <button class="action-btn delete" @click.stop="confirmDelete = true">
            ✕ DELETE
          </button>
        </div>

        <!-- Confirm delete -->
        <transition name="fade">
          <div v-if="confirmDelete" class="confirm-delete">
            <span class="confirm-text">Delete <strong>{{ script.name }}</strong>? This cannot be undone.</span>
            <div class="confirm-btns">
              <button class="confirm-cancel" @click.stop="confirmDelete = false">CANCEL</button>
              <button class="confirm-ok" @click.stop="$emit('delete', script.id)">DELETE</button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  script: { type: Object, required: true },
  shellMode: { type: String, default: 'Powershell' }
})

defineEmits(['edit', 'delete'])

const expanded = ref(false)
const confirmDelete = ref(false)
const copied = ref(false)

const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
const command = computed(() => props.shellMode === 'Bash'
  ? `curl -fsSL ${baseUrl}/script/${props.script.public_id} | sh`
  : `irm ${baseUrl}/script/${props.script.public_id} | iex`)

function copyLink() {
  navigator.clipboard.writeText(command.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.script-card {
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color var(--transition);
  overflow: hidden;
}

.script-card:hover,
.script-card.expanded {
  border-color: var(--border-bright);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  gap: 12px;
}

.card-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.card-icon {
  color: var(--accent);
  flex-shrink: 0;
  margin-top: 1px;
}

.card-name {
  font-weight: 500;
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.expand-icon {
  font-size: 10px;
  color: var(--text-dim);
}

/* Body */
.card-body {
  border-top: 1px solid var(--border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Link row */
.link-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.link-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.link-box {
  display: flex;
  align-items: center;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.link-text {
  flex: 1;
  padding: 9px 12px;
  font-size: 12px;
  color: var(--accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-btn {
  background: transparent;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 0 14px;
  height: 100%;
  border-left: 1px solid var(--border);
  min-height: 36px;
  transition: all var(--transition);
  flex-shrink: 0;
}

.copy-btn:hover {
  color: var(--accent);
}

.copy-btn.copied {
  color: var(--accent);
}

/* Preview */
.script-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.preview-count {
  font-size: 10px;
  color: var(--text-dim);
}

.preview-lines {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  max-height: 200px;
  overflow-y: auto;
}

.preview-line {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}

.preview-line:last-child {
  border-bottom: none;
}

.line-num {
  width: 36px;
  text-align: center;
  font-size: 11px;
  color: var(--text-dim);
  padding: 8px 4px;
  border-right: 1px solid var(--border);
  flex-shrink: 0;
}

.line-text {
  padding: 8px 12px;
  color: var(--accent);
  white-space: pre;
}

/* Actions */
.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 7px 16px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: transparent;
  transition: all var(--transition);
}

.action-btn.edit {
  color: var(--text-muted);
}

.action-btn.edit:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-dim);
}

.action-btn.delete {
  color: var(--text-muted);
}

.action-btn.delete:hover {
  color: var(--red);
  border-color: var(--red);
  background: var(--red-dim);
}

/* Confirm delete */
.confirm-delete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: var(--red-dim);
  border: 1px solid var(--red);
  border-radius: var(--radius);
  flex-wrap: wrap;
}

.confirm-text {
  font-size: 12px;
  color: var(--red);
}

.confirm-text strong {
  font-weight: 700;
}

.confirm-btns {
  display: flex;
  gap: 8px;
}

.confirm-cancel,
.confirm-ok {
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  border-radius: var(--radius);
  border: 1px solid;
  transition: all var(--transition);
}

.confirm-cancel {
  background: transparent;
  border-color: var(--border-bright);
  color: var(--text-muted);
}

.confirm-cancel:hover {
  color: var(--text);
}

.confirm-ok {
  background: var(--red);
  border-color: var(--red);
  color: white;
}

.confirm-ok:hover {
  background: #cc2a2a;
}
</style>
