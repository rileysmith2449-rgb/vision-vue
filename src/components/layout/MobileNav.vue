<template>
  <nav class="mobile-nav">
    <router-link
      v-for="link in navLinks"
      :key="link.to"
      :to="link.to"
      class="mobile-nav-item"
      :class="{ active: isActive(link) }"
    >
      <span class="mobile-nav-icon">{{ link.icon }}</span>
      <span class="mobile-nav-label">{{ link.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navLinks = [
  { to: '/', icon: '📊', label: 'Home' },
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
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-glass);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  z-index: 100;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.mobile-nav-item.active {
  color: var(--electric-teal);
}

.mobile-nav-icon {
  font-size: 1.3rem;
}

.mobile-nav-label {
  font-size: 0.65rem;
  font-weight: 600;
}
</style>
