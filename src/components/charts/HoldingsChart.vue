<template>
  <Card title="Top Holdings by Value">
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </Card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { usePortfolioStore } from '@/stores/portfolio'
import { useThemeStore } from '@/stores/theme'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/components/common/Card.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const router = useRouter()
const portfolioStore = usePortfolioStore()
const themeStore = useThemeStore()

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

watch(() => themeStore.isDark, () => {
  setTimeout(updateColors, 50)
})

const topHoldings = computed(() => {
  return [...portfolioStore.holdings]
    .filter(h => h.type !== 'cash')
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 10)
})

const chartData = computed(() => ({
  labels: topHoldings.value.map(h => h.symbol),
  datasets: [{
    data: topHoldings.value.map(h => h.currentValue),
    backgroundColor: topHoldings.value.map(h =>
      h.currentValue >= h.costBasis ? '#14B8A6' : '#EF4444'
    ),
    borderColor: 'transparent',
    borderRadius: 4,
    barThickness: 24,
  }]
}))

const chartOptions = computed(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  onClick: (event, elements) => {
    if (elements.length > 0) {
      const index = elements[0].index
      const symbol = topHoldings.value[index].symbol
      router.push(`/holding/${encodeURIComponent(symbol)}`)
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
          const holding = topHoldings.value[context.dataIndex]
          const gain = holding.currentValue - holding.costBasis
          const pct = portfolioStore.totalValue > 0
            ? ((holding.currentValue / portfolioStore.totalValue) * 100).toFixed(1)
            : '0.0'
          return [
            ` ${formatCurrency(holding.currentValue)}`,
            ` Gain/Loss: ${formatCurrency(gain)}`,
            ` ${pct}% of portfolio`
          ]
        }
      }
    }
  },
  animation: { duration: 800 },
  scales: {
    x: {
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
      ticks: {
        color: textColor.value,
        font: { size: 11 },
        callback: (value) => formatCurrency(value),
      },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
      ticks: { color: textColor.value, font: { size: 11 } },
      border: { display: false },
    }
  }
}))
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 350px;
  cursor: pointer;
}
</style>
