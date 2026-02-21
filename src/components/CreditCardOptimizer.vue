<template>
  <div class="cc-optimizer">
    <!-- Score Banner -->
    <ScoreBanner
      :optimizationScore="optimizationScore"
      :globalOptimizationScore="globalOptimizationScore"
      :totalSpend="totalSpend"
      :totalOptimalRewards="totalOptimalRewards"
      :totalMissedRewards="totalMissedRewards"
      :futureRewardsGain="futureRewardsGain"
      :signupBonusValue="signupBonusValue"
      :showFutureState="showFutureState"
      :selectedPeriod="selectedPeriod"
      :cardFilter="cardFilter"
      :periodLabel="periodLabel"
      :periods="periods"
      @update:selectedPeriod="selectedPeriod = $event"
      @update:cardFilter="cardFilter = $event"
      @update:showFutureState="showFutureState = $event"
      @manage-cards="showCardManager = true"
    />

    <!-- View Toggle -->
    <div class="view-toggle">
      <button
        v-for="v in views"
        :key="v.key"
        :class="['toggle-btn', { active: activeView === v.key }]"
        @click="activeView = v.key"
      >
        <component :is="v.icon" :size="15" stroke-width="2" />
        {{ v.label }}
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="cardStore.activeCards.length === 0" class="empty-state">
      <CreditCard :size="40" stroke-width="1.2" class="empty-icon" />
      <p class="empty-title">No cards in your portfolio</p>
      <p class="empty-desc">Add your credit cards to see personalized optimization recommendations.</p>
      <button class="primary-btn" @click="showCardManager = true">
        <Plus :size="16" stroke-width="2" />
        Add Cards
      </button>
    </div>

    <!-- Loading -->
    <div v-else-if="isAnalyzing || cardStore.loading" class="loading-state">
      <Loader2 :size="24" stroke-width="2" class="loading-spinner" />
      Analyzing your transactions...
    </div>

    <template v-else>
      <AlertsTab
        v-if="activeView === 'alerts'"
        :wrongCardCount="wrongCardCount"
        :wrongCardTransactions="wrongCardTransactions"
        :annualizedMissedRewards="annualizedMissedRewards"
      />

      <CategoryTab
        v-if="activeView === 'categories'"
        :topCategories="topCategories"
        :expandedCat="expandedCat"
        :getCategoryTransactions="getCategoryTransactions"
        :getCategoryBudget="getCategoryBudget"
        @update:expandedCat="expandedCat = $event"
      />

      <CardStackTab
        v-if="activeView === 'cards'"
        :personalCards="personalCards"
        :businessCards="businessCards"
        :expandedCard="expandedCard"
        :marketCardSuggestions="marketCardSuggestions"
        :merchantCardSuggestions="merchantCardSuggestions"
        :cardFilter="cardFilter"
        :getCardCategoryBreakdown="getCardCategoryBreakdown"
        :getCardTransactions="getCardTransactions"
        :isCardInPortfolio="isCardInPortfolio"
        :getCardImageUrl="(key) => cardStore.getCardImageUrl(key)"
        @update:expandedCard="expandedCard = $event"
        @add-suggested-card="addSuggestedCard"
      />

      <PointsTab
        v-if="activeView === 'points'"
        :pooledPointsPrograms="pooledPointsPrograms"
        :creditsSummary="creditsSummary"
        :totalCreditsValue="totalCreditsValue"
      />

      <SpendMapTab
        v-if="activeView === 'spendmap'"
        :cheatSheet="cheatSheet"
        :activeSpendMap="activeSpendMap"
        :filteredEcosystems="filteredEcosystems"
        :selectedCombo="selectedCombo"
        :expandedEco="expandedEco"
        :activeCards="cardStore.activeCards"
        :cardDetails="cardStore.cardDetails"
        :plaidMappings="cardStore.plaidMappings"
        @toggle-combo="toggleComboPreview"
        @clear-combo="selectedCombo = null; expandedEco = null"
      />

      <SubTrackerTab
        v-if="activeView === 'subtracker'"
        :signupBonusTracker="signupBonusTracker"
        :totalSubValue="totalSubValue"
        :earnedSubValue="earnedSubValue"
      />

      <ApplyOrderTab
        v-if="activeView === 'applyorder'"
      />
    </template>

    <!-- Card Manager Modal -->
    <CardManager :visible="showCardManager" @close="onCardManagerClose" />
  </div>
