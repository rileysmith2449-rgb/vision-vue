<template>
  <div class="score-banner">
    <div class="score-ring-wrap">
      <svg class="score-ring" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-glass)" stroke-width="8" />
        <circle
          cx="60" cy="60" r="52"
          fill="none"
          stroke="var(--accent-teal)"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="`${circumference}`"
          :stroke-dashoffset="ringOffset"
          transform="rotate(-90 60 60)"
          class="score-progress"
        />
      </svg>
      <div class="score-number">
        <span class="score-value">{{ optimizationScore }}</span>
        <span class="score-label">Score</span>
      </div>
    </div>

    <div class="score-stats">
      <div class="score-stat">
        <span class="stat-label">{{ periodLabel }} Spend</span>
        <span class="stat-value">{{ formatCurrency(totalSpend) }}</span>
      </div>
      <div class="score-stat">
        <span class="stat-label">{{ showFutureState ? 'Optimized Rewards' : 'Optimal Rewards' }}</span>
        <span class="stat-value stat-teal">{{ formatCurrencyCents(totalOptimalRewards) }}</span>
      </div>
      <div class="score-stat" v-if="totalMissedRewards > 0 && !showFutureState">
        <span class="stat-label">Left on Table</span>
        <span class="stat-value stat-negative">{{ formatCurrencyCents(totalMissedRewards) }}</span>
      </div>
      <div class="score-stat" v-if="showFutureState && futureRewardsGain > 0">
        <span class="stat-label">Additional Gain</span>
        <span class="stat-value stat-teal">+{{ formatCurrencyCents(futureRewardsGain) }}</span>
      </div>
      <div class="score-stat">
        <span class="stat-label">Global Score</span>
        <span class="stat-value" :class="globalOptimizationScore >= 80 ? 'stat-teal' : globalOptimizationScore >= 50 ? '' : 'stat-negative'">{{ globalOptimizationScore }}%</span>
      </div>
      <div class="score-stat" v-if="signupBonusValue > 0">
        <span class="stat-label">Signup Bonuses</span>
        <span class="stat-value stat-teal">{{ formatCurrency(signupBonusValue) }}</span>
      </div>
    </div>

    <div class="banner-right">
      <div class="period-toggle">
        <button
          v-for="p in periods"
          :key="p.key"
          :class="['period-btn', { active: selectedPeriod === p.key }]"
          @click="$emit('update:selectedPeriod', p.key)"
        >{{ p.label }}</button>
      </div>
      <div class="card-filter-toggle">
        <button :class="['filter-btn', { active: cardFilter === 'all' }]" @click="$emit('update:cardFilter', 'all')">All</button>
        <button :class="['filter-btn', { active: cardFilter === 'personal' }]" @click="$emit('update:cardFilter', 'personal')">Personal</button>
        <button :class="['filter-btn', { active: cardFilter === 'business' }]" @click="$emit('update:cardFilter', 'business')">Business</button>
      </div>
      <div class="future-toggle">
        <label class="toggle-switch">
          <input type="checkbox" :checked="showFutureState" @change="$emit('update:showFutureState', $event.target.checked)" />
          <span class="toggle-slider"></span>
        </label>
        <span class="future-label">{{ showFutureState ? 'Optimized' : 'Current' }}</span>
      </div>
      <button class="manage-btn" @click="$emit('manage-cards')">
        <Settings :size="16" stroke-width="2" />
        Manage Cards
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { Settings } from 'lucide-vue-next'

const props = defineProps({
  optimizationScore: { type: Number, default: 100 },
  globalOptimizationScore: { type: Number, default: 100 },
  totalSpend: { type: Number, default: 0 },
  totalOptimalRewards: { type: Number, default: 0 },
  totalMissedRewards: { type: Number, default: 0 },
  futureRewardsGain: { type: Number, default: 0 },
  signupBonusValue: { type: Number, default: 0 },
  showFutureState: { type: Boolean, default: false },
  selectedPeriod: { type: String, default: '3m' },
  cardFilter: { type: String, default: 'all' },
  periodLabel: { type: String, default: '' },
  periods: { type: Array, default: () => [] },
})

defineEmits(['update:selectedPeriod', 'update:cardFilter', 'update:showFutureState', 'manage-cards'])

const { formatCurrency, formatCurrencyCents } = inject('helpers')

const circumference = 2 * Math.PI * 52
const ringOffset = computed(() => {
  const pct = (100 - props.optimizationScore) / 100
  return circumference * pct
})
</script>

<style scoped>
.score-banner {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 28px 32px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  margin-bottom: 24px;
}

.score-ring-wrap {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.score-ring { width: 100%; height: 100%; }

.score-progress { transition: stroke-dashoffset 0.6s ease; }

.score-number {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent-teal);
  line-height: 1;
}

.score-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 2px;
}

.score-stats {
  flex: 1;
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.score-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-teal { color: var(--accent-teal); }
.stat-negative { color: var(--negative); }

.banner-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  flex-shrink: 0;
}

.period-toggle {
  display: flex;
  gap: 2px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 3px;
}

.period-btn {
  padding: 5px 14px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-btn:hover { color: var(--text-primary); }
.period-btn.active { background: var(--accent-blue); color: #fff; }

.card-filter-toggle {
  display: flex;
  gap: 2px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 3px;
}

.filter-btn {
  padding: 5px 12px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover { color: var(--text-primary); }
.filter-btn.active { background: var(--accent-teal); color: #fff; }

.manage-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
  background: var(--bg-subtle);
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.manage-btn:hover {
  background: var(--bg-elevated);
  border-color: var(--border-focus);
}

.future-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.future-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  cursor: pointer;
}

.toggle-switch input { opacity: 0; width: 0; height: 0; }

.toggle-slider {
  position: absolute;
  inset: 0;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: 10px;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  left: 2px;
  bottom: 2px;
  background: var(--text-tertiary);
  border-radius: 50%;
  transition: transform 0.2s ease, background 0.2s ease;
}

.toggle-switch input:checked + .toggle-slider {
  background: rgba(20, 184, 166, 0.15);
  border-color: var(--accent-teal);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(16px);
  background: var(--accent-teal);
}

@media (max-width: 768px) {
  .score-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;
  }

  .score-ring-wrap {
    width: 80px;
    height: 80px;
    align-self: center;
  }

  .score-stats {
    gap: 20px;
    width: 100%;
  }

  .banner-right {
    width: 100%;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .banner-right > * { width: 100%; }
  .manage-btn { justify-content: center; }
}
</style>
