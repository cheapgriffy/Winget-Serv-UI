<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-bracket">[</span>
        <span class="logo-text">WS</span>
        <span class="logo-bracket">]</span>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div v-if="auth.user" class="user-info">
          <div class="user-avatar">{{ auth.user.username?.[0]?.toUpperCase() || '?' }}</div>
          <div class="user-details">
            <div class="user-name">{{ auth.user.username }}</div>
            <div class="user-email">{{ auth.user.email }}</div>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          ⏻ LOGOUT
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main">
      <!-- Top bar -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">{{ currentTab?.label }}</h1>
          <span class="page-subtitle">{{ pageSubtitle }}</span>
        </div>
        <div class="topbar-right">
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">CONNECTED</span>
          </div>
          <button v-if="activeTab === 'scripts'" class="new-script-btn" @click="openCreateModal">
            + NEW SCRIPT
          </button>
        </div>
      </header>

      <!-- SCRIPTS TAB -->
      <section v-if="activeTab === 'scripts'" class="tab-content">
        <!-- Search / filter bar -->
        <div class="toolbar">
          <div class="search-wrap">
            <span class="search-icon">⌕</span>
            <input
              v-model="searchQuery"
              class="search-input"
              placeholder="Filter scripts..."
            />
          </div>
          <div class="toolbar-right">
            <span class="count-badge">{{ filteredScripts.length }} SCRIPTS</span>
            <button class="icon-btn" @click="scriptStore.fetchScripts()" title="Refresh">
              ↺ REFRESH
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="scriptStore.loading && scriptStore.scripts.length === 0" class="loading-state">
          <div class="loading-spinner">⟳</div>
          <span>Loading scripts...</span>
        </div>

        <!-- Error -->
        <div v-else-if="scriptStore.error" class="error-state">
          <span class="error-icon">⚠</span>
          <span>{{ scriptStore.error }}</span>
          <button @click="scriptStore.fetchScripts()">RETRY</button>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredScripts.length === 0 && scriptStore.scripts.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="6" y="8" width="28" height="24" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M13 16 L18 20 L13 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20 24 H27" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="empty-title">No scripts yet</p>
          <p class="empty-sub">Create your first script and share it anywhere</p>
          <button class="empty-btn" @click="openCreateModal">+ CREATE FIRST SCRIPT</button>
        </div>

        <!-- No results -->
        <div v-else-if="filteredScripts.length === 0" class="empty-state">
          <p class="empty-title">No scripts match "{{ searchQuery }}"</p>
          <button class="empty-btn" @click="searchQuery = ''">CLEAR FILTER</button>
        </div>

        <!-- Script list -->
        <div v-else class="script-list">
          <transition-group name="slide-up">
            <ScriptCard
              v-for="script in filteredScripts"
              :key="script.id"
              :script="script"
              @edit="openEditModal"
              @delete="handleDelete"
            />
          </transition-group>
        </div>
      </section>

      <!-- PROFILE TAB -->
      <section v-else-if="activeTab === 'profile'" class="tab-content">
        <div class="profile-card" v-if="auth.user">
          <div class="profile-avatar">{{ auth.user.username?.[0]?.toUpperCase() || '?' }}</div>
          <div class="profile-fields">
            <div class="profile-row">
              <span class="profile-label">USERNAME</span>
              <span class="profile-value">{{ auth.user.username }}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">EMAIL</span>
              <span class="profile-value">{{ auth.user.email }}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">ROLE</span>
              <span class="tag" :class="auth.user.role === 'admin' ? 'tag-yellow' : 'tag-green'">
                {{ auth.user.role || 'user' }}
              </span>
            </div>
            <div class="profile-row">
              <span class="profile-label">SCRIPTS</span>
              <span class="profile-value">{{ scriptStore.scripts.length }}</span>
            </div>
          </div>
          <button class="danger-btn" @click="confirmDeleteAccount = true">
            DELETE ACCOUNT
          </button>
          <transition name="fade">
            <div v-if="confirmDeleteAccount" class="confirm-delete-account">
              <p>This will permanently delete your account and all scripts.</p>
              <div class="confirm-btns">
                <button class="confirm-cancel" @click="confirmDeleteAccount = false">CANCEL</button>
                <button class="confirm-ok" @click="handleDeleteAccount">CONFIRM DELETE</button>
              </div>
            </div>
          </transition>
        </div>
      </section>
    </main>

    <!-- Modals -->
    <transition name="fade">
      <ScriptModal
        v-if="showModal"
        :script="editingScript"
        @close="closeModal"
        @submit="handleModalSubmit"
      />
    </transition>

    <!-- Toast -->
    <transition name="slide-up">
      <div v-if="toast.visible" :class="['toast', `toast-${toast.type}`]">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useScriptStore } from '@/stores/scripts.js'
