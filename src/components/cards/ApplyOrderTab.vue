<template>
  <div class="apply-order-wrap">
    <div v-if="applicationSequence.length === 0" class="empty-section">
      No application sequence available. Card metadata is needed to build a recommended order.
    </div>
    <template v-else>
      <!-- 5/24 Status Bar -->
      <div class="five24-bar">
        <div class="five24-info">
          <span class="five24-label">Chase 5/24 Status</span>
          <span class="five24-count">
            <strong>{{ currentFiveTwentyFourCount }}</strong> / 5 slots used
          </span>
        </div>
        <div class="five24-meter">
          <div
            class="five24-fill"
            :class="{ full: currentFiveTwentyFourCount >= 5 }"
            :style="{ width: Math.min((currentFiveTwentyFourCount / 5) * 100, 100) + '%' }"
          />
        </div>
        <span class="five24-remaining">
          {{ fiveTwentyFourSlotsRemaining }} slot{{ fiveTwentyFourSlotsRemaining === 1 ? '' : 's' }} remaining
        </span>
      </div>

      <!-- Timeline -->
      <div class="timeline">
        <div
          v-for="(step, idx) in applicationSequence"
          :key="step.cardKey"
          :class="['timeline-step', { owned: step.isOwned }]"
        >
          <div class="timeline-gutter">
            <div :class="['timeline-dot', step.isOwned ? 'dot-complete' : 'dot-pending']">
              <CheckCircle v-if="step.isOwned" :size="14" stroke-width="2" />
              <span v-else class="dot-number">{{ getStepNumber(idx) }}</span>
            </div>
            <div v-if="idx < applicationSequence.length - 1" class="timeline-line" />
          </div>

          <div :class="['timeline-card', { 'timeline-card-owned': step.isOwned }]">
            <div class="timeline-card-header">
              <div class="timeline-card-title">
                <span class="timeline-card-name">{{ step.cardName }}</span>
                <div class="timeline-badges">
                  <span :class="['type-badge', step.type === 'Business' ? 'type-biz' : 'type-personal']">
                    {{ step.type }}
                  </span>
                  <span v-if="step.fiveTwentyFourStatus === 'uses-slot'" class="slot-badge slot-uses">5/24 slot</span>
                  <span v-else-if="step.fiveTwentyFourStatus === 'no-impact'" class="slot-badge slot-safe">No 5/24 impact</span>
                  <span v-else-if="step.fiveTwentyFourStatus === 'completed'" class="slot-badge slot-done">Owned</span>
                </div>
              </div>
              <div v-if="step.signupBonusDollarValue > 0" class="timeline-sub-value">
                {{ formatCurrency(step.signupBonusDollarValue) }}
              </div>
            </div>

            <div v-if="!step.isOwned" class="timeline-card-body">
              <div class="timeline-stats">
                <div v-if="step.signupBonusAmount > 0" class="timeline-stat">
                  <span class="timeline-stat-label">Signup Bonus</span>
                  <span class="timeline-stat-value">{{ step.signupBonusAmount.toLocaleString() }} {{ step.signupBonusType }}</span>
                </div>
                <div v-if="step.spendRequired > 0" class="timeline-stat">
                  <span class="timeline-stat-label">Min Spend</span>
                  <span class="timeline-stat-value">{{ formatCurrency(step.spendRequired) }} in {{ step.spendMonths }}mo</span>
                </div>
                <div class="timeline-stat">
                  <span class="timeline-stat-label">Annual Fee</span>
                  <span class="timeline-stat-value">{{ step.annualFee > 0 ? formatCurrency(step.annualFee) : 'Free' }}</span>
                </div>
                <div class="timeline-stat">
                  <span class="timeline-stat-label">Network</span>
                  <span class="timeline-stat-value">{{ step.network }}</span>
                </div>
              </div>

              <div v-if="step.timing !== 'Apply now'" class="timeline-timing">
                <Clock :size="13" stroke-width="2" />
                {{ step.timing }}
              </div>

              <div v-if="step.applicationNotes" class="timeline-notes">
                {{ step.applicationNotes }}
              </div>
            </div>

            <div v-else class="timeline-card-body timeline-owned-body">
              <span class="timeline-owned-label">Already in your portfolio</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Downgrade Reminder -->
      <div class="downgrade-note">
        <AlertTriangle :size="14" stroke-width="2" />
        <span><strong>Tip:</strong> Consider downgrading Chase Sapphire Preferred to Freedom Flex after year 1 to avoid the annual fee while keeping the credit line and UR points.</span>
      </div>

      <!-- Total Potential Value -->
      <div v-if="totalPotentialSubValue > 0" class="total-value-bar">
        <div class="total-value-stat">
          <span class="total-value-label">Total Potential SUB Value</span>
          <span class="total-value-amount">{{ formatCurrency(totalPotentialSubValue) }}</span>
        </div>
        <div class="total-value-stat">
          <span class="total-value-label">Cards to Apply</span>
          <span class="total-value-amount">{{ applicationSequence.filter(s => !s.isOwned).length }}</span>
        </div>
        <div class="total-value-stat">
          <span class="total-value-label">5/24 Slots Available</span>
          <span class="total-value-amount">{{ fiveTwentyFourSlotsRemaining }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-vue-next'
import { useApplicationSequence } from '@/composables/useApplicationSequence'

const { formatCurrency } = inject('helpers')

const {
  applicationSequence,
  currentFiveTwentyFourCount,
  fiveTwentyFourSlotsRemaining,
  totalPotentialSubValue,
} = useApplicationSequence()

function getStepNumber(idx) {
  // Count non-owned steps up to this index
  let n = 0
  for (let i = 0; i <= idx; i++) {
    if (!applicationSequence.value[i].isOwned) n++
  }
  return n
}
</script>

<style scoped>
.apply-order-wrap {
  animation: viewFadeIn 0.2s ease-out;
}

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.empty-section {
  text-align: center;
  padding: 40px 24px;
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

/* ── 5/24 Status Bar ── */
.five24-bar {
  padding: 16px 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.five24-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.five24-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-primary);
}

.five24-count {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.five24-meter {
  height: 8px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.five24-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--accent-teal);
  transition: width 0.4s ease;
}

.five24-fill.full {
  background: var(--negative);
}

.five24-remaining {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

/* ── Timeline ── */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-step {
  display: flex;
  gap: 16px;
}

.timeline-gutter {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 28px;
}

.timeline-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.dot-complete {
  background: rgba(20, 184, 166, 0.15);
  color: var(--accent-teal);
}

.dot-pending {
  background: var(--bg-subtle);
  border: 2px solid var(--accent-blue);
  color: var(--accent-blue);
}

.dot-number {
  font-size: 0.72rem;
  font-weight: 800;
}

.timeline-line {
  width: 2px;
  flex: 1;
  min-height: 12px;
  background: var(--border-glass);
}

.timeline-card {
  flex: 1;
  padding: 16px 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  margin-bottom: 12px;
}

.timeline-card-owned {
  opacity: 0.7;
  border-color: rgba(20, 184, 166, 0.2);
}

.timeline-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.timeline-card-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.timeline-card-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.timeline-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.type-personal {
  background: rgba(59, 130, 246, 0.12);
  color: #3B82F6;
}

.type-biz {
  background: rgba(234, 179, 8, 0.12);
  color: #EAB308;
}

.slot-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.slot-uses {
  background: rgba(239, 68, 68, 0.08);
  color: var(--negative);
}

.slot-safe {
  background: rgba(20, 184, 166, 0.08);
  color: var(--accent-teal);
}

.slot-done {
  background: rgba(20, 184, 166, 0.12);
  color: var(--accent-teal);
}

.timeline-sub-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--accent-teal);
  flex-shrink: 0;
}

.timeline-card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timeline-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.timeline-stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.timeline-stat-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.timeline-stat-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
}

.timeline-timing {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--accent-blue);
  padding: 6px 10px;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: var(--radius-sm);
}

.timeline-notes {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.5;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--border-glass);
}

.timeline-owned-body {
  padding: 0;
}

.timeline-owned-label {
  font-size: 0.78rem;
  color: var(--accent-teal);
  font-weight: 600;
}

/* ── Downgrade Reminder ── */
.downgrade-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 18px;
  margin-top: 16px;
  background: rgba(234, 179, 8, 0.06);
  border: 1px solid rgba(234, 179, 8, 0.18);
  border-radius: var(--radius-md);
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.downgrade-note svg {
  color: #EAB308;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── Total Value Bar ── */
.total-value-bar {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding: 16px 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
}

.total-value-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.total-value-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
}

.total-value-amount {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--accent-teal);
}

@media (max-width: 768px) {
  .timeline-step {
    gap: 12px;
  }

  .timeline-stats {
    gap: 10px;
  }

  .total-value-bar {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
