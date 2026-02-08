<template>
  <Card title="Gains & Losses">
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </Card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { usePortfolioStore } from '@/stores/portfolio'
import { useThemeStore } from '@/stores/theme'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/components/common/Card.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

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

const chartData = computed(() => ({
  labels: ['Long-term Gains', 'Short-term Gains', 'Unrealized Losses'],
  datasets: [{
    data: [
      portfolioStore.longTermGains,
      portfolioStore.shortTermGains,
      portfolioStore.unrealizedLosses,
    ],
    backgroundColor: ['#00e68a', '#3b82f6', '#f97316'],
    borderColor: 'transparent',
    borderRadius: 6,
    barThickness: 28,
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
        label: (context) => ` ${formatCurrency(context.parsed.x)}`
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
  height: 180px;
}
</style>
