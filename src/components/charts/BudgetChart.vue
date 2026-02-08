<template>
  <Card title="Spending vs Budget">
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </Card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { useBudgetStore } from '@/stores/budget'
import { useThemeStore } from '@/stores/theme'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/components/common/Card.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const budgetStore = useBudgetStore()
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

const chartData = computed(() => {
  const categories = budgetStore.categoryExpenses
  const labels = Object.keys(categories)
  const spent = labels.map(cat => categories[cat].total)
  const budgets = labels.map(cat => categories[cat].budget)
  const spentColors = labels.map(cat =>
    categories[cat].percentage > 100 ? '#f97316' : '#00e68a'
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
        backgroundColor: themeStore.isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.35)',
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
            { text: 'Spent', fillStyle: '#00e68a', strokeStyle: 'transparent', pointStyle: 'rectRounded' },
            { text: 'Budget', fillStyle: themeStore.isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.35)', strokeStyle: 'transparent', pointStyle: 'rectRounded' },
          ]
        }
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => ` ${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
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
        color: borderColor.value,
      },
      ticks: {
        color: textColor.value,
        callback: (value) => formatCurrency(value),
      },
      border: { display: false },
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
