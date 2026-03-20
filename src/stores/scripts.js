import { defineStore } from 'pinia'
import { ref } from 'vue'
import { scriptApi } from '@/api/index.js'

export const useScriptStore = defineStore('scripts', () => {
  const scripts = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchScripts() {
    loading.value = true
    error.value = null
    try {
      const { data } = await scriptApi.list()
      scripts.value = data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load scripts'
    } finally {
      loading.value = false
    }
  }

  async function createScript(payload) {
    loading.value = true
    try {
      const { data } = await scriptApi.create(payload)
      scripts.value.unshift(data)
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to create script' }
    } finally {
      loading.value = false
    }
  }

  async function removeScript(id) {
    try {
      await scriptApi.remove(id)
      scripts.value = scripts.value.filter(s => s.id !== id)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete script' }
    }
  }

  return { scripts, loading, error, fetchScripts, createScript, removeScript }
})
