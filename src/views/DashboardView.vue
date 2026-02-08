<template>
  <div class="dashboard">
    <Header title="Dashboard" subtitle="Your tax-smart portfolio overview" />

    <div v-if="portfolioStore.loading" class="loading">Loading portfolio...</div>

    <template v-else>
      <HeroCard />

      <section class="section">
        <h2 class="section-title">Asset Categories</h2>
        <div class="card-grid">
          <CategoryCard
            v-for="(holdings, category) in portfolioStore.holdingsByCategory"
            :key="category"
            :category="category"
            :holdings="holdings"
            :total="portfolioStore.categoryTotals[category]"
          />
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Top Insights</h2>
          <router-link to="/insights" class="section-link">View all →</router-link>
        </div>
        <div class="insights-preview">
          <InsightCard
            v-for="(insight, index) in topInsights"
            :key="index"
            :title="insight.title"
            :description="insight.description"
            :type="insight.type"
            :value="insight.value"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { useBudgetStore } from '@/stores/budget'
import { formatCurrency } from '@/utils/formatters'
import { daysUntilLongTerm } from '@/utils/taxCalculations'
import Header from '@/components/layout/Header.vue'
import HeroCard from '@/components/portfolio/HeroCard.vue'
import CategoryCard from '@/components/portfolio/CategoryCard.vue'
import InsightCard from '@/components/insights/InsightCard.vue'

const portfolioStore = usePortfolioStore()
const budgetStore = useBudgetStore()

onMounted(() => {
  if (portfolioStore.holdings.length === 0) {
    portfolioStore.loadHoldings()
  }
  if (Object.keys(budgetStore.expenses).length === 0) {
    budgetStore.loadExpenses()
  }
})

const topInsights = computed(() => {
  const results = []

  if (portfolioStore.harvestableAmount > 0) {
    results.push({
      title: 'Tax-Loss Harvesting',
      description: `${portfolioStore.harvestableHoldings.length} holdings have harvestable losses.`,
      type: 'opportunity',
      value: formatCurrency(portfolioStore.harvestableAmount)
    })
  }

  const nearLongTerm = portfolioStore.holdings.filter(h => {
    if (h.type === 'cash') return false
    const days = daysUntilLongTerm(h.purchaseDate)
    return days > 0 && days <= 60
  })
  if (nearLongTerm.length > 0) {
    results.push({
      title: 'Approaching Long-Term',
      description: `${nearLongTerm.length} holdings near long-term status.`,
      type: 'info',
      value: `Within 60 days`
    })
  }

  if (budgetStore.isOverBudget) {
    results.push({
      title: 'Over Budget',
      description: `Monthly spending exceeds budget.`,
      type: 'warning',
      value: formatCurrency(Math.abs(budgetStore.budgetRemaining))
    })
  }

  return results.slice(0, 3)
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
}

.loading {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.section {
  margin-top: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.section-header .section-title {
  margin-bottom: 0;
}

.section-link {
  font-size: 0.85rem;
  color: var(--electric-teal);
  text-decoration: none;
  font-weight: 600;
}

.section-link:hover {
  text-decoration: underline;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.insights-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
