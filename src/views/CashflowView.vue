<template>
  <div class="cashflow-view">

    <!-- ── Header ─────────────────────────────────────────────────────── -->
    <div class="view-header">
      <div>
        <h1 class="view-title">Cash Flow</h1>
        <p class="view-subtitle">Your balance over the next {{ store.forecastDays }} days</p>
      </div>
      <div class="header-controls">
        <div class="window-tabs">
          <button
            v-for="w in windows"
            :key="w.value"
            class="window-tab"
            :class="{ active: store.forecastDays === w.value }"
            @click="store.setForecastDays(w.value)"
          >{{ w.label }}</button>
        </div>
      </div>
    </div>

    <!-- ── Crunch Alert ────────────────────────────────────────────────── -->
    <CashCrunchAlert v-if="store.hasCashCrunchRisk" :day="store.lowestProjectedBalance" />

    <!-- ── KPI Strip ──────────────────────────────────────────────────── -->
    <div class="kpi-strip">
      <KpiCard
        label="Current Balance"
        :value="store.currentBalance"
        type="currency"
        icon="💳"
      />
      <KpiCard
        label="Projected Balance"
        :value="store.projectedEndBalance"
        type="currency"
        icon="🔮"
        :delta="store.projectedEndBalance - store.currentBalance"
      />
      <KpiCard
        label="Monthly Net Flow"
        :value="store.monthlyNetFlow"
        type="currency"
        icon="📈"
        :positive="store.monthlyNetFlow >= 0"
      />
      <KpiCard
        label="Monthly Bills"
        :value="totalMonthlyBills"
        type="currency"
        icon="📋"
      />
    </div>

    <!-- ── Main Chart ─────────────────────────────────────────────────── -->
    <div class="glass-card chart-card">
      <div class="card-header">
        <span class="card-title">Balance Forecast</span>
        <div class="chart-legend">
          <span class="legend-dot income"></span><span class="legend-label">Income</span>
          <span class="legend-dot expense"></span><span class="legend-label">Expenses</span>
          <span class="legend-dot planned"></span><span class="legend-label">Planned</span>
        </div>
      </div>
      <CashflowChart :forecast="store.forecast" :days="store.forecastDays" />
    </div>

    <!-- ── Two-column lower section ───────────────────────────────────── -->
    <div class="lower-grid">

      <!-- Upcoming Events -->
      <div class="glass-card">
        <div class="card-header">
          <span class="card-title">Upcoming (14 days)</span>
          <span class="badge">{{ store.upcomingEvents.length }}</span>
        </div>
        <UpcomingTimeline :events="store.upcomingEvents" />
      </div>

      <!-- Recurring Bills -->
      <div class="glass-card">
        <div class="card-header">
          <span class="card-title">Monthly Bills</span>
          <button class="btn-ghost" @click="showAddExpense = true">+ Add</button>
        </div>
        <BillList
          :expenses="store.recurringExpenses"
          @remove="store.removeExpense"
        />
      </div>

    </div>

    <!-- ── Planned Expenses ───────────────────────────────────────────── -->
    <div class="glass-card">
      <div class="card-header">
        <span class="card-title">Planned Expenses</span>
        <button class="btn-ghost" @click="showAddPlanned = true">+ Add</button>
      </div>
      <PlannedExpenseList
        :expenses="store.plannedExpenses"
        @remove="store.removePlanned"
      />
    </div>

    <!-- ── Add Expense Modal ──────────────────────────────────────────── -->
    <AddExpenseModal
      v-if="showAddExpense"
      @close="showAddExpense = false"
      @save="onAddExpense"
    />

    <!-- ── Add Planned Modal ──────────────────────────────────────────── -->
    <AddPlannedModal
      v-if="showAddPlanned"
      @close="showAddPlanned = false"
      @save="onAddPlanned"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCashflowStore } from '../stores/cashflow.js'
import CashflowChart        from '../components/cashflow/CashflowChart.vue'
import KpiCard              from '../components/cashflow/KpiCard.vue'
import UpcomingTimeline     from '../components/cashflow/UpcomingTimeline.vue'
import BillList             from '../components/cashflow/BillList.vue'
import PlannedExpenseList   from '../components/cashflow/PlannedExpenseList.vue'
import CashCrunchAlert      from '../components/cashflow/CashCrunchAlert.vue'
import AddExpenseModal      from '../components/cashflow/AddExpenseModal.vue'
import AddPlannedModal      from '../components/cashflow/AddPlannedModal.vue'

const store = useCashflowStore()

const showAddExpense = ref(false)
const showAddPlanned = ref(false)

const windows = [
  { label: '30d', value: 30 },
  { label: '60d', value: 60 },
  { label: '90d', value: 90 },
]

const totalMonthlyBills = computed(() =>
  store.recurringExpenses.reduce((s, e) => s + e.amount, 0)
)

function onAddExpense(expense) {
  store.addExpense(expense)
  showAddExpense.value = false
}

function onAddPlanned(expense) {
  store.addPlannedExpense(expense)
  showAddPlanned.value = false
}
</script>

<style scoped>
.cashflow-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: viewFadeIn 0.3s ease-out;
}

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Header ─────────────────────────────────────────────── */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
}
.view-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  margin: 0;
}
.view-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted, #94a3b8);
  margin: 0.25rem 0 0;
}
.window-tabs {
  display: flex;
  background: rgba(255,255,255,0.05);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}
.window-tab {
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-muted, #94a3b8);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.window-tab.active {
  background: rgba(59, 130, 246, 0.25);
  color: #60a5fa;
}

/* ── KPI Strip ──────────────────────────────────────────── */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (max-width: 900px) { .kpi-strip { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .kpi-strip { grid-template-columns: 1fr; } }

/* ── Cards ──────────────────────────────────────────────── */
.glass-card {
  background: var(--bg-card, rgba(255,255,255,0.04));
  border: 1px solid var(--border-glass, rgba(255,255,255,0.08));
  border-radius: var(--radius-xl, 16px);
  padding: 1.25rem;
  box-shadow: var(--shadow-glass, none);
}
.chart-card { padding: 1.5rem; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary, #cbd5e1);
}
.badge {
  background: rgba(59,130,246,0.2);
  color: #60a5fa;
  border-radius: 20px;
  padding: 0.1rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 700;
}
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-glass, rgba(255,255,255,0.12));
  color: var(--text-muted, #94a3b8);
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-ghost:hover {
  border-color: rgba(59,130,246,0.5);
  color: #60a5fa;
}

/* ── Legend ─────────────────────────────────────────────── */
.chart-legend {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.legend-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.legend-dot.income  { background: #34d399; }
.legend-dot.expense { background: #f87171; }
.legend-dot.planned { background: #fbbf24; }
.legend-label {
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
  margin-left: -0.4rem;
}

/* ── Lower grid ─────────────────────────────────────────── */
.lower-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 750px) { .lower-grid { grid-template-columns: 1fr; } }
</style>
