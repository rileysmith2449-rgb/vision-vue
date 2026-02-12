<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="48" height="48" class="login-logo">
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
        flowId="sign-up"
        :theme="'dark'"
        @success="handleSuccess"
        @error="handleError"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Descope } from '@descope/vue-sdk'
const router = useRouter()

function handleSuccess() {
  router.push('/')
}

function handleError(e) {
  console.error('Auth error:', e)
}
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

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  padding: 40px 32px;
  background-image: var(--gradient-card);
  box-shadow: var(--shadow-glass);
}

.login-brand {
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
</style>
