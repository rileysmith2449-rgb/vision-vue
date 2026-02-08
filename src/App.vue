<template>
  <div class="app-container" :data-theme="currentTheme">
    <Sidebar v-if="!isMobile" />
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
