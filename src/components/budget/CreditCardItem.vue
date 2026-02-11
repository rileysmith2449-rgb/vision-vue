<template>
  <div class="credit-card-item" :class="{ expanded }">
    <div class="card-visual" :style="{ background: gradientBg }" @click="expanded = !expanded">
      <div class="card-visual-top">
        <span class="card-name">{{ card.name }}</span>
        <Badge v-if="analysis.bestFor" :label="'Best for ' + analysis.bestFor" type="neutral" />
      </div>
      <div class="card-visual-bottom">
        <span class="tap-hint">{{ expanded ? 'Tap to collapse' : 'Tap for transactions' }}</span>
        <ChevronDown :size="16" stroke-width="2" :class="['expand-chevron', { rotated: expanded }]" />
      </div>
    </div>

    <div class="card-body">
      <div class="stats-grid">
        <div class="stat">
          <span class="stat-label">Total Spend</span>
          <span class="stat-value">{{ formatCurrency(analysis.totalSpend) }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Cashback</span>
          <span class="stat-value gain">{{ formatCurrency(analysis.cashbackEarned) }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Annual Fee</span>
          <span class="stat-value">{{ card.annualFee > 0 ? formatCurrency(card.annualFee) : 'Free' }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Net Value</span>
          <span class="stat-value" :class="analysis.netValue >= 0 ? 'gain' : 'loss'">
            {{ analysis.netValue >= 0 ? '+' : '' }}{{ formatCurrency(analysis.netValue) }}
          </span>
        </div>
        <div class="stat stat-full">
          <span class="stat-label">Optimal Usage</span>
          <div class="optimal-bar-wrap">
            <div class="optimal-bar">
              <div class="optimal-bar-fill" :style="{ width: optimalPercent + '%' }" />
            </div>
            <span class="stat-value" :class="optimalPercent >= 70 ? 'gain' : optimalPercent >= 40 ? '' : 'loss'">
              {{ optimalPercent.toFixed(0) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Transactions (expanded) -->
      <div v-if="expanded && transactions.length" class="transactions-section">
        <h5 class="transactions-title">Transactions ({{ transactions.length }})</h5>
        <div class="transactions-list">
          <div v-for="(txn, i) in transactions" :key="i" :class="['txn-row', { 'txn-suboptimal': !isOptimal(txn) }]">
            <div class="txn-optimal-icon">
              <CheckCircle2 v-if="isOptimal(txn)" :size="14" stroke-width="2" class="icon-optimal" />
              <AlertCircle v-else :size="14" stroke-width="2" class="icon-suboptimal" />
            </div>
            <div class="txn-left">
              <span class="txn-merchant">{{ txn.merchant }}</span>
              <span class="txn-meta">
                {{ txn.category }} &middot; {{ formatDate(txn.date) }}
                <span v-if="!isOptimal(txn)" class="txn-best-hint">&middot; Best: {{ getBestCardForCategory(txn.category, budgetStore.budgetMode).cardName }}</span>
              </span>
            </div>
            <span class="txn-amount">{{ formatCurrency(txn.amount) }}</span>
          </div>
        </div>
      </div>

      <div v-if="card.statementCredits.length" class="credits-section">
        <h5 class="credits-title">Statement Credits</h5>
        <div class="credits-list">
          <div v-for="credit in card.statementCredits" :key="credit.name" class="credit-row">
            <div class="credit-left">
              <CheckCircle v-if="credit.used" :size="16" stroke-width="2" class="credit-icon used" />
              <Circle v-else :size="16" stroke-width="2" class="credit-icon remaining" />
              <span class="credit-name">{{ credit.name }}</span>
            </div>
            <span class="credit-amount">{{ formatCurrency(credit.amount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { getBestCardForCategory } from '@/utils/creditCardData'
import { CheckCircle, Circle, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import { useBudgetStore } from '@/stores/budget'
import Badge from '@/components/common/Badge.vue'

const budgetStore = useBudgetStore()

const props = defineProps({
  card: { type: Object, required: true },
  analysis: { type: Object, required: true }
})

const expanded = ref(false)

const gradientBg = computed(() => {
  const c = props.card.color
  return `linear-gradient(135deg, ${c} 0%, ${c}cc 50%, ${c}88 100%)`
})

const transactions = computed(() => {
  const txns = budgetStore.transactionsByCard[props.card.name] || []
  return [...txns].sort((a, b) => new Date(b.date) - new Date(a.date))
})

function isOptimal(txn) {
  const best = getBestCardForCategory(txn.category, budgetStore.budgetMode)
  return props.card.name === best.cardName
}

const optimalPercent = computed(() => {
  const txns = transactions.value
  if (txns.length === 0) return 100
  let optimalAmount = 0
  let totalAmount = 0
  for (const txn of txns) {
    totalAmount += txn.amount
    if (isOptimal(txn)) {
      optimalAmount += txn.amount
    }
  }
  return totalAmount > 0 ? (optimalAmount / totalAmount) * 100 : 100
})
</script>

<style scoped>
.credit-card-item {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.credit-card-item:hover {
  box-shadow: var(--shadow-hover);
}

.credit-card-item.expanded {
  border-color: rgba(100, 149, 237, 0.25);
}

.card-visual {
  padding: 20px 20px 16px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
}

.card-visual-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 8px;
}

.card-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.card-visual-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.tap-hint {
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
}

.expand-chevron {
  color: rgba(255, 255, 255, 0.55);
  transition: transform 0.2s ease;
}

.expand-chevron.rotated {
  transform: rotate(180deg);
}

.card-body {
  padding: 18px 20px 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.gain {
  color: var(--electric-teal);
}

.stat-value.loss {
  color: var(--persimmon);
}

.stat-full {
  grid-column: 1 / -1;
}

.optimal-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.optimal-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.optimal-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--electric-teal);
  transition: width 0.3s ease;
}

/* Transactions */
.transactions-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-glass);
}

.transactions-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.txn-row {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
  gap: 10px;
}

.txn-row:hover {
  background: var(--bg-subtle);
}

.txn-suboptimal {
  background: rgba(255, 99, 71, 0.04);
}

.txn-optimal-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.icon-optimal {
  color: var(--electric-teal);
}

.icon-suboptimal {
  color: var(--persimmon);
}

.txn-left {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.txn-merchant {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.txn-meta {
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.txn-best-hint {
  color: var(--persimmon);
  font-weight: 600;
}

.txn-amount {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  flex-shrink: 0;
  margin-left: 12px;
}

.credits-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-glass);
}

.credits-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.credits-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.credit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.credit-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.credit-icon.used {
  color: var(--electric-teal);
}

.credit-icon.remaining {
  color: var(--text-tertiary);
}

.credit-name {
  font-size: 0.85rem;
  color: var(--text-primary);
}

.credit-amount {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}
</style>
