<template>
  <div class="dashboard" :class="{ 'sidebar-collapsed': collapsed, 'mobile-open': mobileOpen }">

    <!-- Mobile overlay -->
    <div class="mobile-overlay" @click="mobileOpen = false" />

    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- Logo + collapse toggle -->
      <div class="sidebar-top">
        <div class="sidebar-logo">
          <span class="logo-bracket">[</span>
          <transition name="label-slide">
            <span v-if="!collapsed" class="logo-text">WS</span>
          </transition>
          <span class="logo-bracket">]</span>
        </div>
        <button class="collapse-btn" @click="toggleSidebar" :title="collapsed ? 'Expand' : 'Collapse'">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" :style="{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 250ms ease' }">
            <path d="M9 2L4 7L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Nav items -->
      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="navigate(tab.id)"
          :title="collapsed ? tab.label : ''"
        >
          <span class="nav-icon" v-html="tab.svg"></span>
          <transition name="label-slide">
            <span v-if="!collapsed" class="nav-label">{{ tab.label }}</span>
          </transition>
          <transition name="fade">
            <span v-if="!collapsed && activeTab === tab.id" class="nav-active-dot"></span>
          </transition>
        </button>
      </nav>

      <!-- Sidebar footer -->
      <div class="sidebar-footer">
        <div v-if="!collapsed && auth.user" class="sidebar-user">
          <div class="sidebar-avatar">{{ auth.user.username?.[0]?.toUpperCase() || '?' }}</div>
          <div class="sidebar-user-info">
            <span class="sidebar-username">{{ auth.user.username }}</span>
            <span class="tag sidebar-role" :class="auth.user.role === 'admin' ? 'tag-yellow' : 'tag-green'">
              {{ auth.user.role || 'user' }}
            </span>
          </div>
        </div>
        <div v-else-if="collapsed && auth.user" class="sidebar-avatar-only">
          <div class="sidebar-avatar">{{ auth.user.username?.[0]?.toUpperCase() || '?' }}</div>
        </div>

        <button class="logout-btn" @click="handleLogout" :title="collapsed ? 'Logout' : ''">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0">
            <path d="M5 2H3C2.45 2 2 2.45 2 3V11C2 11.55 2.45 12 3 12H5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <path d="M9.5 4.5L12 7L9.5 9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 7H5.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          <transition name="label-slide">
            <span v-if="!collapsed">LOGOUT</span>
          </transition>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
          <div class="topbar-title-group">
            <h1 class="page-title">{{ currentTab?.label }}</h1>
            <span class="page-subtitle">{{ pageSubtitle }}</span>
          </div>
        </div>
        <div class="topbar-right">
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">LIVE</span>
          </div>
          <button v-if="activeTab === 'scripts'" class="new-script-btn" @click="openCreateModal">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1V10M1 5.5H10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <span class="btn-label">NEW SCRIPT</span>
          </button>
        </div>
      </header>

      <!-- SCRIPTS TAB -->
      <section v-if="activeTab === 'scripts'" class="tab-content">
        <div class="toolbar">
          <div class="search-wrap">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.3"/>
              <path d="M9.5 9.5L12 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <input v-model="searchQuery" class="search-input" placeholder="Filter scripts..." />
            <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">✕</button>
          </div>
          <div class="toolbar-right">
            <span class="count-badge">{{ filteredScripts.length }}/{{ scriptStore.scripts.length }}</span>
            <button class="icon-btn" @click="scriptStore.fetchScripts()" :class="{ spinning: scriptStore.loading }">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M11.5 6.5A5 5 0 1 1 6.5 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                <path d="M9 1.5H11.5V4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="scriptStore.loading && scriptStore.scripts.length === 0" class="loading-state">
          <div class="loading-spinner">⟳</div>
          <span>Loading scripts...</span>
        </div>
        <div v-else-if="scriptStore.error" class="error-state">
          <span class="error-icon">⚠</span>
          <span>{{ scriptStore.error }}</span>
          <button @click="scriptStore.fetchScripts()">RETRY</button>
        </div>
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
        <div v-else-if="filteredScripts.length === 0" class="empty-state">
          <p class="empty-title">No match for "{{ searchQuery }}"</p>
          <button class="empty-btn" @click="searchQuery = ''">CLEAR FILTER</button>
        </div>
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
      <section v-else-if="activeTab === 'profile'" class="tab-content profile-tab">
        <div v-if="auth.user" class="profile-layout">

          <!-- Hero card -->
          <div class="profile-hero">
            <div class="profile-hero-bg"></div>
            <div class="profile-hero-content">
              <div class="profile-big-avatar">
                {{ auth.user.username?.[0]?.toUpperCase() || '?' }}
              </div>
              <div class="profile-hero-text">
                <h2 class="profile-display-name">{{ auth.user.username }}</h2>
                <p class="profile-display-email">{{ auth.user.email }}</p>
                <span class="tag profile-role-tag" :class="auth.user.role === 'admin' ? 'tag-yellow' : 'tag-green'">
                  {{ auth.user.role || 'user' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Stats row -->
          <div class="profile-stats">
            <div class="stat-card">
              <span class="stat-value">{{ scriptStore.scripts.length }}</span>
              <span class="stat-label">SCRIPTS</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ totalLines }}</span>
              <span class="stat-label">TOTAL LINES</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ auth.user.id || '—' }}</span>
              <span class="stat-label">USER ID</span>
            </div>
          </div>

          <!-- Info fields -->
          <div class="profile-fields-card">
            <div class="fields-header">ACCOUNT DETAILS</div>
            <div class="profile-field">
              <span class="field-label">USERNAME</span>
              <div class="field-value-wrap">
                <span class="field-value">{{ auth.user.username }}</span>
                <button class="copy-small" @click="copyToClipboard(auth.user.username, 'username')">
                  {{ copied === 'username' ? '✓' : 'COPY' }}
                </button>
              </div>
            </div>
            <div class="profile-field">
              <span class="field-label">EMAIL</span>
              <div class="field-value-wrap">
                <span class="field-value">{{ auth.user.email }}</span>
                <button class="copy-small" @click="copyToClipboard(auth.user.email, 'email')">
                  {{ copied === 'email' ? '✓' : 'COPY' }}
                </button>
              </div>
            </div>
            <div class="profile-field">
              <span class="field-label">ROLE</span>
              <span class="field-value">{{ auth.user.role || 'user' }}</span>
            </div>
            <div v-if="auth.user.created_at" class="profile-field">
              <span class="field-label">MEMBER SINCE</span>
              <span class="field-value">{{ formatDate(auth.user.created_at) }}</span>
            </div>
          </div>

          <!-- Danger zone -->
          <div class="danger-zone">
            <div class="danger-header">
              <span class="danger-title">DANGER ZONE</span>
              <span class="danger-sub">Irreversible and destructive actions</span>
            </div>
            <div class="danger-action">
              <div>
                <p class="danger-action-title">Delete account</p>
                <p class="danger-action-sub">Permanently removes your account and all associated scripts.</p>
              </div>
              <button class="danger-btn" @click="confirmDeleteAccount = true">DELETE ACCOUNT</button>
            </div>
            <transition name="fade">
              <div v-if="confirmDeleteAccount" class="confirm-delete-account">
                <p>Type <strong>DELETE</strong> to confirm.</p>
                <input v-model="deleteConfirmText" class="confirm-input" placeholder="DELETE" />
                <div class="confirm-btns">
                  <button class="confirm-cancel" @click="confirmDeleteAccount = false; deleteConfirmText = ''">CANCEL</button>
                  <button class="confirm-ok" :disabled="deleteConfirmText !== 'DELETE'" @click="handleDeleteAccount">CONFIRM</button>
                </div>
              </div>
            </transition>
          </div>

        </div>
        <div v-else class="loading-state">
          <div class="loading-spinner">⟳</div>
          <span>Loading profile...</span>
        </div>
      </section>
    </main>

    <!-- Modals -->
    <transition name="fade">
      <ScriptModal v-if="showModal" :script="editingScript" @close="closeModal" @submit="handleModalSubmit" />
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useScriptStore } from '@/stores/scripts.js'
import ScriptCard from '@/components/ScriptCard.vue'
import ScriptModal from '@/components/ScriptModal.vue'

