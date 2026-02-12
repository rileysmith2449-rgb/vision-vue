<template>
  <div class="hero-card">
    <div class="hero-header">
      <div class="hero-label">Total Portfolio Value</div>
      <div class="hero-value">{{ formatCurrency(portfolioStore.totalValue) }}</div>
      <div class="hero-gains">
        <Badge
          :type="portfolioStore.totalGains >= 0 ? 'gain' : 'loss'"
          :label="formatPercent(gainPercent)"
        />
        <span :class="['gain-amount', portfolioStore.totalGains >= 0 ? 'positive' : 'negative']">
          {{ formatCurrency(portfolioStore.totalGains) }}
        </span>
      </div>
    </div>

    <div class="alloc-row">
      <div class="chart-container">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>

      <div class="alloc-legend">
        <button
          v-if="drillCategory"
          class="back-btn"
          @click="goBack"
        >
          <ArrowLeft :size="14" /> All Categories
        </button>

        <template v-if="!drillCategory">
          <button
            v-for="(value, category) in portfolioStore.categoryTotals"
            :key="category"
            class="legend-row"
            @click="drillInto(category)"
          >
            <span class="legend-dot" :style="{ background: categoryColorMap[category] || '#8B5CF6' }"></span>
            <span class="legend-name">{{ category }}</span>
            <span class="legend-pct">{{ getCategoryPct(value) }}%</span>
          </button>
        </template>

        <template v-else>
          <button
            v-for="(holding, i) in drilledHoldings"
            :key="holding.id"
            class="legend-row"
            @click="onHoldingClick(holding)"
          >
            <span class="legend-dot" :style="{ background: holdingColors[i] }"></span>
            <span class="legend-name">{{ holding.symbol }}</span>
            <span class="legend-val">{{ formatCurrency(holding.currentValue) }}</span>
          </button>
        </template>
      </div>
    </div>

    <!-- Bottom row: stat grid spanning full width -->
    <div class="hero-grid">
      <router-link to="/tax/long-term" class="hero-stat clickable">
        <div class="stat-icon-wrap green">
          <TrendingUp :size="16" stroke-width="2" />
        </div>
        <div>
          <span class="stat-label">Long-term Gains</span>
          <span class="stat-value positive">{{ formatCurrency(portfolioStore.longTermGains) }}</span>
        </div>
      </router-link>
      <router-link to="/tax/short-term" class="hero-stat clickable">
        <div class="stat-icon-wrap blue">
          <Clock :size="16" stroke-width="2" />
        </div>
        <div>
          <span class="stat-label">Short-term Gains</span>
          <span class="stat-value">{{ formatCurrency(portfolioStore.shortTermGains) }}</span>
        </div>
      </router-link>
      <router-link to="/tax/tax-impact" class="hero-stat clickable">
        <div class="stat-icon-wrap red">
          <Receipt :size="16" stroke-width="2" />
        </div>
        <div>
          <span class="stat-label">Est. Tax Impact</span>
          <span class="stat-value negative">{{ formatCurrency(portfolioStore.estimatedTaxImpact) }}</span>
        </div>
      </router-link>
      <router-link to="/tax/harvestable" class="hero-stat clickable">
        <div class="stat-icon-wrap purple">
          <Scissors :size="16" stroke-width="2" />
        </div>
        <div>
          <span class="stat-label">Harvestable</span>
          <span class="stat-value">{{ formatCompactNumber(portfolioStore.harvestableAmount) }}</span>
        </div>
      </router-link>
    </div>

    <SellSimulatorModal
      v-if="selectedHolding"
      :holding="selectedHolding"
      @close="selectedHolding = null"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency, formatPercent, formatCompactNumber } from '@/utils/formatters'
import { TrendingUp, Clock, Receipt, Scissors, ArrowLeft } from 'lucide-vue-next'
import Badge from '@/components/common/Badge.vue'
import SellSimulatorModal from '@/components/charts/SellSimulatorModal.vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip)

const portfolioStore = usePortfolioStore()

// --- Hero card logic ---
const gainPercent = computed(() => {
  if (portfolioStore.totalCostBasis === 0) return 0
  return (portfolioStore.totalGains / portfolioStore.totalCostBasis) * 100
})

// --- Allocation chart logic ---
const drillCategory = ref(null)
const selectedHolding = ref(null)

const categoryColorMap = {
  'Cash': '#14B8A6',
  'Stocks': '#3B82F6',
  'Crypto': '#38BDF8',
  'Real Estate': '#6366F1',
  'Other': '#8B5CF6',
}

const holdingColorPalette = [
  '#3B82F6', '#14B8A6', '#38BDF8', '#06B6D4', '#1E40AF',
  '#0891B2', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899',
]

