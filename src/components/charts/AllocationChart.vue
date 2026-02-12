<template>
  <Card title="Portfolio Allocation">
    <div class="chart-container">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </Card>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/components/common/Card.vue'

ChartJS.register(ArcElement, Tooltip, Legend)

const portfolioStore = usePortfolioStore()

const colors = [
  '#3B82F6', // accent-blue
  '#14B8A6', // accent-teal
  '#38BDF8', // accent-sky
  '#06B6D4', // accent-cyan
  '#1E40AF', // deep-blue
  '#0891B2', // dark-cyan
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

const chartData = computed(() => {
  const totals = portfolioStore.categoryTotals
  const labels = Object.keys(totals)
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
  animation: { duration: 800 },
}))
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
}
</style>
