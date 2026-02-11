import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useSession, useUser, useDescope } from '@descope/vue-sdk'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const { isAuthenticated: sessionAuth, isLoading: sessionLoading } = useSession()
  const { user } = useUser()
  const { logout: descopeLogout } = useDescope()

  const isAuthenticated = computed(() => sessionAuth.value === true)
  const loading = computed(() => sessionLoading.value === true)
  const isLoaded = computed(() => !sessionLoading.value)
  const currentUser = computed(() => user.value)

  function init() {
    return Promise.resolve()
  }

  async function logout() {
    await descopeLogout()
    router.push('/login')
  }

  return { isAuthenticated, loading, isLoaded, currentUser, init, logout }
})
