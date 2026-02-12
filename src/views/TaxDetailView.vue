<template>
  <div class="tax-detail">
    <Header :title="pageTitle" :subtitle="pageSubtitle">
      <template #actions>
        <button class="back-btn" @click="router.back()">Back</button>
      </template>
    </Header>

    <div class="summary-card">
      <div class="summary-value" :class="valueClass">{{ formatCurrency(summaryAmount) }}</div>
      <div class="summary-label">{{ summaryLabel }}</div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">{{ tableTitle }}</h3>
        <span class="card-count">{{ filteredHoldings.length }} holdings</span>
      </div>
      <div class="table-scroll">
        <table class="detail-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Category</th>
              <th>Value</th>
              <th>Cost Basis</th>
              <th>Gain/Loss</th>
              <th>Tax Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="holding in filteredHoldings" :key="holding.id" class="row-clickable" @click="router.push(`/holding/${encodeURIComponent(holding.symbol)}`)">
              <td class="cell-symbol">{{ holding.symbol }}</td>
              <td class="cell-muted">{{ holding.category }}</td>
              <td class="cell-value">{{ formatCurrency(holding.currentValue) }}</td>
              <td class="cell-muted">{{ formatCurrency(holding.costBasis) }}</td>
              <td :class="holding.currentValue >= holding.costBasis ? 'cell-gain' : 'cell-loss'">
                {{ formatCurrency(holding.currentValue - holding.costBasis) }}
              </td>
              <td>
                <Badge :type="taxBadgeType(holding)" :label="taxLabel(holding)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency } from '@/utils/formatters'
import { calculateTaxTreatment, daysUntilLongTerm } from '@/utils/taxCalculations'
import Header from '@/components/layout/Header.vue'
import Badge from '@/components/common/Badge.vue'

const route = useRoute()
const router = useRouter()
const portfolioStore = usePortfolioStore()

const detailType = computed(() => route.params.type)

const pageTitle = computed(() => {
  switch (detailType.value) {
    case 'long-term': return 'Long-term Gains'
    case 'short-term': return 'Short-term Gains'
    case 'tax-impact': return 'Estimated Tax Impact'
    case 'harvestable': return 'Tax-Loss Harvesting'
    default: return 'Tax Detail'
  }
})

const pageSubtitle = computed(() => {
  switch (detailType.value) {
    case 'long-term': return 'Holdings held over 1 year with unrealized gains (taxed at 15%)'
    case 'short-term': return 'Holdings held under 1 year with unrealized gains (taxed at 32%)'
    case 'tax-impact': return 'Breakdown of estimated taxes across all gain types'
    case 'harvestable': return 'Holdings with unrealized losses available for tax-loss harvesting'
    default: return ''
  }
})

const filteredHoldings = computed(() => {
  const holdings = portfolioStore.holdings.filter(h => h.type !== 'cash')
  switch (detailType.value) {
    case 'long-term':
      return holdings.filter(h =>
        calculateTaxTreatment(h.purchaseDate) === 'long-term' &&
        h.currentValue > h.costBasis
      )
    case 'short-term':
      return holdings.filter(h =>
        calculateTaxTreatment(h.purchaseDate) === 'short-term' &&
        h.currentValue > h.costBasis
      )
    case 'tax-impact':
      return holdings.filter(h => h.currentValue > h.costBasis)
    case 'harvestable':
      return holdings.filter(h => h.currentValue < h.costBasis)
    default:
      return holdings
  }
})

const summaryAmount = computed(() => {
  switch (detailType.value) {
    case 'long-term': return portfolioStore.longTermGains
    case 'short-term': return portfolioStore.shortTermGains
    case 'tax-impact': return portfolioStore.estimatedTaxImpact
    case 'harvestable': return portfolioStore.harvestableAmount
    default: return 0
  }
})

const summaryLabel = computed(() => {
  switch (detailType.value) {
    case 'long-term': return 'Total long-term gains'
    case 'short-term': return 'Total short-term gains'
    case 'tax-impact': return 'Total estimated tax liability'
    case 'harvestable': return 'Total harvestable losses'
    default: return ''
  }
})

const valueClass = computed(() => {
  switch (detailType.value) {
    case 'long-term':
    case 'short-term': return 'positive'
    case 'tax-impact': return 'negative'
    case 'harvestable': return ''
    default: return ''
  }
})

const tableTitle = computed(() => {
  switch (detailType.value) {
    case 'long-term': return 'Long-term Gain Holdings'
    case 'short-term': return 'Short-term Gain Holdings'
    case 'tax-impact': return 'All Taxable Holdings'
    case 'harvestable': return 'Harvestable Loss Holdings'
    default: return 'Holdings'
  }
})

function taxBadgeType(holding) {
  return calculateTaxTreatment(holding.purchaseDate) === 'long-term' ? 'info' : 'neutral'
}

function taxLabel(holding) {
  const treatment = calculateTaxTreatment(holding.purchaseDate)
  if (treatment === 'long-term') return 'Long-term'
  const days = daysUntilLongTerm(holding.purchaseDate)
  return `Short-term (${days}d)`
}
</script>

<style scoped>
.tax-detail {
  max-width: 1200px;
}

.summary-card {
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  padding: 32px;
  text-align: center;
  margin-bottom: 24px;
}

.summary-value {
  font-family: 'Lexend', sans-serif;
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.summary-value.positive { color: var(--electric-teal); }
.summary-value.negative { color: var(--persimmon); }

.summary-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 8px;
}

.card {
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
}

.card-header {
  padding: 24px 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.card-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.table-scroll {
  overflow-x: auto;
  padding: 16px 0 24px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.detail-table th {
  padding: 10px 16px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-glass);
}

.detail-table th:first-child { padding-left: 24px; }
.detail-table th:last-child { padding-right: 24px; }

.detail-table td {
  padding: 12px 16px;
  font-size: 0.875rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-glass);
}

.detail-table td:first-child { padding-left: 24px; }
.detail-table td:last-child { padding-right: 24px; }

.detail-table tbody tr:hover { background: var(--bg-subtle); }
.detail-table tbody tr:last-child td { border-bottom: none; }
.row-clickable { cursor: pointer; }

.cell-symbol { font-weight: 700; }
.cell-value { font-weight: 600; }
.cell-muted { color: var(--text-secondary); }
.cell-gain { color: var(--electric-teal); font-weight: 600; }
.cell-loss { color: var(--persimmon); font-weight: 600; }

.back-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-glass);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: var(--bg-subtle);
}

@media (max-width: 1024px) {
  .summary-value { font-size: 1.8rem; }
  .summary-card { padding: 24px; }
}
</style>
