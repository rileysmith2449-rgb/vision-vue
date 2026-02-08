import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useViewportStore = defineStore('viewport', () => {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  const isMobile = computed(() => width.value < 1024)
  const isTablet = computed(() => width.value >= 768 && width.value < 1024)
  const isDesktop = computed(() => width.value >= 1024)

  function updateViewport() {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    updateViewport
  }
})
