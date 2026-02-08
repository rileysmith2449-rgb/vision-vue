<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Top Movers</h3>
    </div>
    <div class="movers-grid">
      <div class="movers-column">
        <h4 class="column-title column-title--gain">Top Gainers</h4>
        <div v-for="holding in topGainers" :key="holding.id" class="mover-row">
          <span class="dot dot--gain"></span>
          <span class="mover-symbol">{{ holding.symbol }}</span>
          <Badge type="gain" :label="formatPercent(gainPct(holding))" />
          <span class="mover-amount mover-amount--gain">
            {{ formatCurrency(holding.currentValue - holding.costBasis) }}
          </span>
        </div>
      </div>
      <div class="movers-column">
        <h4 class="column-title column-title--loss">Top Losers</h4>
        <template v-if="topLosers.length">
          <div v-for="holding in topLosers" :key="holding.id" class="mover-row">
            <span class="dot dot--loss"></span>
            <span class="mover-symbol">{{ holding.symbol }}</span>
            <Badge type="loss" :label="formatPercent(gainPct(holding))" />
            <span class="mover-amount mover-amount--loss">
              {{ formatCurrency(holding.currentValue - holding.costBasis) }}
            </span>
          </div>
        </template>
        <p v-else class="no-data">No losses</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import Badge from '@/components/common/Badge.vue'

const portfolioStore = usePortfolioStore()

function gainPct(holding) {
  if (holding.costBasis === 0) return 0
  return ((holding.currentValue - holding.costBasis) / holding.costBasis) * 100
}

const nonCash = computed(() =>
  portfolioStore.holdings.filter(h => h.type !== 'cash')
)

const topGainers = computed(() =>
  [...nonCash.value]
    .filter(h => h.currentValue > h.costBasis)
    .sort((a, b) => gainPct(b) - gainPct(a))
    .slice(0, 3)
)

const topLosers = computed(() =>
  [...nonCash.value]
    .filter(h => h.currentValue < h.costBasis)
    .sort((a, b) => gainPct(a) - gainPct(b))
    .slice(0, 3)
)
</script>

<style scoped>
.card {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
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

.movers-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 20px 24px 24px;
}

.column-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.column-title--gain {
  color: var(--electric-teal);
}

.column-title--loss {
  color: var(--persimmon);
}

.mover-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-glass);
}

.mover-row:last-child {
  border-bottom: none;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot--gain {
  background: var(--electric-teal);
}

.dot--loss {
  background: var(--persimmon);
}

.mover-symbol {
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--text-primary);
  min-width: 48px;
}

.mover-amount {
  margin-left: auto;
  font-size: 0.8rem;
  font-weight: 600;
}

.mover-amount--gain {
  color: var(--electric-teal);
}

.mover-amount--loss {
  color: var(--persimmon);
}

.no-data {
  color: var(--text-tertiary);
  font-size: 0.85rem;
  font-style: italic;
}

@media (max-width: 640px) {
  .movers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
