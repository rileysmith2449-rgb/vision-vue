<template>
  <div>
    <div class="card-drill-section">
      <div class="card-drill-title">Category Breakdown</div>
      <div class="card-drill-cat-row card-drill-cat-head">
        <span class="card-drill-cat-cell card-drill-cat-name">Category</span>
        <span class="card-drill-cat-cell">Txns</span>
        <span class="card-drill-cat-cell">Spend</span>
        <span class="card-drill-cat-cell card-drill-right">Rewards</span>
      </div>
      <div v-for="breakdown in getCardCategoryBreakdown(cardKey)" :key="breakdown.category" class="card-drill-cat-row">
        <span class="card-drill-cat-cell card-drill-cat-name">{{ categoryIcon(breakdown.category) }} {{ formatCatName(breakdown.category) }}</span>
        <span class="card-drill-cat-cell">{{ breakdown.count }}</span>
        <span class="card-drill-cat-cell">{{ formatCurrency(breakdown.spend) }}</span>
        <span class="card-drill-cat-cell card-drill-right">{{ formatCurrencyCents(breakdown.rewards) }}</span>
      </div>
    </div>

    <div class="card-drill-section">
      <div class="card-drill-title">Transactions ({{ getCardTransactions(cardKey).length }})</div>
      <div class="card-drill-txn-header">
        <span class="card-drill-txn-cell card-drill-txn-merchant">Merchant</span>
        <span class="card-drill-txn-cell">Category</span>
        <span class="card-drill-txn-cell">Paid With</span>
        <span class="card-drill-txn-cell">Rate</span>
        <span class="card-drill-txn-cell card-drill-txn-date">Date</span>
        <span class="card-drill-txn-cell card-drill-right">Amount</span>
      </div>
      <div
        v-for="txn in getCardTransactions(cardKey)"
        :key="txn.transaction_id"
        :class="['card-drill-txn-row', { 'card-drill-suboptimal': !txn.isOptimal && txn.actualCard }]"
      >
        <span class="card-drill-txn-cell card-drill-txn-merchant">{{ txn.merchant_name }}</span>
        <span class="card-drill-txn-cell card-drill-txn-cat">{{ formatCatName(txn.plaidPrimary) }}</span>
        <span :class="['card-drill-txn-cell', { 'card-drill-wrong-card': !txn.isOptimal && txn.actualCard }]">{{ txn.actualCard ? getCardName(txn.actualCard) : '—' }}</span>
        <span class="card-drill-txn-cell"><span class="rate-badge">{{ txn.recommendedRate?.earnMultiplier || 1 }}x</span></span>
        <span class="card-drill-txn-cell card-drill-txn-date">{{ txn.date }}</span>
        <span class="card-drill-txn-cell card-drill-right">{{ formatCurrency(txn.amount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

defineProps({
  cardKey: { type: String, required: true },
  getCardCategoryBreakdown: { type: Function, required: true },
  getCardTransactions: { type: Function, required: true },
})

const { formatCurrency, formatCurrencyCents, getCardName, formatCatName, categoryIcon } = inject('helpers')
</script>

<style scoped>
@import './shared.css';

.card-drill-section { margin-bottom: 16px; }
.card-drill-section:last-child { margin-bottom: 0; }

.card-drill-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.card-drill-cat-row {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.card-drill-cat-row:last-child { border-bottom: none; }

.card-drill-cat-head { border-bottom: 1px solid rgba(255, 255, 255, 0.06); }

.card-drill-cat-head .card-drill-cat-cell {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.card-drill-cat-cell {
  flex: 1;
  font-size: 0.78rem;
  color: var(--text-primary);
}

.card-drill-cat-name { flex: 2; font-weight: 600; }
.card-drill-right { text-align: right; }

.card-drill-txn-header {
  display: flex;
  gap: 8px;
  padding: 4px 0 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.card-drill-txn-header .card-drill-txn-cell {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.card-drill-txn-row {
  display: flex;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.card-drill-txn-row:last-child { border-bottom: none; }
.card-drill-suboptimal { background: rgba(239, 68, 68, 0.03); }

.card-drill-txn-cell {
  flex: 1;
  font-size: 0.76rem;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-drill-txn-merchant { flex: 1.3; font-weight: 600; }
.card-drill-txn-cat { color: var(--text-secondary); }
.card-drill-txn-date { color: var(--text-tertiary); }
.card-drill-wrong-card { color: var(--negative); font-weight: 600; }
</style>
