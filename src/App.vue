<template>
  <div class="app-container" :data-theme="currentTheme">
    <Sidebar v-if="!isMobile" />
    <div class="top-bar">
      <div class="top-bar-brand">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24">
          <g transform="translate(50,50)">
            <circle cx="0" cy="0" r="28" fill="none" stroke="currentColor" stroke-width="4"/>
            <ellipse cx="0" cy="0" rx="42" ry="17" fill="none" stroke="currentColor" stroke-width="2.5" transform="rotate(-20)"/>
            <circle cx="40" cy="-16" r="5" fill="currentColor"/>
          </g>
        </svg>
        <span class="top-bar-divider"></span>
        <span class="top-bar-text">VISION</span>
      </div>
    </div>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <MobileNav v-if="isMobile" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useViewportStore } from '@/stores/viewport'
import Sidebar from '@/components/layout/Sidebar.vue'
import MobileNav from '@/components/layout/MobileNav.vue'

const themeStore = useThemeStore()
const viewportStore = useViewportStore()

const currentTheme = computed(() => themeStore.currentTheme)
const isMobile = computed(() => viewportStore.isMobile)

onMounted(() => {
  viewportStore.updateViewport()
  window.addEventListener('resize', viewportStore.updateViewport)
})

onUnmounted(() => {
  window.removeEventListener('resize', viewportStore.updateViewport)
})
</script>

<style>
.top-bar {
  display: none;
}

@media (max-width: 1024px) {
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 24px 20px;
    border-bottom: 1px solid var(--border-glass);
  }
}

.top-bar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
}

.top-bar-divider {
  width: 1px;
  height: 20px;
  background: var(--text-primary);
  opacity: 0.25;
}

.top-bar-text {
  font-family: 'Lexend', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.25em;
  color: var(--text-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
