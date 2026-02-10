import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Vision'} - Tax-Smart Portfolio`
  next()
})

export default router
