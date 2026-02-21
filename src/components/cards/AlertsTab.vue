<template>
  <div class="alerts-view">
    <!-- Summary Banner -->
    <div v-if="wrongCardCount > 0" class="alerts-banner alerts-banner-warn">
      <div class="alerts-banner-icon">
        <AlertTriangle :size="20" stroke-width="2" />
      </div>
      <div class="alerts-banner-text">
        <span class="alerts-banner-title">{{ wrongCardCount }} transaction{{ wrongCardCount === 1 ? '' : 's' }} used the wrong card</span>
        <span class="alerts-banner-subtitle">~{{ formatCurrency(annualizedMissedRewards) }}/yr in missed rewards</span>
      </div>
    </div>
    <div v-else class="alerts-banner alerts-banner-ok">
      <div class="alerts-banner-icon alerts-icon-ok">
        <CheckCircle :size="20" stroke-width="2" />
      </div>
      <div class="alerts-banner-text">
        <span class="alerts-banner-title">You're using the right cards</span>
        <span class="alerts-banner-subtitle">No missed rewards detected in this period</span>
      </div>
    </div>

    <!-- Wrong Card Transaction List -->
    <div v-if="wrongCardTransactions.length > 0" class="alerts-list">
      <div
        v-for="txn in wrongCardTransactions"
        :key="txn.transaction_id"
        class="alerts-txn-row"
      >
        <div class="alerts-txn-top">
          <span class="alerts-txn-merchant">{{ txn.merchant_name }}</span>
          <span class="alerts-txn-amount">{{ formatCurrency(txn.amount) }}</span>
        </div>
        <div class="alerts-txn-bottom">
          <span class="alerts-txn-cards">
            <span class="alerts-wrong-card">{{ getCardName(txn.actualCard) }}</span>
            <ArrowRight :size="12" stroke-width="2" class="alerts-arrow" />
            <span class="alerts-right-card">{{ getCardName(txn.recommendedCard) }}</span>
          </span>
          <span class="alerts-txn-missed">-{{ formatCurrencyCents(txn.missedRewards) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-vue-next'

defineProps({
  wrongCardCount: { type: Number, default: 0 },
  wrongCardTransactions: { type: Array, default: () => [] },
  annualizedMissedRewards: { type: Number, default: 0 },
})

const { formatCurrency, formatCurrencyCents, getCardName } = inject('helpers')
</script>

<style scoped>
.alerts-view { animation: viewFadeIn 0.2s ease-out; }

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.alerts-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

.alerts-banner-warn {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.18);
}

.alerts-banner-ok {
  background: rgba(20, 184, 166, 0.06);
  border: 1px solid rgba(20, 184, 166, 0.18);
}

.alerts-banner-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--negative);
  flex-shrink: 0;
}

.alerts-icon-ok {
  background: rgba(20, 184, 166, 0.1);
  color: var(--accent-teal);
}

.alerts-banner-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alerts-banner-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.alerts-banner-subtitle {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.alerts-list {
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.alerts-txn-row {
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-glass);
  transition: background 0.15s ease;
}

.alerts-txn-row:last-child { border-bottom: none; }
.alerts-txn-row:hover { background: var(--bg-subtle); }

.alerts-txn-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.alerts-txn-merchant {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.alerts-txn-amount {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}

.alerts-txn-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alerts-txn-cards {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
}

.alerts-wrong-card {
  color: var(--negative);
  font-weight: 600;
  text-decoration: line-through;
}

.alerts-arrow {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.alerts-right-card {
  color: var(--accent-teal);
  font-weight: 600;
}

.alerts-txn-missed {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--negative);
}

@media (max-width: 768px) {
  .alerts-banner {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .alerts-txn-cards { font-size: 0.72rem; }
}
</style>