</template>

<script setup>
import { ref, computed, provide, onMounted } from 'vue'
import {
  CreditCard, Plus, Loader2,
  BarChart3, Wallet, BookOpen,
  Gift, AlertTriangle,
  Map, Bell, Target, ListOrdered,
} from 'lucide-vue-next'
import { useCreditCardStore } from '@/stores/creditCardStore'
import { useBudgetStore } from '@/stores/budget'
import { useSettingsStore } from '@/stores/settings'
import { useCardOptimizer } from '@/composables/useCardOptimizer'
import { formatCurrency } from '@/utils/formatters'
import { creditCards, marketCards, cardEcosystems, pointsEcosystems, merchantCardMap } from '@/utils/creditCardData'
import { generateCheatSheet } from '@/services/cardOptimizationService'
import CardManager from '@/components/CardManager.vue'

import ScoreBanner from '@/components/cards/ScoreBanner.vue'
import AlertsTab from '@/components/cards/AlertsTab.vue'
import CategoryTab from '@/components/cards/CategoryTab.vue'
import CardStackTab from '@/components/cards/CardStackTab.vue'
import PointsTab from '@/components/cards/PointsTab.vue'
import SpendMapTab from '@/components/cards/SpendMapTab.vue'
import SubTrackerTab from '@/components/cards/SubTrackerTab.vue'
import ApplyOrderTab from '@/components/cards/ApplyOrderTab.vue'

const cardStore = useCreditCardStore()
const budgetStore = useBudgetStore()
const settingsStore = useSettingsStore()

// ── Period toggle ──
const periods = [
  { key: '1m', label: '1M', months: 1 },
  { key: '3m', label: '3M', months: 3 },
  { key: '6m', label: '6M', months: 6 },
  { key: '1y', label: '1Y', months: 12 },
  { key: 'all', label: 'All', months: 0 },
]
const selectedPeriod = ref('3m')
const cardFilter = ref('all')
const showFutureState = ref(false)

const periodLabel = computed(() => {
  const p = periods.find(p => p.key === selectedPeriod.value)
  if (p.key === 'all') return 'All-Time'
  return p.months === 1 ? '1-Month' : p.months === 12 ? '12-Month' : `${p.months}-Month`
})

const {
  report,
  activeReport,
  recommendations,
  cheatSheet,
  futureReport,
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
  topMerchants,
  runAnalysis,
} = useCardOptimizer(selectedPeriod, cardFilter, showFutureState)

const showCardManager = ref(false)
const activeView = ref('spendmap')
const expandedCat = ref(null)
const expandedCard = ref(null)
const expandedEco = ref(null)
const selectedCombo = ref(null)

function toCardKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
}

const views = [
  { key: 'spendmap', label: 'Spend Map', icon: Map },
  { key: 'categories', label: 'By Category', icon: BarChart3 },
  { key: 'cards', label: 'By Card', icon: Wallet },
  { key: 'alerts', label: 'Alerts', icon: Bell },
  { key: 'points', label: 'Points & Credits', icon: Gift },
  { key: 'subtracker', label: 'SUB Tracker', icon: Target },
  { key: 'applyorder', label: 'Apply Order', icon: ListOrdered },
]

// ── Provide shared helpers to child components ──
function formatCurrencyCents(val) {
  if (val >= 1) return `$${val.toFixed(2)}`
  return `$${val.toFixed(2)}`
}

function getCardName(cardKey) {
  return cardStore.cardDetails[cardKey]?.cardName || cardKey || 'Unknown'
}

function getCardIssuer(cardKey) {
  return cardStore.cardDetails[cardKey]?.cardIssuer || ''
}

