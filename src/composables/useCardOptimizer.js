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

export function useCardOptimizer(periodRef, cardFilterRef, showFutureRef) {
  const cardStore = useCreditCardStore()
  const budgetStore = useBudgetStore()
  const settingsStore = useSettingsStore()

  // Current state analysis
  const report = ref(null)
  const recommendations = ref([])
  const cheatSheet = ref([])

  // Future state analysis (current cards + market cards)
  const futureReport = ref(null)
  const futureRecommendations = ref([])
  const futureCheatSheet = ref([])

  // Global analysis (all known cards)
  const globalReport = ref(null)

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

  /** Filter transactions by card type and selected period */
  const filteredTransactions = computed(() => {
    const isCSV = settingsStore.dataSource === 'csv'
    let txns = isCSV ? toHistoricalPlaidTransactions() : toBudgetPlaidTransactions()
    if (txns.length === 0) return txns

    // Filter by card type — only show transactions actually made on matching cards
    const filter = cardFilterRef?.value || 'all'
    if (filter !== 'all') {
      const type = filter === 'personal' ? 'Personal' : 'Business'
      txns = txns.filter(t => {
        if (!t._cardKey) return false
        const detail = cardStore.cardDetails[t._cardKey]
        return detail?.cardType === type
      })
    }

    if (!periodRef || txns.length === 0) return txns

    // "all" period = no date filter
    if (periodRef.value === 'all') return txns

    const months = PERIOD_MONTHS[periodRef.value] || 3

    if (isCSV) {
      // For CSV, use the date range relative to the newest transaction
      // so uploaded data always shows regardless of how old it is
      const dates = txns.map(t => new Date(t.date))
      const maxDate = new Date(Math.max(...dates))
      const cutoff = new Date(maxDate.getFullYear(), maxDate.getMonth() - months + 1, 1)
      return txns.filter(t => new Date(t.date) >= cutoff)
    }

    const now = new Date()
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
    return txns.filter(t => new Date(t.date) >= cutoff)
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

  /** All known cards as portfolio-like entries (for future/global analysis) */
  const allKnownCards = computed(() => {
    const filter = cardFilterRef?.value || 'all'
    return cardStore.allKnownCardKeys.map(key => ({ cardKey: key, active: true })).filter(c => {
      if (filter === 'all') return true
      const type = filter === 'personal' ? 'Personal' : 'Business'
      const detail = cardStore.cardDetails[c.cardKey]
      return detail?.cardType === type
    })
  })

  /** Current portfolio + market cards merged (for future state) */
  const futureCards = computed(() => {
    const activeKeys = new Set(filteredActiveCards.value.map(c => c.cardKey))
    const filter = cardFilterRef?.value || 'all'
    const extra = cardStore.allKnownCardKeys
      .filter(key => !activeKeys.has(key))
      .filter(key => {
        if (filter === 'all') return true
        const type = filter === 'personal' ? 'Personal' : 'Business'
        const detail = cardStore.cardDetails[key]
        return detail?.cardType === type
      })
      .map(key => ({ cardKey: key, active: true }))
    return [...filteredActiveCards.value, ...extra]
  })

  function runAnalysis() {
    const active = filteredActiveCards.value
    if (active.length === 0) {
      report.value = null
      recommendations.value = []
      cheatSheet.value = []
      futureReport.value = null
      futureRecommendations.value = []
      futureCheatSheet.value = []
      globalReport.value = null
      return
    }

    isAnalyzing.value = true

    try {
      const transactions = filteredTransactions.value

      // Current state analysis
      const r = analyzeTransactions(transactions, cardStore.plaidMappings, active, cardStore.cardDetails)
      report.value = r
      recommendations.value = generateRecommendations(r, cardStore.cardDetails, cardStore.plaidMappings, active)
      cheatSheet.value = generateCheatSheet(cardStore.plaidMappings, active, cardStore.cardDetails)

      // Future state analysis (all known cards matching filter)
      const fCards = futureCards.value
      if (fCards.length > active.length) {
        const fr = analyzeTransactions(transactions, cardStore.plaidMappings, fCards, cardStore.cardDetails)
        futureReport.value = fr
        futureRecommendations.value = generateRecommendations(fr, cardStore.cardDetails, cardStore.plaidMappings, fCards)
        futureCheatSheet.value = generateCheatSheet(cardStore.plaidMappings, fCards, cardStore.cardDetails)
      } else {
        futureReport.value = r
        futureRecommendations.value = recommendations.value
        futureCheatSheet.value = cheatSheet.value
      }

      // Global analysis — all known cards regardless of portfolio (for global score)
      const gCards = allKnownCards.value
      if (gCards.length > active.length) {
        globalReport.value = analyzeTransactions(transactions, cardStore.plaidMappings, gCards, cardStore.cardDetails)
      } else {
        globalReport.value = r
      }
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

  // ── Computed helpers that switch based on future state toggle ──
  const isFuture = computed(() => showFutureRef?.value || false)
  const activeReport = computed(() => isFuture.value ? futureReport.value : report.value)
  const activeRecommendations = computed(() => isFuture.value ? futureRecommendations.value : recommendations.value)
  const activeCheatSheet = computed(() => isFuture.value ? futureCheatSheet.value : cheatSheet.value)

  const totalMissedRewards = computed(() => activeReport.value?.totals?.missedRewards || 0)

  const optimizationScore = computed(() => {
    if (!activeReport.value?.totals) return 100
    const { optimalRewards } = activeReport.value.totals
    if (optimalRewards === 0) return 100
    return Math.round((1 - (activeReport.value.totals.missedRewards / optimalRewards)) * 100)
  })

  // Global score: actual rewards / theoretical max with all known cards
  const globalOptimizationScore = computed(() => {
    if (!report.value?.totals || !globalReport.value?.totals) return 100
    const actual = report.value.totals.actualRewards
    const globalOptimal = globalReport.value.totals.optimalRewards
    if (globalOptimal === 0) return 100
    return Math.round((actual / globalOptimal) * 100)
  })

  const totalOptimalRewards = computed(() => activeReport.value?.totals?.optimalRewards || 0)
  const totalSpend = computed(() => activeReport.value?.totals?.spend || 0)
  const signupBonusValue = computed(() => activeReport.value?.totals?.signupBonusValue || 0)

  // Improvement from current → future
  const futureRewardsGain = computed(() => {
    if (!futureReport.value?.totals || !report.value?.totals) return 0
    return futureReport.value.totals.optimalRewards - report.value.totals.optimalRewards
  })

  const topCategories = computed(() => {
    if (!activeReport.value?.byCategory) return []
    return Object.values(activeReport.value.byCategory)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10)
  })

  // ── Wrong Card Transactions (Alerts) ──
  const wrongCardTransactions = computed(() => {
    if (!activeReport.value?.analyses) return []
    return activeReport.value.analyses
      .filter(a => !a.isOptimal && a.actualCard && a.missedRewards > 0)
      .sort((a, b) => b.missedRewards - a.missedRewards)
  })

  const wrongCardCount = computed(() => wrongCardTransactions.value.length)

  const annualizedMissedRewards = computed(() => {
    const missed = activeReport.value?.totals?.missedRewards || 0
    const months = PERIOD_MONTHS[periodRef?.value] || 3
    return (missed / months) * 12
  })

  // ── Signup Bonus Tracker ──
  const signupBonusTracker = computed(() => {
    const cards = cardStore.activeCards
    const now = new Date()
    const trackers = []

    for (const card of cards) {
      const detail = cardStore.cardDetails[card.cardKey]
      if (!detail || !detail.isSignupBonus) continue

      const spendRequired = detail.signupBonusSpend || 0
      const bonusMonths = detail.signupBonusLength || 3
      const bonusAmount = detail.signupBonusAmount || 0
      const bonusType = detail.signUpBonusItem || ''
      const dollarValue = detail.signupBonusDollarValue || 0

      const spent = activeReport.value?.byCard?.[card.cardKey]?.spend || 0
      const remaining = Math.max(0, spendRequired - spent)
      const pct = spendRequired > 0 ? Math.min(100, Math.round((spent / spendRequired) * 100)) : 0

      const addedDate = card.addedDate ? new Date(card.addedDate) : null
      let daysLeft = 0
      let deadlineDate = null
      if (addedDate) {
        deadlineDate = new Date(addedDate)
        deadlineDate.setMonth(deadlineDate.getMonth() + bonusMonths)
        daysLeft = Math.max(0, Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24)))
      }

      const dailyNeeded = daysLeft > 0 ? remaining / daysLeft : 0

      let status = 'not-started'
      if (pct >= 100) {
        status = 'complete'
      } else if (addedDate && deadlineDate && now > deadlineDate) {
        status = 'expired'
      } else if (spent > 0) {
        status = 'active'
      }

      trackers.push({
        cardKey: card.cardKey,
        cardName: detail.cardName,
        cardIssuer: detail.cardIssuer,
        bonusAmount,
        bonusType,
        dollarValue,
        spendRequired,
        spent,
        remaining,
        pct,
        daysLeft,
        dailyNeeded,
        status,
      })
    }

    // Sort: active first (by daysLeft asc), then not-started, complete, expired
    const order = { active: 0, 'not-started': 1, complete: 2, expired: 3 }
    return trackers.sort((a, b) => {
      const oa = order[a.status] ?? 9
      const ob = order[b.status] ?? 9
      if (oa !== ob) return oa - ob
      if (a.status === 'active' && b.status === 'active') return a.daysLeft - b.daysLeft
      return 0
    })
  })

  const totalSubValue = computed(() =>
    signupBonusTracker.value.reduce((s, t) => s + t.dollarValue, 0)
  )

  const earnedSubValue = computed(() =>
    signupBonusTracker.value
      .filter(t => t.status === 'complete')
      .reduce((s, t) => s + t.dollarValue, 0)
  )

  function getBestCardFor(plaidCategory) {
    return findBestCard(plaidCategory, cardStore.plaidMappings, cardStore.activeCards, null, cardStore.cardDetails)
  }

  return {
    report,
    activeReport,
    recommendations: activeRecommendations,
    cheatSheet: activeCheatSheet,
    futureReport,
    globalReport,
    isAnalyzing,
    totalMissedRewards,
    optimizationScore,
    globalOptimizationScore,
    totalOptimalRewards,
    totalSpend,
    signupBonusValue,
    futureRewardsGain,
    topCategories,
    filteredTransactions,
    wrongCardTransactions,
    wrongCardCount,
    annualizedMissedRewards,
    signupBonusTracker,
    totalSubValue,
    earnedSubValue,
    runAnalysis,
    getBestCardFor,
  }
}
