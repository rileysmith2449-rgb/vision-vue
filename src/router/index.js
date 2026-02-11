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
      path: '/insights',
      name: 'insights',
      component: () => import('@/views/InsightsView.vue'),
      meta: { title: 'Tax Insights' }
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

  if (!to.meta.public && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
