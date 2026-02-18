<template>
  <div class="account-list">
    <div v-for="group in groups" :key="group.type" class="account-group">
      <div class="group-header">
        <span class="group-label">{{ typeLabel(group.type) }}</span>
        <span class="group-total" :class="group.total < 0 ? 'neg' : ''">
          {{ group.total < 0 ? '-' : '' }}{{ formatCurrency(Math.abs(group.total)) }}
        </span>
      </div>
      <div v-for="acc in group.accounts" :key="acc.id" class="account-row">
        <div class="acc-icon">{{ institutionIcon(acc.institution || acc.name) }}</div>
        <div class="acc-info">
          <span class="acc-name">{{ acc.name }}</span>
          <span class="acc-inst">{{ acc.institution || acc.category || '' }}</span>
        </div>
        <div class="acc-balance" :class="acc.balance < 0 ? 'neg' : ''">
          {{ acc.balance < 0 ? '-' : '' }}{{ formatCurrency(Math.abs(acc.balance)) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ groups: { type: Array, default: () => [] } })

function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}

function typeLabel(t) {
  const map = { depository: 'Cash & Savings', investment: 'Investments', credit: 'Credit Cards', loan: 'Loans', manual: 'Other Assets' }
  return map[t] || t
}

function institutionIcon(name = '') {
  const n = name.toLowerCase()
  if (n.includes('chase'))    return '🏦'
  if (n.includes('fidelity')) return '📊'
  if (n.includes('vanguard')) return '📈'
  if (n.includes('goldman') || n.includes('marcus')) return '💎'
  if (n.includes('ally'))     return '🚗'
  if (n.includes('porsche') || n.includes('vehicle')) return '🚗'
  return '🏛️'
}
</script>

<style scoped>
.account-list { display: flex; flex-direction: column; gap: 1.25rem; max-height: 400px; overflow-y: auto; }

.account-group { display: flex; flex-direction: column; gap: 0.35rem; }

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.1rem 0 0.35rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.group-label { font-size: 0.7rem; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
.group-total { font-size: 0.85rem; color: #94a3b8; font-weight: 600; }
.group-total.neg { color: #f87171; }

.account-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.35rem;
  border-radius: 8px;
  transition: background 0.15s;
}
.account-row:hover { background: rgba(255,255,255,0.03); }

.acc-icon { font-size: 1.1rem; width: 26px; text-align: center; }
.acc-info { flex: 1; display: flex; flex-direction: column; }
.acc-name { font-size: 0.85rem; color: #cbd5e1; font-weight: 500; }
.acc-inst { font-size: 0.72rem; color: #475569; text-transform: capitalize; }

.acc-balance { font-size: 0.875rem; font-weight: 600; color: #f1f5f9; }
.acc-balance.neg { color: #f87171; }
</style>
