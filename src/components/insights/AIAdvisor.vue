<template>
  <div class="ai-advisor">
    <div class="advisor-header">
      <span class="advisor-icon">🤖</span>
      <div>
        <h3 class="advisor-title">AI Tax Advisor</h3>
        <p class="advisor-subtitle">Personalized recommendations based on your portfolio</p>
      </div>
    </div>

    <div class="insights-list">
      <InsightCard
        v-for="(insight, index) in insights"
        :key="index"
        :title="insight.title"
        :description="insight.description"
        :type="insight.type"
        :value="insight.value"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { useBudgetStore } from '@/stores/budget'
import { formatCurrency } from '@/utils/formatters'
import { daysUntilLongTerm } from '@/utils/taxCalculations'
import InsightCard from './InsightCard.vue'

const portfolioStore = usePortfolioStore()
const budgetStore = useBudgetStore()

const insights = computed(() => {
  const results = []

  // Tax-loss harvesting opportunities
  if (portfolioStore.harvestableAmount > 0) {
    results.push({
      title: 'Tax-Loss Harvesting Opportunity',
      description: `You have ${portfolioStore.harvestableHoldings.length} holdings with unrealized losses. Consider selling to offset gains and reduce your tax bill.`,
      type: 'opportunity',
      value: `Potential savings: ${formatCurrency(portfolioStore.harvestableAmount * 0.32)}`
    })
  }

  // Holdings approaching long-term status
  const nearLongTerm = portfolioStore.holdings.filter(h => {
    if (h.type === 'cash') return false
    const days = daysUntilLongTerm(h.purchaseDate)
    return days > 0 && days <= 60
  })
  if (nearLongTerm.length > 0) {
    results.push({
      title: 'Long-Term Transition Alert',
      description: `${nearLongTerm.length} holding(s) will qualify for long-term capital gains treatment within 60 days. Hold to save on taxes.`,
      type: 'info',
      value: `${nearLongTerm.map(h => h.symbol).join(', ')}`
    })
  }

  // Budget warnings
  if (budgetStore.isOverBudget) {
    results.push({
      title: 'Budget Warning',
      description: `You've exceeded your monthly budget by ${formatCurrency(Math.abs(budgetStore.budgetRemaining))}. Consider cutting discretionary spending.`,
      type: 'warning',
      value: `Over by ${formatCurrency(Math.abs(budgetStore.budgetRemaining))}`
    })
  }

  // High effective tax rate
  if (budgetStore.effectiveRate > 25) {
    results.push({
      title: 'High Effective Tax Rate',
      description: `Your effective tax rate is ${budgetStore.effectiveRate.toFixed(1)}%. Consider maximizing pre-tax retirement contributions to reduce taxable income.`,
      type: 'warning',
      value: `${budgetStore.effectiveRate.toFixed(1)}% effective rate`
    })
  }

  // Long-term gains advantage
  if (portfolioStore.longTermGains > 0) {
    results.push({
      title: 'Long-Term Gains Advantage',
      description: `You have ${formatCurrency(portfolioStore.longTermGains)} in long-term gains taxed at preferential rates (15%) instead of ordinary income rates (up to 37%).`,
      type: 'opportunity',
      value: `Saving ${formatCurrency(portfolioStore.longTermGains * 0.17)}`
    })
  }

  // Diversification insight
  const categories = Object.keys(portfolioStore.holdingsByCategory)
  if (categories.length > 0) {
    results.push({
      title: 'Portfolio Diversification',
      description: `Your portfolio spans ${categories.length} asset categories. Diversification helps manage risk and may provide tax optimization opportunities across asset classes.`,
      type: 'info',
      value: `${categories.length} categories`
    })
  }

  return results
})
</script>

<style scoped>
.ai-advisor {
  margin-bottom: 32px;
}

.advisor-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.advisor-icon {
  font-size: 2rem;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-pop);
  border-radius: 16px;
}

.advisor-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.advisor-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
