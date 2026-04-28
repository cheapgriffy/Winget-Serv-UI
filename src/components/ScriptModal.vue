<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title-row">
          <span class="modal-label">{{ isEdit ? 'EDIT SCRIPT' : 'NEW SCRIPT' }}</span>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </div>
        <p class="modal-sub">Scripts are executed as PowerShell commands via <code>irm | iex</code></p>
      </div>

      <form class="modal-form" @submit.prevent="handleSubmit">
        <div v-if="formError" class="form-error">
          <span>✕</span> {{ formError }}
        </div>

        <div class="field">
          <label class="field-label">NAME <span class="required">*</span></label>
          <input
            v-model="form.name"
            class="field-input"
            placeholder="my-setup-script"
            required
          />
        </div>

        <div class="field">
          <label class="field-label">DESCRIPTION <span class="optional">(optional)</span></label>
          <input
            v-model="form.description"
            class="field-input"
            placeholder="Brief description of what this script does"
          />
        </div>

        <div class="field">
          <div class="editor-header">
            <label class="field-label">SCRIPT LINES <span class="required">*</span></label>
            <div class="editor-actions">
              <input
                ref="fileInput"
                type="file"
                style="display: none"
                accept=".ps1,.txt"
                @change="handleImport"
              />
              <button type="button" class="icon-btn" @click="triggerFileInput" title="Import from file">IMPORT</button>
              <button type="button" class="icon-btn" @click="exportToFile" title="Download as .ps1">EXPORT</button>
              <button type="button" class="icon-btn" @click="addLine" title="Add line">+ ADD LINE</button>
            </div>
          </div>

          <div class="script-editor">
            <div
              v-for="(line, i) in form.content"
              :key="i"
              class="script-line"
            >
              <span class="line-num">{{ String(i + 1).padStart(2, '0') }}</span>
              <input
                v-model="form.content[i]"
                class="line-input"
                :placeholder="`Write-Host 'Line ${i + 1}'`"
                @keydown.enter.prevent="insertLineAfter(i)"
                @keydown.backspace="maybeRemoveLine($event, i)"
              />
              <button
                v-if="form.content.length > 1"
                type="button"
                class="line-remove"
                @click="removeLine(i)"
                title="Remove line"
              >✕</button>
            </div>

            <button type="button" class="add-line-btn" @click="addLine">
              + ADD LINE
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('close')">CANCEL</button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            <span v-if="submitting" class="spin">⟳</span>
            <span v-else>{{ isEdit ? 'SAVE CHANGES' : 'CREATE SCRIPT' }} →</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  script: { type: Object, default: null }
})

const emit = defineEmits(['close', 'submit'])

const isEdit = !!props.script
const submitting = ref(false)
const formError = ref('')

const form = reactive({
  name: props.script?.name || '',
  description: props.script?.description || '',
  content: props.script?.content?.length ? [...props.script.content] : ['']
})

const fileInput = ref(null)

function triggerFileInput() {
  fileInput.value.click()
}

function handleImport(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (res) => {
    const text = res.target.result
    const lines = text.split(/\r?\n/)
    form.content = lines.length ? lines : ['']
    
    if (!form.name) {
      form.name = file.name.replace(/\.[^/.]+$/, "")
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function exportToFile() {
  const content = form.content.join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${form.name || 'script'}.ps1`
  a.click()
  URL.revokeObjectURL(url)
}

function addLine() {
  form.content.push('')
}

function insertLineAfter(i) {
  form.content.splice(i + 1, 0, '')
  // focus next line input after DOM update
}

function removeLine(i) {
  if (form.content.length > 1) form.content.splice(i, 1)
}

function maybeRemoveLine(e, i) {
  if (form.content[i] === '' && form.content.length > 1) {
    e.preventDefault()
    removeLine(i)
  }
}

async function handleSubmit() {
  formError.value = ''
  const lines = form.content.filter(l => l.trim() !== '')
  if (!form.name.trim()) {
    formError.value = 'Script name is required'
    return
  }
  if (lines.length === 0) {
    formError.value = 'Script must have at least one non-empty line'
    return
  }
  submitting.value = true
  try {
    await emit('submit', {
      ...(isEdit ? { id: props.script.id } : {}),
      name: form.name.trim(),
      description: form.description.trim() || null,
      content: lines
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal {
  background: var(--bg-2);
  border: 1px solid var(--border-bright);
  border-radius: var(--radius);
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modal-in 200ms ease;
}

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  padding: 24px 24px 0;
  border-bottom: 1px solid var(--border);
  padding-bottom: 20px;
  margin-bottom: 24px;
}
.modal-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.modal-label {
  font-family: var(--sans);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.06em;
}
.modal-close {
  background: transparent;
  color: var(--text-muted);
  font-size: 14px;
  padding: 4px 8px;
  transition: color var(--transition);
}
.modal-close:hover { color: var(--red); }
.modal-sub {
  font-size: 12px;
  color: var(--text-muted);
}
.modal-sub code {
  color: var(--accent);
  background: var(--accent-dim);
  padding: 1px 5px;
  border-radius: 2px;
}

.modal-form {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-error {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 14px;
  background: var(--red-dim);
  border: 1px solid var(--red);
  color: var(--red);
  font-size: 12px;
  border-radius: var(--radius);
}

.field { display: flex; flex-direction: column; gap: 8px; }
.field-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}
.required { color: var(--accent); }
.optional { color: var(--text-dim); font-size: 9px; }

.field-input {
  padding: 10px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 13px;
  transition: border-color var(--transition);
}
.field-input:focus { border-color: var(--accent); }
.field-input::placeholder { color: var(--text-dim); }

/* Script editor */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.editor-actions { display: flex; gap: 8px; }

.icon-btn {
  background: transparent;
  color: var(--accent);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 4px 8px;
  border: 1px solid var(--accent);
  border-radius: var(--radius);
  transition: all var(--transition);
}
.icon-btn:hover { background: var(--accent-dim); }

.script-editor {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.script-line {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.line-num {
  width: 40px;
  text-align: center;
  font-size: 11px;
  color: var(--text-dim);
  padding: 0 4px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  user-select: none;
}

.line-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--accent);
  font-size: 13px;
  padding: 9px 12px;
}
.line-input::placeholder { color: var(--text-dim); }
.line-input:focus { background: rgba(0, 255, 136, 0.03); }

.line-remove {
  background: transparent;
  color: var(--text-dim);
  font-size: 11px;
  padding: 0 12px;
  height: 100%;
  transition: color var(--transition);
  flex-shrink: 0;
}
.line-remove:hover { color: var(--red); }

.add-line-btn {
  width: 100%;
  padding: 9px;
  background: transparent;
  color: var(--text-dim);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  transition: all var(--transition);
  text-align: center;
}
.add-line-btn:hover { color: var(--accent); background: var(--accent-dim); }

/* Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn-secondary {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--border-bright);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  border-radius: var(--radius);
  transition: all var(--transition);
}
.btn-secondary:hover { border-color: var(--text-muted); color: var(--text); }

.btn-primary {
  padding: 10px 24px;
  background: var(--accent);
  color: var(--bg);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  border-radius: var(--radius);
  transition: all var(--transition);
}
.btn-primary:hover:not(:disabled) {
  background: #00cc70;
  box-shadow: 0 2px 16px var(--accent-glow);
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.spin {
  display: inline-block;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
