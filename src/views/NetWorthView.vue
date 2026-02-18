<template>
  <div class="networth-view">

    <!-- Header -->
    <div class="view-header">
      <div>
        <h1 class="view-title">Net Worth</h1>
        <p class="view-subtitle">All assets and liabilities in one place</p>
      </div>
    </div>

    <!-- Hero KPIs -->
    <div class="hero-strip">
      <div class="hero-main glass-card">
        <div class="hero-label">Total Net Worth</div>
        <div class="hero-value">{{ formatCurrency(store.netWorth) }}</div>
        <div class="hero-sub">
          <span class="hero-breakdown">
            <span class="asset-tag">↑ {{ formatCurrency(store.totalAssets) }} assets</span>
            <span class="separator"> · </span>
            <span class="liab-tag">↓ {{ formatCurrency(store.totalLiabilities) }} liabilities</span>
          </span>
        </div>
      </div>

      <div class="hero-side">
        <div class="glass-card kpi-tile">
          <div class="kpi-label">30-Day Change</div>
          <div class="kpi-val" :class="store.monthlyChange.amount >= 0 ? 'pos' : 'neg'">
            {{ store.monthlyChange.amount >= 0 ? '+' : '' }}{{ formatCurrency(store.monthlyChange.amount) }}
          </div>
          <div class="kpi-pct" :class="store.monthlyChange.amount >= 0 ? 'pos' : 'neg'">
            {{ store.monthlyChange.percent >= 0 ? '▲' : '▼' }} {{ Math.abs(store.monthlyChange.percent).toFixed(1) }}%
          </div>
        </div>
        <div class="glass-card kpi-tile">
          <div class="kpi-label">1-Year Change</div>
          <div class="kpi-val" :class="store.yearlyChange.amount >= 0 ? 'pos' : 'neg'">
            {{ store.yearlyChange.amount >= 0 ? '+' : '' }}{{ formatCurrency(store.yearlyChange.amount) }}
          </div>
          <div class="kpi-pct" :class="store.yearlyChange.amount >= 0 ? 'pos' : 'neg'">
            {{ store.yearlyChange.percent >= 0 ? '▲' : '▼' }} {{ Math.abs(store.yearlyChange.percent).toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- History Chart -->
    <div class="glass-card chart-card">
      <div class="card-header">
        <span class="card-title">Net Worth Over Time</span>
        <div class="range-tabs">
          <button
            v-for="r in ranges"
            :key="r.value"
            class="range-tab"
            :class="{ active: store.chartRange === r.value }"
            @click="store.setChartRange(r.value)"
          >{{ r.label }}</button>
        </div>
      </div>
      <NetworthChart :history="store.filteredHistory" />
    </div>

    <!-- Lower grid -->
    <div class="lower-grid">

      <!-- Account Breakdown -->
      <div class="glass-card">
        <div class="card-header">
          <span class="card-title">Accounts</span>
          <div class="tab-pills">
            <button
              class="tab-pill"
              :class="{ active: store.activeTab === 'accounts' }"
              @click="store.setActiveTab('accounts')"
            >By Account</button>
            <button
              class="tab-pill"
              :class="{ active: store.activeTab === 'categories' }"
              @click="store.setActiveTab('categories')"
            >By Type</button>
          </div>
        </div>
        <AccountList
          v-if="store.activeTab === 'accounts'"
          :groups="store.accountsByType"
        />
        <AllocationBreakdown
          v-else
          :allocation="store.assetAllocation"
          :total="store.totalAssets"
        />
      </div>

      <!-- Asset Allocation Donut -->
      <div class="glass-card">
        <div class="card-header">
          <span class="card-title">Asset Allocation</span>
        </div>
        <AllocationDonut :allocation="store.assetAllocation" />
      </div>

    </div>

  </div>
</template>

<script setup>
import { useNetworthStore } from '../stores/networth.js'
import NetworthChart       from '../components/networth/NetworthChart.vue'
import AccountList         from '../components/networth/AccountList.vue'
import AllocationBreakdown from '../components/networth/AllocationBreakdown.vue'
import AllocationDonut     from '../components/networth/AllocationDonut.vue'

const store = useNetworthStore()

const ranges = [
  { label: '3M',  value: '3m' },
  { label: '6M',  value: '6m' },
  { label: '1Y',  value: '1y' },
  { label: 'All', value: 'all' },
]

function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}
</script>

<style scoped>
.networth-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: viewFadeIn 0.3s ease-out;
}

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.view-header { margin-bottom: 0.25rem; }
.view-title   { font-size: 1.75rem; font-weight: 700; color: var(--text-primary, #f1f5f9); margin: 0; }
.view-subtitle { font-size: 0.875rem; color: var(--text-muted, #64748b); margin: 0.25rem 0 0; }

.hero-strip {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: stretch;
}
@media (max-width: 700px) { .hero-strip { grid-template-columns: 1fr; } }

.hero-main {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.hero-label  { font-size: 0.75rem; color: var(--text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.07em; }
.hero-value  { font-size: 2.5rem; font-weight: 800; color: var(--text-primary, #f1f5f9); line-height: 1; letter-spacing: -0.02em; }
.hero-sub    { margin-top: 0.25rem; }
.hero-breakdown { font-size: 0.85rem; }
.asset-tag   { color: #34d399; }
.liab-tag    { color: #f87171; }
.separator   { color: #334155; }

.hero-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 180px;
}

.kpi-tile {
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}
.kpi-label { font-size: 0.72rem; color: var(--text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.06em; }
.kpi-val   { font-size: 1.3rem; font-weight: 700; line-height: 1.1; }
.kpi-pct   { font-size: 0.78rem; font-weight: 600; }
.pos { color: #34d399; }
.neg { color: #f87171; }

.chart-card { padding: 1.5rem; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.card-title { font-size: 0.9rem; font-weight: 600; color: var(--text-secondary, #cbd5e1); }

.range-tabs {
  display: flex;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}
.range-tab {
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-muted, #64748b);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.range-tab.active { background: rgba(59,130,246,0.25); color: #60a5fa; }

.tab-pills { display: flex; gap: 0.35rem; }
.tab-pill {
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08);
  background: transparent;
  color: var(--text-muted, #64748b);
  font-size: 0.75rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-pill.active { border-color: rgba(59,130,246,0.4); color: #60a5fa; background: rgba(59,130,246,0.1); }

.lower-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 750px) { .lower-grid { grid-template-columns: 1fr; } }

.glass-card {
  background: var(--bg-card, rgba(255,255,255,0.04));
  border: 1px solid var(--border-glass, rgba(255,255,255,0.08));
  border-radius: var(--radius-xl, 16px);
  padding: 1.25rem;
  box-shadow: var(--shadow-glass, none);
}
</style>
