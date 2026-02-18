<template>
  <div class="chart-wrapper">
    <canvas ref="canvas"></canvas>

    <!-- Tooltip overlay (custom) -->
    <div
      v-if="tooltip.visible"
      class="chart-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-date">{{ tooltip.date }}</div>
      <div class="tooltip-balance">{{ formatCurrency(tooltip.balance) }}</div>
      <div v-for="event in tooltip.events" :key="event.label" class="tooltip-event" :class="event.type">
        <span>{{ event.label }}</span>
        <span>{{ event.type === 'income' ? '+' : '-' }}{{ formatCurrency(event.amount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  forecast: { type: Array, required: true },
  days:     { type: Number, default: 90 },
})

const canvas  = ref(null)
let chartInst = null

const tooltip = ref({ visible: false, x: 0, y: 0, date: '', balance: 0, events: [] })

// ── Chart construction ────────────────────────────────────────────────────────

function buildChart() {
  if (chartInst) { chartInst.destroy(); chartInst = null }
  if (!canvas.value || !props.forecast.length) return

  const labels   = props.forecast.map(d => formatDateLabel(d.date, props.days))
  const balances = props.forecast.map(d => d.balance)
  const events   = props.forecast

  // Color each point: green if income, red if expense, amber if planned, normal otherwise
  const pointColors = props.forecast.map(d => {
    if (!d.events.length) return 'transparent'
    if (d.events.some(e => e.type === 'income'))  return '#34d399'
    if (d.events.some(e => e.type === 'planned')) return '#fbbf24'
    return '#f87171'
  })

  const pointRadius = props.forecast.map(d => d.events.length ? 4 : 0)

  // Gradient fill
  const ctx   = canvas.value.getContext('2d')
  const grad  = ctx.createLinearGradient(0, 0, 0, 300)
  grad.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
  grad.addColorStop(1, 'rgba(59, 130, 246, 0.0)')

  chartInst = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Balance',
        data: balances,
        borderColor: '#3b82f6',
        borderWidth: 2,
        backgroundColor: grad,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 3,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,  // we use our own
          external: (context) => {
            const { tooltip: tt } = context
            if (tt.opacity === 0) {
              tooltip.value.visible = false
              return
            }
            const idx     = tt.dataPoints[0].dataIndex
            const dayData = events[idx]

            tooltip.value = {
              visible: true,
              x: tt.caretX + 12,
              y: tt.caretY - 20,
              date: dayData.date,
              balance: dayData.balance,
              events: dayData.events,
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#64748b',
            maxTicksLimit: props.days <= 30 ? 10 : props.days <= 60 ? 8 : 6,
            font: { size: 11 }
          }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#64748b',
            font: { size: 11 },
            callback: (v) => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v.toFixed(0))
          }
        }
      }
    }
  })
}

function formatDateLabel(dateStr, days) {
  const d = new Date(dateStr)
  if (days <= 30) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

onMounted(buildChart)
watch(() => [props.forecast, props.days], buildChart, { deep: true })
onBeforeUnmount(() => { if (chartInst) chartInst.destroy() })
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
}

/* ── Custom Tooltip ──────────────────────────────────────── */
.chart-tooltip {
  position: absolute;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 0.75rem;
  min-width: 160px;
  pointer-events: none;
  z-index: 10;
  backdrop-filter: blur(12px);
}
.tooltip-date {
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.tooltip-balance {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.5rem;
}
.tooltip-event {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.75rem;
  padding: 0.1rem 0;
}
.tooltip-event.income  { color: #34d399; }
.tooltip-event.expense { color: #f87171; }
.tooltip-event.planned { color: #fbbf24; }
</style>
