<template>
  <Card title="Connected Accounts" subtitle="Link your brokerage to import real holdings">
    <div class="plaid-link">
      <!-- Connected state -->
      <div v-if="plaidStore.isConnected" class="status-row">
        <div class="status-badge connected">
          <CheckCircle :size="16" />
          <span>Account Connected</span>
        </div>
        <button class="disconnect-btn" @click="handleDisconnect">Disconnect</button>
      </div>

      <!-- Not connected -->
      <div v-else class="status-row">
        <div class="status-badge disconnected">
          <LinkIcon :size="16" />
          <span>No account linked</span>
        </div>
      </div>

      <!-- Error message -->
      <p v-if="plaidStore.error" class="error-text">{{ plaidStore.error }}</p>

      <!-- Connect button -->
      <button
        v-if="!plaidStore.isConnected"
        class="connect-btn"
        :disabled="plaidStore.isLinking"
        @click="handleConnect"
      >
        <LinkIcon v-if="!plaidStore.isLinking" :size="16" />
        <Loader2 v-else :size="16" class="spin" />
        {{ plaidStore.isLinking ? 'Connecting...' : 'Connect Bank Account' }}
      </button>

      <p class="hint-text">
        Uses Plaid sandbox — test with <strong>user_good</strong> / <strong>pass_good</strong>
      </p>
    </div>
  </Card>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { CheckCircle, Link as LinkIcon, Loader2 } from 'lucide-vue-next'
import Card from '@/components/common/Card.vue'
import { usePlaidStore } from '@/stores/plaid'
import { usePortfolioStore } from '@/stores/portfolio'

const plaidStore = usePlaidStore()
const portfolioStore = usePortfolioStore()

const plaidReady = ref(false)

onMounted(() => {
  // Load Plaid Link SDK from CDN
  if (!document.getElementById('plaid-link-sdk')) {
    const script = document.createElement('script')
    script.id = 'plaid-link-sdk'
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
    script.onload = () => { plaidReady.value = true }
    document.head.appendChild(script)
  } else {
    plaidReady.value = true
  }
})

async function handleConnect() {
  plaidStore.isLinking = true
  plaidStore.error = null

  try {
    const linkToken = await plaidStore.createLinkToken()

    if (!window.Plaid) {
      throw new Error('Plaid SDK not loaded yet. Please try again.')
    }

    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (publicToken) => {
        try {
          await plaidStore.exchangeToken(publicToken)
          await portfolioStore.loadFromPlaid()
        } catch (err) {
          plaidStore.error = err.message
        } finally {
          plaidStore.isLinking = false
        }
      },
      onExit: (err) => {
        if (err) plaidStore.error = err.display_message || err.error_message
        plaidStore.isLinking = false
      },
    })

    handler.open()
  } catch (err) {
    plaidStore.error = err.message
    plaidStore.isLinking = false
  }
}

async function handleDisconnect() {
  await plaidStore.disconnect()
  portfolioStore.loadHoldings() // Revert to demo data
}
</script>

<style scoped>
.plaid-link {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 500;
}

.status-badge.connected {
  background: rgba(100, 149, 237, 0.12);
  color: var(--electric-teal);
}

.status-badge.disconnected {
  background: var(--bg-subtle);
  color: var(--text-tertiary);
}

.connect-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--electric-teal);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.connect-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.disconnect-btn {
  padding: 6px 14px;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.disconnect-btn:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}

.error-text {
  font-size: 0.8rem;
  color: #e74c3c;
}

.hint-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.hint-text strong {
  color: var(--text-secondary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
