<template>
  <div class="allocation-breakdown">
    <div v-for="item in allocation" :key="item.label" class="alloc-item">
      <div class="alloc-row" @click="toggleCategory(item.label)">
        <div class="alloc-top">
          <div class="alloc-left">
            <span class="alloc-dot" :style="{ background: colorFor(item.label) }"></span>
            <span class="alloc-label">{{ item.label }}</span>
          </div>
          <span class="alloc-values">
            <span class="alloc-pct">{{ item.percent }}%</span>
            <span class="alloc-amt">{{ formatCurrency(item.value) }}</span>
            <ChevronDown :size="14" stroke-width="2" :class="['expand-icon', { rotated: expandedCategory === item.label }]" />
          </span>
        </div>
        <div class="alloc-track">
          <div
            class="alloc-fill"
            :style="{ width: item.percent + '%', background: colorFor(item.label) }"
          ></div>
        </div>
      </div>

      <!-- Expanded account list for this category -->
      <div v-if="expandedCategory === item.label" class="category-accounts">
        <div v-for="acc in accountsForCategory(item.label)" :key="acc.id" class="cat-account-row">
          <span class="cat-acc-name">{{ acc.name }}</span>
          <span class="cat-acc-balance">{{ formatCurrency(acc.balance || acc.value || 0) }}</span>
        </div>
        <div v-if="!accountsForCategory(item.label).length" class="cat-empty">
          No individual accounts
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { formatCurrency } from '@/utils/formatters'
import { useNetworthStore } from '@/stores/networth'

defineProps({
  allocation: { type: Array, default: () => [] },
  total:      { type: Number, default: 0 },
})

const store = useNetworthStore()
const expandedCategory = ref(null)

function toggleCategory(label) {
  expandedCategory.value = expandedCategory.value === label ? null : label
}

function accountsForCategory(label) {
  const accounts = store.accounts
  const manualAssets = store.manualAssets

  switch (label) {
    case 'Cash & Savings':
      return accounts.filter(a => a.balance > 0 && (a.subtype === 'checking' || a.subtype === 'savings'))
    case 'Investments':
      return accounts.filter(a => a.balance > 0 && a.subtype === 'brokerage')
    case 'Retirement':
      return accounts.filter(a => a.balance > 0 && ['401k', 'ira', 'roth', '403b'].includes(a.subtype))
    case 'Real Assets':
      return manualAssets.map(a => ({ ...a, balance: a.value }))
    default:
      return []
  }
}

function colorFor(label) {
  const map = {
    'Cash & Savings': '#34d399',
    'Investments':    '#3b82f6',
    'Retirement':     '#a78bfa',
    'Real Assets':    '#fbbf24',
  }
  return map[label] || '#64748b'
}
</script>

<style scoped>
.allocation-breakdown { display: flex; flex-direction: column; gap: 0.75rem; }

.alloc-item {
  border-radius: 10px;
  overflow: hidden;
  transition: background 0.15s;
}

.alloc-row {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  cursor: pointer;
  padding: 0.55rem 0.5rem;
  border-radius: 10px;
  transition: background 0.15s;
}
.alloc-row:hover { background: rgba(255,255,255,0.03); }

.alloc-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.alloc-left { display: flex; align-items: center; gap: 0.5rem; }
.alloc-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.alloc-label  { font-size: 0.85rem; color: #cbd5e1; }
.alloc-values { display: flex; gap: 0.5rem; align-items: center; }
.alloc-pct    { font-size: 0.85rem; font-weight: 700; color: #f1f5f9; }
.alloc-amt    { font-size: 0.75rem; color: #475569; }

.expand-icon { color: #334155; transition: transform 0.2s; }
.expand-icon.rotated { transform: rotate(180deg); }

.alloc-track {
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 99px;
  overflow: hidden;
}
.alloc-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
}

.category-accounts {
  padding: 0.35rem 0.5rem 0.5rem 1.5rem;
  animation: slideDown 0.15s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.cat-account-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  transition: background 0.12s;
}
.cat-account-row:hover { background: rgba(255,255,255,0.03); }
.cat-acc-name { font-size: 0.78rem; color: #94a3b8; }
.cat-acc-balance { font-size: 0.78rem; color: #cbd5e1; font-weight: 600; }

.cat-empty { font-size: 0.75rem; color: #334155; padding: 0.3rem 0.5rem; font-style: italic; }
</style>
