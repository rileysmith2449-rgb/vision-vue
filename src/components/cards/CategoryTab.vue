<template>
  <div class="category-table-wrap">
    <div v-if="topCategories.length === 0" class="empty-section">
      No transaction data to analyze.
    </div>
    <div v-else class="category-table">
      <div class="cat-row cat-header">
        <span class="cat-cell cat-name-cell">Category</span>
        <span class="cat-cell">Spend</span>
        <span class="cat-cell">Best Card</span>
        <span class="cat-cell">Rate</span>
        <span class="cat-cell cat-right">Rewards</span>
      </div>
      <template v-for="cat in topCategories" :key="cat.category">
        <div
          :class="['cat-row', 'cat-data-row', { 'cat-row-expanded': expandedCat === cat.category }]"
          @click="$emit('update:expandedCat', expandedCat === cat.category ? null : cat.category)"
        >
          <span class="cat-cell cat-name-cell">
            <span class="cat-icon">{{ categoryIcon(cat.category) }}</span>
            {{ formatCatName(cat.category) }}
          </span>
          <span class="cat-cell">{{ formatCurrency(cat.spend) }}</span>
          <span class="cat-cell cat-card-name">{{ getCardName(cat.bestCard) }}</span>
          <span class="cat-cell">
            <span class="rate-badge">{{ cat.bestRate?.earnMultiplier || 1 }}x</span>
          </span>
          <span class="cat-cell cat-right">
            {{ formatCurrencyCents(cat.optimalRewards) }}
            <span v-if="cat.missedRewards > 0.5" class="missed-tag">
              -{{ formatCurrencyCents(cat.missedRewards) }}
            </span>
          </span>
          <ChevronDown :size="14" stroke-width="2" :class="['cat-chevron', { rotated: expandedCat === cat.category }]" />
        </div>

        <!-- Drilldown -->
        <div v-if="expandedCat === cat.category" class="cat-drilldown">
          <div v-if="getCategoryBudget(cat.category)" class="cat-budget-bar">
            <div class="cat-budget-bar-info">
              <span>{{ formatCurrency(cat.spend) }} of {{ formatCurrency(getCategoryBudget(cat.category)) }}</span>
              <span :class="cat.spend > getCategoryBudget(cat.category) ? 'over-budget' : 'under-budget'">
                {{ cat.spend > getCategoryBudget(cat.category) ? 'Over by ' + formatCurrency(cat.spend - getCategoryBudget(cat.category)) : formatCurrency(getCategoryBudget(cat.category) - cat.spend) + ' remaining' }}
              </span>
            </div>
            <div class="cat-progress">
              <div
                class="cat-progress-fill"
                :class="{ over: cat.spend > getCategoryBudget(cat.category) }"
                :style="{ width: Math.min((cat.spend / getCategoryBudget(cat.category)) * 100, 100) + '%' }"
              />
            </div>
          </div>

          <div class="cat-txn-header">
            <span class="cat-txn-cell cat-txn-merchant">Merchant</span>
            <span class="cat-txn-cell">Paid With</span>
            <span class="cat-txn-cell">Best Card</span>
            <span class="cat-txn-cell">Rate</span>
            <span class="cat-txn-cell cat-txn-date">Date</span>
            <span class="cat-txn-cell cat-txn-right">Rewards</span>
            <span class="cat-txn-cell cat-txn-right">Amount</span>
          </div>
          <div
            v-for="(txn, i) in getCategoryTransactions(cat.category)"
            :key="i"
            :class="['cat-txn-row', { 'cat-txn-suboptimal': !txn.isOptimal && txn.actualCard }]"
          >
            <span class="cat-txn-cell cat-txn-merchant">{{ txn.merchant_name }}</span>
            <span :class="['cat-txn-cell', { 'cat-txn-wrong-card': !txn.isOptimal && txn.actualCard }]">{{ txn.actualCard ? getCardName(txn.actualCard) : '—' }}</span>
            <span class="cat-txn-cell cat-card-name">{{ getCardName(txn.recommendedCard) }}</span>
            <span class="cat-txn-cell"><span class="rate-badge">{{ txn.recommendedRate?.earnMultiplier || 1 }}x</span></span>
            <span class="cat-txn-cell cat-txn-date">{{ txn.date }}</span>
            <span class="cat-txn-cell cat-txn-right">
              {{ formatCurrencyCents(txn.optimalRewards) }}
              <span v-if="txn.missedRewards > 0.01" class="missed-tag">-{{ formatCurrencyCents(txn.missedRewards) }}</span>
            </span>
            <span class="cat-txn-cell cat-txn-right">{{ formatCurrency(txn.amount) }}</span>
          </div>
          <div class="cat-txn-footer">
            <span>{{ getCategoryTransactions(cat.category).length }} transactions</span>
            <span v-if="cat.missedRewards > 0" class="cat-txn-footer-missed">{{ formatCurrencyCents(cat.missedRewards) }} left on table</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

