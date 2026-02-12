<template>
  <div class="asset-category">
    <Header :title="categoryName" :subtitle="`${holdings.length} holdings`">
      <template #actions>
        <router-link to="/net-worth" class="back-link">← Back to Net Worth</router-link>
      </template>
    </Header>

    <div v-if="portfolioStore.loading" class="loading">Loading...</div>

    <template v-else-if="holdings.length > 0">
      <div class="category-summary">
        <div class="summary-stat">
          <span class="summary-label">Category Total</span>
          <span class="summary-value">{{ formatCurrency(categoryTotal) }}</span>
        </div>
        <div class="summary-stat">
          <span class="summary-label">Holdings</span>
          <span class="summary-value">{{ holdings.length }}</span>
        </div>
      </div>

      <div class="holdings-list">
        <AssetCard v-for="holding in holdings" :key="holding.id" :holding="holding" />
      </div>
    </template>

    <div v-else class="empty-state">
      <p>No holdings found in this category.</p>
      <router-link to="/net-worth" class="back-link">← Back to Net Worth</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency } from '@/utils/formatters'
import Header from '@/components/layout/Header.vue'
import AssetCard from '@/components/portfolio/AssetCard.vue'

const route = useRoute()
const portfolioStore = usePortfolioStore()

const categoryName = computed(() => decodeURIComponent(route.params.category))

const holdings = computed(() =>
  portfolioStore.getHoldingsByCategory(categoryName.value)
)

const categoryTotal = computed(() =>
  holdings.value.reduce((sum, h) => sum + h.currentValue, 0)
)

onMounted(() => {
  if (portfolioStore.holdings.length === 0) {
    portfolioStore.loadHoldings()
  }
})
</script>

<style scoped>
.asset-category {
  max-width: 1200px;
}

.loading {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary);
}

.back-link {
  font-size: 0.85rem;
  color: var(--electric-teal);
  text-decoration: none;
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}

.category-summary {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
}

.summary-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
}

.holdings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary);
}

.empty-state .back-link {
  display: inline-block;
  margin-top: 16px;
}
</style>
