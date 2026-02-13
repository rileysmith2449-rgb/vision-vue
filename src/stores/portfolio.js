import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateDemoHoldings, generateDemoLiabilities, generateNetWorthHistory, generateBenchmarkData, generatePropertyValues } from '@/utils/demoData'
import { calculateTaxTreatment, daysUntilLongTerm } from '@/utils/taxCalculations'
import { useSettingsStore } from '@/stores/settings'
import { usePlaidStore } from '@/stores/plaid'

export const usePortfolioStore = defineStore('portfolio', () => {
  // State
  const holdings = ref([])
  const loading = ref(false)
  const error = ref(null)
  const dataSource = ref('demo') // 'demo' | 'plaid'

  // Net worth state
  const liabilities = ref([])
  const netWorthHistory = ref([])
  const benchmarkHistory = ref([])
  const propertyValues = ref([])

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

  // Net worth computeds
  const totalLiabilities = computed(() => {
    return liabilities.value.reduce((sum, l) => sum + l.balance, 0)
  })

  const totalPropertyValue = computed(() => {
    return propertyValues.value.reduce((sum, p) => sum + p.estimatedValue, 0)
  })

  const netWorth = computed(() => {
    return totalValue.value + totalPropertyValue.value - totalLiabilities.value
  })

  const liabilitiesByCategory = computed(() => {
    const categories = {}
    liabilities.value.forEach(l => {
      const cat = l.category || 'Other'
      if (!categories[cat]) categories[cat] = []
      categories[cat].push(l)
    })
    return categories
  })

  const liabilityCategoryTotals = computed(() => {
    const totals = {}
    Object.keys(liabilitiesByCategory.value).forEach(cat => {
      totals[cat] = liabilitiesByCategory.value[cat].reduce((sum, l) => sum + l.balance, 0)
    })
    return totals
  })

  async function loadLiabilitiesFromPlaid() {
    const plaidStore = usePlaidStore()
    try {
      const plaidLiabilities = await plaidStore.fetchLiabilities()
      liabilities.value = plaidLiabilities
    } catch (err) {
      console.error('Failed to load Plaid liabilities, falling back to demo:', err)
      liabilities.value = generateDemoLiabilities()
    }
  }

  async function loadNetWorthData() {
    const settingsStore = useSettingsStore()
    if (settingsStore.dataSource === 'plaid') {
      await loadLiabilitiesFromPlaid()
    } else {
      liabilities.value = generateDemoLiabilities()
    }
    propertyValues.value = generatePropertyValues()
    // Pin today's net worth so the chart's last point matches the hero cards
    const assets = (totalValue.value || 0) + (totalPropertyValue.value || 0)
    const debts = totalLiabilities.value || 0
    const currentNW = assets - debts
    netWorthHistory.value = generateNetWorthHistory(isNaN(currentNW) ? 0 : currentNW)
    benchmarkHistory.value = generateBenchmarkData()
  }

  // Actions
  async function loadHoldings() {
    const settingsStore = useSettingsStore()
    loading.value = true
    error.value = null
    try {
      if (settingsStore.dataSource === 'plaid') {
        return await loadFromPlaid()
      }
      await new Promise(resolve => setTimeout(resolve, 300))
      holdings.value = generateDemoHoldings()
      await loadNetWorthData()
      dataSource.value = 'demo'
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadFromPlaid() {
    const plaidStore = usePlaidStore()
    loading.value = true
    error.value = null
    try {
      const plaidHoldings = await plaidStore.fetchHoldings()
      holdings.value = plaidHoldings
      await loadNetWorthData()
      dataSource.value = 'plaid'
    } catch (err) {
      error.value = err.message
      // Fall back to demo on error
      holdings.value = generateDemoHoldings()
      await loadNetWorthData()
      dataSource.value = 'demo'
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
    liabilities,
    netWorthHistory,
    benchmarkHistory,
    propertyValues,
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
    totalLiabilities,
    totalPropertyValue,
    netWorth,
    liabilitiesByCategory,
    liabilityCategoryTotals,
    // Actions
    loadHoldings,
    loadFromPlaid,
    loadLiabilitiesFromPlaid,
    loadNetWorthData,
    addHolding,
    updateHolding,
    removeHolding,
    getHoldingsByCategory
  }
})
