import { ref, computed, watch } from 'vue'
import { useCreditCardStore } from '@/stores/creditCardStore'
import { useBudgetStore } from '@/stores/budget'
import {
  analyzeTransactions,
  generateRecommendations,
  generateCheatSheet,
  findBestCard,
} from '@/services/cardOptimizationService'

export function useCardOptimizer() {
  const cardStore = useCreditCardStore()
  const budgetStore = useBudgetStore()

  const report = ref(null)
  const recommendations = ref([])
  const cheatSheet = ref([])
  const isAnalyzing = ref(false)

  /** Convert budget store transactions to Plaid-like format for the engine */
  function toBudgetPlaidTransactions() {
    const txns = []
    const expenses = budgetStore.expenses
    if (!expenses) return txns

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

    let idCounter = 0
    for (const [catName, catData] of Object.entries(expenses)) {
      const mapping = CATEGORY_MAP[catName] || { primary: 'OTHER', detailed: 'OTHER' }
      for (const [subName, transactions] of Object.entries(catData.subcategories)) {
        const detailed = SUB_MAP[subName] || mapping.detailed
        for (const t of transactions) {
          txns.push({
            transaction_id: `budget_${idCounter++}`,
            amount: t.amount,
            merchant_name: t.merchant,
            name: t.merchant,
            personal_finance_category: {
              primary: mapping.primary,
              detailed,
            },
            _cardKey: null, // Budget data doesn't map to cardKeys in the API portfolio
            _budgetCard: t.card, // Keep original budget card name for reference
            date: t.date,
          })
        }
      }
    }
    return txns
  }

  function runAnalysis() {
    const active = cardStore.activeCards
    if (active.length === 0) {
      report.value = null
      recommendations.value = []
      cheatSheet.value = []
      return
    }

    isAnalyzing.value = true

    try {
      const transactions = toBudgetPlaidTransactions()
      const r = analyzeTransactions(transactions, cardStore.plaidMappings, active, cardStore.cardDetails)
      report.value = r

      recommendations.value = generateRecommendations(r, cardStore.cardDetails, cardStore.plaidMappings, active)
      cheatSheet.value = generateCheatSheet(cardStore.plaidMappings, active, cardStore.cardDetails)
    } finally {
      isAnalyzing.value = false
    }
  }

  // Re-analyze when transactions or active cards change
  watch(
    () => [budgetStore.allTransactions.length, cardStore.activeCards.length],
    () => { runAnalysis() },
    { immediate: false }
  )

  // Computed helpers
  const totalMissedRewards = computed(() => report.value?.totals?.missedRewards || 0)

  const optimizationScore = computed(() => {
    if (!report.value?.totals) return 100
    const { optimalRewards, actualRewards } = report.value.totals
    if (optimalRewards === 0) return 100
    // When we don't have actual card tracking, show potential vs base
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
    runAnalysis,
    getBestCardFor,
  }
}
