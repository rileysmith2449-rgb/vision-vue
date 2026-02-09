import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlaidStore = defineStore('plaid', () => {
  const isConnected = ref(false)
  const isLinking = ref(false)
  const error = ref(null)
  const itemId = ref(null)

  // Per-member connections for family mode
  const memberConnections = ref({
    mine: { isConnected: false, isLinking: false, error: null, itemId: null },
    yours: { isConnected: false, isLinking: false, error: null, itemId: null }
  })

  async function createLinkToken(memberId) {
    if (memberId) {
      memberConnections.value[memberId].error = null
    } else {
      error.value = null
    }
    const url = memberId ? `/api/link-token?member=${memberId}` : '/api/link-token'
    const res = await fetch(url, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to create link token')
    const data = await res.json()
    return data.link_token
  }

  async function exchangeToken(publicToken, memberId) {
    if (memberId) {
      memberConnections.value[memberId].error = null
    } else {
      error.value = null
    }
    const res = await fetch('/api/exchange-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_token: publicToken, member: memberId || undefined }),
    })
    if (!res.ok) throw new Error('Failed to exchange token')
    const data = await res.json()
    if (memberId) {
      memberConnections.value[memberId].itemId = data.item_id
      memberConnections.value[memberId].isConnected = true
    } else {
      itemId.value = data.item_id
      isConnected.value = true
    }
  }

  async function disconnect(memberId) {
    await fetch('/api/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member: memberId || undefined }),
    })
    if (memberId) {
      memberConnections.value[memberId].isConnected = false
      memberConnections.value[memberId].itemId = null
    } else {
      isConnected.value = false
      itemId.value = null
    }
  }

  return {
    isConnected,
    isLinking,
    error,
    itemId,
    memberConnections,
    createLinkToken,
    exchangeToken,
    disconnect,
  }
})
