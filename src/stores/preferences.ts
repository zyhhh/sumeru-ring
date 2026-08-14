import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'sumeru-ring:preferences'

interface StoredPreferences { sidebarCollapsed: boolean; darkMode: boolean }

function readPreferences(): StoredPreferences {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) : { sidebarCollapsed: false, darkMode: false }
  } catch {
    return { sidebarCollapsed: false, darkMode: false }
  }
}

export const usePreferencesStore = defineStore('preferences', () => {
  const initial = readPreferences()
  const sidebarCollapsed = ref(initial.sidebarCollapsed)
  const darkMode = ref(initial.darkMode)

  // 只持久化界面偏好，绝不保存 JWT 密钥、JSON 等工具输入。
  watch([sidebarCollapsed, darkMode], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sidebarCollapsed: sidebarCollapsed.value, darkMode: darkMode.value }))
    document.documentElement.classList.toggle('dark', darkMode.value)
  }, { immediate: true })

  return { sidebarCollapsed, darkMode }
})

