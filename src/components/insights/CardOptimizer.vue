<template>
  <div class="card-optimizer">
    <div class="optimizer-header">
      <div class="optimizer-icon-wrap">
        <CreditCard :size="22" stroke-width="2" />
      </div>
      <div>
        <h3 class="optimizer-title">Card Optimization</h3>
        <p class="optimizer-subtitle">Use the right card for each category to maximize rewards</p>
      </div>
    </div>

    <div v-if="optimizations.length === 0" class="empty-state">
      No spending data available yet.
    </div>

    <div v-else class="optimization-list">
      <div
        v-for="opt in optimizations"
        :key="opt.category"
        class="optimization-row"
      >
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
      </div>

      <div v-if="totalMissedRewards > 0" class="total-savings">
        <span class="total-label">Potential extra rewards</span>
        <span class="total-value">{{ formatCurrency(totalMissedRewards) }}/mo</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CreditCard, ArrowRight } from 'lucide-vue-next'
import { useBudgetStore } from '@/stores/budget'
import { formatCurrency } from '@/utils/formatters'

const budgetStore = useBudgetStore()

// Reward rates per card per category (points per dollar, simplified to cash-back equivalent)
const CARD_REWARDS = {
  'Amex Gold': {
    'Dining & Food': { rate: 4, type: 'pts' },
    'Shopping': { rate: 1, type: 'pts' },
    'Travel': { rate: 3, type: 'pts' },
    'Transportation': { rate: 1, type: 'pts' },
    'Entertainment': { rate: 1, type: 'pts' },
    'Bills & Utilities': { rate: 1, type: 'pts' },
  },
  'Chase Sapphire': {
    'Dining & Food': { rate: 3, type: 'pts' },
    'Travel': { rate: 5, type: 'pts' },
    'Transportation': { rate: 3, type: 'pts' },
    'Shopping': { rate: 1, type: 'pts' },
    'Entertainment': { rate: 1, type: 'pts' },
    'Bills & Utilities': { rate: 1, type: 'pts' },
  },
  'Capital One Savor': {
    'Dining & Food': { rate: 4, type: '%' },
    'Entertainment': { rate: 4, type: '%' },
    'Shopping': { rate: 1, type: '%' },
    'Travel': { rate: 1, type: '%' },
    'Transportation': { rate: 1, type: '%' },
    'Bills & Utilities': { rate: 1, type: '%' },
  },
  'Citi Double': {
    'Dining & Food': { rate: 2, type: '%' },
    'Shopping': { rate: 2, type: '%' },
    'Travel': { rate: 2, type: '%' },
    'Transportation': { rate: 2, type: '%' },
    'Entertainment': { rate: 2, type: '%' },
    'Bills & Utilities': { rate: 2, type: '%' },
  },
  'Apple Card': {
    'Shopping': { rate: 3, type: '%' },
    'Dining & Food': { rate: 2, type: '%' },
    'Travel': { rate: 1, type: '%' },
    'Transportation': { rate: 1, type: '%' },
    'Entertainment': { rate: 1, type: '%' },
    'Bills & Utilities': { rate: 1, type: '%' },
  },
}

const CATEGORY_ICONS = {
  'Dining & Food': '🍽️',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Travel': '✈️',
  'Bills & Utilities': '💡',
}

function getRewardValue(card, category, spend) {
  const reward = CARD_REWARDS[card]?.[category]
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

    // Find the best card for this category
    let bestCard = currentCard
    let bestRate = 0
    let bestRewardType = '%'

    for (const [card, categories] of Object.entries(CARD_REWARDS)) {
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
</script>

<style scoped>
.card-optimizer {
  margin-bottom: 32px;
}

.optimizer-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
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

.optimization-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  transition: box-shadow 0.2s ease;
}

.optimization-row:hover {
  box-shadow: var(--shadow-hover);
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
  background: rgba(100, 149, 237, 0.1);
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
  background: rgba(100, 149, 237, 0.06);
  border: 1px solid rgba(100, 149, 237, 0.15);
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

@media (max-width: 640px) {
  .optimization-row {
    flex-wrap: wrap;
    gap: 10px;
  }

  .card-recommendation {
    flex: auto;
  }
}
</style>
