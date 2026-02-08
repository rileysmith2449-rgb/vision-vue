<template>
  <Card title="Portfolio Allocation">
    <div class="chart-container">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </Card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { usePortfolioStore } from '@/stores/portfolio'
import { useThemeStore } from '@/stores/theme'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/components/common/Card.vue'

ChartJS.register(ArcElement, Tooltip, Legend)

const portfolioStore = usePortfolioStore()
const themeStore = useThemeStore()

const colors = [
  '#00e68a', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f97316', // persimmon
  '#0ea5e9', // sky
  '#6366f1', // mid-blue
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

watch(() => themeStore.isDark, () => {
  setTimeout(updateColors, 50)
})

const chartData = computed(() => {
  const totals = portfolioStore.categoryTotals
  const labels = Object.keys(totals)
  const data = Object.values(totals)

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.slice(0, labels.length),
      borderColor: 'transparent',
      hoverOffset: 6,
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
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
      callbacks: {
        label: (context) => {
          const value = context.parsed
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const pct = ((value / total) * 100).toFixed(1)
          return ` ${context.label}: ${formatCurrency(value)} (${pct}%)`
        }
      }
    }
  }
}))
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
}
</style>
