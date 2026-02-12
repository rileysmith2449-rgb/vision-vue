<template>
  <section v-if="cardsWithSpend.length" class="credit-cards-section">
    <div class="section-header-row">
      <div>
        <h2 class="section-title">Credit Cards</h2>
        <p class="section-subtitle">Cashback earned and card value analysis</p>
      </div>
      <div class="overall-optimal">
        <span class="overall-optimal-label">Overall Optimal</span>
        <div class="overall-optimal-bar">
          <div class="overall-optimal-fill" :style="{ width: totalOptimalPercent + '%' }" />
        </div>
        <span
          class="overall-optimal-value"
          :class="totalOptimalPercent >= 70 ? 'gain' : totalOptimalPercent >= 40 ? '' : 'loss'"
        >{{ totalOptimalPercent.toFixed(0) }}%</span>
      </div>
    </div>
    <div class="cards-grid">
      <CreditCardItem
        v-for="item in cardsWithSpend"
        :key="item.card.name"
        :card="item.card"
        :analysis="item.analysis"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { getBestCardForCategory } from '@/utils/creditCardData'
import CreditCardItem from './CreditCardItem.vue'

const budgetStore = useBudgetStore()

const totalOptimalPercent = computed(() => {
  const txns = budgetStore.allTransactions
  if (!txns || txns.length === 0) return 100
  let optimalAmount = 0
  let totalAmount = 0
  for (const txn of txns) {
    totalAmount += txn.amount
    const best = getBestCardForCategory(txn.category, budgetStore.budgetMode, budgetStore.businessEnabled)
    if (txn.card === best.cardName) {
      optimalAmount += txn.amount
    }
  }
  return totalAmount > 0 ? (optimalAmount / totalAmount) * 100 : 100
})

const cardsWithSpend = computed(() => {
  const spendData = budgetStore.spendByCardAndCategory
  const results = []

  for (const card of budgetStore.filteredCards) {
    const cardSpend = spendData[card.name]
    if (!cardSpend) continue

    let totalSpend = 0
    let cashbackEarned = 0
    let bestCategory = ''
    let bestCategorySpend = 0

    for (const [category, amount] of Object.entries(cardSpend)) {
      totalSpend += amount
      const rate = card.cashbackRates[category] || card.cashbackRates.default || 0
      cashbackEarned += amount * rate

      if (amount > bestCategorySpend) {
        bestCategorySpend = amount
        bestCategory = category
      }
    }

    if (totalSpend <= 0) continue

    const creditsUsed = card.statementCredits
      .filter(c => c.used)
      .reduce((sum, c) => sum + c.amount, 0)
    const creditsRemaining = card.statementCredits
      .filter(c => !c.used)
      .reduce((sum, c) => sum + c.amount, 0)
    const totalBenefits = cashbackEarned + creditsUsed
    const netValue = totalBenefits - card.annualFee

    results.push({
      card,
      analysis: {
        totalSpend,
        cashbackEarned,
        creditsUsed,
        creditsRemaining,
        netValue,
        bestFor: bestCategory
      }
    })
  }

  return results
})
</script>

<style scoped>
.credit-cards-section {
  margin-top: 40px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  gap: 20px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.overall-optimal {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.overall-optimal-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.overall-optimal-bar {
  width: 80px;
  height: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}

.overall-optimal-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--electric-teal);
  transition: width 0.3s ease;
}

.overall-optimal-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-primary);
  min-width: 36px;
  text-align: right;
}

.overall-optimal-value.gain {
  color: var(--electric-teal);
}

.overall-optimal-value.loss {
  color: var(--persimmon);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .section-header-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
