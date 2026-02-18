<template>
  <div class="detail-panel glass-card">
    <div class="panel-header">
      <div class="panel-title-row">
        <span class="panel-emoji">{{ goal.emoji }}</span>
        <h2 class="panel-title">{{ goal.title }}</h2>
      </div>
      <button class="close-btn" @click="$emit('close')">✕</button>
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <div class="stat">
        <div class="stat-label">Saved</div>
        <div class="stat-val pos">{{ formatCurrency(goal.currentAmount) }}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Target</div>
        <div class="stat-val">{{ formatCurrency(goal.targetAmount) }}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Remaining</div>
        <div class="stat-val warn">{{ formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount)) }}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Monthly Needed</div>
        <div class="stat-val" :class="neededPerMonth > 0 ? 'warn' : ''">{{ neededPerMonth > 0 ? formatCurrency(neededPerMonth) : 'Done' }}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Days Left</div>
        <div class="stat-val" :class="daysLeft <= 30 ? 'warn' : ''">{{ daysLeft }}</div>
      </div>
    </div>

    <!-- Linked account info -->
    <div v-if="linkedAccount" class="linked-account">
      <span class="linked-icon">🔗</span>
      <span class="linked-text">
        Linked to <strong>{{ linkedAccount.name }}</strong>
        <span class="linked-balance">({{ formatCurrency(Math.abs(linkedAccount.balance)) }})</span>
      </span>
    </div>

    <!-- Projection insight -->
    <div v-if="projection" class="projection-row" :class="isOnTrack ? 'on-track' : 'off-track'">
      <span class="proj-icon">{{ isOnTrack ? '✅' : '⚠️' }}</span>
      <span v-if="isOnTrack">
        At your current pace, you'll hit this goal around <strong>{{ formatDate(projection) }}</strong>.
      </span>
      <span v-else>
        At your current pace, you're projected to finish around <strong>{{ formatDate(projection) }}</strong> —
        <strong>{{ formatCurrency(neededPerMonth) }}/mo</strong> needed to hit the deadline.
      </span>
    </div>

    <!-- Contribution history chart -->
    <div v-if="goal.contributions.length > 1">
      <div class="section-label">Contribution History</div>
      <div class="contrib-chart-wrap">
        <canvas ref="canvas"></canvas>
      </div>
    </div>

    <!-- Add contribution -->
    <div class="add-contrib">
      <input
        v-model.number="amount"
        type="number"
        min="1"
        placeholder="Add contribution amount"
        @keydown.enter="submit"
      />
      <button class="btn-save" :style="{ background: goal.color }" @click="submit">
        Add
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
import { daysUntil, monthlyNeeded as calcMonthlyNeeded, projectedCompletion } from '../../stores/goals.js'
import { useNetworthStore } from '../../stores/networth.js'

Chart.register(...registerables)

const props = defineProps({ goal: { type: Object, required: true } })
const emit  = defineEmits(['close', 'contribute'])

const networthStore = useNetworthStore()
const canvas = ref(null)
const amount = ref(null)
let chartInst = null

const daysLeft      = computed(() => daysUntil(props.goal.targetDate))
const projection    = computed(() => projectedCompletion(props.goal))
const neededPerMonth = computed(() => calcMonthlyNeeded(props.goal))
const isOnTrack     = computed(() => {
  if (!projection.value) return false
  return projection.value <= props.goal.targetDate
})

const linkedAccount = computed(() => {
  if (!props.goal.linkedAccountId) return null
  return networthStore.accounts.find(a => a.id === props.goal.linkedAccountId) || null
})

function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}
function formatDate(str) {
  return new Date(str + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function buildChart() {
  if (chartInst) { chartInst.destroy(); chartInst = null }
  if (!canvas.value || props.goal.contributions.length < 2) return

  const labels = props.goal.contributions.map(c =>
    new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  )
  const data = props.goal.contributions.map(c => c.running)

  const ctx  = canvas.value.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, 120)
  grad.addColorStop(0, props.goal.color + '44')
  grad.addColorStop(1, props.goal.color + '00')

  chartInst = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: props.goal.color,
        borderWidth: 2,
        backgroundColor: grad,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 3.5,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.95)',
          titleColor: '#64748b',
          bodyColor: '#f1f5f9',
          callbacks: { label: ctx => ' ' + formatCurrency(ctx.parsed.y) }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#475569', maxTicksLimit: 5, font: { size: 10 } } },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#475569',
            font: { size: 10 },
            callback: v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)
          }
        }
      }
    }
  })
}

function submit() {
  if (!amount.value || amount.value <= 0) return
  emit('contribute', { goalId: props.goal.id, amount: amount.value })
  amount.value = null
}

onMounted(buildChart)
watch(() => props.goal, buildChart, { deep: true })
onBeforeUnmount(() => { if (chartInst) chartInst.destroy() })
</script>

<style scoped>
.detail-panel {
  padding: 1.5rem;
  margin-top: 0.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}
.panel-title-row { display: flex; align-items: center; gap: 0.6rem; }
.panel-emoji     { font-size: 1.5rem; }
.panel-title     { font-size: 1.2rem; font-weight: 700; color: #f1f5f9; margin: 0; }
.close-btn {
  background: transparent;
  border: none;
  color: #475569;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
}
.close-btn:hover { color: #94a3b8; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
@media (max-width: 600px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }

.stat { display: flex; flex-direction: column; gap: 0.25rem; }
.stat-label { font-size: 0.7rem; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; }
.stat-val   { font-size: 1rem; font-weight: 700; color: #f1f5f9; }
.stat-val.warn { color: #fbbf24; }
.stat-val.pos { color: #34d399; }

.linked-account {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  background: rgba(59,130,246,0.06);
  border: 1px solid rgba(59,130,246,0.15);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.82rem;
  color: #94a3b8;
}
.linked-icon { font-size: 0.9rem; }
.linked-text strong { color: #cbd5e1; }
.linked-balance { color: #60a5fa; }

.projection-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 1.25rem;
}
.projection-row.on-track  { background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); color: #6ee7b7; }
.projection-row.off-track { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); color: #fcd34d; }
.projection-row strong    { color: inherit; font-weight: 700; }

.section-label { font-size: 0.72rem; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.75rem; }
.contrib-chart-wrap { margin-bottom: 1.25rem; }

.add-contrib {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.5rem;
}
.add-contrib input {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  color: #f1f5f9;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.add-contrib input:focus { border-color: rgba(59,130,246,0.5); }
.btn-save {
  border: none;
  color: #fff;
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-save:hover { opacity: 0.85; }

.glass-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  backdrop-filter: blur(12px);
}
</style>