defineProps({
  topCategories: { type: Array, default: () => [] },
  expandedCat: { type: String, default: null },
  getCategoryTransactions: { type: Function, required: true },
  getCategoryBudget: { type: Function, required: true },
})

defineEmits(['update:expandedCat'])

const { formatCurrency, formatCurrencyCents, getCardName, formatCatName, categoryIcon } = inject('helpers')
</script>

<style scoped>
@import './shared.css';

.category-table-wrap { overflow-x: auto; }

.category-table {
  width: 100%;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.cat-row {
  display: flex;
  gap: 8px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-glass);
  align-items: center;
}

.cat-row:last-child { border-bottom: none; }

.cat-header { background: var(--bg-subtle); }

.cat-header .cat-cell {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
}

.cat-data-row {
  cursor: pointer;
  transition: background 0.15s ease;
}

.cat-data-row:hover { background: var(--bg-subtle); }
.cat-row-expanded { background: var(--bg-subtle); }

.cat-cell {
  flex: 1;
  font-size: 0.82rem;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-name-cell {
  flex: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.cat-icon { flex-shrink: 0; }

.cat-card-name {
  color: var(--accent-blue);
  font-weight: 600;
}

.cat-right {
  text-align: right;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}

.cat-chevron {
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.cat-chevron.rotated { transform: rotate(180deg); }

/* ── Category Drilldown ── */
.cat-drilldown {
  padding: 12px 18px 16px;
  border-bottom: 1px solid var(--border-glass);
  background: rgba(255, 255, 255, 0.01);
}

.cat-budget-bar { margin-bottom: 14px; }

.cat-budget-bar-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.over-budget { color: var(--negative); font-weight: 700; }
.under-budget { color: var(--accent-teal); }

.cat-progress {
  height: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}

.cat-progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--accent-teal);
  transition: width 0.3s ease;
}

.cat-progress-fill.over { background: var(--negative); }

.cat-txn-header {
  display: flex;
  gap: 8px;
  padding: 4px 0 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.cat-txn-header .cat-txn-cell {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cat-txn-row {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.cat-txn-row:last-of-type { border-bottom: none; }

.cat-txn-cell {
  flex: 1;
  font-size: 0.78rem;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-txn-merchant { flex: 1.3; font-weight: 600; }
.cat-txn-date { color: var(--text-tertiary); }
.cat-txn-right { text-align: right; flex: 0.7; font-weight: 600; }

.cat-txn-suboptimal { background: rgba(239, 68, 68, 0.03); }
.cat-txn-wrong-card { color: var(--negative); font-weight: 600; }

.cat-txn-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.cat-txn-footer-missed { color: var(--negative); font-weight: 600; }

@media (max-width: 768px) {
  .cat-row { padding: 10px 14px; gap: 6px; }
}
</style>
