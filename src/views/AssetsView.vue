<template>
  <div class="assets">
    <Header title="Assets" subtitle="All your holdings by category" />

    <div v-if="portfolioStore.loading" class="loading">Loading assets...</div>

    <template v-else>
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-label">Total Value</span>
          <span class="stat-value">{{ formatCurrency(portfolioStore.totalValue) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Categories</span>
          <span class="stat-value">{{ categoryCount }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Harvestable</span>
          <span class="stat-value harvest">{{ formatCurrency(portfolioStore.harvestableAmount) }}</span>
        </div>
      </div>

      <GainsChart class="gains-chart" />

      <div class="card-grid">
        <CategoryCard
          v-for="(holdings, category) in portfolioStore.holdingsByCategory"
          :key="category"
          :category="category"
          :holdings="holdings"
          :total="portfolioStore.categoryTotals[category]"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency } from '@/utils/formatters'
import Header from '@/components/layout/Header.vue'
import CategoryCard from '@/components/portfolio/CategoryCard.vue'
import GainsChart from '@/components/charts/GainsChart.vue'

const portfolioStore = usePortfolioStore()

const categoryCount = computed(() => Object.keys(portfolioStore.holdingsByCategory).length)

onMounted(() => {
  if (portfolioStore.holdings.length === 0) {
    portfolioStore.loadHoldings()
  }
})
</script>

<style scoped>
.assets {
  max-width: 1200px;
}

.loading {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 24px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 16px;
  box-shadow: var(--shadow-glass);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.harvest {
  color: var(--electric-teal);
}

.gains-chart {
  margin-bottom: 32px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
</style>
