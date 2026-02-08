<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <span class="brand-icon">◈</span>
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
        <span class="nav-icon">{{ link.icon }}</span>
        <span class="nav-label">{{ link.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="theme-toggle" @click="themeStore.toggleTheme()">
        <span class="nav-icon">{{ themeStore.isDark ? '☀️' : '🌙' }}</span>
        <span class="nav-label">{{ themeStore.isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

const route = useRoute()
const themeStore = useThemeStore()

const navLinks = [
  { to: '/', icon: '📊', label: 'Dashboard' },
  { to: '/assets', icon: '💰', label: 'Assets' },
  { to: '/budget', icon: '📋', label: 'Budget' },
  { to: '/insights', icon: '💡', label: 'Insights' },
  { to: '/settings', icon: '⚙️', label: 'Settings' }
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
  width: 280px;
  height: 100vh;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-glass);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  z-index: 100;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 32px;
}

.brand-icon {
  font-size: 1.8rem;
  background: var(--gradient-pop);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
}

.brand-accent {
  background: var(--gradient-pop);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: rgba(135, 206, 235, 0.1);
  color: var(--text-primary);
}

.nav-link.active {
  background: rgba(0, 255, 159, 0.1);
  color: var(--electric-teal);
}

.nav-icon {
  font-size: 1.2rem;
  width: 28px;
  text-align: center;
}

.nav-label {
  font-size: 0.95rem;
}

.sidebar-footer {
  padding-top: 16px;
  border-top: 1px solid var(--border-glass);
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: rgba(135, 206, 235, 0.1);
  color: var(--text-primary);
}
</style>
