<template>
  <Card title="Net Worth Over Time">
    <template #actions>
      <div class="chart-controls">
        <!-- Time period -->
        <div class="period-toggle">
          <button
            v-for="p in periods"
            :key="p.key"
            class="period-btn"
            :class="{ active: activePeriod === p.key }"
            @click="activePeriod = p.key"
          >{{ p.label }}</button>
        </div>

        <!-- Benchmark comparison -->
        <div class="benchmark-toggle">
          <span class="compare-label">vs</span>
          <button
            v-for="b in benchmarks"
            :key="b.key"
            class="benchmark-btn"
            :class="{ active: activeBenchmarks.includes(b.key) }"
            @click="toggleBenchmark(b.key)"
          >{{ b.label }}</button>
        </div>
      </div>
    </template>

    <div class="chart-container">
      <Line :key="chartKey" :data="chartData" :options="chartOptions" />
    </div>
  </Card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import { usePortfolioStore } from '@/stores/portfolio'
import { useThemeStore } from '@/stores/theme'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/components/common/Card.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const portfolioStore = usePortfolioStore()
const themeStore = useThemeStore()

// --- Controls ---
const periods = [
  { key: '1D', label: '1D', days: 1 },
  { key: '1W', label: '1W', days: 7 },
  { key: '1M', label: '1M', days: 30 },
  { key: '1Y', label: '1Y', days: 365 },
  { key: 'ALL', label: 'All', days: Infinity },
]
const benchmarks = [
  { key: 'sp500', label: 'S&P 500', color: '#3B82F6' },
  { key: 'inflation', label: 'US Inflation', color: '#38BDF8' },
  { key: 'bitcoin', label: 'Bitcoin', color: '#06B6D4' },
]

const activePeriod = ref('1Y')
const activeBenchmarks = ref([])

function toggleBenchmark(key) {
  const idx = activeBenchmarks.value.indexOf(key)
  if (idx >= 0) {
    activeBenchmarks.value.splice(idx, 1)
  } else {
    activeBenchmarks.value.push(key)
  }
}

// Force re-mount the canvas when toggles change (chart.js reactivity quirk)
const chartKey = computed(() => `${activePeriod.value}-${activeBenchmarks.value.join(',')}`)

// --- Theme colors ---
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const textColor = ref(getCSSVar('--text-secondary'))
const borderColor = ref(getCSSVar('--border-glass'))

function updateColors() {
  textColor.value = getCSSVar('--text-secondary')
  borderColor.value = getCSSVar('--border-glass')
}

watch(() => themeStore.isDark, () => setTimeout(updateColors, 50))
onMounted(updateColors)

// --- Sliced data for active period ---
const periodDays = computed(() => periods.find(p => p.key === activePeriod.value)?.days ?? 365)

const slicedNW = computed(() => {
  const h = portfolioStore.netWorthHistory
  if (!h.length) return []
  if (periodDays.value === Infinity) return h
  return h.slice(-Math.min(periodDays.value + 1, h.length))
})

const slicedBenchmark = computed(() => {
  const b = portfolioStore.benchmarkHistory
  if (!b.length) return []
  if (periodDays.value === Infinity) return b
  return b.slice(-Math.min(periodDays.value + 1, b.length))
})

const showingReturn = computed(() => activeBenchmarks.value.length > 0)

// --- Label helpers ---
function formatDateLabel(dateStr, period) {
  const d = new Date(dateStr + 'T00:00:00')
  if (period === '1D' || period === '1W') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (period === '1M') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

// Downsample to keep the chart readable
function downsample(arr, maxPoints) {
  if (arr.length <= maxPoints) return arr
  const step = (arr.length - 1) / (maxPoints - 1)
  const result = []
  for (let i = 0; i < maxPoints; i++) {
    result.push(arr[Math.round(i * step)])
  }
  return result
}

const MAX_POINTS = 60

// --- Chart data ---
const chartData = computed(() => {
  const nw = downsample(slicedNW.value, MAX_POINTS)
  const bench = downsample(slicedBenchmark.value, MAX_POINTS)
  if (!nw.length) return { labels: [], datasets: [] }

  const labels = nw.map(p => formatDateLabel(p.date, activePeriod.value))
  const datasets = []

  if (showingReturn.value) {
    // % return mode — normalise net worth to % change from period start
    const base = nw[0].value
    datasets.push({
      label: 'Net Worth',
      data: nw.map(p => ((p.value - base) / Math.abs(base)) * 100),
      borderColor: '#14b8a6',
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2.5,
    })

    for (const b of activeBenchmarks.value) {
      const meta = benchmarks.find(x => x.key === b)
      if (!meta || !bench.length) continue
      const bBase = bench[0][b]
      datasets.push({
        label: meta.label,
        data: bench.map(p => ((p[b] - bBase) / bBase) * 100),
        borderColor: meta.color,
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
        borderDash: [6, 3],
      })
    }
  } else {
    // Absolute $ mode
    datasets.push({
      label: 'Net Worth',
      data: nw.map(p => p.value),
      borderColor: '#14b8a6',
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2.5,
    })
  }

  return { labels, datasets }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      display: showingReturn.value,
      position: 'top',
      labels: {
        color: textColor.value,
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: { size: 12, weight: '600' }
      }
    },
    tooltip: {
      backgroundColor: '#1E293B',
      borderColor: 'rgba(56, 189, 248, 0.08)',
      borderWidth: 1,
      titleColor: '#F1F5F9',
      bodyColor: '#F1F5F9',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          if (showingReturn.value) {
            const sign = ctx.raw >= 0 ? '+' : ''
            return `${ctx.dataset.label}: ${sign}${ctx.raw.toFixed(2)}%`
          }
          return `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
      ticks: {
        color: textColor.value,
        font: { size: 11 },
        maxTicksLimit: 10,
      }
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
      ticks: {
        color: textColor.value,
        font: { size: 11 },
        callback: (v) => showingReturn.value ? `${v >= 0 ? '+' : ''}${v.toFixed(1)}%` : formatCurrency(v)
      }
    }
  },
  animation: { duration: 800 },
}))
</script>

<style scoped>
.chart-container {
  height: 300px;
  position: relative;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.period-toggle {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 2px;
  gap: 1px;
}

.period-btn {
  padding: 4px 10px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.7rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  letter-spacing: 0.02em;
}

.period-btn:hover {
  color: var(--text-primary);
}

.period-btn.active {
  background: var(--accent-blue);
  color: #fff;
}

.benchmark-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
}

.compare-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-tertiary);
  padding: 0 4px;
}

.benchmark-btn {
  padding: 4px 10px;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.68rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.benchmark-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.benchmark-btn.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: var(--text-primary);
}

@media (max-width: 640px) {
  .chart-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
