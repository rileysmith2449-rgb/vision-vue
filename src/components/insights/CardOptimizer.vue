<template>
  <div class="card-optimizer">
    <div class="optimizer-header">
      <div class="optimizer-header-left">
        <div class="optimizer-icon-wrap">
          <CreditCard :size="22" stroke-width="2" />
        </div>
        <div>
          <h3 class="optimizer-title">Card Optimization</h3>
          <p class="optimizer-subtitle">Use the right card for each category to maximize rewards</p>
        </div>
      </div>
    </div>

    <div v-if="optimizations.length === 0" class="empty-state">
      No spending data available yet.
    </div>

    <div v-else class="optimization-list">
      <div
        v-for="opt in optimizations"
        :key="opt.category"
        :class="['optimization-item', { expanded: expandedCategory === opt.category }]"
      >
        <div class="optimization-row" @click="toggleCategory(opt.category)">
          <div class="category-info">
            <span class="category-icon">{{ opt.icon }}</span>
            <div class="category-details">
              <span class="category-name">{{ opt.category }}</span>
              <span class="category-spend">{{ formatCurrency(opt.totalSpend) }} spent</span>
            </div>
          </div>

          <div class="card-recommendation">
            <div v-if="opt.currentCard !== opt.bestCard" class="switch-badge">
              <ArrowRight :size="12" />
              Switch
            </div>
            <div class="card-info">
              <span class="best-card">{{ opt.bestCard }}</span>
              <span class="reward-rate">{{ opt.bestRate }}x {{ opt.rewardType }}</span>
            </div>
          </div>

          <div class="savings-info">
            <span v-if="opt.missedRewards > 0" class="missed-rewards">
              +{{ formatCurrency(opt.missedRewards) }}/mo
            </span>
            <span v-else class="already-optimal">Optimal</span>
          </div>

          <div class="opt-chevron" :class="{ rotated: expandedCategory === opt.category }">
            <ChevronDown :size="16" stroke-width="2" />
          </div>
        </div>

        <div v-if="expandedCategory === opt.category" class="category-drilldown">
          <div class="drilldown-header">
            <span class="drilldown-cell drilldown-hd">Merchant</span>
            <span class="drilldown-cell drilldown-hd">Card Used</span>
            <span class="drilldown-cell drilldown-hd">Best Card</span>
            <span class="drilldown-cell drilldown-hd drilldown-right">Amount</span>
          </div>
          <div
            v-for="(txn, i) in getCategoryTransactions(opt.category)"
            :key="i"
            :class="['drilldown-row', { 'is-optimal': txn.card === opt.bestCard }]"
          >
            <span class="drilldown-cell txn-merchant-cell">{{ txn.merchant }}</span>
            <span class="drilldown-cell" :class="{ 'wrong-card': txn.card !== opt.bestCard }">{{ txn.card }}</span>
            <span class="drilldown-cell best-card-cell">{{ opt.bestCard }}</span>
            <span class="drilldown-cell drilldown-right">{{ formatCurrency(txn.amount) }}</span>
          </div>
          <div class="drilldown-summary">
            <span>{{ getCategoryTransactions(opt.category).length }} transactions</span>
            <span v-if="opt.currentCard !== opt.bestCard" class="drilldown-tip">
              Use <strong>{{ opt.bestCard }}</strong> for {{ opt.bestRate }}x {{ opt.rewardType }} on {{ opt.category }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="totalMissedRewards > 0" class="total-savings">
        <span class="total-label">Potential extra rewards</span>
        <span class="total-value">{{ formatCurrency(totalMissedRewards) }}/mo</span>
      </div>
    </div>

    <div v-if="enrollmentSuggestions.length > 0" class="enrollment-section">
      <div class="enrollment-header">
        <PlusCircle :size="16" stroke-width="2" />
        <span>Cards to Consider</span>
      </div>
      <div class="enrollment-list">
        <div
          v-for="suggestion in enrollmentSuggestions"
          :key="suggestion.card"
          class="enrollment-card"
        >
          <div class="enrollment-card-top">
            <span class="enrollment-card-name">{{ suggestion.card }}</span>
            <span class="enrollment-card-reward">+{{ formatCurrency(suggestion.totalExtraRewards) }}/mo</span>
          </div>
          <div class="enrollment-categories">
            <span
              v-for="cat in suggestion.categories"
              :key="cat.name"
              class="enrollment-category-tag"
            >
              {{ cat.name }} {{ cat.rate }}x {{ cat.rewardType }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CreditCard, ArrowRight, PlusCircle, ChevronDown } from 'lucide-vue-next'
import { useBudgetStore } from '@/stores/budget'
import { formatCurrency, formatDate } from '@/utils/formatters'

const budgetStore = useBudgetStore()

const expandedCategory = ref(null)

function toggleCategory(category) {
  expandedCategory.value = expandedCategory.value === category ? null : category
}

function getCategoryTransactions(category) {
  const catData = budgetStore.expenses[category]
  if (!catData) return []
  const txns = []
  for (const transactions of Object.values(catData.subcategories)) {
    for (const t of transactions) {
      txns.push(t)
    }
  }
  return txns.sort((a, b) => b.amount - a.amount)
}

// Reward rates per card per category (points per dollar, simplified to cash-back equivalent)
const CARD_REWARDS = {
  // Personal cards
  'Amex Gold': {
    type: 'personal',
    categories: {
      'Dining & Food': { rate: 4, type: 'pts' },
      'Shopping': { rate: 1, type: 'pts' },
      'Travel': { rate: 3, type: 'pts' },
      'Transportation': { rate: 1, type: 'pts' },
      'Entertainment': { rate: 1, type: 'pts' },
      'Bills & Utilities': { rate: 1, type: 'pts' },
      'Housing & Rent': { rate: 1, type: 'pts' },
    }
  },
  'Chase Sapphire': {
    type: 'personal',
    categories: {
      'Dining & Food': { rate: 3, type: 'pts' },
      'Travel': { rate: 5, type: 'pts' },
      'Transportation': { rate: 3, type: 'pts' },
      'Shopping': { rate: 1, type: 'pts' },
      'Entertainment': { rate: 1, type: 'pts' },
      'Bills & Utilities': { rate: 1, type: 'pts' },
      'Housing & Rent': { rate: 1, type: 'pts' },
    }
  },
  'Capital One Savor': {
    type: 'personal',
    categories: {
      'Dining & Food': { rate: 4, type: '%' },
      'Entertainment': { rate: 4, type: '%' },
      'Shopping': { rate: 1, type: '%' },
      'Travel': { rate: 1, type: '%' },
      'Transportation': { rate: 1, type: '%' },
      'Bills & Utilities': { rate: 1, type: '%' },
      'Housing & Rent': { rate: 1, type: '%' },
    }
  },
  'Citi Double': {
    type: 'personal',
    categories: {
      'Dining & Food': { rate: 2, type: '%' },
      'Shopping': { rate: 2, type: '%' },
      'Travel': { rate: 2, type: '%' },
      'Transportation': { rate: 2, type: '%' },
      'Entertainment': { rate: 2, type: '%' },
      'Bills & Utilities': { rate: 2, type: '%' },
      'Housing & Rent': { rate: 2, type: '%' },
    }
  },
  'Apple Card': {
    type: 'personal',
    categories: {
      'Shopping': { rate: 3, type: '%' },
      'Dining & Food': { rate: 2, type: '%' },
      'Travel': { rate: 1, type: '%' },
      'Transportation': { rate: 1, type: '%' },
      'Entertainment': { rate: 1, type: '%' },
      'Bills & Utilities': { rate: 1, type: '%' },
      'Housing & Rent': { rate: 1, type: '%' },
    }
  },
  // Business cards
  'Amex Business Gold': {
    type: 'business',
    categories: {
      'Office & Software': { rate: 4, type: 'pts' },
      'Travel': { rate: 3, type: 'pts' },
      'Meals & Entertainment': { rate: 3, type: 'pts' },
      'Internet & Phone': { rate: 1, type: 'pts' },
    }
  },
  'Chase Ink Business': {
    type: 'business',
    categories: {
      'Office & Software': { rate: 5, type: 'pts' },
      'Internet & Phone': { rate: 5, type: 'pts' },
      'Travel': { rate: 1, type: 'pts' },
      'Meals & Entertainment': { rate: 1, type: 'pts' },
    }
  },
}

const CATEGORY_ICONS = {
  'Dining & Food': '🍽️',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Travel': '✈️',
  'Housing & Rent': '🏠',
  'Bills & Utilities': '💡',
  'Office & Software': '💻',
  'Meals & Entertainment': '🍽️',
  'Internet & Phone': '📡',
}

// Only cards matching the active budget mode (family maps to personal)
const activeCards = computed(() => {
  const mode = budgetStore.budgetMode === 'family' ? 'personal' : budgetStore.budgetMode
  const filtered = {}
  for (const [card, data] of Object.entries(CARD_REWARDS)) {
    if (data.type === mode) {
      filtered[card] = data.categories
    }
  }
  return filtered
})

function getRewardValue(card, category, spend) {
  const reward = activeCards.value[card]?.[category]
  if (!reward) return 0
  // Assume 1 point ≈ $0.01 for simplicity
  return (reward.rate / 100) * spend
}

const optimizations = computed(() => {
  const expenses = budgetStore.expenses
  if (!expenses || Object.keys(expenses).length === 0) return []

  const results = []

  for (const [category, data] of Object.entries(expenses)) {
    let totalSpend = 0
    const cardSpend = {}

    // Calculate spend per card for this category
    for (const transactions of Object.values(data.subcategories)) {
      for (const t of transactions) {
        totalSpend += t.amount
        cardSpend[t.card] = (cardSpend[t.card] || 0) + t.amount
      }
    }

    if (totalSpend === 0) continue

    // Find which card is used most in this category
    const currentCard = Object.entries(cardSpend)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'

    // Find the best card for this category (only from active mode's cards)
    let bestCard = currentCard
    let bestRate = 0
    let bestRewardType = '%'

    for (const [card, categories] of Object.entries(activeCards.value)) {
      const reward = categories[category]
      if (reward && reward.rate > bestRate) {
        bestRate = reward.rate
        bestCard = card
        bestRewardType = reward.type
      }
    }

    // Calculate missed rewards
    const currentRewards = getRewardValue(currentCard, category, totalSpend)
    const bestRewards = getRewardValue(bestCard, category, totalSpend)
    const missedRewards = bestRewards - currentRewards

    results.push({
      category,
      icon: CATEGORY_ICONS[category] || '📋',
      totalSpend,
      currentCard,
      bestCard,
      bestRate,
      rewardType: bestRewardType,
      missedRewards: Math.max(0, missedRewards),
    })
  }

  // Sort: biggest missed rewards first
  return results.sort((a, b) => b.missedRewards - a.missedRewards)
})

const totalMissedRewards = computed(() => {
  return optimizations.value.reduce((sum, opt) => sum + opt.missedRewards, 0)
})

// Cards the user currently uses (from transaction data)
const userCards = computed(() => {
  const cards = new Set()
  const expenses = budgetStore.expenses
  if (!expenses) return cards
  for (const data of Object.values(expenses)) {
    for (const transactions of Object.values(data.subcategories)) {
      for (const t of transactions) {
        if (t.card) cards.add(t.card)
      }
    }
  }
  return cards
})

// Cards the user doesn't have but would benefit from
const enrollmentSuggestions = computed(() => {
  const suggestions = {}

  for (const opt of optimizations.value) {
    if (opt.missedRewards > 0 && !userCards.value.has(opt.bestCard)) {
      if (!suggestions[opt.bestCard]) {
        suggestions[opt.bestCard] = {
          card: opt.bestCard,
          categories: [],
          totalExtraRewards: 0,
        }
      }
      suggestions[opt.bestCard].categories.push({
        name: opt.category,
        rate: opt.bestRate,
        rewardType: opt.rewardType,
        extraRewards: opt.missedRewards,
      })
      suggestions[opt.bestCard].totalExtraRewards += opt.missedRewards
    }
  }

  return Object.values(suggestions).sort((a, b) => b.totalExtraRewards - a.totalExtraRewards)
})
</script>

<style scoped>
.card-optimizer {
  margin-bottom: 32px;
}

.optimizer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 24px;
}

