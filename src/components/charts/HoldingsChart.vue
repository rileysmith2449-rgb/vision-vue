<template>
  <Card title="Top Holdings by Value">
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </Card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { usePortfolioStore } from '@/stores/portfolio'
import { useThemeStore } from '@/stores/theme'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/components/common/Card.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

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
      h.currentValue >= h.costBasis ? '#00e68a' : '#f45b69'
    ),
    borderColor: 'transparent',
    borderRadius: 6,
    barThickness: 24,
  }]
}))

const chartOptions = computed(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
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
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: textColor.value,
        callback: (value) => formatCurrency(value),
      },
      border: { display: false },
    },
    y: {
      grid: { display: false },
      ticks: { color: textColor.value },
      border: { display: false },
    }
  }
}))
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 350px;
}
</style>
