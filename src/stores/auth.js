import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useSession, useUser, useDescope } from '@descope/vue-sdk'
import router from '@/router'

const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

export const useAuthStore = defineStore('auth', () => {
  if (isLocalDev) {
    const isAuthenticated = ref(true)
    const loading = ref(false)
    const isLoaded = ref(true)
    const currentUser = ref({ name: 'Local Dev User', email: 'dev@localhost' })

    function init() { return Promise.resolve() }
    function logout() { router.push('/login') }

    return { isAuthenticated, loading, isLoaded, currentUser, init, logout }
  }

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
