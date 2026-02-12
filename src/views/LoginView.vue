<template>
  <div class="login-page">
    <!-- Animated Intro -->
    <transition name="intro-fade">
      <div v-if="introActive" class="intro-overlay" @click="endIntro">
        <div class="intro-scene">
          <svg class="intro-svg" viewBox="-55 -55 110 110" xmlns="http://www.w3.org/2000/svg">
            <!-- Planet -->
            <circle cx="0" cy="0" r="28" fill="none" stroke="currentColor" stroke-width="4" class="intro-planet" />
            <!-- Orbit ring -->
            <ellipse cx="0" cy="0" rx="42" ry="17" fill="none" stroke="currentColor" stroke-width="2.5" transform="rotate(-20)" class="intro-ring" />
            <!-- Satellite removed for now -->
          </svg>
          <transition name="wordmark-fade">
            <div v-if="showWordmark" class="intro-wordmark">
              <h1>VISION</h1>
              <p>Tax-Smart Portfolio Intelligence</p>
            </div>
          </transition>
        </div>
      </div>
    </transition>

    <!-- Login Card -->
    <transition name="card-appear">
      <div v-if="!introActive" class="login-card">
        <div class="login-brand">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="72" height="72" class="login-logo">
            <g transform="translate(50,50)">
              <circle cx="0" cy="0" r="28" fill="none" stroke="currentColor" stroke-width="4"/>
              <ellipse cx="0" cy="0" rx="42" ry="17" fill="none" stroke="currentColor" stroke-width="2.5" transform="rotate(-20)"/>
              <circle cx="40" cy="-16" r="5" fill="currentColor"/>
            </g>
          </svg>
          <h1 class="login-title">VISION</h1>
          <p class="login-subtitle">Tax-Smart Portfolio Intelligence</p>
        </div>

        <Descope
          flowId="sign-up-or-in"
          :theme="themeStore.isDark ? 'dark' : 'light'"
          @success="handleSuccess"
          @error="handleError"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Descope } from '@descope/vue-sdk'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const themeStore = useThemeStore()

const introActive = ref(true)
const showWordmark = ref(false)

function endIntro() {
  introActive.value = false
}

function handleSuccess() {
  router.push('/')
}

function handleError(e) {
  console.error('Auth error:', e)
}

onMounted(() => {
  // Show VISION text after satellite starts decelerating
  setTimeout(() => { showWordmark.value = true }, 2500)
  // End intro and reveal login
  setTimeout(() => { introActive.value = false }, 4500)
})
</script>

<style scoped>
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 20px;
  z-index: 1000;
}

/* ── Intro Overlay ── */
.intro-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  z-index: 2000;
  cursor: pointer;
}

.intro-scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.intro-svg {
  width: 400px;
  height: 400px;
  color: var(--violet-pop);
}

/* Planet draws in */
.intro-planet {
  stroke-dasharray: 176;
  stroke-dashoffset: 176;
  animation: draw-stroke 0.8s ease-out forwards;
}

/* Orbit ring draws in after planet */
.intro-ring {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: draw-stroke 1s ease-out 0.3s forwards;
}

@keyframes draw-stroke {
  to { stroke-dashoffset: 0; }
}

/* Wordmark fade-in */
.intro-wordmark {
  text-align: center;
}

.intro-wordmark h1 {
  font-family: 'Lexend', sans-serif;
  font-size: 2.5rem;
  font-weight: 400;
  letter-spacing: 0.3em;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.intro-wordmark p {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.wordmark-fade-enter-active {
  transition: all 0.8s ease-out;
}

.wordmark-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

/* Intro fade-out transition */
.intro-fade-leave-active {
  transition: opacity 0.6s ease;
}

.intro-fade-leave-to {
  opacity: 0;
}

/* Login card appear transition */
.card-appear-enter-active {
  transition: all 0.6s ease-out 0.2s;
}

.card-appear-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* ── Login Card ── */
.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  padding: 40px 32px;
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-glass);
}

.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 24px;
}

.login-logo {
  color: var(--violet-pop);
  margin-bottom: 12px;
}

.login-title {
  font-family: 'Lexend', sans-serif;
  font-size: 1.75rem;
  font-weight: 400;
  letter-spacing: 0.25em;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.login-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

@media (max-width: 480px) {
  .intro-svg {
    width: 280px;
    height: 280px;
  }

  .intro-wordmark h1 {
    font-size: 2rem;
  }
}
</style>
