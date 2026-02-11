<template>
  <div class="net-worth">
    <Header title="Net Worth" subtitle="Complete picture of your financial position" />

    <div v-if="portfolioStore.loading" class="loading">Loading...</div>

    <template v-else>
      <!-- Hero stats -->
      <div class="stats-row">
        <div class="stat-card hero">
          <span class="stat-label">Net Worth</span>
          <span class="stat-value" :class="{ negative: latestNetWorth < 0 }">
            {{ formatCurrency(latestNetWorth) }}
          </span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Assets</span>
          <span class="stat-value assets">{{ formatCurrency(totalAssets) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Liabilities</span>
          <span class="stat-value liabilities">{{ formatCurrency(portfolioStore.totalLiabilities) }}</span>
        </div>
      </div>

      <!-- Net Worth Chart -->
      <NetWorthChart class="chart-section" />

      <!-- Assets Section -->
      <div class="section">
        <h3 class="section-title">Assets</h3>
        <div class="group-list">
          <AssetGroup
            v-for="(holdings, category) in portfolioStore.holdingsByCategory"
            :key="category"
            :category="category"
            :holdings="holdings"
            :total="portfolioStore.categoryTotals[category]"
            :icon="categoryIcons[category] || '📊'"
          />
        </div>
      </div>

      <!-- Property Values -->
      <div v-if="portfolioStore.propertyValues.length > 0" class="section">
        <h3 class="section-title">Property Values</h3>
        <div class="property-list">
          <div v-for="prop in portfolioStore.propertyValues" :key="prop.id" class="property-card clickable" @click="router.push(`/property/${prop.id}`)">
            <div class="property-info">
              <span class="property-name">{{ prop.name }}</span>
              <span class="property-address">{{ prop.address }}</span>
            </div>
            <div class="property-values">
              <div class="property-stat">
                <span class="property-stat-label">Estimated Value</span>
                <span class="property-stat-value">{{ formatCurrency(prop.estimatedValue) }}</span>
              </div>
              <div class="property-stat">
                <span class="property-stat-label">Purchase Price</span>
                <span class="property-stat-value muted">{{ formatCurrency(prop.purchasePrice) }}</span>
              </div>
              <div class="property-stat">
                <span class="property-stat-label">Gain</span>
                <span class="property-stat-value gain">{{ formatCurrency(prop.estimatedValue - prop.purchasePrice) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liabilities Section -->
      <div class="section">
        <h3 class="section-title">Liabilities</h3>
        <div class="group-list">
          <LiabilityGroup
            v-for="(items, category) in portfolioStore.liabilitiesByCategory"
            :key="category"
            :category="category"
            :items="items"
            :total="portfolioStore.liabilityCategoryTotals[category]"
            :icon="liabilityIcons[category] || '📋'"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency } from '@/utils/formatters'
import Header from '@/components/layout/Header.vue'
import NetWorthChart from '@/components/networth/NetWorthChart.vue'
import AssetGroup from '@/components/networth/AssetGroup.vue'
import LiabilityGroup from '@/components/networth/LiabilityGroup.vue'

const router = useRouter()
const portfolioStore = usePortfolioStore()

const categoryIcons = {
  'Cash': '💵',
  'Stocks': '📈',
  'Crypto': '₿',
  'ETFs': '💎',
  'Real Estate': '🏠',
  'Bonds': '🏦',
  'Other': '🎯'
}

const liabilityIcons = {
  'Mortgage': '🏠',
  'Auto Loans': '🚗',
  'Student Loans': '🎓',
  'Credit Cards': '💳'
}

const latestNetWorth = computed(() => {
  const h = portfolioStore.netWorthHistory
  if (!h || h.length === 0) return 0
  return h[h.length - 1].value || 0
})

const totalAssets = computed(() => (portfolioStore.totalValue || 0) + (portfolioStore.totalPropertyValue || 0))

onMounted(() => {
  if (portfolioStore.holdings.length === 0) {
    portfolioStore.loadHoldings()
  } else if (portfolioStore.netWorthHistory.length === 0) {
    portfolioStore.loadNetWorthData()
  }
})
</script>

<style scoped>
.net-worth {
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.stat-card.hero {
  border-color: rgba(20, 184, 166, 0.25);
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

.stat-value.negative {
  color: #ef4444;
}

.stat-value.assets {
  color: #6495ed;
}

.stat-value.liabilities {
  color: #ef4444;
}

.chart-section {
  margin-bottom: 32px;
}

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 14px;
  letter-spacing: -0.01em;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.property-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-card {
  padding: 18px 22px;
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
}

.property-card.clickable {
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.property-card.clickable:hover {
  border-color: rgba(100, 149, 237, 0.3);
  background: var(--bg-subtle);
}

.property-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 14px;
}

.property-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.property-address {
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

.property-values {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
}

.property-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.property-stat-label {
  font-size: 0.68rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.property-stat-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.property-stat-value.muted {
  color: var(--text-secondary);
  font-weight: 600;
}

.property-stat-value.gain {
  color: var(--electric-teal);
}
</style>
