<template>
  <div class="auth-layout">
    <div class="noise-bg"></div>

    <!-- Left panel: brand -->
    <div class="brand-panel">
      <div class="brand-inner">
        <div class="brand-logo">
          <img class="brand-logo-img" :src="pipelineLogo" alt="PipeLine logo" />
        </div>
        <h1 class="brand-title">PipeLine</h1>
        <p class="brand-tagline">One command. Any machine.<br>Your scripts, instantly.</p>

        <div class="code-preview">
          <div class="code-bar">
            <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
            <span class="code-title">powershell</span>
          </div>
          <div class="code-body">
            <span class="code-prompt">PS&gt;</span>
            <span class="code-cmd">irm https://script.cheapgriffy.fr/script/<span
                class="code-highlight">Jk3xZ2</span></span>
            <span class="code-op"> | iex</span>
          </div>
        </div>

        <ul class="feature-list">
          <li v-for="f in features" :key="f">
            <span class="feat-icon">▸</span>{{ f }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Right panel: form -->
    <div class="form-panel">
      <div class="form-inner">
        <div class="form-header">
          <h2 class="form-title">{{ isRegister ? 'CREATE ACCOUNT' : 'SIGN IN' }}</h2>
          <div class="form-mode-toggle">
            <button :class="['mode-btn', { active: !isRegister }]" @click="isRegister = false">LOGIN</button>
            <button :class="['mode-btn', { active: isRegister }]" @click="isRegister = true">REGISTER</button>
          </div>
        </div>

        <transition name="slide-up" mode="out-in">
          <!-- LOGIN FORM -->
          <form v-if="!isRegister" key="login" class="auth-form" @submit.prevent="handleLogin">
            <div v-if="formError" class="form-error">
              <span class="error-icon">✕</span> {{ formError }}
            </div>

            <div class="field">
              <label class="field-label">USERNAME OR EMAIL</label>
              <input v-model="loginForm.identifier" class="field-input" placeholder="user@example.com"
                autocomplete="username" required />
            </div>

            <div class="field">
              <label class="field-label">PASSWORD</label>
              <div class="input-wrap">
                <input v-model="loginForm.password" :type="showPass ? 'text' : 'password'" class="field-input"
                  placeholder="••••••••••" autocomplete="current-password" required />
                <button type="button" class="pass-toggle" @click="showPass = !showPass">
                  {{ showPass ? 'HIDE' : 'SHOW' }}
                </button>
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="auth.loading">
              <span v-if="auth.loading" class="btn-loader">⟳</span>
              <span v-else>SIGN IN →</span>
            </button>
          </form>

          <!-- REGISTER FORM -->
          <form v-else key="register" class="auth-form" @submit.prevent="handleRegister">
            <div v-if="formError" class="form-error">
              <span class="error-icon">✕</span> {{ formError }}
            </div>
            <div v-if="registerSuccess" class="form-success">
              <span>✓</span> Account created. You can now sign in.
            </div>

            <div class="field">
              <label class="field-label">USERNAME</label>
              <input v-model="registerForm.username" class="field-input" placeholder="johndoe" autocomplete="off"
                required />
            </div>

            <div class="field">
              <label class="field-label">EMAIL</label>
              <input v-model="registerForm.email" type="email" class="field-input" placeholder="user@example.com"
                autocomplete="email" required />
            </div>

            <div class="field">
              <label class="field-label">PASSWORD</label>
              <div class="input-wrap">
                <input v-model="registerForm.password" :type="showPass ? 'text' : 'password'" class="field-input"
                  placeholder="••••••••••" autocomplete="new-password" required />
                <button type="button" class="pass-toggle" @click="showPass = !showPass">
                  {{ showPass ? 'HIDE' : 'SHOW' }}
                </button>
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="auth.loading">
              <span v-if="auth.loading" class="btn-loader">⟳</span>
              <span v-else>CREATE ACCOUNT →</span>
            </button>
          </form>
        </transition>

        <div class="form-footer">
          <span class="footer-label">PipeLine</span>
          <span class="footer-dot">·</span>
          <span class="footer-label">{{pkg.version}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import pipelineLogo from '@/assets/Pipeline_logo.png'
import pkg from '/package.json'

const auth = useAuthStore()
const router = useRouter()

const isRegister = ref(false)
const showPass = ref(false)
const formError = ref('')
const registerSuccess = ref(false)

const loginForm = reactive({ identifier: '', password: '' })
const registerForm = reactive({ username: '', email: '', password: '' })

const features = [
  'Create scripts with a GUI',
  'Share via unique public link',
  'Execute from any machine',
  'Security-first distribution',
]

async function handleLogin() {
  formError.value = ''
  const isEmail = loginForm.identifier.includes('@')
  const payload = {
    password: loginForm.password,
    ...(isEmail ? { email: loginForm.identifier } : { username: loginForm.identifier })
  }
  const res = await auth.login(payload)
  if (res.success) {
    router.push('/dashboard')
  } else {
    formError.value = res.error
  }
}

async function handleRegister() {
  formError.value = ''
  registerSuccess.value = false
  const res = await auth.register(registerForm)
  if (res.success) {
    registerSuccess.value = true
    setTimeout(() => { isRegister.value = false }, 1500)
  } else {
    formError.value = res.error
  }
}
</script>

<style scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

.noise-bg {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}

/* Brand panel */
.brand-panel {
  flex: 1;
  background: var(--bg-2);
  border-right: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  position: relative;
}

.brand-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
}

.brand-inner {
  max-width: 380px;
  width: 100%;
}

.brand-logo {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.brand-logo-img {
  width: 186px;
  height: auto;
  display: block;
  border-radius: 12px;
  flex-shrink: 0;
}

.logo-bracket {
  color: var(--accent);
}

.logo-text {
  color: var(--text);
  margin: 0 4px;
}

.brand-title {
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.25em;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.brand-tagline {
  font-size: 22px;
  font-family: var(--sans);
  font-weight: 700;
  line-height: 1.3;
  color: var(--text);
  margin-bottom: 36px;
}

/* Code preview */
.code-preview {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 36px;
  overflow: hidden;
}

.code-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-3);
  border-bottom: 1px solid var(--border);
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.dot.red {
  background: #ff5f57;
}

.dot.yellow {
  background: #febc2e;
}

.dot.green {
  background: #28c840;
}

.code-title {
  font-size: 11px;
  color: var(--text-dim);
  margin-left: auto;
}

.code-body {
  padding: 14px 16px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.code-prompt {
  color: var(--accent);
  margin-right: 8px;
}

.code-cmd {
  color: var(--text-muted);
}

.code-highlight {
  color: var(--accent);
  font-weight: 700;
}

.code-op {
  color: var(--text-dim);
}

/* Feature list */
.feature-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-muted);
}

.feat-icon {
  color: var(--accent);
  font-size: 10px;
}

/* Form panel */
.form-panel {
  width: 440px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  background: var(--bg);
}

.form-inner {
  width: 100%;
  max-width: 340px;
}

.form-header {
  margin-bottom: 32px;
}

.form-title {
  font-family: var(--sans);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.form-mode-toggle {
  display: flex;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.mode-btn {
  flex: 1;
  padding: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  transition: all var(--transition);
}

.mode-btn.active {
  background: var(--accent);
  color: var(--bg);
}

.mode-btn:hover:not(.active) {
  color: var(--text);
  background: var(--bg-3);
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--red-dim);
  border: 1px solid var(--red);
  border-radius: var(--radius);
  color: var(--red);
  font-size: 12px;
}

.form-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--accent-dim);
  border: 1px solid var(--accent);
  border-radius: var(--radius);
  color: var(--accent);
  font-size: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.input-wrap {
  position: relative;
  display: flex;
}

.field-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 13px;
  transition: border-color var(--transition);
}

.field-input:focus {
  border-color: var(--accent);
}

.field-input::placeholder {
  color: var(--text-dim);
}

.pass-toggle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 0 14px;
  background: transparent;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  border-left: 1px solid var(--border);
  transition: color var(--transition);
}

.pass-toggle:hover {
  color: var(--accent);
}

.submit-btn {
  padding: 13px;
  background: var(--accent);
  color: var(--bg);
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  border-radius: var(--radius);
  transition: all var(--transition);
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  background: #00cc70;
  transform: translateY(-1px);
  box-shadow: 0 4px 20px var(--accent-glow);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loader {
  display: inline-block;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
  font-size: 11px;
  color: var(--text-dim);
}

.footer-dot {
  color: var(--border-bright);
}

/* Responsive */
@media (max-width: 768px) {
  .auth-layout {
    flex-direction: column;
  }

  .brand-panel {
    display: none;
  }

  .form-panel {
    width: 100%;
    padding: 40px 24px;
  }
}
</style>
