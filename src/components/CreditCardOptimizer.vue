<template>
  <div class="cc-optimizer">
    <!-- Score Banner -->
    <div class="score-banner">
      <div class="score-ring-wrap">
        <svg class="score-ring" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-glass)" stroke-width="8" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="var(--accent-teal)"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="`${circumference}`"
            :stroke-dashoffset="ringOffset"
            transform="rotate(-90 60 60)"
            class="score-progress"
          />
        </svg>
        <div class="score-number">
          <span class="score-value">{{ optimizationScore }}</span>
          <span class="score-label">Score</span>
        </div>
      </div>

      <div class="score-stats">
        <div class="score-stat">
          <span class="stat-label">{{ periodLabel }} Spend</span>
          <span class="stat-value">{{ formatCurrency(totalSpend) }}</span>
        </div>
        <div class="score-stat">
          <span class="stat-label">Optimal Rewards</span>
          <span class="stat-value stat-teal">{{ formatCurrencyCents(totalOptimalRewards) }}</span>
        </div>
        <div class="score-stat" v-if="totalMissedRewards > 0">
          <span class="stat-label">Left on Table</span>
          <span class="stat-value stat-negative">{{ formatCurrencyCents(totalMissedRewards) }}</span>
        </div>
      </div>

      <div class="banner-right">
        <div class="period-toggle">
          <button
            v-for="p in periods"
            :key="p.key"
            :class="['period-btn', { active: selectedPeriod === p.key }]"
            @click="selectedPeriod = p.key"
          >{{ p.label }}</button>
        </div>
        <button class="manage-btn" @click="showCardManager = true">
          <Settings :size="16" stroke-width="2" />
          Manage Cards
        </button>
      </div>
    </div>

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
      <!-- Recommendations View -->
      <div v-if="activeView === 'recommendations'" class="recommendations-view">
        <div v-if="recommendations.length === 0 && marketCardSuggestions.length === 0" class="empty-section">
          Your card usage is already optimized. Nice work!
        </div>
        <div v-if="recommendations.length > 0" class="recommendations-grid">
          <div
            v-for="(rec, i) in recommendations"
            :key="i"
            :class="['rec-card', `rec-${rec.type}`, `priority-${rec.priority}`]"
          >
            <div class="rec-header">
              <div :class="['rec-type-icon', `rec-icon-${rec.type}`]">
                <component :is="recIcon(rec.type)" :size="16" stroke-width="2" />
              </div>
              <span class="rec-type-label">{{ recTypeLabel(rec.type) }}</span>
              <span :class="['rec-priority', `priority-${rec.priority}`]">{{ rec.priority }}</span>
            </div>
            <h4 class="rec-title">{{ rec.title }}</h4>
            <p class="rec-message">{{ rec.message }}</p>
            <div class="rec-footer">
              <span v-if="rec.impact" class="rec-impact">
                {{ rec.type === 'signup' ? '' : '+' }}{{ rec.type === 'signup' ? rec.impact.toLocaleString() + ' pts' : formatCurrencyCents(rec.impact) }}
              </span>
              <span v-if="rec.daysLeft" class="rec-deadline">{{ rec.daysLeft }} days left</span>
            </div>
          </div>
        </div>

        <!-- Cards to Consider -->
        <div v-if="marketCardSuggestions.length > 0" class="section-block">
          <h4 class="block-title">
            <PlusCircle :size="16" stroke-width="2" />
            Cards to Consider
          </h4>
          <p class="block-subtitle">Popular cards that could boost your rewards based on your spending</p>
          <div class="combo-grid">
            <div
              v-for="card in marketCardSuggestions"
              :key="card.name"
              class="combo-card suggest"
            >
              <div class="combo-card-header">
                <span class="combo-card-name">{{ card.name }}</span>
                <span class="combo-badge suggest">Consider</span>
              </div>
              <p class="suggest-highlight">{{ card.highlight }}</p>
              <div class="combo-stats">
                <div class="combo-stat">
                  <span class="combo-stat-label">Projected Rewards</span>
                  <span class="combo-stat-value gain">{{ formatCurrency(card.projectedRewards) }}</span>
                </div>
                <div class="combo-stat">
                  <span class="combo-stat-label">Annual Fee</span>
                  <span class="combo-stat-value">{{ card.annualFee > 0 ? formatCurrency(card.annualFee) : 'Free' }}</span>
                </div>
                <div class="combo-stat">
                  <span class="combo-stat-label">Net Value</span>
                  <span class="combo-stat-value gain">+{{ formatCurrency(card.netValue) }}</span>
                </div>
              </div>
              <div v-if="card.bestCategories.length" class="combo-categories">
                <span v-for="cat in card.bestCategories" :key="cat" class="combo-cat-tag">{{ cat }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Table View -->
      <div v-if="activeView === 'categories'" class="category-table-wrap">
        <div v-if="topCategories.length === 0" class="empty-section">
          No transaction data to analyze.
        </div>
        <div v-else class="category-table">
          <div class="cat-row cat-header">
            <span class="cat-cell cat-name-cell">Category</span>
            <span class="cat-cell">Spend</span>
            <span class="cat-cell">Best Card</span>
            <span class="cat-cell">Rate</span>
            <span class="cat-cell cat-right">Rewards</span>
          </div>
          <template v-for="cat in topCategories" :key="cat.category">
            <div
              :class="['cat-row', 'cat-data-row', { 'cat-row-expanded': expandedCat === cat.category }]"
              @click="expandedCat = expandedCat === cat.category ? null : cat.category"
            >
              <span class="cat-cell cat-name-cell">
                <span class="cat-icon">{{ categoryIcon(cat.category) }}</span>
                {{ formatCatName(cat.category) }}
              </span>
              <span class="cat-cell">{{ formatCurrency(cat.spend) }}</span>
              <span class="cat-cell cat-card-name">{{ getCardName(cat.bestCard) }}</span>
              <span class="cat-cell">
                <span class="rate-badge">{{ cat.bestRate?.earnMultiplier || 1 }}x</span>
              </span>
              <span class="cat-cell cat-right">
                {{ formatCurrencyCents(cat.optimalRewards) }}
                <span v-if="cat.missedRewards > 0.5" class="missed-tag">
                  -{{ formatCurrencyCents(cat.missedRewards) }}
                </span>
              </span>
              <ChevronDown :size="14" stroke-width="2" :class="['cat-chevron', { rotated: expandedCat === cat.category }]" />
            </div>

            <!-- Drilldown -->
            <div v-if="expandedCat === cat.category" class="cat-drilldown">
              <div v-if="getCategoryBudget(cat.category)" class="cat-budget-bar">
                <div class="cat-budget-bar-info">
                  <span>{{ formatCurrency(cat.spend) }} of {{ formatCurrency(getCategoryBudget(cat.category)) }}</span>
                  <span :class="cat.spend > getCategoryBudget(cat.category) ? 'over-budget' : 'under-budget'">
                    {{ cat.spend > getCategoryBudget(cat.category) ? 'Over by ' + formatCurrency(cat.spend - getCategoryBudget(cat.category)) : formatCurrency(getCategoryBudget(cat.category) - cat.spend) + ' remaining' }}
                  </span>
                </div>
                <div class="cat-progress">
                  <div
                    class="cat-progress-fill"
                    :class="{ over: cat.spend > getCategoryBudget(cat.category) }"
                    :style="{ width: Math.min((cat.spend / getCategoryBudget(cat.category)) * 100, 100) + '%' }"
                  />
                </div>
              </div>

              <div class="cat-txn-header">
                <span class="cat-txn-cell cat-txn-merchant">Merchant</span>
                <span class="cat-txn-cell">Card</span>
                <span class="cat-txn-cell">Date</span>
                <span class="cat-txn-cell cat-txn-right">Amount</span>
              </div>
              <div
                v-for="(txn, i) in getCategoryTransactions(cat.category)"
                :key="i"
                class="cat-txn-row"
              >
                <span class="cat-txn-cell cat-txn-merchant">{{ txn.merchant_name || txn.name }}</span>
                <span class="cat-txn-cell">{{ txn._budgetCard || 'N/A' }}</span>
                <span class="cat-txn-cell cat-txn-date">{{ txn.date }}</span>
                <span class="cat-txn-cell cat-txn-right">{{ formatCurrency(txn.amount) }}</span>
              </div>
              <div class="cat-txn-footer">
                <span>{{ getCategoryTransactions(cat.category).length }} transactions</span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Card Stack View -->
      <div v-if="activeView === 'cards'" class="card-stack">
        <div v-if="!report?.byCard || Object.keys(report.byCard).length === 0" class="empty-section">
          No card assignments yet.
        </div>
        <template v-else>
          <div v-if="personalCards.length > 0 && businessCards.length > 0" class="section-subheading">Personal</div>
          <div
            v-for="card in personalCards"
            :key="card.cardKey"
            :class="['stack-card', card.action ? card.action : '']"
          >
            <div class="stack-card-header">
              <img
                v-if="cardStore.getCardImageUrl(card.cardKey)"
                :src="cardStore.getCardImageUrl(card.cardKey)"
                :alt="getCardName(card.cardKey)"
                class="stack-card-img"
              />
              <div v-else class="stack-card-img stack-card-placeholder">
                <CreditCard :size="20" stroke-width="1.5" />
              </div>
              <div class="stack-card-info">
                <span class="stack-card-name">{{ getCardName(card.cardKey) }}</span>
                <span class="stack-card-issuer">{{ getCardIssuer(card.cardKey) }}</span>
              </div>
              <span v-if="card.action" :class="['combo-badge', card.action]">
                {{ card.action === 'keep' ? 'Keep' : card.action === 'add' ? 'Add' : card.action === 'evaluate' ? 'Evaluate' : 'Drop' }}
              </span>
              <div class="stack-card-stat">
                <span class="stack-rewards">{{ formatCurrencyCents(card.rewards) }}</span>
                <span class="stack-spend">on {{ formatCurrency(card.spend) }}</span>
              </div>
            </div>
            <div v-if="card.action === 'evaluate'" class="combo-warning">
              Fee exceeds rewards — consider if perks justify the cost
            </div>
            <div v-if="card.netValue !== undefined" class="stack-card-net">
              <span class="combo-stat-label">Fee (prorated)</span>
              <span class="combo-stat-value">{{ card.proratedFee > 0 ? formatCurrency(card.proratedFee) : 'Free' }}</span>
              <span class="combo-stat-label" style="margin-left: 14px;">Net Value</span>
              <span class="combo-stat-value" :class="card.netValue >= 0 ? 'gain' : 'loss'">
                {{ card.netValue >= 0 ? '+' : '' }}{{ formatCurrency(card.netValue) }}
              </span>
            </div>
            <div class="stack-card-categories">
              <span
                v-for="cat in card.categories"
                :key="cat"
                class="stack-cat-tag"
              >
                {{ categoryIcon(cat) }} {{ formatCatName(cat) }}
              </span>
            </div>
          </div>

          <div v-if="businessCards.length > 0" class="section-subheading section-subheading-business">Business</div>
          <div
            v-for="card in businessCards"
            :key="card.cardKey"
            :class="['stack-card', card.action ? card.action : '']"
          >
            <div class="stack-card-header">
              <img
                v-if="cardStore.getCardImageUrl(card.cardKey)"
                :src="cardStore.getCardImageUrl(card.cardKey)"
                :alt="getCardName(card.cardKey)"
                class="stack-card-img"
              />
              <div v-else class="stack-card-img stack-card-placeholder">
                <CreditCard :size="20" stroke-width="1.5" />
              </div>
              <div class="stack-card-info">
                <span class="stack-card-name">{{ getCardName(card.cardKey) }}</span>
                <span class="stack-card-issuer">{{ getCardIssuer(card.cardKey) }}</span>
              </div>
              <span v-if="card.action" :class="['combo-badge', card.action]">
                {{ card.action === 'keep' ? 'Keep' : card.action === 'add' ? 'Add' : card.action === 'evaluate' ? 'Evaluate' : 'Drop' }}
              </span>
              <div class="stack-card-stat">
                <span class="stack-rewards">{{ formatCurrencyCents(card.rewards) }}</span>
                <span class="stack-spend">on {{ formatCurrency(card.spend) }}</span>
              </div>
            </div>
            <div v-if="card.action === 'evaluate'" class="combo-warning">
              Fee exceeds rewards — consider if perks justify the cost
            </div>
            <div v-if="card.netValue !== undefined" class="stack-card-net">
              <span class="combo-stat-label">Fee (prorated)</span>
              <span class="combo-stat-value">{{ card.proratedFee > 0 ? formatCurrency(card.proratedFee) : 'Free' }}</span>
              <span class="combo-stat-label" style="margin-left: 14px;">Net Value</span>
              <span class="combo-stat-value" :class="card.netValue >= 0 ? 'gain' : 'loss'">
                {{ card.netValue >= 0 ? '+' : '' }}{{ formatCurrency(card.netValue) }}
              </span>
            </div>
            <div class="stack-card-categories">
              <span
                v-for="cat in card.categories"
                :key="cat"
                class="stack-cat-tag"
              >
                {{ categoryIcon(cat) }} {{ formatCatName(cat) }}
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- Points & Credits View -->
      <div v-if="activeView === 'points'" class="points-view">
        <div v-if="pointsPrograms.length === 0 && creditsSummary.length === 0" class="empty-section">
          No points or credit data available. Use cards with rewards programs to see redemption strategies.
        </div>

        <template v-if="pointsPrograms.length > 0">
          <h4 class="block-title">
            <Gift :size="16" stroke-width="2" />
            Points & Redemption Strategy
          </h4>
          <p class="block-subtitle">Maximize the value of your earned rewards</p>

          <div class="points-grid">
            <div v-for="program in pointsPrograms" :key="program.name" class="points-card">
              <div class="points-card-header">
                <span class="points-program-name">{{ program.name }}</span>
                <span class="points-balance">{{ program.points.toLocaleString() }} {{ program.unit }}</span>
              </div>
              <div class="redemption-options">
                <div
                  v-for="opt in program.redemptions"
                  :key="opt.method"
                  :class="['redemption-row', { best: opt.best }]"
                >
                  <div class="redemption-left">
                    <span v-if="opt.best" class="best-tag">Best</span>
                    <span class="redemption-method">{{ opt.method }}</span>
                    <span class="redemption-rate">{{ opt.rate }}</span>
                  </div>
                  <span class="redemption-value" :class="{ 'best-value': opt.best }">{{ formatCurrency(opt.value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Statement Credits -->
        <div v-if="creditsSummary.length > 0" class="credits-block">
          <h5 class="credits-block-title">Statement Credits Status</h5>
          <div class="credits-block-list">
            <div v-for="credit in creditsSummary" :key="credit.card + credit.name" class="credit-block-row">
              <div class="credit-block-left">
                <CheckCircle v-if="credit.used" :size="14" stroke-width="2" class="credit-used-icon" />
                <Circle v-else :size="14" stroke-width="2" class="credit-unused-icon" />
                <span class="credit-block-card">{{ credit.card }}</span>
                <span class="credit-block-name">{{ credit.name }}</span>
              </div>
              <span class="credit-block-amount">{{ formatCurrency(credit.amount) }}</span>
            </div>
          </div>
          <div class="credits-total">
            <span>Total credits value</span>
            <span class="credits-total-value">{{ formatCurrency(totalCreditsValue) }}</span>
          </div>
        </div>
      </div>

      <!-- Cheat Sheet View -->
      <div v-if="activeView === 'cheatsheet'" class="cheatsheet-wrap">
        <div v-if="cheatSheet.length === 0" class="empty-section">
          Add cards to see your personalized cheat sheet.
        </div>
        <div v-else class="cheatsheet-grid">
          <div
            v-for="item in cheatSheet"
            :key="item.plaidCategory"
            class="cheat-row"
          >
            <span class="cheat-category">{{ item.displayName }}</span>
            <span class="cheat-arrow">
              <ArrowRight :size="14" stroke-width="2" />
            </span>
            <span class="cheat-card">{{ item.cardName }}</span>
            <span class="cheat-rate">
              <span class="rate-badge">{{ item.earnMultiplier }}x</span>
              {{ item.currency }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Card Manager Modal -->
    <CardManager :visible="showCardManager" @close="onCardManagerClose" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  CreditCard, Settings, Plus, ArrowRight, Loader2,
  LayoutList, BarChart3, Wallet, BookOpen,
  TrendingUp, Gift, Zap, AlertTriangle,
  ChevronDown, PlusCircle, CheckCircle, Circle,
} from 'lucide-vue-next'
import { useCreditCardStore } from '@/stores/creditCardStore'
import { useBudgetStore } from '@/stores/budget'
import { useCardOptimizer } from '@/composables/useCardOptimizer'
import { formatCurrency } from '@/utils/formatters'
import { creditCards, getBestCardForCategory, marketCards } from '@/utils/creditCardData'
import CardManager from '@/components/CardManager.vue'

const cardStore = useCreditCardStore()
const budgetStore = useBudgetStore()

// Period toggle
const periods = [
  { key: '1m', label: '1M', months: 1 },
  { key: '3m', label: '3M', months: 3 },
  { key: '6m', label: '6M', months: 6 },
  { key: '1y', label: '1Y', months: 12 },
]
const selectedPeriod = ref('3m')

const periodLabel = computed(() => {
  const p = periods.find(p => p.key === selectedPeriod.value)
  return p.months === 1 ? '1-Month' : p.months === 12 ? '12-Month' : `${p.months}-Month`
})

const {
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
} = useCardOptimizer(selectedPeriod)

const showCardManager = ref(false)
const activeView = ref('recommendations')
const expandedCat = ref(null)

const views = [
  { key: 'recommendations', label: 'Recommendations', icon: Zap },
  { key: 'categories', label: 'By Category', icon: BarChart3 },
  { key: 'cards', label: 'By Card', icon: Wallet },
  { key: 'points', label: 'Points & Credits', icon: Gift },
  { key: 'cheatsheet', label: 'Cheat Sheet', icon: BookOpen },
]

const circumference = 2 * Math.PI * 52
const ringOffset = computed(() => {
  const pct = (100 - optimizationScore.value) / 100
  return circumference * pct
})

// ── By Card: sorted with keep/add/drop/evaluate actions ──
const PERIOD_MONTHS = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }

const sortedCards = computed(() => {
  if (!report.value?.byCard) return []
  const byCard = Object.values(report.value.byCard)
  const months = PERIOD_MONTHS[selectedPeriod.value] || 3
  const proratedFactor = months / 12

  return byCard.map(card => {
    const cardDetail = cardStore.cardDetails[card.cardKey]
    const annualFee = cardDetail?.annualFee || 0
    const proratedFee = annualFee * proratedFactor
    const netValue = card.rewards - proratedFee

    let action = 'keep'
    if (netValue < 0 && card.categories?.length > 0) {
      action = 'evaluate'
    } else if (netValue < 0) {
      action = 'drop'
    } else if (card.spend === 0 && card.categories?.length > 0) {
      action = 'add'
    } else if (card.spend === 0) {
      action = 'drop'
    }

    return {
      ...card,
      proratedFee,
      netValue,
      action,
      type: cardDetail?.cardType || 'personal',
    }
  }).sort((a, b) => {
    const order = { keep: 0, add: 1, evaluate: 2, drop: 3 }
    return (order[a.action] ?? 9) - (order[b.action] ?? 9) || b.rewards - a.rewards
  })
})

const personalCards = computed(() => sortedCards.value.filter(c => c.type !== 'business'))
const businessCards = computed(() => sortedCards.value.filter(c => c.type === 'business'))

// ── Points & Credits ──
const CARD_PROGRAMS = {
  'Amex Gold': {
    program: 'Amex Membership Rewards',
    unit: 'MR pts',
    redemptions: [
      { method: 'Statement Credit', multiplier: 0.6, rate: '0.6¢/pt' },
      { method: 'Amex Travel Portal', multiplier: 1.0, rate: '1¢/pt' },
      { method: 'Airline Transfers', multiplier: 2.0, rate: '2¢/pt' },
    ]
  },
  'Chase Sapphire': {
    program: 'Chase Ultimate Rewards',
    unit: 'UR pts',
    redemptions: [
      { method: 'Statement Credit', multiplier: 1.0, rate: '1¢/pt' },
      { method: 'Chase Travel Portal', multiplier: 1.5, rate: '1.5¢/pt' },
      { method: 'Airline/Hotel Transfers', multiplier: 2.0, rate: '2¢/pt' },
    ]
  },
  'Capital One Savor': {
    program: 'Capital One Rewards',
    unit: 'miles',
    redemptions: [
      { method: 'Statement Credit', multiplier: 1.0, rate: '1¢/mi' },
      { method: 'Travel Portal', multiplier: 1.25, rate: '1.25¢/mi' },
      { method: 'Airline Transfers', multiplier: 1.4, rate: '1.4¢/mi' },
    ]
  },
  'Apple Card': {
    program: 'Apple Daily Cash',
    unit: 'cash',
    redemptions: [
      { method: 'Daily Cash', multiplier: 1.0, rate: 'Direct' },
    ]
  },
  'Citi Double': {
    program: 'Citi ThankYou Rewards',
    unit: 'TY pts',
    redemptions: [
      { method: 'Statement Credit', multiplier: 1.0, rate: '1¢/pt' },
      { method: 'Airline Transfers', multiplier: 1.6, rate: '1.6¢/pt' },
    ]
  },
}

const pointsPrograms = computed(() => {
  const txns = filteredTransactions.value
  // Build card → budget-category → spend map from filtered transactions
  const cardSpendMap = {}
  for (const t of txns) {
    const cardName = t._budgetCard
    if (!cardName) continue
    if (!cardSpendMap[cardName]) cardSpendMap[cardName] = {}
    const cat = t._budgetCategory || 'Other'
    cardSpendMap[cardName][cat] = (cardSpendMap[cardName][cat] || 0) + t.amount
  }

  const programs = []
  for (const [cardName, program] of Object.entries(CARD_PROGRAMS)) {
    const cardData = creditCards.find(c => c.name === cardName)
    if (!cardData) continue
    let baseCashback = 0
    const spend = cardSpendMap[cardName]
    if (spend) {
      for (const [category, amount] of Object.entries(spend)) {
        const rate = cardData.cashbackRates[category] || cardData.cashbackRates.default || 0
        baseCashback += amount * rate
      }
    }
    if (baseCashback <= 0) continue

    const points = Math.round(baseCashback * 100)
    const redemptions = program.redemptions.map(r => ({
      method: r.method,
      rate: r.rate,
      value: baseCashback * r.multiplier,
      best: false,
    }))
    const maxValue = Math.max(...redemptions.map(r => r.value))
    redemptions.forEach(r => { if (r.value === maxValue) r.best = true })

    programs.push({ name: program.program, unit: program.unit, points, redemptions, bestValue: maxValue })
  }
  return programs.sort((a, b) => b.bestValue - a.bestValue)
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
  const mode = budgetStore.budgetMode
  const months = PERIOD_MONTHS[selectedPeriod.value] || 3
  const proratedFactor = months / 12
  const cats = topCategories.value

  return marketCards.map(card => {
    let projectedRewards = 0
    const bestCategories = []
    for (const cat of cats) {
      const catName = formatCatName(cat.category)
      const rate = card.cashbackRates[catName] || card.cashbackRates.default || 0
      const currentBest = getBestCardForCategory(catName, mode, budgetStore.businessEnabled)
      if (rate > currentBest.rate) {
        projectedRewards += cat.spend * rate
        bestCategories.push(catName)
      }
    }
    const proratedFee = card.annualFee * proratedFactor
    const netValue = projectedRewards - proratedFee
    return {
      name: card.name,
      annualFee: card.annualFee,
      projectedRewards,
      netValue,
      bestCategories,
      highlight: card.highlight,
    }
  }).filter(c => c.bestCategories.length > 0 && c.netValue > 0)
    .sort((a, b) => b.netValue - a.netValue)
})

// ── Category drilldowns ──
// Map Plaid primary categories back to budget category names for budget lookups
const PLAID_TO_BUDGET = {
  'FOOD_AND_DRINK': 'Dining & Food',
  'TRANSPORTATION': 'Transportation',
  'TRAVEL': 'Travel',
  'ENTERTAINMENT': 'Entertainment',
  'GENERAL_MERCHANDISE': 'Shopping',
  'RENT_AND_UTILITIES': 'Housing & Rent',
  'GENERAL_SERVICES': 'Office & Software',
}

function getCategoryBudget(plaidCategory) {
  const budgetCatName = PLAID_TO_BUDGET[plaidCategory]
  if (!budgetCatName) return 0
  const months = PERIOD_MONTHS[selectedPeriod.value] || 3
  const budgetData = budgetStore.expenses[budgetCatName]
  return (budgetData?.budget || 0) * months
}

function getCategoryTransactions(plaidCategory) {
  return filteredTransactions.value
    .filter(t => t.personal_finance_category?.primary === plaidCategory)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20)
}

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
  PERSONAL_CARE: '💆',
  MEDICAL: '🏥',
  OTHER: '📋',
}

function categoryIcon(cat) {
  return CATEGORY_ICONS[cat] || '📋'
}

function recIcon(type) {
  const map = { optimize: TrendingUp, benefit: Gift, signup: Zap, gap: AlertTriangle }
  return map[type] || Zap
}

function recTypeLabel(type) {
  const map = { optimize: 'Optimize', benefit: 'Benefit', signup: 'Signup Bonus', gap: 'Coverage Gap' }
  return map[type] || type
}

function onCardManagerClose() {
  showCardManager.value = false
  runAnalysis()
}

onMounted(async () => {
  await cardStore.initialize()

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

/* ── Score Banner ── */
.score-banner {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 28px 32px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  margin-bottom: 24px;
}

.score-ring-wrap {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.score-ring {
  width: 100%;
  height: 100%;
}

.score-progress {
  transition: stroke-dashoffset 0.6s ease;
}

.score-number {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent-teal);
  line-height: 1;
}

.score-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 2px;
}

.score-stats {
  flex: 1;
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.score-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-teal { color: var(--accent-teal); }
.stat-negative { color: var(--negative); }

.banner-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  flex-shrink: 0;
}

.period-toggle {
  display: flex;
  gap: 2px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 3px;
}

.period-btn {
  padding: 5px 14px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-btn:hover {
  color: var(--text-primary);
}

.period-btn.active {
  background: var(--accent-blue);
  color: #fff;
}

.manage-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
  background: var(--bg-subtle);
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.manage-btn:hover {
  background: var(--bg-elevated);
  border-color: var(--border-focus);
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

.empty-section {
  text-align: center;
  padding: 40px 24px;
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

/* ── Section Blocks ── */
.section-block {
  margin-top: 24px;
  padding: 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
}

.block-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}

.block-title svg { color: var(--accent-blue); }

.block-subtitle {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.section-subheading {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  margin-bottom: 8px;
  margin-top: 8px;
}

.section-subheading-business {
  margin-top: 16px;
}

/* ── Recommendations Grid ── */
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.rec-card {
  padding: 18px 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.rec-card:hover {
  box-shadow: var(--shadow-hover);
}

.rec-card.priority-high { border-left: 3px solid var(--accent-teal); }
.rec-card.priority-medium { border-left: 3px solid var(--accent-blue); }
.rec-card.priority-low { border-left: 3px solid var(--text-tertiary); }

.rec-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.rec-type-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.rec-icon-optimize { background: rgba(20, 184, 166, 0.12); color: var(--accent-teal); }
.rec-icon-benefit { background: rgba(59, 130, 246, 0.12); color: var(--accent-blue); }
.rec-icon-signup { background: rgba(234, 179, 8, 0.12); color: #EAB308; }
.rec-icon-gap { background: rgba(239, 68, 68, 0.12); color: var(--negative); }

.rec-type-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  flex: 1;
}

.rec-priority {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 4px;
}

.rec-priority.priority-high { background: rgba(20, 184, 166, 0.1); color: var(--accent-teal); }
.rec-priority.priority-medium { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
.rec-priority.priority-low { background: rgba(100, 116, 139, 0.1); color: var(--text-tertiary); }

.rec-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.rec-message {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
}

.rec-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rec-impact {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent-teal);
}

.rec-deadline {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
}

/* ── Combo / Cards to Consider ── */
.combo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.combo-card {
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
  background: rgba(255, 255, 255, 0.03);
  transition: border-color 0.2s ease;
}

.combo-card.suggest { border-color: rgba(59, 130, 246, 0.25); }

.combo-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.combo-card-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
}

.combo-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.combo-badge.keep { background: rgba(20, 184, 166, 0.12); color: var(--accent-teal); }
.combo-badge.add { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
.combo-badge.evaluate { background: rgba(56, 189, 248, 0.12); color: #38BDF8; }
.combo-badge.drop { background: rgba(239, 68, 68, 0.1); color: var(--negative); }
.combo-badge.suggest { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }

.combo-warning {
  font-size: 0.72rem;
  color: #38BDF8;
  background: rgba(56, 189, 248, 0.06);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  margin-top: 6px;
  margin-bottom: 4px;
}

.suggest-highlight {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.combo-stats {
  display: flex;
  gap: 14px;
  margin-bottom: 8px;
}

.combo-stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.combo-stat-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.combo-stat-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}

.combo-stat-value.gain { color: var(--accent-teal); }
.combo-stat-value.loss { color: var(--negative); }

.combo-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.combo-cat-tag {
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 0.65rem;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.08);
  color: var(--text-secondary);
}

/* ── Category Table ── */
.category-table-wrap {
  overflow-x: auto;
}

.category-table {
  width: 100%;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.cat-row {
  display: flex;
  gap: 8px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-glass);
  align-items: center;
}

.cat-row:last-child {
  border-bottom: none;
}

.cat-header {
  background: var(--bg-subtle);
}

.cat-header .cat-cell {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
}

.cat-data-row {
  cursor: pointer;
  transition: background 0.15s ease;
}

.cat-data-row:hover {
  background: var(--bg-subtle);
}

.cat-row-expanded {
  background: var(--bg-subtle);
}

.cat-cell {
  flex: 1;
  font-size: 0.82rem;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-name-cell {
  flex: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.cat-icon { flex-shrink: 0; }

.cat-card-name {
  color: var(--accent-blue);
  font-weight: 600;
}

.cat-right {
  text-align: right;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}

.rate-badge {
  display: inline-flex;
  padding: 1px 7px;
  border-radius: 4px;
  background: rgba(20, 184, 166, 0.1);
  color: var(--accent-teal);
  font-size: 0.72rem;
  font-weight: 700;
}

.missed-tag {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--negative);
  opacity: 0.8;
}

.cat-chevron {
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.cat-chevron.rotated {
  transform: rotate(180deg);
}

/* ── Category Drilldown ── */
.cat-drilldown {
  padding: 12px 18px 16px;
  border-bottom: 1px solid var(--border-glass);
  background: rgba(255, 255, 255, 0.01);
}

.cat-budget-bar {
  margin-bottom: 14px;
}

.cat-budget-bar-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.over-budget { color: var(--negative); font-weight: 700; }
.under-budget { color: var(--accent-teal); }

.cat-progress {
  height: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}

.cat-progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--accent-teal);
  transition: width 0.3s ease;
}

.cat-progress-fill.over {
  background: var(--negative);
}

.cat-txn-header {
  display: flex;
  gap: 8px;
  padding: 4px 0 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.cat-txn-header .cat-txn-cell {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cat-txn-row {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.cat-txn-row:last-of-type {
  border-bottom: none;
}

.cat-txn-cell {
  flex: 1;
  font-size: 0.78rem;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-txn-merchant {
  flex: 1.3;
  font-weight: 600;
}

.cat-txn-date {
  color: var(--text-tertiary);
}

.cat-txn-right {
  text-align: right;
  flex: 0.7;
  font-weight: 600;
}

.cat-txn-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

/* ── Card Stack ── */
.card-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stack-card {
  padding: 18px 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
}

.stack-card.keep { border-color: rgba(20, 184, 166, 0.2); }
.stack-card.add { border-color: rgba(59, 130, 246, 0.25); }
.stack-card.evaluate { border-color: rgba(56, 189, 248, 0.25); }
.stack-card.drop { border-color: rgba(239, 68, 68, 0.2); opacity: 0.6; }

.stack-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stack-card-img {
  width: 54px;
  height: 34px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.stack-card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  color: var(--text-tertiary);
}

.stack-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.stack-card-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stack-card-issuer {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.stack-card-stat {
  text-align: right;
  flex-shrink: 0;
}

.stack-rewards {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  color: var(--accent-teal);
}

.stack-spend {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.stack-card-net {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.stack-card-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.stack-cat-tag {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.06);
  color: var(--text-secondary);
}

/* ── Points & Credits ── */
.points-view {
  animation: viewFadeIn 0.2s ease-out;
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.points-card {
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
  background: var(--bg-card);
  background-image: var(--gradient-card);
}

.points-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.points-program-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}

.points-balance {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--accent-blue);
}

.redemption-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.redemption-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
}

.redemption-row.best {
  background: rgba(20, 184, 166, 0.06);
  border: 1px solid rgba(20, 184, 166, 0.15);
}

.redemption-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.best-tag {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  background: rgba(20, 184, 166, 0.15);
  color: var(--accent-teal);
}

.redemption-method {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
}

.redemption-rate {
  font-size: 0.68rem;
  color: var(--text-tertiary);
}

.redemption-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.redemption-value.best-value {
  color: var(--accent-teal);
}

/* Credits */
.credits-block {
  padding: 20px;
  margin-top: 16px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
}

.credits-block-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.credits-block-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.credit-block-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.credit-block-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.credit-used-icon { color: var(--accent-teal); }
.credit-unused-icon { color: var(--text-tertiary); }

.credit-block-card {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.credit-block-name {
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

.credit-block-amount {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
}

.credits-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-glass);
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.credits-total-value {
  font-weight: 800;
  color: var(--accent-teal);
}

/* ── Cheat Sheet ── */
.cheatsheet-wrap {
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.cheatsheet-grid {
  max-height: 500px;
  overflow-y: auto;
}

.cheat-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--border-glass);
  transition: background 0.15s ease;
}

.cheat-row:last-child { border-bottom: none; }
.cheat-row:hover { background: var(--bg-subtle); }

.cheat-category {
  flex: 1.5;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cheat-arrow {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.cheat-card {
  flex: 1.2;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--accent-blue);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cheat-rate {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .score-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;
  }

  .score-ring-wrap {
    width: 80px;
    height: 80px;
    align-self: center;
  }

  .score-stats {
    gap: 20px;
    width: 100%;
  }

  .banner-right {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .manage-btn {
    flex: 1;
    justify-content: center;
  }

  .view-toggle {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .toggle-btn {
    padding: 8px 12px;
    white-space: nowrap;
    font-size: 0.75rem;
  }

  .recommendations-grid {
    grid-template-columns: 1fr;
  }

  .combo-grid {
    grid-template-columns: 1fr;
  }

  .cat-row {
    padding: 10px 14px;
    gap: 6px;
  }

  .points-grid {
    grid-template-columns: 1fr;
  }
}
</style>