function formatCatName(name) {
  if (!name) return 'Other'
  return name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

const CATEGORY_ICONS = {
  FOOD_AND_DRINK: '🍽️',
  TRANSPORTATION: '🚗',
  TRAVEL: '✈️',
  ENTERTAINMENT: '🎬',
  GENERAL_MERCHANDISE: '🛍️',
  RENT_AND_UTILITIES: '🏠',
  GENERAL_SERVICES: '💼',
  BUSINESS: '💼',
  PERSONAL_CARE: '💆',
  MEDICAL: '🏥',
  OTHER: '📋',
}

function categoryIcon(cat) {
  return CATEGORY_ICONS[cat] || '📋'
}

provide('helpers', {
  formatCurrency,
  formatCurrencyCents,
  getCardName,
  getCardIssuer,
  formatCatName,
  categoryIcon,
  toCardKey,
})

// ── Spend Map ──
const SPENDMAP_ICONS = {
  'FOOD_AND_DRINK': '🍽️',
  'TRANSPORTATION': '🚗',
  'TRAVEL': '✈️',
  'ENTERTAINMENT': '🎬',
  'GENERAL_MERCHANDISE': '🛍️',
  'RENT_AND_UTILITIES': '🏠',
  'GENERAL_SERVICES': '💼',
  'PERSONAL_CARE': '💆',
  'MEDICAL': '🏥',
  'OTHER': '📋',
}

const CARD_COLORS = {
  'chase-freedom-unlimited': '#1A3C6E',
  'chase-sapphire-preferred': '#1A3C6E',
  'chase-business-unlimited': '#0A2540',
  'amex-hilton-aspire': '#1A1A2E',
}

const spendMapGrouped = computed(() => {
  const items = cheatSheet.value
  if (!items || items.length === 0) return { personal: [], business: [] }

  const personal = []
  const business = []

  for (const item of items) {
    const cardKey = item.cardKey
    const detail = cardStore.cardDetails[cardKey]
    const cardType = detail?.cardType || 'Personal'
    let primaryKey = 'OTHER'
    for (const key of Object.keys(SPENDMAP_ICONS)) {
      if (item.plaidCategory?.startsWith(key)) {
        primaryKey = key
        break
      }
    }
    const icon = SPENDMAP_ICONS[primaryKey] || '📋'
    const color = CARD_COLORS[cardKey] || detail?._color || 'var(--accent-teal)'
    const entry = { ...item, icon, color, cardType }

    if (cardType === 'Business') {
      business.push(entry)
    } else {
      personal.push(entry)
    }
  }

  return { personal, business }
})

// ── Combo Spend Map Preview ──
const comboCheatSheet = computed(() => {
  if (!selectedCombo.value) return []
  const eco = cardEcosystems.find(e => e.name === selectedCombo.value)
  if (!eco) return []
  const existingKeys = new Set(cardStore.activeCards.map(c => c.cardKey))
  const mergedCards = [...cardStore.activeCards]
  for (const ecoCard of eco.cards) {
    const key = toCardKey(ecoCard.name)
    if (!existingKeys.has(key) && cardStore.plaidMappings[key]) {
      mergedCards.push({ cardKey: key })
    }
  }
  return generateCheatSheet(cardStore.plaidMappings, mergedCards, cardStore.cardDetails)
})

const comboSpendMapGrouped = computed(() => {
  const items = comboCheatSheet.value
  if (!items || items.length === 0) return { personal: [], business: [] }

  const currentLookup = {}
  for (const item of [...spendMapGrouped.value.personal, ...spendMapGrouped.value.business]) {
    currentLookup[item.plaidCategory] = item
  }

  const personal = []
  const business = []

  for (const item of items) {
    const cardKey = item.cardKey
    const detail = cardStore.cardDetails[cardKey]
    const cardType = detail?.cardType || 'Personal'
    let primaryKey = 'OTHER'
    for (const key of Object.keys(SPENDMAP_ICONS)) {
      if (item.plaidCategory?.startsWith(key)) {
        primaryKey = key
        break
      }
    }
    const icon = SPENDMAP_ICONS[primaryKey] || '📋'
    const color = CARD_COLORS[cardKey] || detail?._color || 'var(--accent-teal)'
    const prev = currentLookup[item.plaidCategory]
    const changed = prev && prev.cardKey !== item.cardKey
    const previousCard = changed ? prev.cardName : null
    const previousRate = changed ? prev.earnMultiplier : null
    const entry = { ...item, icon, color, cardType, changed, previousCard, previousRate }

    if (cardType === 'Business') {
      business.push(entry)
    } else {
      personal.push(entry)
    }
  }

  return { personal, business }
})

const activeSpendMap = computed(() => {
  return selectedCombo.value ? comboSpendMapGrouped.value : spendMapGrouped.value
})

function toggleComboPreview(ecoName) {
  if (selectedCombo.value === ecoName) {
    selectedCombo.value = null
    expandedEco.value = null
  } else {
    selectedCombo.value = ecoName
    expandedEco.value = ecoName
  }
}

// ── By Card: sorted with keep/add/drop/evaluate actions ──
const PERIOD_MONTHS = { '1m': 1, '3m': 3, '6m': 6, '1y': 12, 'all': 12 }

const sortedCards = computed(() => {
  if (!activeReport.value?.byCard) return []
  const byCard = Object.values(activeReport.value.byCard)
  const months = PERIOD_MONTHS[selectedPeriod.value] || 3
  const proratedFactor = months / 12

  return byCard.map(card => {
    const cardDetail = cardStore.cardDetails[card.cardKey]
    const annualFee = cardDetail?.annualFee || 0
    const proratedFee = annualFee * proratedFactor
    const netValue = card.rewards - proratedFee
    let action = 'keep'
    if (netValue < 0 && card.categories?.length > 0) action = 'evaluate'
    else if (netValue < 0) action = 'drop'
    else if (card.spend === 0 && card.categories?.length > 0) action = 'add'
    else if (card.spend === 0) action = 'drop'
    return { ...card, proratedFee, netValue, action, type: cardDetail?.cardType || 'personal' }
  }).sort((a, b) => {
    const order = { keep: 0, add: 1, evaluate: 2, drop: 3 }
    return (order[a.action] ?? 9) - (order[b.action] ?? 9) || b.rewards - a.rewards
  })
})

const personalCards = computed(() => sortedCards.value.filter(c => c.type !== 'business' && c.type !== 'Business'))
const businessCards = computed(() => sortedCards.value.filter(c => c.type === 'business' || c.type === 'Business'))

// ── Points & Credits ──
const pooledPointsPrograms = computed(() => {
  const keyToName = {}
  for (const [key, detail] of Object.entries(cardStore.cardDetails)) {
    keyToName[key] = detail.cardName
  }

  const cardRewardsMap = {}
  if (showFutureState.value && activeReport.value?.byCard) {
    for (const [cardKey, data] of Object.entries(activeReport.value.byCard)) {
      const name = keyToName[cardKey] || cardKey
      cardRewardsMap[name] = (cardRewardsMap[name] || 0) + data.rewards
    }
  } else {
    const txns = filteredTransactions.value
    const cardSpendMap = {}
    for (const t of txns) {
      const cardName = t._budgetCard
      if (!cardName) continue
      if (!cardSpendMap[cardName]) cardSpendMap[cardName] = {}
      const cat = t._budgetCategory || 'Other'
      cardSpendMap[cardName][cat] = (cardSpendMap[cardName][cat] || 0) + t.amount
    }
    for (const [cardName, spend] of Object.entries(cardSpendMap)) {
      const cardData = creditCards.find(c => c.name === cardName) || marketCards.find(c => c.name === cardName)
      if (!cardData) continue
      let cashback = 0
      for (const [category, amount] of Object.entries(spend)) {
        const rate = cardData.cashbackRates[category] || cardData.cashbackRates.default || 0
        cashback += amount * rate
      }
      if (cashback > 0) cardRewardsMap[cardName] = cashback
    }
  }

  const programs = []
  for (const [, eco] of Object.entries(pointsEcosystems)) {
    let totalCashback = 0
    const contributingCards = []
    for (const cardName of eco.cards) {
      const rewards = cardRewardsMap[cardName]
      if (rewards && rewards > 0) {
        totalCashback += rewards
        contributingCards.push(cardName)
      }
    }
    if (totalCashback <= 0) continue
    const points = Math.round(totalCashback * 100)
    const redemptions = eco.redemptions.map(r => ({
      method: r.method,
      rate: r.rate,
      value: totalCashback * r.multiplier,
      best: false,
    }))
    const maxValue = Math.max(...redemptions.map(r => r.value))
    redemptions.forEach(r => { if (r.value === maxValue) r.best = true })
    programs.push({
      name: eco.program,
      unit: eco.unit,
      points,
      redemptions,
      bestValue: maxValue,
      contributingCards,
      poolNote: contributingCards.length > 1 ? eco.poolNote : null,
    })
  }
  return programs.sort((a, b) => b.bestValue - a.bestValue)
})

// Card Ecosystem Combos
const filteredEcosystems = computed(() => {
  const cats = topCategories.value
  const months = selectedPeriod.value === 'all' ? 12 : (PERIOD_MONTHS[selectedPeriod.value] || 3)
  const proratedFactor = months / 12
  const filterType = cardFilter.value

  return cardEcosystems
    .filter(eco => filterType === 'all' || eco.scope === filterType || eco.scope === 'combined')
    .map(eco => {
      let projectedRewards = 0
      for (const cat of cats) {
        const catName = formatCatName(cat.category)
        let bestRate = 0
        for (const ecoCard of eco.cards) {
          const cardData = creditCards.find(c => c.name === ecoCard.name) || marketCards.find(c => c.name === ecoCard.name)
          if (!cardData) continue
          const rate = cardData.cashbackRates[catName] || cardData.cashbackRates.default || 0
          if (rate > bestRate) bestRate = rate
        }
        projectedRewards += cat.spend * bestRate
      }
      let pooledValue = 0
      let poolNote = null
      for (const [, ecosystem] of Object.entries(pointsEcosystems)) {
        const ecoCardNames = eco.cards.map(c => c.name)
        if (ecosystem.cards.some(c => ecoCardNames.includes(c))) {
          pooledValue = projectedRewards * (ecosystem.bestMultiplier - 1)
          poolNote = ecosystem.poolNote
          break
        }
      }
      const proratedFee = eco.totalAnnualFee * proratedFactor
      const netValue = projectedRewards + pooledValue - proratedFee
      return { ...eco, projectedRewards, pooledValue, netValue, poolNote }
    })
    .filter(eco => eco.projectedRewards > 0)
    .sort((a, b) => b.netValue - a.netValue)
})

const creditsSummary = computed(() => {
  const mode = budgetStore.budgetMode
  const activeType = mode === 'family' ? 'personal' : mode
  const allCards = creditCards.filter(c => c.type === activeType || (budgetStore.businessEnabled && c.type === 'business'))
  const credits = []
  for (const card of allCards) {
    for (const credit of card.statementCredits) {
      credits.push({ card: card.name, name: credit.name, amount: credit.amount, used: credit.used })
    }
  }
  return credits
})

const totalCreditsValue = computed(() => creditsSummary.value.reduce((s, c) => s + c.amount, 0))

// ── Cards to Consider (market cards) ──
const marketCardSuggestions = computed(() => {
  const months = selectedPeriod.value === 'all' ? 12 : (PERIOD_MONTHS[selectedPeriod.value] || 3)
  const proratedFactor = months / 12
  const cats = topCategories.value
  const filterType = cardFilter.value
  const eligibleMarket = (filterType === 'all'
    ? marketCards
    : marketCards.filter(c => (c.type || 'personal') === filterType)
  ).filter(c => !c.merchantCard)

  return eligibleMarket.map(card => {
    let projectedRewards = 0
    const bestCategories = []
    for (const cat of cats) {
      const catName = formatCatName(cat.category)
      const rate = card.cashbackRates[catName] || card.cashbackRates.default || 0
      const currentBestRate = cat.bestRate?.effectiveValue || 0
      if (rate > currentBestRate) {
        projectedRewards += cat.spend * rate
        bestCategories.push(catName)
      }
    }
    const proratedFee = card.annualFee * proratedFactor
    const netValue = projectedRewards - proratedFee
    return { name: card.name, type: card.type || 'personal', annualFee: card.annualFee, projectedRewards, netValue, bestCategories, highlight: card.highlight }
  }).filter(c => c.bestCategories.length > 0 && c.netValue > 0)
    .sort((a, b) => b.netValue - a.netValue)
})

// ── Merchant-Specific Card Suggestions ──
const merchantCardSuggestions = computed(() => {
  const merchants = topMerchants.value
  const filterType = cardFilter.value
  const months = selectedPeriod.value === 'all' ? 12 : (PERIOD_MONTHS[selectedPeriod.value] || 3)
  const proratedFactor = months / 12

  const ownedNames = new Set()
  for (const card of cardStore.activeCards) {
    const detail = cardStore.cardDetails[card.cardKey]
    if (detail?.cardName) ownedNames.add(detail.cardName)
  }

  const suggestions = []
  for (const m of merchants) {
    const key = m.merchant.toLowerCase()
    for (const [pattern, cards] of Object.entries(merchantCardMap)) {
      if (!key.includes(pattern)) continue
      const types = filterType === 'all' ? ['personal', 'business'] : [filterType]
      for (const type of types) {
        const cardName = cards[type]
        if (!cardName) continue
        if (ownedNames.has(cardName)) continue
        if (suggestions.some(s => s.cardName === cardName && s.merchant === m.merchant)) continue
        const cardData = marketCards.find(c => c.name === cardName)
        if (!cardData) continue
        const shoppingRate = cardData.cashbackRates['Shopping'] || cardData.cashbackRates.default || 0
        const projectedRewards = m.spend * shoppingRate
        const proratedFee = cardData.annualFee * proratedFactor
        const netValue = projectedRewards - proratedFee
        if (netValue <= 0) continue
        suggestions.push({
          cardName, merchant: m.merchant, merchantSpend: m.spend,
          projectedRewards, annualFee: cardData.annualFee, netValue,
          type: cardData.type, highlight: cardData.highlight,
        })
      }
    }
  }
  return suggestions.sort((a, b) => b.netValue - a.netValue)
})

// ── Category drilldowns ──
const PLAID_TO_BUDGET = {
  'FOOD_AND_DRINK': 'Dining & Food',
  'TRANSPORTATION': 'Transportation',
  'TRAVEL': 'Travel',
  'ENTERTAINMENT': 'Entertainment',
  'GENERAL_MERCHANDISE': 'Shopping',
  'RENT_AND_UTILITIES': 'Housing & Rent',
  'GENERAL_SERVICES': 'Business',
}

function getCategoryBudget(plaidCategory) {
  const budgetCatName = PLAID_TO_BUDGET[plaidCategory]
  if (!budgetCatName) return 0
  const months = PERIOD_MONTHS[selectedPeriod.value] || 3
  const budgetData = budgetStore.expenses[budgetCatName]
  return (budgetData?.budget || 0) * months
}

function getCategoryTransactions(plaidCategory) {
  if (!activeReport.value?.byCategory?.[plaidCategory]) return []
  return activeReport.value.byCategory[plaidCategory].transactions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

function getCardTransactions(cardKey) {
  if (!activeReport.value?.analyses) return []
  return activeReport.value.analyses
    .filter(a => a.recommendedCard === cardKey)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

function getCardCategoryBreakdown(cardKey) {
  const txns = getCardTransactions(cardKey)
  const groups = {}
  for (const t of txns) {
    const cat = t.plaidPrimary || 'OTHER'
    if (!groups[cat]) groups[cat] = { category: cat, count: 0, spend: 0, rewards: 0 }
    groups[cat].count++
    groups[cat].spend += t.amount
    groups[cat].rewards += t.optimalRewards
  }
  return Object.values(groups).sort((a, b) => b.spend - a.spend)
}

// ── Add to Portfolio (suggested cards) ──
function isCardInPortfolio(cardName) {
  return cardStore.portfolioCardKeys.includes(toCardKey(cardName))
}

async function addSuggestedCard(cardName) {
  await cardStore.addCardToPortfolio(toCardKey(cardName))
  runAnalysis()
}

function onCardManagerClose() {
  showCardManager.value = false
  runAnalysis()
}

onMounted(async () => {
  await cardStore.initialize()
  if (settingsStore.dataSource === 'csv') {
    cardStore.syncPortfolioWithCSV()
  }
  if (Object.keys(budgetStore.expenses).length === 0) {
    await budgetStore.loadExpenses()
  }
  budgetStore.loadHistoricalData()
  runAnalysis()
})
</script>

<style scoped>
.cc-optimizer {
  max-width: 1200px;
  animation: viewFadeIn 0.3s ease-out;
}

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── View Toggle ── */
.view-toggle {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  flex: 1;
  justify-content: center;
}

.toggle-btn:hover {
  color: var(--text-primary);
  background: var(--bg-subtle);
}

.toggle-btn.active {
  background: var(--gradient-pop);
  color: #fff;
}

/* ── Empty & Loading ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 24px;
  text-align: center;
}

.empty-icon { color: var(--text-tertiary); }
.empty-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
.empty-desc { font-size: 0.85rem; color: var(--text-secondary); max-width: 360px; }

.primary-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--gradient-pop);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s ease;
  margin-top: 8px;
}

.primary-btn:hover { opacity: 0.9; }

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .view-toggle {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .toggle-btn {
    padding: 8px 12px;
    white-space: nowrap;
    font-size: 0.75rem;
  }
}
</style>
