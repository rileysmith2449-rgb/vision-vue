import { ref, computed, watch } from 'vue'
import { useCreditCardStore } from '@/stores/creditCardStore'
import { useBudgetStore } from '@/stores/budget'
import { useSettingsStore } from '@/stores/settings'
import {
  analyzeTransactions,
  generateRecommendations,
  generateCheatSheet,
  findBestCard,
} from '@/services/cardOptimizationService'

// Map budget category names to Plaid primary/detailed codes
const CATEGORY_MAP = {
  'Housing & Rent': { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
  'Dining & Food': { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_RESTAURANT' },
  'Transportation': { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_GAS' },
  'Shopping': { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE' },
  'Entertainment': { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_OTHER_ENTERTAINMENT' },
  'Travel': { primary: 'TRAVEL', detailed: 'TRAVEL_OTHER_TRAVEL' },
  'Bills & Utilities': { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_OTHER_UTILITIES' },
  'Office & Software': { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_OTHER_GENERAL_SERVICES' },
  'Meals & Entertainment': { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_RESTAURANT' },
  'Internet & Phone': { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_TELECOMMUNICATION_SERVICES' },
  'Business': { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_OTHER_GENERAL_SERVICES' },
}

// Sub-category to more specific Plaid detailed codes
const SUB_MAP = {
  'Groceries': 'FOOD_AND_DRINK_GROCERIES',
  'Restaurants': 'FOOD_AND_DRINK_RESTAURANT',
  'Coffee Shops': 'FOOD_AND_DRINK_COFFEE',
  'Fast Food': 'FOOD_AND_DRINK_FAST_FOOD',
  'Gas & Fuel': 'TRANSPORTATION_GAS',
  'Rideshare': 'TRANSPORTATION_TAXIS_AND_RIDE_SHARES',
  'Public Transit': 'TRANSPORTATION_PUBLIC_TRANSIT',
  'Parking': 'TRANSPORTATION_PARKING',
  'Flights': 'TRAVEL_FLIGHTS',
  'Hotels': 'TRAVEL_LODGING',
  'Streaming': 'ENTERTAINMENT_TV_AND_MOVIES',
  'Games': 'ENTERTAINMENT_GAMES',
  'Clothing': 'GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES',
  'Electronics': 'GENERAL_MERCHANDISE_ELECTRONICS',
  'Rent': 'RENT_AND_UTILITIES_RENT',
  'Renters Insurance': 'RENT_AND_UTILITIES_OTHER_UTILITIES',
}

function toCardKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
}

export function useCardOptimizer(periodRef, cardFilterRef) {
  const cardStore = useCreditCardStore()
  const budgetStore = useBudgetStore()
  const settingsStore = useSettingsStore()

  const report = ref(null)
  const recommendations = ref([])
  const cheatSheet = ref([])
  const isAnalyzing = ref(false)

  const PERIOD_MONTHS = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }

  /** Resolve a card name to a portfolio cardKey */
  function resolveCardKey(cardName) {
    if (!cardName) return null
    const key = toCardKey(cardName)
    // Direct match
    if (cardStore.cardDetails[key]) return key
    // Fuzzy match — find by cardName in details
    for (const [k, detail] of Object.entries(cardStore.cardDetails)) {
      if (detail.cardName === cardName) return k
    }
    return key // return computed key even if not in portfolio
  }

  /** Convert a flat transaction to Plaid-like format */
  function toPlaidTransaction(t, id, catName) {
    const mapping = CATEGORY_MAP[catName] || { primary: 'OTHER', detailed: 'OTHER' }
    const detailed = (t.subcategory && SUB_MAP[t.subcategory]) || mapping.detailed
    return {
      transaction_id: id,
      amount: t.amount,
      merchant_name: t.merchant,
      name: t.merchant,
      personal_finance_category: {
        primary: mapping.primary,
        detailed,
      },
      _cardKey: resolveCardKey(t.card),
      _budgetCard: t.card,
      _budgetCategory: catName,
      date: t.date,
    }
  }

  /** Convert budget store expenses (structured) to Plaid-like format */
  function toBudgetPlaidTransactions() {
    const txns = []
    const expenses = budgetStore.expenses
    if (!expenses) return txns

    let idCounter = 0
    for (const [catName, catData] of Object.entries(expenses)) {
      for (const [, transactions] of Object.entries(catData.subcategories)) {
        for (const t of transactions) {
          txns.push(toPlaidTransaction(t, `budget_${idCounter++}`, catName))
        }
      }
    }
    return txns
  }

  /** Convert flat historical transactions (from CSV) to Plaid-like format */
  function toHistoricalPlaidTransactions() {
    const historical = budgetStore.historicalTransactions
    if (!historical || historical.length === 0) return []
    return historical.map((t, i) =>
      toPlaidTransaction(t, `csv_${i}`, t.category || 'Shopping')
    )
  }

  /** Filter transactions by selected period */
  const filteredTransactions = computed(() => {
    const isCSV = settingsStore.dataSource === 'csv'
    const all = isCSV ? toHistoricalPlaidTransactions() : toBudgetPlaidTransactions()
    if (!periodRef || all.length === 0) return all

    const months = PERIOD_MONTHS[periodRef.value] || 3

    if (isCSV) {
      // For CSV, use the date range relative to the newest transaction
      // so uploaded data always shows regardless of how old it is
      const dates = all.map(t => new Date(t.date))
      const maxDate = new Date(Math.max(...dates))
      const cutoff = new Date(maxDate.getFullYear(), maxDate.getMonth() - months + 1, 1)
      return all.filter(t => new Date(t.date) >= cutoff)
    }

    const now = new Date()
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
    return all.filter(t => new Date(t.date) >= cutoff)
  })

  const filteredActiveCards = computed(() => {
    const filter = cardFilterRef?.value || 'all'
    if (filter === 'all') return cardStore.activeCards
    const type = filter === 'personal' ? 'Personal' : 'Business'
    return cardStore.activeCards.filter(c => {
      const detail = cardStore.cardDetails[c.cardKey]
      return detail?.cardType === type
    })
  })

  function runAnalysis() {
    const active = filteredActiveCards.value
    if (active.length === 0) {
      report.value = null
      recommendations.value = []
      cheatSheet.value = []
      return
    }

    isAnalyzing.value = true

    try {
      const transactions = filteredTransactions.value
      const r = analyzeTransactions(transactions, cardStore.plaidMappings, active, cardStore.cardDetails)
      report.value = r

      recommendations.value = generateRecommendations(r, cardStore.cardDetails, cardStore.plaidMappings, active)
      cheatSheet.value = generateCheatSheet(cardStore.plaidMappings, active, cardStore.cardDetails)
    } finally {
      isAnalyzing.value = false
    }
  }

  // Re-analyze when transactions, active cards, or period change
  watch(
    () => [budgetStore.allTransactions.length, budgetStore.historicalTransactions.length, cardStore.activeCards.length, periodRef?.value, cardFilterRef?.value],
    () => { runAnalysis() },
    { immediate: false }
  )

  // Computed helpers
  const totalMissedRewards = computed(() => report.value?.totals?.missedRewards || 0)

  const optimizationScore = computed(() => {
    if (!report.value?.totals) return 100
    const { optimalRewards, actualRewards } = report.value.totals
    if (optimalRewards === 0) return 100
    return Math.round((1 - (report.value.totals.missedRewards / optimalRewards)) * 100)
  })

  const totalOptimalRewards = computed(() => report.value?.totals?.optimalRewards || 0)
  const totalSpend = computed(() => report.value?.totals?.spend || 0)

  const topCategories = computed(() => {
    if (!report.value?.byCategory) return []
    return Object.values(report.value.byCategory)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10)
  })

  function getBestCardFor(plaidCategory) {
    return findBestCard(plaidCategory, cardStore.plaidMappings, cardStore.activeCards, null, cardStore.cardDetails)
  }

  return {
    report,
    recommendations,
    cheatSheet,
    isAnalyzing,
    totalMissedRewards,
    optimizationScore,
    totalOptimalRewards,
    totalSpend,
    topCategories,
    filteredTransactions,
    runAnalysis,
    getBestCardFor,
  }
}