.optimizer-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.optimizer-icon-wrap {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-pop);
  border-radius: var(--radius-md);
  color: #0f172a;
}

.optimizer-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.optimizer-subtitle {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-top: 1px;
}

.optimization-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.optimization-item {
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  overflow: hidden;
}

.optimization-item:hover {
  box-shadow: var(--shadow-hover);
}

.optimization-item.expanded {
  border-color: var(--border-focus);
}

.optimization-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.optimization-row:hover {
  background: var(--bg-subtle);
}

.opt-chevron {
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.opt-chevron.rotated {
  transform: rotate(180deg);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.category-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.category-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
}

.category-spend {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.card-recommendation {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.switch-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--electric-teal);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.best-card {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
}

.reward-rate {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.savings-info {
  text-align: right;
  flex-shrink: 0;
}

.missed-rewards {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--electric-teal);
}

.already-optimal {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-tertiary);
}

.total-savings {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  margin-top: 4px;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: var(--radius-md);
}

.total-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.total-value {
  font-size: 1rem;
  font-weight: 800;
  color: var(--electric-teal);
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

.enrollment-section {
  margin-top: 20px;
}

.enrollment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}

.enrollment-header svg {
  color: var(--accent-blue);
}

.enrollment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.enrollment-card {
  padding: 14px 18px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  transition: box-shadow 0.2s ease;
}

.enrollment-card:hover {
  box-shadow: var(--shadow-hover);
}

.enrollment-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.enrollment-card-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
}

