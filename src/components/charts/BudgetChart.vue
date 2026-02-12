<template>
  <Card title="Spending vs Budget">
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </Card>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { useBudgetStore } from '@/stores/budget'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/components/common/Card.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const budgetStore = useBudgetStore()

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
  const categories = budgetStore.categoryExpenses
  const labels = Object.keys(categories)
  const spent = labels.map(cat => categories[cat].total)
  const budgets = labels.map(cat => categories[cat].budget)
  const spentColors = labels.map(cat =>
    categories[cat].percentage > 100 ? '#06B6D4' : '#14B8A6'
  )

  return {
    labels,
    datasets: [
      {
        label: 'Spent',
        data: spent,
        backgroundColor: spentColors,
        borderColor: 'transparent',
        borderRadius: 4,
      },
      {
        label: 'Budget',
        data: budgets,
        backgroundColor: 'rgba(148, 163, 184, 0.15)',
        borderColor: 'transparent',
        borderRadius: 4,
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: textColor.value,
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
        font: { size: 12 },
        generateLabels: (chart) => {
          return [
            { text: 'Spent', fillStyle: '#14B8A6', strokeStyle: 'transparent', pointStyle: 'rectRounded' },
            { text: 'Budget', fillStyle: 'rgba(148, 163, 184, 0.15)', strokeStyle: 'transparent', pointStyle: 'rectRounded' },
          ]
        }
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
        label: (context) => ` ${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
      }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
      ticks: {
        color: textColor.value,
        font: { size: 11 },
        maxRotation: 45,
        minRotation: 0,
      },
      border: { display: false },
    },
    y: {
      grid: {
        color: 'rgba(148, 163, 184, 0.08)',
      },
      ticks: {
        color: textColor.value,
        font: { size: 11 },
        callback: (value) => formatCurrency(value),
      },
      border: { display: false },
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
