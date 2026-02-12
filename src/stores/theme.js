import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('vision-theme') || 'dark')

  const currentTheme = computed(() => theme.value)
  const isDark = computed(() => theme.value === 'dark')

  function setTheme(newTheme) {
    theme.value = newTheme
    localStorage.setItem('vision-theme', newTheme)
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return {
    theme,
    currentTheme,
    isDark,
    setTheme,
    toggleTheme
  }
})