const auth = useAuthStore()
const scriptStore = useScriptStore()
const router = useRouter()

// ── Sidebar ──
const collapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')
const mobileOpen = ref(false)

function toggleSidebar() {
  if (window.innerWidth <= 768) {
    mobileOpen.value = !mobileOpen.value
  } else {
    collapsed.value = !collapsed.value
    localStorage.setItem('sidebar-collapsed', collapsed.value)
  }
}

function onResize() {
  if (window.innerWidth > 768) mobileOpen.value = false
}
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

// ── Tabs ──
const activeTab = ref('scripts')
const tabs = [
  {
    id: 'scripts', label: 'SCRIPTS',
    svg: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="2.5" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 5.5L7 7.5L4.5 9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 9.5H10.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`
  },
  {
    id: 'profile', label: 'PROFILE',
    svg: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.5" stroke="currentColor" stroke-width="1.3"/><path d="M2 13C2 10.5 4.5 9 7.5 9C10.5 9 13 10.5 13 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`
  },
]

const currentTab = computed(() => tabs.find(t => t.id === activeTab.value))
const pageSubtitle = computed(() => {
  if (activeTab.value === 'scripts') return `${scriptStore.scripts.length} scripts`
  return auth.user?.email || ''
})

const totalLines = computed(() =>
  scriptStore.scripts.reduce((acc, s) => acc + (s.content?.length || 0), 0)
)

