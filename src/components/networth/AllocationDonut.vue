<template>
  <div class="donut-wrapper">
    <canvas ref="canvas" width="220" height="220"></canvas>
    <div class="donut-center">
      <div class="donut-label">Assets</div>
      <div class="donut-count">{{ allocation.length }}</div>
      <div class="donut-sublabel">categories</div>
    </div>
    <div class="donut-legend">
      <div v-for="item in allocation" :key="item.label" class="legend-row">
        <span class="legend-dot" :style="{ background: colorFor(item.label) }"></span>
        <span class="legend-name">{{ item.label }}</span>
        <span class="legend-pct">{{ item.percent }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({ allocation: { type: Array, default: () => [] } })
const canvas = ref(null)
let chartInst = null

const COLORS = {
  'Cash & Savings': '#34d399',
  'Investments':    '#3b82f6',
  'Retirement':     '#a78bfa',
  'Real Assets':    '#fbbf24',
}

function colorFor(label) { return COLORS[label] || '#64748b' }

function buildChart() {
  if (chartInst) { chartInst.destroy(); chartInst = null }
  if (!canvas.value || !props.allocation.length) return

  chartInst = new Chart(canvas.value, {
    type: 'doughnut',
    data: {
      labels: props.allocation.map(a => a.label),
      datasets: [{
        data: props.allocation.map(a => a.value),
        backgroundColor: props.allocation.map(a => colorFor(a.label)),
        borderColor: 'rgba(255,255,255,0.06)',
        borderWidth: 2,
        hoverOffset: 4,
      }]
    },
    options: {
      responsive: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`
          },
          backgroundColor: 'rgba(15,23,42,0.95)',
          titleColor: '#94a3b8',
          bodyColor: '#f1f5f9',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
        }
      }
    }
  })
}

onMounted(buildChart)
watch(() => props.allocation, buildChart, { deep: true })
onBeforeUnmount(() => { if (chartInst) chartInst.destroy() })
</script>

<style scoped>
.donut-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.donut-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  top: calc(90px - 30px);
  left: 50%;
  transform: translateX(-50%);
}
.donut-label    { font-size: 0.65rem; color: #475569; text-transform: uppercase; letter-spacing: 0.07em; }
.donut-count    { font-size: 1.6rem; font-weight: 800; color: #f1f5f9; line-height: 1; }
.donut-sublabel { font-size: 0.65rem; color: #475569; }

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
.legend-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.legend-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.legend-name { flex: 1; font-size: 0.82rem; color: #94a3b8; }
.legend-pct  { font-size: 0.82rem; font-weight: 600; color: #f1f5f9; }
</style>
