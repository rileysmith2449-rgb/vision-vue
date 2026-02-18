<template>
  <div class="account-list">
    <div v-for="group in groups" :key="group.type" class="account-group">
      <div class="group-header" @click="toggleGroup(group.type)">
        <div class="group-left">
          <span class="group-icon">{{ groupIcon(group.type) }}</span>
          <div class="group-info">
            <span class="group-label">{{ typeLabel(group.type) }}</span>
            <span class="group-count">{{ group.accounts.length }} account{{ group.accounts.length !== 1 ? 's' : '' }}</span>
          </div>
        </div>
        <div class="group-right">
          <span class="group-total" :class="group.total < 0 ? 'neg' : ''">
            {{ group.total < 0 ? '-' : '' }}{{ formatCurrency(Math.abs(group.total)) }}
          </span>
          <ChevronDown :size="16" stroke-width="2" :class="['expand-icon', { rotated: expandedGroups.has(group.type) }]" />
        </div>
      </div>

      <div v-if="expandedGroups.has(group.type)" class="group-details">
        <div
          v-for="acc in group.accounts"
          :key="acc.id"
          class="account-item"
        >
          <div class="account-row" @click="toggleAccount(acc.id)">
            <div class="acc-icon">{{ institutionIcon(acc.institution || acc.name) }}</div>
            <div class="acc-info">
              <span class="acc-name">{{ acc.name }}</span>
              <span class="acc-inst">{{ acc.institution || acc.category || '' }}</span>
            </div>
            <div class="acc-right">
              <span class="acc-balance" :class="acc.balance < 0 ? 'neg' : ''">
                {{ acc.balance < 0 ? '-' : '' }}{{ formatCurrency(Math.abs(acc.balance)) }}
              </span>
              <ChevronDown :size="14" stroke-width="2" :class="['row-chevron', { rotated: expandedAccount === acc.id }]" />
            </div>
          </div>

          <!-- Inline detail expansion -->
          <div v-if="expandedAccount === acc.id" class="account-detail">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Type</span>
                <span class="detail-val">{{ subtypeLabel(acc.subtype || acc.category) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Institution</span>
                <span class="detail-val">{{ acc.institution || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Balance</span>
                <span class="detail-val" :class="acc.balance < 0 ? 'neg' : 'pos'">
                  {{ acc.balance < 0 ? '-' : '' }}{{ formatCurrency(Math.abs(acc.balance)) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">% of {{ acc.balance < 0 ? 'Liabilities' : 'Assets' }}</span>
                <span class="detail-val">{{ accountPercent(acc) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { formatCurrency } from '@/utils/formatters'
import { useNetworthStore } from '@/stores/networth'

const props = defineProps({ groups: { type: Array, default: () => [] } })

const store = useNetworthStore()
const expandedGroups = reactive(new Set())
const expandedAccount = ref(null)

function toggleGroup(type) {
  if (expandedGroups.has(type)) {
    expandedGroups.delete(type)
  } else {
    expandedGroups.add(type)
  }
}

function toggleAccount(id) {
  expandedAccount.value = expandedAccount.value === id ? null : id
}

function accountPercent(acc) {
  const total = acc.balance < 0 ? store.totalLiabilities : store.totalAssets
  if (!total) return '0.0'
  return ((Math.abs(acc.balance) / total) * 100).toFixed(1)
}

function typeLabel(t) {
  const map = { depository: 'Cash & Savings', investment: 'Investments', credit: 'Credit Cards', loan: 'Loans', manual: 'Other Assets' }
  return map[t] || t
}

function groupIcon(t) {
  const map = { depository: '💰', investment: '📈', credit: '💳', loan: '📋', manual: '🏠' }
  return map[t] || '🏛️'
}

function subtypeLabel(s) {
  if (!s) return '—'
  const map = {
    checking: 'Checking Account', savings: 'Savings Account', brokerage: 'Brokerage',
    '401k': '401(k)', ira: 'IRA', roth: 'Roth IRA', '403b': '403(b)',
    'credit card': 'Credit Card', auto: 'Auto Loan', mortgage: 'Mortgage',
    vehicle: 'Vehicle', personal: 'Personal Property', real_estate: 'Real Estate'
  }
  return map[s] || s.charAt(0).toUpperCase() + s.slice(1)
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
.account-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 500px; overflow-y: auto; }

.account-group {
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.account-group:hover { border-color: rgba(255,255,255,0.1); }

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}
.group-header:hover { background: rgba(255,255,255,0.03); }

.group-left { display: flex; align-items: center; gap: 0.6rem; }
.group-icon { font-size: 1.1rem; }
.group-info { display: flex; flex-direction: column; }
.group-label { font-size: 0.8rem; color: #cbd5e1; font-weight: 600; }
.group-count { font-size: 0.68rem; color: #475569; }

.group-right { display: flex; align-items: center; gap: 0.5rem; }
.group-total { font-size: 0.85rem; color: #94a3b8; font-weight: 600; }
.group-total.neg { color: #f87171; }

.expand-icon { color: #475569; transition: transform 0.2s ease; }
.expand-icon.rotated { transform: rotate(180deg); }

.group-details {
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 0.25rem 0.5rem 0.5rem;
}

.account-item { border-radius: 8px; overflow: hidden; }

.account-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.45rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.account-row:hover { background: rgba(255,255,255,0.04); }

.acc-icon { font-size: 1rem; width: 24px; text-align: center; }
.acc-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.acc-name { font-size: 0.82rem; color: #cbd5e1; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.acc-inst { font-size: 0.7rem; color: #475569; text-transform: capitalize; }

.acc-right { display: flex; align-items: center; gap: 0.4rem; }
.acc-balance { font-size: 0.85rem; font-weight: 600; color: #f1f5f9; }
.acc-balance.neg { color: #f87171; }

.row-chevron { color: #334155; transition: transform 0.2s; flex-shrink: 0; }
.row-chevron.rotated { transform: rotate(180deg); }

.account-detail {
  padding: 0.5rem 0.75rem 0.65rem 2.5rem;
  animation: slideDown 0.15s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
  padding: 0.6rem 0.75rem;
  background: rgba(255,255,255,0.02);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.04);
}
.detail-item { display: flex; flex-direction: column; gap: 0.15rem; }
.detail-label { font-size: 0.65rem; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
.detail-val { font-size: 0.8rem; color: #cbd5e1; font-weight: 500; }
.detail-val.pos { color: #34d399; }
.detail-val.neg { color: #f87171; }
</style>