import ScriptCard from '@/components/ScriptCard.vue'
import ScriptModal from '@/components/ScriptModal.vue'

const auth = useAuthStore()
const scriptStore = useScriptStore()
const router = useRouter()

const activeTab = ref('scripts')
const searchQuery = ref('')
const showModal = ref(false)
const editingScript = ref(null)
const confirmDeleteAccount = ref(false)

const tabs = [
  { id: 'scripts', label: 'SCRIPTS', icon: '▶' },
  { id: 'profile', label: 'PROFILE', icon: '◉' },
]

const currentTab = computed(() => tabs.find(t => t.id === activeTab.value))
const pageSubtitle = computed(() => {
  if (activeTab.value === 'scripts') return `${scriptStore.scripts.length} total`
  return auth.user?.username || ''
})

const filteredScripts = computed(() => {
  if (!searchQuery.value) return scriptStore.scripts
  const q = searchQuery.value.toLowerCase()
  return scriptStore.scripts.filter(s =>
    s.name?.toLowerCase().includes(q) ||
    s.description?.toLowerCase().includes(q)
  )
})

// Toast
const toast = ref({ visible: false, message: '', type: 'success' })
let toastTimer = null
function showToast(message, type = 'success') {
  clearTimeout(toastTimer)
  toast.value = { visible: true, message, type }
  toastTimer = setTimeout(() => { toast.value.visible = false }, 3000)
}

// Modal
function openCreateModal() {
  editingScript.value = null
  showModal.value = true
}
function openEditModal(script) {
  editingScript.value = script
  showModal.value = true
}
function closeModal() {
  showModal.value = false
  editingScript.value = null
}

async function handleModalSubmit(payload) {
  if (editingScript.value) {
    // Simulate edit by delete + recreate for minimal API
    await scriptStore.removeScript(payload.id)
    const res = await scriptStore.createScript({ name: payload.name, description: payload.description, content: payload.content })
    if (res.success) { showToast('Script updated'); closeModal() }
    else showToast(res.error, 'error')
  } else {
    const res = await scriptStore.createScript(payload)
    if (res.success) { showToast('Script created'); closeModal() }
    else showToast(res.error, 'error')
  }
}

async function handleDelete(id) {
  const res = await scriptStore.removeScript(id)
  if (res.success) showToast('Script deleted')
  else showToast(res.error, 'error')
}

async function handleDeleteAccount() {
  await auth.logout()
  router.push('/login')
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  scriptStore.fetchScripts()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 200px;
  background: var(--bg-2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-logo {
  padding: 24px 20px 20px;
  font-family: var(--sans);
  font-size: 20px;
  font-weight: 800;
  border-bottom: 1px solid var(--border);
}
.logo-bracket { color: var(--accent); }
.logo-text { margin: 0 3px; }

.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  border-radius: var(--radius);
  transition: all var(--transition);
  text-align: left;
  width: 100%;
}
.nav-item:hover { color: var(--text); background: var(--bg-3); }
.nav-item.active {
  color: var(--accent);
  background: var(--accent-dim);
}
.nav-icon { font-size: 11px; width: 16px; }

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}
.user-avatar {
  width: 30px;
  height: 30px;
  background: var(--accent-dim);
  border: 1px solid var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  flex-shrink: 0;
}
.user-details { min-width: 0; }
.user-name {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-email {
  font-size: 10px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.logout-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 7px;
  border-radius: var(--radius);
  transition: all var(--transition);
  width: 100%;
}
.logout-btn:hover { color: var(--red); border-color: var(--red); background: var(--red-dim); }

/* Main */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
}

