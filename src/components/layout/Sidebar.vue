<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-mark">
        <Eye :size="22" stroke-width="2.5" />
      </div>
      <span class="brand-text">Vision<span class="brand-accent">Vue</span></span>
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
      <button class="theme-toggle" @click="themeStore.toggleTheme()">
        <Sun v-if="themeStore.isDark" :size="20" stroke-width="1.8" />
        <Moon v-else :size="20" stroke-width="1.8" />
        <span class="nav-label">{{ themeStore.isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import {
  Eye,
  LayoutDashboard,
  Wallet,
  PieChart,
  Lightbulb,
  Settings,
  Sun,
  Moon
} from 'lucide-vue-next'

const route = useRoute()
const themeStore = useThemeStore()

const navLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assets', icon: Wallet, label: 'Assets' },
  { to: '/budget', icon: PieChart, label: 'Budget' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
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
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid var(--border-glass);
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
  background: var(--gradient-pop);
  border-radius: 10px;
  color: #0f172a;
}

.brand-text {
  font-family: 'Lexend', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.brand-accent {
  color: var(--electric-teal);
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
  background: rgba(0, 230, 138, 0.08);
  color: var(--electric-teal);
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
</style>
