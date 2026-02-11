import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'

const SESSION_KEY = 'vision_authenticated'

export const useAuthStore = defineStore('auth', () => {
  const authenticated = ref(sessionStorage.getItem(SESSION_KEY) === 'true')
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => authenticated.value)

  function init() {
    return Promise.resolve()
  }

  function login(passcode) {
    error.value = null
    if (passcode === import.meta.env.VITE_APP_PASSCODE) {
      authenticated.value = true
      sessionStorage.setItem(SESSION_KEY, 'true')
    } else {
      error.value = 'Incorrect passcode.'
      throw new Error('Incorrect passcode')
    }
  }

  function logout() {
    authenticated.value = false
    sessionStorage.removeItem(SESSION_KEY)
    router.push('/login')
  }

  return { authenticated, loading, error, isAuthenticated, init, login, logout }
})
