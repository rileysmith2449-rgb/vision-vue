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

  function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' }
    try {
      const token = sessionStorage.getItem('DS_SESSION_TOKEN')
        || localStorage.getItem('DS_SESSION_TOKEN')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } catch {
      // No auth token available — localhost fallback will be used server-side
    }
    return headers
  }

  async function createLinkToken(memberId) {
    if (memberId) {
      memberConnections.value[memberId].error = null
    } else {
      error.value = null
    }
    const url = memberId ? `/api/link-token?member=${memberId}` : '/api/link-token'
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        products: ['transactions', 'investments', 'liabilities']
      }),
    })
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
      headers: getAuthHeaders(),
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

  async function fetchTransactions(memberId, start, end) {
    const params = new URLSearchParams({ start, end })
    if (memberId) params.set('member', memberId)
    const res = await fetch(`/api/transactions?${params}`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to fetch transactions')
    const data = await res.json()
    return data.transactions
  }

  async function fetchHoldings(memberId) {
    const params = new URLSearchParams()
    if (memberId) params.set('member', memberId)
    const res = await fetch(`/api/holdings?${params}`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to fetch holdings')
    const data = await res.json()
    return data.holdings
  }

  async function fetchAccounts(memberId) {
    const params = new URLSearchParams()
    if (memberId) params.set('member', memberId)
    const res = await fetch(`/api/accounts?${params}`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to fetch accounts')
    const data = await res.json()
    return data.accounts
  }

  async function fetchLiabilities(memberId) {
    const params = new URLSearchParams()
    if (memberId) params.set('member', memberId)
    const res = await fetch(`/api/liabilities?${params}`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to fetch liabilities')
    const data = await res.json()
    return data.liabilities
  }

  async function disconnect(memberId) {
    await fetch('/api/disconnect', {
      method: 'POST',
      headers: getAuthHeaders(),
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
    getAuthHeaders,
    createLinkToken,
    exchangeToken,
    fetchTransactions,
    fetchHoldings,
    fetchAccounts,
    fetchLiabilities,
    disconnect,
  }
})
