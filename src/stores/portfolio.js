import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateDemoHoldings } from '@/utils/demoData'
import { calculateTaxTreatment, daysUntilLongTerm } from '@/utils/taxCalculations'

export const usePortfolioStore = defineStore('portfolio', () => {
  // State
  const holdings = ref([])
  const loading = ref(false)
  const error = ref(null)
  const dataSource = ref('demo') // 'demo' | 'plaid'

  // Getters
  const totalValue = computed(() => {
    return holdings.value.reduce((sum, holding) => sum + holding.currentValue, 0)
  })

  const totalCostBasis = computed(() => {
    return holdings.value.reduce((sum, holding) => sum + holding.costBasis, 0)
  })

  const totalGains = computed(() => {
    return totalValue.value - totalCostBasis.value
  })

  const unrealizedGains = computed(() => {
    return holdings.value
      .filter(h => h.currentValue > h.costBasis)
      .reduce((sum, h) => sum + (h.currentValue - h.costBasis), 0)
  })

  const unrealizedLosses = computed(() => {
    return holdings.value
      .filter(h => h.currentValue < h.costBasis)
      .reduce((sum, h) => sum + Math.abs(h.currentValue - h.costBasis), 0)
  })

  const longTermHoldings = computed(() => {
    return holdings.value.filter(h => {
      if (h.type === 'cash') return false
      return calculateTaxTreatment(h.purchaseDate) === 'long-term'
    })
  })

  const longTermValue = computed(() => {
    return longTermHoldings.value.reduce((sum, h) => sum + h.currentValue, 0)
  })

  const shortTermGains = computed(() => {
    return holdings.value
      .filter(h => h.type !== 'cash' && calculateTaxTreatment(h.purchaseDate) === 'short-term')
      .reduce((sum, h) => sum + Math.max(0, h.currentValue - h.costBasis), 0)
  })

  const longTermGains = computed(() => {
    return holdings.value
      .filter(h => h.type !== 'cash' && calculateTaxTreatment(h.purchaseDate) === 'long-term')
      .reduce((sum, h) => sum + Math.max(0, h.currentValue - h.costBasis), 0)
  })

  const harvestableHoldings = computed(() => {
    return holdings.value.filter(h => h.currentValue < h.costBasis)
  })

  const harvestableAmount = computed(() => {
    return harvestableHoldings.value.reduce(
      (sum, h) => sum + Math.abs(h.currentValue - h.costBasis),
      0
    )
  })

  const estimatedTaxImpact = computed(() => {
    // Simplified: 32% short-term, 15% long-term
    return shortTermGains.value * 0.32 + longTermGains.value * 0.15
  })

  const holdingsByCategory = computed(() => {
    const categories = {}
    holdings.value.forEach(holding => {
      const category = holding.category || 'Other'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(holding)
    })
    return categories
  })

  const categoryTotals = computed(() => {
    const totals = {}
    Object.keys(holdingsByCategory.value).forEach(category => {
      totals[category] = holdingsByCategory.value[category].reduce(
        (sum, h) => sum + h.currentValue,
        0
      )
    })
    return totals
  })

  // Actions
  async function loadHoldings() {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      holdings.value = generateDemoHoldings()
      dataSource.value = 'demo'
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadFromPlaid() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/holdings')
      if (!res.ok) throw new Error('Failed to fetch holdings from Plaid')
      const data = await res.json()
      holdings.value = data.holdings
      dataSource.value = 'plaid'
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function addHolding(holding) {
    holdings.value.push({
      ...holding,
      id: Date.now().toString()
    })
  }

  function updateHolding(id, updates) {
    const index = holdings.value.findIndex(h => h.id === id)
    if (index !== -1) {
      holdings.value[index] = { ...holdings.value[index], ...updates }
    }
  }

  function removeHolding(id) {
    holdings.value = holdings.value.filter(h => h.id !== id)
  }

  function getHoldingsByCategory(category) {
    return holdings.value.filter(h => h.category === category)
  }

  return {
    // State
    holdings,
    loading,
    error,
    dataSource,
    // Getters
    totalValue,
    totalCostBasis,
    totalGains,
    unrealizedGains,
    unrealizedLosses,
    longTermHoldings,
    longTermValue,
    shortTermGains,
    longTermGains,
    harvestableHoldings,
    harvestableAmount,
    estimatedTaxImpact,
    holdingsByCategory,
    categoryTotals,
    // Actions
    loadHoldings,
    loadFromPlaid,
    addHolding,
    updateHolding,
    removeHolding,
    getHoldingsByCategory
  }
})