function goBack() {
  drillCategory.value = null
  selectedHolding.value = null
}

function drillInto(category) {
  drillCategory.value = category
}

function onHoldingClick(holding) {
  if (holding.type !== 'cash') {
    selectedHolding.value = holding
  }
}

const drilledHoldings = computed(() => {
  if (!drillCategory.value) return []
  return portfolioStore.getHoldingsByCategory(drillCategory.value)
})

const holdingColors = computed(() => {
  return drilledHoldings.value.map((_, i) => holdingColorPalette[i % holdingColorPalette.length])
})

function getCategoryPct(value) {
  const total = portfolioStore.totalValue
  if (!total) return '0.0'
  return ((value / total) * 100).toFixed(1)
}

const chartData = computed(() => {
  if (drillCategory.value) {
    const holdings = drilledHoldings.value
    return {
      labels: holdings.map(h => h.symbol),
      datasets: [{
        data: holdings.map(h => h.currentValue),
        backgroundColor: holdingColors.value,
        borderColor: '#0B1120',
        borderWidth: 2,
        hoverOffset: 4,
      }]
    }
  }

  const totals = portfolioStore.categoryTotals
  const categories = Object.keys(totals)
  return {
    labels: categories,
    datasets: [{
      data: Object.values(totals),
      backgroundColor: categories.map(c => categoryColorMap[c] || '#8B5CF6'),
      borderColor: '#0B1120',
      borderWidth: 2,
      hoverOffset: 4,
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  onClick(event, elements) {
    if (!elements.length) return
    const index = elements[0].index

    if (drillCategory.value) {
      const holding = drilledHoldings.value[index]
      if (holding && holding.type !== 'cash') {
        selectedHolding.value = holding
      }
    } else {
      const category = Object.keys(portfolioStore.categoryTotals)[index]
      if (category) {
        drillCategory.value = category
      }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1E293B',
      borderColor: 'rgba(56, 189, 248, 0.08)',
      borderWidth: 1,
      cornerRadius: 8,
      titleColor: '#F1F5F9',
      bodyColor: '#F1F5F9',
      padding: 12,
      callbacks: {
        label: (context) => {
          const value = context.parsed
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const pct = ((value / total) * 100).toFixed(1)
          return ` ${context.label}: ${formatCurrency(value)} (${pct}%)`
        }
      }
    }
  },
  animation: { duration: 600 },
}))
</script>

<style scoped>
.hero-card {
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  padding: 32px;
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.hero-header {
  margin-bottom: 20px;
}

.alloc-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.hero-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
  margin-bottom: 8px;
}

.hero-value {
  font-family: 'Lexend', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero-gains {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.gain-amount {
  font-size: 0.85rem;
  font-weight: 600;
}

.gain-amount.positive { color: var(--accent-teal); }
.gain-amount.negative { color: var(--negative); }

.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid rgba(59, 130, 246, 0.15);
}

.hero-stat {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-decoration: none;
}

.hero-stat.clickable {
  padding: 10px;
  margin: -10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s ease;
}

.hero-stat.clickable:hover {
  background: var(--bg-subtle);
}

.stat-icon-wrap {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.stat-icon-wrap.green {
  background: rgba(20, 184, 166, 0.1);
  color: var(--accent-teal);
}

.stat-icon-wrap.blue {
  background: rgba(56, 189, 248, 0.1);
  color: var(--accent-sky);
}

.stat-icon-wrap.red {
  background: rgba(239, 68, 68, 0.1);
  color: var(--negative);
}

.stat-icon-wrap.purple {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-blue);
}

.stat-label {
  display: block;
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  display: block;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 2px;
}

.stat-value.positive { color: var(--accent-teal); }
.stat-value.negative { color: var(--negative); }

/* --- Chart + legend --- */
.chart-container {
  position: relative;
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}

.alloc-legend {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  text-align: left;
  white-space: nowrap;
}

.legend-row:hover {
  background: var(--bg-subtle);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  font-size: 0.8rem;
  color: var(--text-primary);
  font-weight: 500;
}

.legend-pct,
.legend-val {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  padding: 4px 10px;
  background: transparent;
  border: 1px solid var(--border-glass);
  border-radius: 6px;
  color: var(--accent-blue, #3B82F6);
  font-size: 0.75rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  width: fit-content;
}

.back-btn:hover {
  background: rgba(59, 130, 246, 0.08);
  border-color: var(--accent-blue, #3B82F6);
}

/* --- Responsive --- */
@media (max-width: 1024px) {
  .hero-value {
    font-size: 2rem;
  }

  .hero-card {
    padding: 24px;
  }
}
</style>
