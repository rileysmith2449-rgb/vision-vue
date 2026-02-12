<template>
  <Card title="Portfolio Allocation">
    <div class="chart-wrapper">
      <div class="chart-container">
        <Doughnut ref="chartRef" :data="chartData" :options="chartOptions" :plugins="[centerTextPlugin]" />
      </div>
      <button v-if="drillCategory" class="back-btn" @click="goBack">
        &larr; All Categories
      </button>
    </div>
    <SellSimulatorModal
      v-if="selectedHolding"
      :holding="selectedHolding"
      @close="selectedHolding = null"
    />
  </Card>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/components/common/Card.vue'
import SellSimulatorModal from '@/components/charts/SellSimulatorModal.vue'

ChartJS.register(ArcElement, Tooltip, Legend)

const portfolioStore = usePortfolioStore()
const chartRef = ref(null)
const drillCategory = ref(null)
const selectedHolding = ref(null)

const categoryIcons = {
  'Cash': '$',
  'Stocks': '📈',
  'Crypto': '₿',
  'Real Estate': '🏠',
  'Other': '🔮',
}

const colors = [
  '#3B82F6', // accent-blue
  '#14B8A6', // accent-teal
  '#38BDF8', // accent-sky
  '#06B6D4', // accent-cyan
  '#1E40AF', // deep-blue
  '#0891B2', // dark-cyan
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#A855F7', // purple
  '#EC4899', // pink
]

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const textColor = ref(getCSSVar('--text-secondary'))
const borderColor = ref(getCSSVar('--border-glass'))

function updateColors() {
  textColor.value = getCSSVar('--text-secondary')
  borderColor.value = getCSSVar('--border-glass')
}

onMounted(updateColors)

function goBack() {
  drillCategory.value = null
  selectedHolding.value = null
}

const chartData = computed(() => {
  if (drillCategory.value) {
    const holdings = portfolioStore.getHoldingsByCategory(drillCategory.value)
    const labels = holdings.map(h => `${h.icon} ${h.symbol}`)
    const data = holdings.map(h => h.currentValue)
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#0B1120',
        borderWidth: 2,
        hoverOffset: 6,
      }]
    }
  }

  const totals = portfolioStore.categoryTotals
  const labels = Object.keys(totals).map(cat => `${categoryIcons[cat] || ''} ${cat}`)
  const data = Object.values(totals)
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.slice(0, labels.length),
      borderColor: '#0B1120',
      borderWidth: 2,
      hoverOffset: 6,
    }]
  }
})

const centerLabel = computed(() => {
  if (drillCategory.value) {
    const icon = categoryIcons[drillCategory.value] || ''
    const total = portfolioStore.categoryTotals[drillCategory.value] || 0
    return { title: `${icon} ${drillCategory.value}`, value: formatCurrency(total) }
  }
  return { title: 'Total', value: formatCurrency(portfolioStore.totalValue) }
})

const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx, width } = chart
    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2
    const centerX = width / 2

    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Title line
    ctx.fillStyle = getCSSVar('--text-secondary') || '#94A3B8'
    ctx.font = '500 12px Inter, system-ui, sans-serif'
    ctx.fillText(centerLabel.value.title, centerX, centerY - 10)

    // Value line
    ctx.fillStyle = getCSSVar('--text-primary') || '#F1F5F9'
    ctx.font = '600 16px Inter, system-ui, sans-serif'
    ctx.fillText(centerLabel.value.value, centerX, centerY + 10)

    ctx.restore()
  }
}

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  onClick(event, elements) {
    if (!elements.length) return
    const index = elements[0].index

    if (drillCategory.value) {
      // Drill level 2: click a holding → open sell simulator
      const holdings = portfolioStore.getHoldingsByCategory(drillCategory.value)
      const holding = holdings[index]
      if (holding && holding.type !== 'cash') {
        selectedHolding.value = holding
      }
    } else {
      // Drill level 1: click category → drill into holdings
      const category = Object.keys(portfolioStore.categoryTotals)[index]
      if (category) {
        drillCategory.value = category
      }
    }
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: textColor.value,
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
        font: { size: 12 },
      }
    },
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
.chart-wrapper {
  position: relative;
}

.chart-container {
  position: relative;
  height: 300px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px 12px;
  background: transparent;
  border: 1px solid var(--border-glass);
  border-radius: 6px;
  color: var(--accent-blue, #3B82F6);
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.back-btn:hover {
  background: rgba(59, 130, 246, 0.08);
  border-color: var(--accent-blue, #3B82F6);
}
</style>
