import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: 'Sign In', public: true }
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('@/views/SignUpView.vue'),
      meta: { title: 'Sign Up', public: true }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/PrivacyPolicyView.vue'),
      meta: { title: 'Privacy Policy', public: true }
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/TermsOfServiceView.vue'),
      meta: { title: 'Terms of Service', public: true }
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { title: 'Get Started' }
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { title: 'Dashboard' }
    },
    {
      path: '/net-worth',
      name: 'net-worth',
      component: () => import('@/views/NetWorthView.vue'),
      meta: { title: 'Net Worth' }
    },
    {
      path: '/net-worth/:category',
      name: 'net-worth-category',
      component: () => import('@/views/AssetCategoryView.vue'),
      meta: { title: 'Net Worth' }
    },
    {
      path: '/assets',
      redirect: '/net-worth'
    },
    {
      path: '/assets/:category',
      redirect: to => `/net-worth/${to.params.category}`
    },
    {
      path: '/budget',
      name: 'budget',
      component: () => import('@/views/BudgetView.vue'),
      meta: { title: 'Budget & Cashflow' }
    },
    {
      path: '/tax/:type',
      name: 'tax-detail',
      component: () => import('@/views/TaxDetailView.vue'),
      meta: { title: 'Tax Detail' }
    },
    {
      path: '/holding/:symbol',
      name: 'holding-detail',
      component: () => import('@/views/HoldingDetailView.vue'),
      meta: { title: 'Holding Detail' }
    },
    {
      path: '/property/:id',
      name: 'property-detail',
      component: () => import('@/views/PropertyDetailView.vue'),
      meta: { title: 'Property Detail' }
    },
    {
      path: '/liability/:id',
      name: 'liability-detail',
      component: () => import('@/views/LiabilityDetailView.vue'),
      meta: { title: 'Liability Detail' }
    },
    {
      path: '/cashflow',
      name: 'cashflow',
      component: () => import('@/views/CashflowView.vue'),
      meta: { title: 'Cash Flow' }
    },
    {
      path: '/goals',
      name: 'goals',
      component: () => import('@/views/GoalsView.vue'),
      meta: { title: 'Goals' }
    },
    {
      path: '/cards',
      name: 'cards',
      component: () => import('@/views/CardsView.vue'),
      meta: { title: 'Card Optimizer' }
    },
    {
      path: '/insights',
      name: 'insights',
      component: () => import('@/views/InsightsView.vue'),
      meta: { title: 'Tax & Portfolio Insights' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: 'Settings' }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  document.title = `${to.meta.title || 'Vision'} - Tax-Smart Portfolio`

  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()

  // Wait for Descope to finish loading before checking auth
  if (!authStore.isLoaded) {
    await new Promise((resolve) => {
      const check = setInterval(() => {
        if (authStore.isLoaded) {
          clearInterval(check)
          resolve()
        }
      }, 50)
    })
  }

  if (!to.meta.public && !authStore.isAuthenticated) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'sign-up') && authStore.isAuthenticated && window.location.hostname !== 'localhost') {
    next('/')
  } else if (authStore.isAuthenticated && localStorage.getItem('vision-settings-configured') !== 'true' && to.name !== 'onboarding') {
    next('/onboarding')
  } else if (authStore.isAuthenticated && localStorage.getItem('vision-settings-configured') === 'true' && to.name === 'onboarding') {
    next('/')
  } else {
    next()
  }
})

export default router
