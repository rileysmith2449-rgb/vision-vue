<template>
  <section v-if="cardsWithSpend.length" class="credit-cards-section">
    <h2 class="section-title">Credit Cards</h2>
    <p class="section-subtitle">Cashback earned and card value analysis</p>
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
import CreditCardItem from './CreditCardItem.vue'

const budgetStore = useBudgetStore()

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
  margin-bottom: 20px;
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
}
</style>
