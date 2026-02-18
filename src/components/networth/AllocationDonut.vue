<template>
  <div class="donut-wrapper">
    <canvas ref="canvas" width="220" height="220"></canvas>
    <div class="donut-center">
      <div class="donut-label">Assets</div>
      <div class="donut-count">{{ allocation.length }}</div>
      <div class="donut-sublabel">categories</div>
    </div>
    <div class="donut-legend">
      <div
        v-for="item in allocation"
        :key="item.label"
        class="legend-row"
        :class="{ highlighted: highlightedCategory === item.label }"
        @click="$emit('select-category', item.label)"
      >
        <span class="legend-dot" :style="{ background: colorFor(item.label) }"></span>
        <span class="legend-name">{{ item.label }}</span>
        <span class="legend-val">{{ formatCurrency(item.value) }}</span>
        <span class="legend-pct">{{ item.percent }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
import { formatCurrency } from '@/utils/formatters'

Chart.register(...registerables)

const props = defineProps({
  allocation: { type: Array, default: () => [] },
  highlightedCategory: { type: String, default: null }
})
const emit = defineEmits(['select-category'])
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
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: false,
      cutout: '72%',
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const idx = elements[0].index
          const label = props.allocation[idx]?.label
          if (label) emit('select-category', label)
        }
      },
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
  top: 0;
  left: 50%;
  height: 220px;
  transform: translateX(-50%);
  justify-content: center;
}
.donut-label    { font-size: 0.65rem; color: #475569; text-transform: uppercase; letter-spacing: 0.07em; }
.donut-count    { font-size: 1.6rem; font-weight: 800; color: #f1f5f9; line-height: 1; }
.donut-sublabel { font-size: 0.65rem; color: #475569; }

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
}
.legend-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.legend-row:hover { background: rgba(255,255,255,0.04); }
.legend-row.highlighted { background: rgba(59,130,246,0.1); }
.legend-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.legend-name { flex: 1; font-size: 0.82rem; color: #94a3b8; }
.legend-val  { font-size: 0.78rem; color: #cbd5e1; font-weight: 500; }
.legend-pct  { font-size: 0.78rem; font-weight: 600; color: #f1f5f9; min-width: 36px; text-align: right; }
</style>
