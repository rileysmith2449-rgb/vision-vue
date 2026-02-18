<template>
  <div class="chart-wrapper">
    <canvas ref="canvas"></canvas>
    <div v-if="tooltip.visible" class="chart-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div class="tt-date">{{ tooltip.date }}</div>
      <div class="tt-value">{{ formatCurrency(tooltip.value) }}</div>
      <div class="tt-row">
        <span class="tt-asset">↑ {{ formatCurrency(tooltip.assets) }}</span>
        <span class="tt-sep"> · </span>
        <span class="tt-liab">↓ {{ formatCurrency(tooltip.liabilities) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  history: { type: Array, required: true }
})

const canvas   = ref(null)
let chartInst  = null
const tooltip  = ref({ visible: false, x: 0, y: 0, date: '', value: 0, assets: 0, liabilities: 0 })

function buildChart() {
  if (chartInst) { chartInst.destroy(); chartInst = null }
  if (!canvas.value || !props.history.length) return

  const ctx    = canvas.value.getContext('2d')
  const labels = props.history.map(d => formatLabel(d.date))
  const values = props.history.map(d => d.value)
  const data   = props.history

  const grad = ctx.createLinearGradient(0, 0, 0, 280)
  grad.addColorStop(0, 'rgba(59,130,246,0.28)')
  grad.addColorStop(1, 'rgba(59,130,246,0.0)')

  chartInst = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: '#3b82f6',
        borderWidth: 2,
        backgroundColor: grad,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#3b82f6',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 3.2,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: ({ chart, tooltip: tt }) => {
            if (tt.opacity === 0) { tooltip.value.visible = false; return }
            const idx = tt.dataPoints[0].dataIndex
            const d   = data[idx]
            tooltip.value = {
              visible: true,
              x: Math.min(tt.caretX + 12, chart.width - 180),
              y: Math.max(tt.caretY - 60, 0),
              date: formatFullDate(d.date),
              value: d.value,
              assets: d.assets,
              liabilities: d.liabilities,
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#475569', maxTicksLimit: 6, font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#475569',
            font: { size: 11 },
            callback: v => '$' + (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)
          }
        }
      }
    }
  })
}

function formatLabel(str) {
  return new Date(str + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}
function formatFullDate(str) {
  return new Date(str + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}

onMounted(buildChart)
watch(() => props.history, buildChart, { deep: true })
onBeforeUnmount(() => { if (chartInst) chartInst.destroy() })
</script>

<style scoped>
.chart-wrapper { position: relative; width: 100%; }

.chart-tooltip {
  position: absolute;
  background: rgba(15,23,42,0.96);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 0.75rem;
  min-width: 170px;
  pointer-events: none;
  z-index: 10;
  backdrop-filter: blur(12px);
}
.tt-date  { font-size: 0.7rem; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
.tt-value { font-size: 1.15rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.4rem; }
.tt-row   { font-size: 0.78rem; }
.tt-asset { color: #34d399; }
.tt-liab  { color: #f87171; }
.tt-sep   { color: #334155; }
</style>
