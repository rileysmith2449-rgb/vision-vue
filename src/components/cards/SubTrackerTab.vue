<template>
  <div class="sub-wrap">
    <div v-if="signupBonusTracker.length === 0" class="empty-section">
      No cards with signup bonuses in your portfolio.
    </div>
    <template v-else>
      <div class="sub-cards">
        <div
          v-for="tracker in signupBonusTracker"
          :key="tracker.cardKey"
          :class="['sub-card', `sub-status-${tracker.status}`]"
        >
          <div class="sub-card-header">
            <div class="sub-card-info">
              <span class="sub-card-name">{{ tracker.cardName }}</span>
              <span class="sub-card-issuer">{{ tracker.cardIssuer }}</span>
            </div>
            <span class="sub-bonus-badge">
              {{ tracker.bonusAmount.toLocaleString() }} {{ tracker.bonusType }}
            </span>
          </div>

          <div class="sub-progress-wrap">
            <div class="sub-progress-bar">
              <div
                class="sub-progress-fill"
                :class="`sub-fill-${tracker.status}`"
                :style="{ width: tracker.pct + '%' }"
              ></div>
            </div>
            <div class="sub-progress-labels">
              <span>{{ formatCurrency(tracker.spent) }} of {{ formatCurrency(tracker.spendRequired) }}</span>
              <span class="sub-pct">{{ tracker.pct }}%</span>
            </div>
          </div>

          <div class="sub-status-line">
            <template v-if="tracker.status === 'complete'">
              <CheckCircle :size="14" stroke-width="2" class="sub-status-icon sub-icon-complete" />
              <span class="sub-status-text sub-text-complete">Bonus earned — {{ formatCurrency(tracker.dollarValue) }} value</span>
            </template>
            <template v-else-if="tracker.status === 'active'">
              <Clock :size="14" stroke-width="2" class="sub-status-icon sub-icon-active" />
              <span class="sub-status-text sub-text-active">{{ tracker.daysLeft }} days left — spend {{ formatCurrency(tracker.dailyNeeded) }}/day</span>
            </template>
            <template v-else-if="tracker.status === 'expired'">
              <AlertTriangle :size="14" stroke-width="2" class="sub-status-icon sub-icon-expired" />
              <span class="sub-status-text sub-text-expired">Deadline passed — bonus missed</span>
            </template>
            <template v-else>
              <Circle :size="14" stroke-width="2" class="sub-status-icon sub-icon-notstarted" />
              <span class="sub-status-text sub-text-notstarted">Not started — {{ formatCurrency(tracker.spendRequired) }} to spend in {{ tracker.daysLeft }} days</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Summary Bar -->
      <div class="sub-summary">
        <div class="sub-summary-stat">
          <span class="sub-summary-label">Total Bonus Value</span>
          <span class="sub-summary-value">{{ formatCurrency(totalSubValue) }}</span>
        </div>
        <div class="sub-summary-stat">
          <span class="sub-summary-label">Earned So Far</span>
          <span class="sub-summary-value sub-summary-earned">{{ formatCurrency(earnedSubValue) }}</span>
        </div>
        <div class="sub-summary-stat">
          <span class="sub-summary-label">Remaining</span>
          <span class="sub-summary-value">{{ formatCurrency(totalSubValue - earnedSubValue) }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { CheckCircle, Clock, AlertTriangle, Circle } from 'lucide-vue-next'

defineProps({
  signupBonusTracker: { type: Array, default: () => [] },
  totalSubValue: { type: Number, default: 0 },
  earnedSubValue: { type: Number, default: 0 },
})

const { formatCurrency } = inject('helpers')
</script>

<style scoped>
.sub-wrap { animation: viewFadeIn 0.2s ease-out; }

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

.sub-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-card {
  padding: 18px 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
}

.sub-status-active { border-color: rgba(59, 130, 246, 0.25); }
.sub-status-complete { border-color: rgba(20, 184, 166, 0.25); }
.sub-status-expired { border-color: rgba(239, 68, 68, 0.2); opacity: 0.7; }
.sub-status-not-started { border-color: var(--border-glass); }

.sub-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.sub-card-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sub-card-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.sub-card-issuer {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.sub-bonus-badge {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(234, 179, 8, 0.1);
  color: #EAB308;
  flex-shrink: 0;
}

.sub-progress-wrap { margin-bottom: 10px; }

.sub-progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.sub-progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.sub-fill-active { background: var(--accent-blue); }
.sub-fill-complete { background: var(--accent-teal); }
.sub-fill-expired { background: var(--negative); }
.sub-fill-not-started { background: var(--text-tertiary); }

.sub-progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.sub-pct {
  font-weight: 700;
  color: var(--text-primary);
}

.sub-status-line {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.sub-status-icon { flex-shrink: 0; }

.sub-icon-complete { color: var(--accent-teal); }
.sub-icon-active { color: var(--accent-blue); }
.sub-icon-expired { color: var(--negative); }
.sub-icon-notstarted { color: var(--text-tertiary); }

.sub-status-text {
  font-size: 0.78rem;
  font-weight: 600;
}

.sub-text-complete { color: var(--accent-teal); }
.sub-text-active { color: var(--accent-blue); }
.sub-text-expired { color: var(--negative); }
.sub-text-notstarted { color: var(--text-tertiary); }

.sub-summary {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding: 16px 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
}

.sub-summary-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sub-summary-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
}

.sub-summary-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
}

.sub-summary-earned { color: var(--accent-teal); }

@media (max-width: 768px) {
  .sub-summary {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
