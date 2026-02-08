<template>
  <div class="credit-card-item">
    <div class="card-visual" :style="{ background: gradientBg }">
      <div class="card-visual-top">
        <span class="card-name">{{ card.name }}</span>
        <Badge v-if="analysis.bestFor" :label="'Best for ' + analysis.bestFor" type="neutral" />
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
import { computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import { CheckCircle, Circle } from 'lucide-vue-next'
import Badge from '@/components/common/Badge.vue'

const props = defineProps({
  card: { type: Object, required: true },
  analysis: { type: Object, required: true }
})

const gradientBg = computed(() => {
  const c = props.card.color
  return `linear-gradient(135deg, ${c} 0%, ${c}cc 50%, ${c}88 100%)`
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

.card-visual {
  padding: 20px 20px 16px;
  min-height: 80px;
  display: flex;
  align-items: flex-start;
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