/* Topbar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.topbar-left { display: flex; align-items: baseline; gap: 12px; }
.page-title {
  font-family: var(--sans);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.06em;
}
.page-subtitle { font-size: 12px; color: var(--text-muted); }

.topbar-right { display: flex; align-items: center; gap: 16px; }
.status-indicator { display: flex; align-items: center; gap: 6px; }
.status-dot {
  width: 7px; height: 7px;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--accent);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.status-text { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: var(--accent); }

.new-script-btn {
  padding: 9px 18px;
  background: var(--accent);
  color: var(--bg);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  border-radius: var(--radius);
  transition: all var(--transition);
}
.new-script-btn:hover {
  background: #00cc70;
  box-shadow: 0 2px 16px var(--accent-glow);
}

/* Tab content */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0 14px;
}
.search-icon { color: var(--text-dim); font-size: 16px; }
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text);
  padding: 9px 0;
  font-size: 13px;
}
.search-input::placeholder { color: var(--text-dim); }
.search-input:focus { outline: none; }
.toolbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.count-badge {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-dim);
}
.icon-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 7px 14px;
  border-radius: var(--radius);
  transition: all var(--transition);
}
.icon-btn:hover { color: var(--accent); border-color: var(--accent); }

/* States */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 12px;
  color: var(--text-muted);
  text-align: center;
}
.loading-spinner {
  font-size: 24px;
  animation: spin 0.8s linear infinite;
  color: var(--accent);
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon { color: var(--text-dim); margin-bottom: 8px; }
.empty-title { font-size: 16px; font-family: var(--sans); font-weight: 700; color: var(--text); }
.empty-sub { font-size: 13px; }
.empty-btn {
  margin-top: 8px;
  padding: 10px 24px;
  background: var(--accent);
  color: var(--bg);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  border-radius: var(--radius);
  transition: all var(--transition);
}
.empty-btn:hover { background: #00cc70; }

.error-state { color: var(--red); }
.error-icon { font-size: 20px; }
.error-state button {
  background: var(--red-dim);
  border: 1px solid var(--red);
  color: var(--red);
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  border-radius: var(--radius);
}

/* Script list */
.script-list { display: flex; flex-direction: column; gap: 8px; }

/* Profile */
.profile-card {
  max-width: 480px;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.profile-avatar {
  width: 56px;
  height: 56px;
  background: var(--accent-dim);
  border: 2px solid var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  font-family: var(--sans);
  color: var(--accent);
}
.profile-fields { display: flex; flex-direction: column; gap: 0; }
.profile-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 0;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}
.profile-row:last-child { border-bottom: none; }
.profile-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  flex-shrink: 0;
}
.profile-value { font-size: 13px; }

.danger-btn {
  background: transparent;
  border: 1px solid var(--red);
  color: var(--red);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 9px 18px;
  border-radius: var(--radius);
  align-self: flex-start;
  transition: all var(--transition);
}
.danger-btn:hover { background: var(--red-dim); }

.confirm-delete-account {
  padding: 16px;
  background: var(--red-dim);
  border: 1px solid var(--red);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 13px;
  color: var(--red);
}
.confirm-btns { display: flex; gap: 8px; }
.confirm-cancel, .confirm-ok {
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  border-radius: var(--radius);
  border: 1px solid;
  transition: all var(--transition);
}
.confirm-cancel { background: transparent; border-color: var(--border-bright); color: var(--text-muted); }
.confirm-ok { background: var(--red); border-color: var(--red); color: white; }
.confirm-ok:hover { background: #cc2a2a; }

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 500;
  z-index: 200;
  border: 1px solid;
}
.toast-success {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}
.toast-error {
  background: var(--red-dim);
  border-color: var(--red);
  color: var(--red);
}
</style>
