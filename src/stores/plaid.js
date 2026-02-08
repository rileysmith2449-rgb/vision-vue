import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlaidStore = defineStore('plaid', () => {
  const isConnected = ref(false)
  const isLinking = ref(false)
  const error = ref(null)
  const itemId = ref(null)

  async function createLinkToken() {
    error.value = null
    const res = await fetch('/api/link-token', { method: 'POST' })
    if (!res.ok) throw new Error('Failed to create link token')
    const data = await res.json()
    return data.link_token
  }

  async function exchangeToken(publicToken) {
    error.value = null
    const res = await fetch('/api/exchange-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_token: publicToken }),
    })
    if (!res.ok) throw new Error('Failed to exchange token')
    const data = await res.json()
    itemId.value = data.item_id
    isConnected.value = true
  }

  async function disconnect() {
    await fetch('/api/disconnect', { method: 'POST' })
    isConnected.value = false
    itemId.value = null
  }

  return {
    isConnected,
    isLinking,
    error,
    itemId,
    createLinkToken,
    exchangeToken,
    disconnect,
  }
})