function navigate(tabId) {
  activeTab.value = tabId
  mobileOpen.value = false
}

// ── Scripts ──
const searchQuery = ref('')
const filteredScripts = computed(() => {
  if (!searchQuery.value) return scriptStore.scripts
  const q = searchQuery.value.toLowerCase()
  return scriptStore.scripts.filter(s =>
    s.name?.toLowerCase().includes(q) ||
    s.description?.toLowerCase().includes(q)
  )
})

const showModal = ref(false)
const editingScript = ref(null)

function openCreateModal() { editingScript.value = null; showModal.value = true }
function openEditModal(script) { editingScript.value = script; showModal.value = true }
function closeModal() { showModal.value = false; editingScript.value = null }

async function handleModalSubmit(payload) {
  if (editingScript.value) {
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

// ── Profile ──
const confirmDeleteAccount = ref(false)
const deleteConfirmText = ref('')
const copied = ref('')

function copyToClipboard(text, key) {
  navigator.clipboard.writeText(text)
  copied.value = key
  setTimeout(() => { copied.value = '' }, 2000)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function handleDeleteAccount() {
  if (deleteConfirmText.value !== 'DELETE') return
  auth.logout()
  router.push('/login')
}

function handleLogout() { auth.logout(); router.push('/login') }

// ── Toast ──
const toast = ref({ visible: false, message: '', type: 'success' })
let toastTimer = null
function showToast(message, type = 'success') {
  clearTimeout(toastTimer)
  toast.value = { visible: true, message, type }
  toastTimer = setTimeout(() => { toast.value.visible = false }, 3000)
}

onMounted(() => { scriptStore.fetchScripts() })
</script>

<style scoped>
/* ─── Layout ─── */
.dashboard {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* ─── Mobile overlay ─── */
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 40;
  backdrop-filter: blur(2px);
}

/* ─── Sidebar ─── */
.sidebar {
  width: 220px;
  background: var(--bg-2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 260ms cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
  z-index: 50;
}

.sidebar-collapsed .sidebar { width: 60px; }

.sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 12px;
  border-bottom: 1px solid var(--border);
  min-height: 60px;
  flex-shrink: 0;
}

.sidebar-logo {
  font-family: var(--sans);
  font-size: 18px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 1px;
  overflow: hidden;
  white-space: nowrap;
}
.logo-bracket { color: var(--accent); }
.logo-text { color: var(--text); margin: 0 2px; }

.collapse-btn {
  background: transparent;
  color: var(--text-dim);
  padding: 5px;
  border-radius: var(--radius);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition), background var(--transition);
}
.collapse-btn:hover { color: var(--accent); background: var(--accent-dim); }

.sidebar-nav {
  flex: 1;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  border-radius: var(--radius);
  transition: all var(--transition);
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}
.nav-item:hover { color: var(--text); background: var(--bg-3); }
.nav-item.active { color: var(--accent); background: var(--accent-dim); }
.nav-icon { flex-shrink: 0; display: flex; align-items: center; }
.nav-label { flex: 1; }
.nav-active-dot {
  width: 5px; height: 5px;
  background: var(--accent);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 5px var(--accent);
}

.sidebar-footer {
  padding: 10px 8px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px;
  overflow: hidden;
}
.sidebar-avatar-only { padding: 4px 0; display: flex; justify-content: center; }

.sidebar-avatar {
  width: 28px; height: 28px;
  background: var(--accent-dim);
  border: 1px solid var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  font-family: var(--sans);
  color: var(--accent);
  flex-shrink: 0;
}

.sidebar-user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  min-width: 0;
}
.sidebar-username {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sidebar-role { font-size: 9px !important; padding: 1px 5px !important; }

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 8px 10px;
  border-radius: var(--radius);
  transition: all var(--transition);
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
}
.logout-btn:hover { color: var(--red); border-color: var(--red); background: var(--red-dim); }

/* ─── Main ─── */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
  min-width: 0;
}

