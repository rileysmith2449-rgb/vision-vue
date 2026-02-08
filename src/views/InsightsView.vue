<template>
  <div class="insights">
    <Header title="Tax Insights" subtitle="AI-powered tax optimization recommendations" />

    <div v-if="portfolioStore.loading" class="loading">Analyzing portfolio...</div>

    <template v-else>
      <CardOptimizer />
      <AIAdvisor />
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { useBudgetStore } from '@/stores/budget'
import Header from '@/components/layout/Header.vue'
import AIAdvisor from '@/components/insights/AIAdvisor.vue'
import CardOptimizer from '@/components/insights/CardOptimizer.vue'

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
</script>

<style scoped>
.insights {
  max-width: 1200px;
}

.loading {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}
</style>
