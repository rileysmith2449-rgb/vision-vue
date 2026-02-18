<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-mark">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="28" height="28">
          <g transform="translate(50,50)">
            <circle cx="0" cy="0" r="28" fill="none" stroke="currentColor" stroke-width="4"/>
            <ellipse cx="0" cy="0" rx="42" ry="17" fill="none" stroke="currentColor" stroke-width="2.5" transform="rotate(-20)"/>
            <circle cx="40" cy="-16" r="5" fill="currentColor"/>
          </g>
        </svg>
      </div>
      <span class="brand-divider"></span>
      <span class="brand-text">VISION</span>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="nav-link"
        :class="{ active: isActive(link) }"
      >
        <component :is="link.icon" :size="20" stroke-width="1.8" />
        <span class="nav-label">{{ link.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="theme-toggle logout-btn" @click="authStore.logout()">
        <LogOut :size="20" stroke-width="1.8" />
        <span class="nav-label">Sign Out</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  Scale,
  PieChart,
  Banknote,
  Target,
  CreditCard,
  Lightbulb,
  Settings,
  LogOut
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()

const navLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/net-worth', icon: Scale, label: 'Net Worth' },
  { to: '/budget', icon: PieChart, label: 'Budget' },
  { to: '/cashflow', icon: Banknote, label: 'Cash Flow' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/cards', icon: CreditCard, label: 'Cards' },
  { to: '/insights', icon: Lightbulb, label: 'Tax Insights' },
  { to: '/settings', icon: Settings, label: 'Settings' }
]

function isActive(link) {
  if (link.to === '/') return route.path === '/'
  return route.path.startsWith(link.to)
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: var(--bg-base);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  padding: 28px 16px 20px;
  z-index: 100;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 14px 36px;
}

.brand-mark {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.brand-divider {
  width: 1px;
  height: 24px;
  background: var(--text-primary);
  opacity: 0.25;
}

.brand-text {
  font-family: 'Lexend', sans-serif;
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--text-primary);
  letter-spacing: 0.25em;
}

.brand-accent {
  color: var(--accent-blue);
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.nav-link.active {
  background: rgba(59, 130, 246, 0.08);
  color: var(--accent-blue);
  border-left: 3px solid var(--accent-blue);
}

.nav-label {
  font-size: 0.9rem;
}

.sidebar-footer {
  padding-top: 16px;
  border-top: 1px solid var(--border-glass);
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.logout-btn:hover {
  color: var(--negative);
}
</style>
