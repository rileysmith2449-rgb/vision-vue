<template>
  <nav class="mobile-nav">
    <router-link
      v-for="link in navLinks"
      :key="link.to"
      :to="link.to"
      class="mobile-nav-item"
      :class="{ active: isActive(link) }"
    >
      <component :is="link.icon" :size="20" stroke-width="1.8" />
      <span class="mobile-nav-label">{{ link.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { LayoutDashboard, Scale, PieChart, Lightbulb, Settings } from 'lucide-vue-next'

const route = useRoute()

const navLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/net-worth', icon: Scale, label: 'Net Worth' },
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
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 68px;
  background: var(--bg-base);
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
  gap: 3px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-tertiary);
  transition: all 0.2s ease;
}

.mobile-nav-item.active {
  color: var(--accent-blue);
}

.mobile-nav-label {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