.enrollment-card-reward {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent-blue);
}

.enrollment-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.enrollment-category-tag {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.08);
  color: var(--text-secondary);
}

/* Drilldown */
.category-drilldown {
  border-top: 1px solid var(--border-glass);
  padding: 12px 18px 16px;
}

.drilldown-header {
  display: flex;
  gap: 8px;
  padding: 4px 0 8px;
  border-bottom: 1px solid var(--border-glass);
}

.drilldown-hd {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.drilldown-row {
  display: flex;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.drilldown-row:last-of-type {
  border-bottom: none;
}

.drilldown-row.is-optimal {
  opacity: 0.65;
}

.drilldown-cell {
  flex: 1;
  font-size: 0.78rem;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drilldown-right {
  text-align: right;
  flex: 0.6;
}

.txn-merchant-cell {
  font-weight: 600;
}

.wrong-card {
  color: var(--persimmon);
}

.best-card-cell {
  color: var(--electric-teal);
  font-weight: 600;
}

.drilldown-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-glass);
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.drilldown-tip {
  color: var(--electric-teal);
}

.drilldown-tip strong {
  font-weight: 700;
}

@media (max-width: 640px) {
  .optimizer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .optimization-row {
    flex-wrap: wrap;
    gap: 10px;
  }

  .card-recommendation {
    flex: auto;
  }
}
</style>
