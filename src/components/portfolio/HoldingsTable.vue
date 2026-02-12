<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">All Holdings</h3>
    </div>
    <div class="table-scroll">
      <table class="holdings-table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="{ active: sortKey === col.key }"
              @click="toggleSort(col.key)"
            >
              {{ col.label }}
              <span v-if="sortKey === col.key" class="sort-icon">
                {{ sortAsc ? '\u25B2' : '\u25BC' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="holding in sortedHoldings" :key="holding.id" class="row-clickable" @click="router.push(`/holding/${encodeURIComponent(holding.symbol)}`)">
            <td class="cell-symbol">{{ holding.symbol }}</td>
            <td class="cell-category">{{ holding.category }}</td>
            <td class="cell-value">{{ formatCurrency(holding.currentValue) }}</td>
            <td class="cell-muted">{{ formatCurrency(holding.costBasis) }}</td>
            <td :class="gainClass(holding)">
              {{ formatCurrency(holding.currentValue - holding.costBasis) }}
            </td>
            <td>
              <Badge
                :type="holding.currentValue >= holding.costBasis ? 'gain' : 'loss'"
                :label="formatPercent(gainPercent(holding))"
              />
            </td>
            <td>
              <Badge
                :type="taxBadgeType(holding)"
                :label="taxLabel(holding)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import { calculateTaxTreatment, daysUntilLongTerm } from '@/utils/taxCalculations'
import Badge from '@/components/common/Badge.vue'

const router = useRouter()
const portfolioStore = usePortfolioStore()

const columns = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'category', label: 'Category' },
  { key: 'currentValue', label: 'Value' },
  { key: 'costBasis', label: 'Cost Basis' },
  { key: 'gain', label: 'Gain/Loss' },
  { key: 'gainPct', label: 'Gain %' },
  { key: 'taxStatus', label: 'Tax Status' },
]

const sortKey = ref('currentValue')
const sortAsc = ref(false)

function toggleSort(key) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = false
  }
}

function gainPercent(holding) {
  if (holding.costBasis === 0) return 0
  return ((holding.currentValue - holding.costBasis) / holding.costBasis) * 100
}

function getSortValue(holding, key) {
  switch (key) {
    case 'symbol': return holding.symbol.toLowerCase()
    case 'category': return holding.category.toLowerCase()
    case 'currentValue': return holding.currentValue
    case 'costBasis': return holding.costBasis
    case 'gain': return holding.currentValue - holding.costBasis
    case 'gainPct': return gainPercent(holding)
    case 'taxStatus': return calculateTaxTreatment(holding.purchaseDate)
    default: return 0
  }
}

const sortedHoldings = computed(() => {
  return [...portfolioStore.holdings]
    .filter(h => h.type !== 'cash')
    .sort((a, b) => {
      const aVal = getSortValue(a, sortKey.value)
      const bVal = getSortValue(b, sortKey.value)
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
      return sortAsc.value ? cmp : -cmp
    })
})

function gainClass(holding) {
  return holding.currentValue >= holding.costBasis ? 'cell-gain' : 'cell-loss'
}

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
.card {
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
}

.card-header {
  padding: 24px 24px 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.table-scroll {
  overflow-x: auto;
  padding: 16px 0 24px;
}

.holdings-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.holdings-table th {
  padding: 10px 16px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  border-bottom: 1px solid var(--border-glass);
}

.holdings-table th:first-child {
  padding-left: 24px;
}

.holdings-table th:last-child {
  padding-right: 24px;
}

.holdings-table th:hover {
  color: var(--text-secondary);
}

.holdings-table th.active {
  color: var(--accent-blue);
}

.sort-icon {
  font-size: 0.6rem;
  margin-left: 4px;
}

.holdings-table td {
  padding: 12px 16px;
  font-size: 0.875rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-glass);
}

.holdings-table td:first-child {
  padding-left: 24px;
}

.holdings-table td:last-child {
  padding-right: 24px;
}

.holdings-table tbody tr:nth-child(even) {
  background: rgba(30, 41, 59, 0.5);
}

.holdings-table tbody tr:hover {
  background: var(--bg-surface-hover);
}

.holdings-table tbody tr:last-child td {
  border-bottom: none;
}

.row-clickable {
  cursor: pointer;
}

.cell-symbol {
  font-weight: 700;
}

.cell-value {
  font-weight: 600;
}

.cell-category,
.cell-muted {
  color: var(--text-secondary);
}

.cell-gain {
  color: var(--accent-teal);
  font-weight: 600;
}

.cell-loss {
  color: var(--negative);
  font-weight: 600;
}
</style>
