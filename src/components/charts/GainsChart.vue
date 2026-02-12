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
    backgroundColor: ['#14B8A6', '#3B82F6', '#06B6D4'],
    borderColor: 'transparent',
    borderRadius: 4,
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
      backgroundColor: '#1E293B',
      borderColor: 'rgba(56, 189, 248, 0.08)',
      borderWidth: 1,
      cornerRadius: 8,
      titleColor: '#F1F5F9',
      bodyColor: '#F1F5F9',
      padding: 12,
      callbacks: {
        label: (context) => ` ${formatCurrency(context.parsed.x)}`
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
  height: 180px;
}
</style>
