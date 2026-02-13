<template>
  <div class="spending-analyzer">
    <div class="analyzer-header">
      <div class="analyzer-header-left">
        <div class="analyzer-icon-wrap">
          <TrendingUp :size="22" stroke-width="2" />
        </div>
        <div>
          <h3 class="analyzer-title">Spending Analysis</h3>
          <p class="analyzer-subtitle">Find the best credit card strategy for your spending</p>
        </div>
      </div>
      <div class="period-toggle">
        <button
          v-for="p in periods"
          :key="p.key"
          :class="['period-btn', { active: selectedPeriod === p.key }]"
          @click="selectedPeriod = p.key"
        >{{ p.label }}</button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="summary-row">
      <div class="summary-stat">
        <span class="summary-label">Total Spend</span>
        <span class="summary-value">{{ formatCurrency(analysis.totalSpend) }}</span>
      </div>
      <div class="summary-stat">
        <span class="summary-label">Current Rewards</span>
        <span class="summary-value gain">{{ formatCurrency(analysis.currentRewards) }}</span>
      </div>
      <div class="summary-stat">
        <span class="summary-label">Optimal Rewards</span>
        <span class="summary-value gain">{{ formatCurrency(analysis.optimalRewards) }}</span>
      </div>
      <div class="summary-stat highlight">
        <span class="summary-label">You're Missing</span>
        <span class="summary-value loss">{{ formatCurrency(analysis.missedRewards) }}</span>
      </div>
    </div>

    <!-- Category Breakdown -->
    <div class="section-block">
      <h4 class="block-title">
        <BarChart3 :size="16" stroke-width="2" />
        Category Breakdown
      </h4>

      <div class="category-table">
        <div class="cat-table-header">
          <span class="cat-cell cat-name-col">Category</span>
          <span class="cat-cell">Spend</span>
          <span class="cat-cell">Budget</span>
          <span class="cat-cell">Best Card</span>
          <span class="cat-cell cat-right">Extra Rewards</span>
        </div>
        <template v-for="cat in analysis.categories" :key="cat.name">
          <div
            :class="['cat-table-row', { 'cat-row-expanded': expandedCat === cat.name }]"
            @click="expandedCat = expandedCat === cat.name ? null : cat.name"
          >
            <span class="cat-cell cat-name-col">
              <span class="cat-icon">{{ cat.icon }}</span>
              {{ cat.name }}
            </span>
            <span class="cat-cell" :class="{ 'over-budget': cat.spend > cat.budget }">{{ formatCurrency(cat.spend) }}</span>
            <span class="cat-cell cat-budget-cell">{{ formatCurrency(cat.budget) }}</span>
            <span class="cat-cell" :class="{ 'best-card-highlight': cat.currentCard !== cat.bestCard }">{{ cat.bestCard }}</span>
            <span class="cat-cell cat-right" :class="{ gain: cat.savings > 0 }">
              {{ cat.savings > 0 ? '+' + formatCurrency(cat.savings) : '—' }}
            </span>
            <ChevronDown :size="14" stroke-width="2" :class="['cat-chevron', { rotated: expandedCat === cat.name }]" />
          </div>

          <!-- Drilldown -->
          <div v-if="expandedCat === cat.name" class="cat-drilldown">
            <div class="cat-budget-bar">
              <div class="cat-budget-bar-info">
                <span>{{ formatCurrency(cat.spend) }} of {{ formatCurrency(cat.budget) }}</span>
                <span :class="cat.spend > cat.budget ? 'over-budget' : 'gain'">
                  {{ cat.spend > cat.budget ? 'Over by ' + formatCurrency(cat.spend - cat.budget) : formatCurrency(cat.budget - cat.spend) + ' remaining' }}
                </span>
              </div>
              <div class="cat-progress">
                <div
                  class="cat-progress-fill"
                  :class="{ over: cat.spend > cat.budget }"
                  :style="{ width: Math.min((cat.spend / cat.budget) * 100, 100) + '%' }"
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
              v-for="(txn, i) in getCategoryTxns(cat.name)"
              :key="i"
              :class="['cat-txn-row', { 'txn-not-optimal': txn.card !== cat.bestCard }]"
            >
              <span class="cat-txn-cell cat-txn-merchant">{{ txn.merchant }}</span>
              <span class="cat-txn-cell" :class="{ 'wrong-card': txn.card !== cat.bestCard }">{{ txn.card }}</span>
              <span class="cat-txn-cell cat-txn-date">{{ txn.date }}</span>
              <span class="cat-txn-cell cat-txn-right">{{ formatCurrency(txn.amount) }}</span>
            </div>
            <div class="cat-txn-footer">
              <span>{{ getCategoryTxns(cat.name).length }} transactions</span>
              <span v-if="cat.currentCard !== cat.bestCard" class="cat-switch-tip">
                Switch to <strong>{{ cat.bestCard }}</strong> to earn +{{ formatCurrency(cat.savings) }}
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Best Card Combination -->
    <div class="section-block">
      <h4 class="block-title">
        <Wallet :size="16" stroke-width="2" />
        Best Card Combination
      </h4>
      <p class="block-subtitle">The optimal wallet for your {{ periodLabel }} spending pattern</p>

      <h5 v-if="personalRecommendedCards.length > 0 && businessRecommendedCards.length > 0" class="section-subheading">Personal</h5>
      <div v-if="personalRecommendedCards.length > 0" class="combo-grid">
        <div
          v-for="card in personalRecommendedCards"
          :key="card.name"
          :class="['combo-card', card.action]"
        >
          <div class="combo-card-header">
            <span class="combo-card-name">{{ card.name }}</span>
            <span :class="['combo-badge', card.action]">
              {{ card.action === 'keep' ? 'Keep' : card.action === 'add' ? 'Add' : card.action === 'evaluate' ? 'Evaluate' : 'Drop' }}
            </span>
          </div>
          <div v-if="card.action === 'evaluate'" class="combo-warning">
            Fee exceeds rewards — consider if perks justify the cost
          </div>
          <div class="combo-stats">
            <div class="combo-stat">
              <span class="combo-stat-label">Rewards</span>
              <span class="combo-stat-value gain">{{ formatCurrency(card.rewards) }}</span>
            </div>
            <div class="combo-stat">
              <span class="combo-stat-label">Fee (prorated)</span>
              <span class="combo-stat-value">{{ card.proratedFee > 0 ? formatCurrency(card.proratedFee) : 'Free' }}</span>
            </div>
            <div class="combo-stat">
              <span class="combo-stat-label">Net Value</span>
              <span class="combo-stat-value" :class="card.netValue >= 0 ? 'gain' : 'loss'">
                {{ card.netValue >= 0 ? '+' : '' }}{{ formatCurrency(card.netValue) }}
              </span>
            </div>
          </div>
          <div v-if="card.bestCategories.length" class="combo-categories">
            <span v-for="cat in card.bestCategories" :key="cat" class="combo-cat-tag">{{ cat }}</span>
          </div>
        </div>
      </div>

      <h5 v-if="businessRecommendedCards.length > 0" class="section-subheading section-subheading-business">Business</h5>
      <div v-if="businessRecommendedCards.length > 0" class="combo-grid">
        <div
          v-for="card in businessRecommendedCards"
          :key="card.name"
          :class="['combo-card', card.action]"
        >
          <div class="combo-card-header">
            <span class="combo-card-name">{{ card.name }}</span>
            <span :class="['combo-badge', card.action]">
              {{ card.action === 'keep' ? 'Keep' : card.action === 'add' ? 'Add' : card.action === 'evaluate' ? 'Evaluate' : 'Drop' }}
            </span>
          </div>
          <div v-if="card.action === 'evaluate'" class="combo-warning">
            Fee exceeds rewards — consider if perks justify the cost
          </div>
          <div class="combo-stats">
            <div class="combo-stat">
              <span class="combo-stat-label">Rewards</span>
              <span class="combo-stat-value gain">{{ formatCurrency(card.rewards) }}</span>
            </div>
            <div class="combo-stat">
              <span class="combo-stat-label">Fee (prorated)</span>
              <span class="combo-stat-value">{{ card.proratedFee > 0 ? formatCurrency(card.proratedFee) : 'Free' }}</span>
            </div>
            <div class="combo-stat">
              <span class="combo-stat-label">Net Value</span>
              <span class="combo-stat-value" :class="card.netValue >= 0 ? 'gain' : 'loss'">
                {{ card.netValue >= 0 ? '+' : '' }}{{ formatCurrency(card.netValue) }}
              </span>
            </div>
          </div>
          <div v-if="card.bestCategories.length" class="combo-categories">
            <span v-for="cat in card.bestCategories" :key="cat" class="combo-cat-tag">{{ cat }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards to Consider -->
    <div v-if="personalSuggestedCards.length || businessSuggestedCards.length" class="section-block">
      <h4 class="block-title">
        <PlusCircle :size="16" stroke-width="2" />
        Cards to Consider
      </h4>
      <p class="block-subtitle">Popular cards that could boost your rewards based on your spending</p>

      <h5 v-if="personalSuggestedCards.length > 0 && businessSuggestedCards.length > 0" class="section-subheading">Personal</h5>
      <div v-if="personalSuggestedCards.length > 0" class="combo-grid">
        <div
          v-for="card in personalSuggestedCards"
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

      <h5 v-if="businessSuggestedCards.length > 0" class="section-subheading section-subheading-business">Business</h5>
      <div v-if="businessSuggestedCards.length > 0" class="combo-grid">
        <div
          v-for="card in businessSuggestedCards"
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

    <!-- Points & Redemption Strategy -->
    <div class="section-block">
      <h4 class="block-title">
        <Gift :size="16" stroke-width="2" />
        Points & Redemption Strategy
      </h4>
      <p class="block-subtitle">Maximize the value of your earned rewards</p>

      <div class="points-grid">
        <div v-for="program in analysis.pointsPrograms" :key="program.name" class="points-card">
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

      <!-- Statement Credits -->
      <div v-if="analysis.creditsSummary.length" class="credits-block">
        <h5 class="credits-block-title">Statement Credits Status</h5>
        <div class="credits-block-list">
          <div v-for="credit in analysis.creditsSummary" :key="credit.card + credit.name" class="credit-block-row">
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
          <span class="credits-total-value">{{ formatCurrency(analysis.totalCreditsValue) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { TrendingUp, Wallet, BarChart3, Gift, CheckCircle, Circle, ChevronDown, PlusCircle } from 'lucide-vue-next'
import { useBudgetStore } from '@/stores/budget'
import { creditCards, getBestCardForCategory, marketCards } from '@/utils/creditCardData'
import { formatCurrency } from '@/utils/formatters'
import Badge from '@/components/common/Badge.vue'

const budgetStore = useBudgetStore()

const periods = [
  { key: '1m', label: '1M', months: 1 },
  { key: '3m', label: '3M', months: 3 },
  { key: '6m', label: '6M', months: 6 },
  { key: '1y', label: '1Y', months: 12 },
]

const selectedPeriod = ref('3m')

const periodLabel = computed(() => {
  const p = periods.find(p => p.key === selectedPeriod.value)
  return p.months === 1 ? '1-month' : p.months === 12 ? '12-month' : `${p.months}-month`
})

const expandedCat = ref(null)

onMounted(() => {
  budgetStore.loadHistoricalData()
})

function getCategoryTxns(categoryName) {
  return filteredTxns.value
    .filter(t => t.category === categoryName)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

const CATEGORY_ICONS = {
  'Dining & Food': '🍽️',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Travel': '✈️',
  'Housing & Rent': '🏠',
  'Bills & Utilities': '💡',
}

// Redemption programs per card
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

// Filter transactions by selected period
const filteredTxns = computed(() => {
  const monthsBack = periods.find(p => p.key === selectedPeriod.value)?.months || 3
  const now = new Date(2026, 1, 10)
  const cutoff = new Date(now.getFullYear(), now.getMonth() - monthsBack, now.getDate())
  return budgetStore.historicalTransactions.filter(t => new Date(t.date) >= cutoff)
})

const analysis = computed(() => {
  const txns = filteredTxns.value
  const monthsBack = periods.find(p => p.key === selectedPeriod.value)?.months || 3
  const mode = budgetStore.budgetMode

  // Aggregate by category
  const catMap = {}
  const cardSpendMap = {} // card → { category → amount }

  for (const t of txns) {
    if (!catMap[t.category]) {
      catMap[t.category] = { spend: 0, cardSpend: {} }
    }
    catMap[t.category].spend += t.amount
    catMap[t.category].cardSpend[t.card] = (catMap[t.category].cardSpend[t.card] || 0) + t.amount

    if (!cardSpendMap[t.card]) cardSpendMap[t.card] = {}
    cardSpendMap[t.card][t.category] = (cardSpendMap[t.card][t.category] || 0) + t.amount
  }

  // Calculate rewards
  let totalSpend = 0
  let currentRewards = 0
  let optimalRewards = 0

  const categories = Object.entries(catMap).map(([name, data]) => {
    totalSpend += data.spend
    const currentCard = Object.entries(data.cardSpend).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
    const best = getBestCardForCategory(name, mode, budgetStore.businessEnabled)

    // Current rewards: actual per-card rewards for this category
    let catCurrentRewards = 0
    for (const [card, amount] of Object.entries(data.cardSpend)) {
      const cardData = creditCards.find(c => c.name === card)
      const rate = cardData?.cashbackRates[name] || cardData?.cashbackRates.default || 0
      catCurrentRewards += amount * rate
    }
    currentRewards += catCurrentRewards

    // Optimal rewards: all spend on best card
    const catOptimalRewards = data.spend * best.rate
    optimalRewards += catOptimalRewards

    const budgetData = budgetStore.expenses[name]
    const monthlyBudget = budgetData?.budget || 0
    const monthsBack = periods.find(p => p.key === selectedPeriod.value)?.months || 3
    const periodBudget = monthlyBudget * monthsBack

    return {
      name,
      icon: CATEGORY_ICONS[name] || '📋',
      spend: data.spend,
      budget: periodBudget,
      currentCard,
      bestCard: best.cardName,
      currentRewards: catCurrentRewards,
      optimalRewards: catOptimalRewards,
      savings: catOptimalRewards - catCurrentRewards,
    }
  }).sort((a, b) => b.spend - a.spend)

  const missedRewards = optimalRewards - currentRewards

  // Card combination recommendation
  const activeType = mode === 'family' ? 'personal' : mode
  const allCards = creditCards.filter(c => c.type === activeType || (budgetStore.businessEnabled && c.type === 'business'))
  const userCardNames = new Set(Object.keys(cardSpendMap))
  const proratedFactor = monthsBack / 12

  const recommendedCards = allCards.map(card => {
    // Calculate rewards earned on this card
    let rewards = 0
    const bestCategories = []
    for (const cat of categories) {
      if (cat.bestCard === card.name) {
        rewards += cat.spend * (card.cashbackRates[cat.name] || card.cashbackRates.default || 0)
        bestCategories.push(cat.name)
      }
    }

    // Statement credits value (prorated)
    const creditsValue = card.statementCredits.reduce((s, c) => s + c.amount, 0) * proratedFactor
    const totalRewardsWithCredits = rewards + creditsValue
    const proratedFee = card.annualFee * proratedFactor
    const netValue = totalRewardsWithCredits - proratedFee

    const hasSpend = userCardNames.has(card.name)
    let action = 'keep'
    if (netValue < 0 && bestCategories.length > 0) {
      action = 'evaluate'
    } else if (netValue < 0) {
      action = 'drop'
    } else if (!hasSpend && bestCategories.length > 0) {
      action = 'add'
    } else if (!hasSpend && bestCategories.length === 0) {
      action = 'drop'
    }

    return { name: card.name, type: card.type, rewards, proratedFee, netValue, bestCategories, action, creditsValue }
  }).sort((a, b) => {
    const order = { keep: 0, add: 1, evaluate: 2, drop: 3 }
    return (order[a.action] ?? 9) - (order[b.action] ?? 9) || b.netValue - a.netValue
  })

  // Points programs
  const pointsPrograms = []
  for (const [cardName, program] of Object.entries(CARD_PROGRAMS)) {
    const cardData = creditCards.find(c => c.name === cardName)
    if (!cardData) continue
    // Calculate base cashback earned on this card
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
    // Mark the highest value as best
    const maxValue = Math.max(...redemptions.map(r => r.value))
    redemptions.forEach(r => { if (r.value === maxValue) r.best = true })

    pointsPrograms.push({
      name: program.program,
      unit: program.unit,
      points,
      redemptions,
      bestValue: maxValue,
    })
  }
  pointsPrograms.sort((a, b) => b.bestValue - a.bestValue)

  // Cards to consider (market cards the user doesn't own)
    const suggestedCards = marketCards.map(card => {
      let projectedRewards = 0
      const bestCategories = []
      for (const cat of categories) {
        const rate = card.cashbackRates[cat.name] || card.cashbackRates.default || 0
        const currentBest = getBestCardForCategory(cat.name, mode, budgetStore.businessEnabled)
        if (rate > currentBest.rate) {
          projectedRewards += cat.spend * rate
          bestCategories.push(cat.name)
        } else {
          projectedRewards += cat.spend * Math.min(rate, currentBest.rate)
        }
      }
      const proratedFee = card.annualFee * proratedFactor
      const netValue = projectedRewards - proratedFee
      return {
        name: card.name,
        type: 'personal',
        annualFee: card.annualFee,
        projectedRewards,
        netValue,
        bestCategories,
        highlight: card.highlight,
      }
    }).filter(c => c.bestCategories.length > 0 && c.netValue > 0)
      .sort((a, b) => b.netValue - a.netValue)

    // Statement credits summary
  const creditsSummary = []
  let totalCreditsValue = 0
  for (const card of allCards) {
    for (const credit of card.statementCredits) {
      creditsSummary.push({ card: card.name, name: credit.name, amount: credit.amount, used: credit.used })
      totalCreditsValue += credit.amount
    }
  }

  return {
    totalSpend,
    currentRewards,
    optimalRewards,
    missedRewards,
    categories,
    recommendedCards,
    suggestedCards,
    pointsPrograms,
    creditsSummary,
    totalCreditsValue,
  }
})

const personalRecommendedCards = computed(() =>
  analysis.value.recommendedCards.filter(c => c.type === 'personal')
)

const businessRecommendedCards = computed(() =>
  analysis.value.recommendedCards.filter(c => c.type === 'business')
)

const personalSuggestedCards = computed(() =>
  analysis.value.suggestedCards.filter(c => c.type === 'personal')
)

const businessSuggestedCards = computed(() =>
  analysis.value.suggestedCards.filter(c => c.type === 'business')
)
</script>

<style scoped>
.spending-analyzer {
  margin-bottom: 32px;
}

.analyzer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 24px;
}

.analyzer-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.analyzer-icon-wrap {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-pop);
  border-radius: var(--radius-md);
  color: #0f172a;
}

.analyzer-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.analyzer-subtitle {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-top: 1px;
}

.period-toggle {
  display: flex;
  gap: 2px;
  background: var(--bg-card);
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

/* Summary Stats */
.summary-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
}

.summary-stat.highlight {
  border-color: rgba(239, 68, 68, 0.2);
}

.summary-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  font-family: 'Lexend', sans-serif;
}

.summary-value.gain { color: var(--electric-teal); }
.summary-value.loss { color: var(--persimmon); }

/* Section Blocks */
.section-block {
  margin-bottom: 24px;
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
}

.section-subheading-business {
  margin-top: 16px;
}

/* Card Combo Grid */
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

.combo-card.keep { border-color: rgba(20, 184, 166, 0.2); }
.combo-card.add { border-color: rgba(59, 130, 246, 0.25); }
.combo-card.evaluate { border-color: rgba(56, 189, 248, 0.25); }
.combo-card.drop { border-color: rgba(239, 68, 68, 0.2); opacity: 0.6; }
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

.combo-badge.keep { background: rgba(20, 184, 166, 0.12); color: var(--electric-teal); }
.combo-badge.add { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
.combo-badge.evaluate { background: rgba(56, 189, 248, 0.12); color: #38BDF8; }
.combo-badge.drop { background: rgba(239, 68, 68, 0.1); color: var(--persimmon); }
.combo-badge.suggest { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }

.combo-warning {
  font-size: 0.72rem;
  color: #38BDF8;
  background: rgba(56, 189, 248, 0.06);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
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

.combo-stat-value.gain { color: var(--electric-teal); }
.combo-stat-value.loss { color: var(--persimmon); }

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

/* Category Table */
.category-table {
  display: flex;
  flex-direction: column;
}

.cat-table-header {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-glass);
}

.cat-table-header .cat-cell {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cat-table-row {
  display: flex;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.cat-table-row:last-child { border-bottom: none; }

.cat-cell {
  flex: 1;
  font-size: 0.8rem;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-name-col {
  flex: 1.4;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat-icon { font-size: 1rem; }

.cat-right { text-align: right; }

.cat-table-row {
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
}

.cat-table-row:hover {
  background: var(--bg-subtle);
}

.cat-row-expanded {
  background: var(--bg-subtle);
}

.cat-budget-cell {
  color: var(--text-secondary);
}

.over-budget {
  color: var(--persimmon);
  font-weight: 700;
}

.cat-chevron {
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.cat-chevron.rotated {
  transform: rotate(180deg);
}

.best-card-highlight {
  color: var(--electric-teal);
  font-weight: 700;
}

.gain { color: var(--electric-teal); }

/* Category Drilldown */
.cat-drilldown {
  padding: 12px 4px 16px;
  border-bottom: 1px solid var(--border-glass);
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

.cat-progress {
  height: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}

.cat-progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--electric-teal);
  transition: width 0.3s ease;
}

.cat-progress-fill.over {
  background: var(--persimmon);
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

.txn-not-optimal {
  background: rgba(239, 68, 68, 0.03);
  border-radius: var(--radius-sm);
  padding-left: 4px;
  padding-right: 4px;
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

.wrong-card {
  color: var(--persimmon);
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

.cat-switch-tip {
  color: var(--electric-teal);
}

.cat-switch-tip strong {
  font-weight: 700;
}

/* Points Programs */
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
  background: rgba(255, 255, 255, 0.03);
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
  color: var(--electric-teal);
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
  color: var(--electric-teal);
}

/* Credits Block */
.credits-block {
  padding-top: 16px;
  border-top: 1px solid var(--border-glass);
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

.credit-used-icon { color: var(--electric-teal); }
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
  color: var(--electric-teal);
}

/* Responsive */
@media (max-width: 768px) {
  .analyzer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .summary-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .combo-grid {
    grid-template-columns: 1fr;
  }

  .cat-table-header,
  .cat-table-row {
    flex-wrap: wrap;
  }

  .points-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .summary-row {
    grid-template-columns: 1fr;
  }
}
</style>
