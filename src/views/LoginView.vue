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

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="input-group">
          <label for="passcode">Passcode</label>
          <input
            id="passcode"
            v-model="passcode"
            type="password"
            placeholder="Enter passcode"
            autocomplete="off"
            required
          />
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <button type="submit" class="btn-primary">
          Enter
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const passcode = ref('')

function handleSubmit() {
  try {
    authStore.login(passcode.value)
    router.push('/')
  } catch {
    // error is set in auth store
  }
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
  max-width: 380px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  padding: 40px 32px;
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-glass);
}

.login-brand {
  text-align: center;
  margin-bottom: 32px;
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}

.input-group input {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.input-group input::placeholder {
  color: var(--text-tertiary);
}

.input-group input:focus {
  border-color: var(--violet-pop);
}

.error-message {
  font-size: 0.85rem;
  color: var(--persimmon);
  background: rgba(244, 91, 105, 0.08);
  border: 1px solid rgba(244, 91, 105, 0.2);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  background: var(--gradient-pop);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:active {
  transform: scale(0.98);
}
</style>