/* ─── Topbar ─── */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  gap: 12px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: transparent;
  padding: 5px;
  flex-shrink: 0;
  border-radius: var(--radius);
}
.hamburger span {
  display: block;
  width: 18px; height: 1.5px;
  background: var(--text-muted);
  border-radius: 2px;
  transition: background var(--transition);
}
.hamburger:hover span { background: var(--accent); }

.topbar-title-group { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.page-title {
  font-family: var(--sans);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.06em;
  white-space: nowrap;
}
.page-subtitle {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.status-indicator { display: flex; align-items: center; gap: 6px; }
.status-dot {
  width: 6px; height: 6px;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 5px var(--accent);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
.status-text { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: var(--accent); }

.new-script-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  background: var(--accent);
  color: var(--bg);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  border-radius: var(--radius);
  transition: all var(--transition);
  white-space: nowrap;
}
.new-script-btn:hover { background: #00cc70; box-shadow: 0 2px 14px var(--accent-glow); }

/* ─── Tab content ─── */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ─── Toolbar ─── */
.toolbar { display: flex; align-items: center; gap: 10px; }
.search-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0 12px;
  transition: border-color var(--transition);
}
.search-wrap:focus-within { border-color: var(--accent); }
.search-icon { color: var(--text-dim); flex-shrink: 0; }
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text);
  padding: 9px 0;
  font-size: 13px;
}
.search-input::placeholder { color: var(--text-dim); }
.search-clear { background: transparent; color: var(--text-dim); font-size: 10px; padding: 2px 4px; transition: color var(--transition); }
.search-clear:hover { color: var(--red); }
.toolbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.count-badge { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; color: var(--text-dim); }
.icon-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 8px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  transition: all var(--transition);
}
.icon-btn:hover { color: var(--accent); border-color: var(--accent); }
.icon-btn.spinning svg { animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── States ─── */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 10px;
  color: var(--text-muted);
  text-align: center;
}
.loading-spinner { font-size: 22px; animation: spin 0.8s linear infinite; color: var(--accent); }
.empty-icon { color: var(--text-dim); margin-bottom: 6px; }
.empty-title { font-size: 15px; font-family: var(--sans); font-weight: 700; color: var(--text); }
.empty-sub { font-size: 12px; }
.empty-btn {
  margin-top: 6px; padding: 9px 22px;
  background: var(--accent); color: var(--bg);
  font-family: var(--mono); font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
  border-radius: var(--radius); transition: all var(--transition);
}
.empty-btn:hover { background: #00cc70; }
.error-state { color: var(--red); }
.error-icon { font-size: 20px; }
.error-state button {
  background: var(--red-dim); border: 1px solid var(--red); color: var(--red);
  padding: 7px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; border-radius: var(--radius);
}

/* ─── Script list ─── */
.script-list { display: flex; flex-direction: column; gap: 8px; }

/* ─── Profile ─── */
.profile-tab { gap: 16px; }
.profile-layout { display: flex; flex-direction: column; gap: 14px; max-width: 560px; }

.profile-hero {
  position: relative;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.profile-hero-bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, var(--accent-dim) 0%, transparent 60%);
  pointer-events: none;
}
.profile-hero::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--accent), transparent);
}
.profile-hero-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
}
.profile-big-avatar {
  width: 64px; height: 64px;
  background: var(--accent-dim);
  border: 2px solid var(--accent);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; font-weight: 800; font-family: var(--sans); color: var(--accent);
  flex-shrink: 0;
  box-shadow: 0 0 20px var(--accent-glow);
}
.profile-hero-text { min-width: 0; }
.profile-display-name {
  font-family: var(--sans); font-size: 20px; font-weight: 800;
  letter-spacing: -0.01em; margin-bottom: 4px;
}
.profile-display-email {
  font-size: 12px; color: var(--text-muted); margin-bottom: 8px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.profile-role-tag { font-size: 10px !important; }

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.stat-card {
  background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 16px; display: flex; flex-direction: column; gap: 4px; align-items: center; text-align: center;
}
.stat-value { font-family: var(--sans); font-size: 22px; font-weight: 800; color: var(--accent); line-height: 1; }
.stat-label { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; color: var(--text-dim); }

.profile-fields-card {
  background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden;
}
.fields-header {
  padding: 10px 16px; font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  color: var(--text-muted); border-bottom: 1px solid var(--border); background: var(--bg-3);
}
.profile-field {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 16px; border-bottom: 1px solid var(--border); gap: 12px;
}
.profile-field:last-child { border-bottom: none; }
.field-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: var(--text-muted);
  flex-shrink: 0; min-width: 100px;
}
.field-value-wrap { display: flex; align-items: center; gap: 10px; min-width: 0; }
.field-value { font-size: 13px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.copy-small {
  background: transparent; border: 1px solid var(--border); color: var(--text-dim);
  font-size: 9px; font-weight: 700; letter-spacing: 0.06em; padding: 3px 8px;
  border-radius: var(--radius); transition: all var(--transition); flex-shrink: 0;
}
.copy-small:hover { color: var(--accent); border-color: var(--accent); }

.danger-zone {
  background: var(--bg-2); border: 1px solid var(--red); border-radius: var(--radius); overflow: hidden;
}
.danger-header {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px; background: var(--red-dim); border-bottom: 1px solid var(--red);
}
.danger-title { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--red); }
.danger-sub { font-size: 11px; color: var(--text-muted); }
.danger-action {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 16px; flex-wrap: wrap;
}
.danger-action-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
.danger-action-sub { font-size: 11px; color: var(--text-muted); }
.danger-btn {
  background: transparent; border: 1px solid var(--red); color: var(--red);
  font-family: var(--mono); font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
  padding: 8px 16px; border-radius: var(--radius); transition: all var(--transition);
  white-space: nowrap; flex-shrink: 0;
}
.danger-btn:hover { background: var(--red); color: white; }
.confirm-delete-account {
  padding: 16px; border-top: 1px solid var(--red); background: var(--red-dim);
  display: flex; flex-direction: column; gap: 10px; font-size: 12px; color: var(--text-muted);
}
.confirm-delete-account strong { color: var(--red); }
.confirm-input {
  background: var(--bg); border: 1px solid var(--red); color: var(--text);
  padding: 8px 12px; border-radius: var(--radius); font-size: 13px;
  font-family: var(--mono); letter-spacing: 0.1em; width: 100%;
}
.confirm-btns { display: flex; gap: 8px; }
.confirm-cancel, .confirm-ok {
  padding: 7px 14px; font-family: var(--mono); font-size: 11px; font-weight: 700;
  letter-spacing: 0.06em; border-radius: var(--radius); border: 1px solid; transition: all var(--transition);
}
.confirm-cancel { background: transparent; border-color: var(--border-bright); color: var(--text-muted); }
.confirm-ok { background: var(--red); border-color: var(--red); color: white; }
.confirm-ok:disabled { opacity: 0.35; cursor: not-allowed; }
.confirm-ok:not(:disabled):hover { background: #cc2a2a; }

/* ─── Toast ─── */
.toast {
  position: fixed; bottom: 20px; right: 20px;
  padding: 11px 18px; border-radius: var(--radius); font-size: 12px; font-weight: 600;
  z-index: 200; border: 1px solid;
}
.toast-success { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
.toast-error { background: var(--red-dim); border-color: var(--red); color: var(--red); }

/* ─── Transitions ─── */
.label-slide-enter-active { transition: opacity 180ms ease, max-width 200ms ease; overflow: hidden; }
.label-slide-leave-active { transition: opacity 100ms ease; position: absolute; }
.label-slide-enter-from { opacity: 0; }
.label-slide-leave-to { opacity: 0; }

/* ─── Mobile ─── */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    transform: translateX(-100%);
    transition: transform 280ms cubic-bezier(0.4,0,0.2,1);
    width: 240px !important;
  }
  .mobile-open .sidebar { transform: translateX(0); }
  .mobile-open .mobile-overlay { display: block; }

  .collapse-btn { display: none; }
  .hamburger { display: flex; }

  .topbar { padding: 0 16px; height: 56px; }
  .tab-content { padding: 14px 16px; }

  .page-subtitle { display: none; }
  .status-text { display: none; }
  .btn-label { display: none; }
  .new-script-btn { padding: 8px 10px; }

  .profile-stats { gap: 8px; }
  .stat-card { padding: 12px 8px; }
  .stat-value { font-size: 18px; }
  .profile-hero-content { padding: 18px; gap: 14px; }
  .profile-big-avatar { width: 50px; height: 50px; font-size: 20px; }
  .profile-display-name { font-size: 17px; }
  .danger-action { flex-direction: column; align-items: flex-start; }

  .toast { bottom: 12px; right: 12px; left: 12px; }
}

@media (max-width: 400px) {
  .profile-stats { grid-template-columns: repeat(2, 1fr); }
  .profile-hero-content { flex-direction: column; align-items: flex-start; gap: 12px; }
  .field-label { min-width: 80px; }
}
</style>
