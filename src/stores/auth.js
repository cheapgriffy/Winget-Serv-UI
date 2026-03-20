import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/index.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  async function login(credentials) {
    loading.value = true
    try {
      const { data } = await authApi.login(credentials)
      token.value = data.token
      localStorage.setItem('token', data.token)
      await fetchMe()
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' }
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    loading.value = true
    try {
      await authApi.register(payload)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Registration failed' }
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    try {
      const { data } = await authApi.getMe()
      user.value = data
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, loading, isLoggedIn, login, register, fetchMe, logout }
})
