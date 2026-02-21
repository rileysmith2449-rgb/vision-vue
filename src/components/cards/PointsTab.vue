<template>
  <div class="points-view">
    <div v-if="pooledPointsPrograms.length === 0 && creditsSummary.length === 0" class="empty-section">
      No points or credit data available. Use cards with rewards programs to see redemption strategies.
    </div>

    <template v-if="pooledPointsPrograms.length > 0">
      <h4 class="block-title">
        <Gift :size="16" stroke-width="2" />
        Points & Redemption Strategy
      </h4>
      <p class="block-subtitle">Pooled ecosystem rewards across personal & business cards</p>

      <div class="points-grid">
        <div v-for="program in pooledPointsPrograms" :key="program.name" class="points-card">
          <div class="points-card-header">
            <span class="points-program-name">{{ program.name }}</span>
            <span class="points-balance">{{ program.points.toLocaleString() }} {{ program.unit }}</span>
          </div>
          <div v-if="program.contributingCards.length > 1" class="pool-note">
            Pooled from: {{ program.contributingCards.join(', ') }}
          </div>
          <div class="redemption-options">
            <div
              v-for="opt in program.redemptions"
              :key="opt.method"
              :class="['redemption-row', { best: opt.best }]"
            >
              <div class="redemption-left">
                <span v-if="opt.best" class="best-tag">Best</span>
                <span class="redemption-method">{{ opt.method }}</span>
                <span class="redemption-rate">{{ opt.rate }}</span>
              </div>
              <span class="redemption-value" :class="{ 'best-value': opt.best }">{{ formatCurrency(opt.value) }}</span>
            </div>
          </div>
          <div v-if="program.poolNote" class="eco-pool-note" style="margin-top: 8px;">
            {{ program.poolNote }}
          </div>
        </div>
      </div>
    </template>

    <!-- Statement Credits -->
    <div v-if="creditsSummary.length > 0" class="credits-block">
      <h5 class="credits-block-title">Statement Credits Status</h5>
      <div class="credits-block-list">
        <div v-for="credit in creditsSummary" :key="credit.card + credit.name" class="credit-block-row">
          <div class="credit-block-left">
            <CheckCircle v-if="credit.used" :size="14" stroke-width="2" class="credit-used-icon" />
            <Circle v-else :size="14" stroke-width="2" class="credit-unused-icon" />
            <span class="credit-block-card">{{ credit.card }}</span>
            <span class="credit-block-name">{{ credit.name }}</span>
          </div>
          <span class="credit-block-amount">{{ formatCurrency(credit.amount) }}</span>
        </div>
      </div>
      <div class="credits-total">
        <span>Total credits value</span>
        <span class="credits-total-value">{{ formatCurrency(totalCreditsValue) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { Gift, CheckCircle, Circle } from 'lucide-vue-next'

defineProps({
  pooledPointsPrograms: { type: Array, default: () => [] },
  creditsSummary: { type: Array, default: () => [] },
  totalCreditsValue: { type: Number, default: 0 },
})

const { formatCurrency } = inject('helpers')
</script>

<style scoped>
@import './shared.css';

.points-view { animation: viewFadeIn 0.2s ease-out; }

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.points-card {
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
  background: var(--bg-card);
  background-image: var(--gradient-card);
}

.points-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.points-program-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}

.points-balance {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--accent-blue);
}

.redemption-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.redemption-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
}

.redemption-row.best {
  background: rgba(20, 184, 166, 0.06);
  border: 1px solid rgba(20, 184, 166, 0.15);
}

.redemption-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.best-tag {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  background: rgba(20, 184, 166, 0.15);
  color: var(--accent-teal);
}

.redemption-method {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
}

.redemption-rate {
  font-size: 0.68rem;
  color: var(--text-tertiary);
}

.redemption-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.redemption-value.best-value { color: var(--accent-teal); }

.pool-note {
  font-size: 0.68rem;
  color: var(--text-tertiary);
  margin-bottom: 8px;
  font-style: italic;
}

.eco-pool-note {
  padding: 8px 10px;
  background: rgba(20, 184, 166, 0.04);
  border: 1px solid rgba(20, 184, 166, 0.1);
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
  color: var(--accent-teal);
  line-height: 1.4;
}

/* Credits */
.credits-block {
  padding: 20px;
  margin-top: 16px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
}

.credits-block-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.credits-block-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.credit-block-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.credit-block-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.credit-used-icon { color: var(--accent-teal); }
.credit-unused-icon { color: var(--text-tertiary); }

.credit-block-card {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.credit-block-name {
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

.credit-block-amount {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
}

.credits-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-glass);
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.credits-total-value {
  font-weight: 800;
  color: var(--accent-teal);
}

@media (max-width: 768px) {
  .points-grid { grid-template-columns: 1fr; }
}
</style>
