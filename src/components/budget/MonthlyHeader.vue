<template>
  <div class="monthly-header">
    <div class="month-nav">
      <button class="nav-btn" @click="prevMonth">
        <ChevronLeft :size="20" stroke-width="2" />
      </button>
      <h2 class="month-name">{{ monthName }}</h2>
      <button class="nav-btn" @click="nextMonth">
        <ChevronRight :size="20" stroke-width="2" />
      </button>
    </div>

    <div class="budget-totals">
      <div class="total-item">
        <span class="total-label">Spent</span>
        <span class="total-value">{{ formatCurrency(spent) }}</span>
      </div>
      <div class="total-divider">/</div>
      <div class="total-item">
        <span class="total-label">Budget</span>
        <span class="total-value">{{ formatCurrency(budget) }}</span>
      </div>
      <div class="total-remaining" :class="{ over: remaining < 0 }">
        {{ remaining >= 0 ? formatCurrency(remaining) + ' left' : formatCurrency(Math.abs(remaining)) + ' over' }}
      </div>
    </div>

    <ProgressBar
      :value="percentage"
      :show-percent="true"
      :label="remaining < 0 ? 'Over budget!' : 'Budget used'"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ProgressBar from '@/components/common/ProgressBar.vue'

const props = defineProps({
  spent: { type: Number, required: true },
  budget: { type: Number, required: true }
})

const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

const monthName = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const remaining = computed(() => props.budget - props.spent)
const percentage = computed(() => (props.spent / props.budget) * 100)

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}
</script>

<style scoped>
.monthly-header {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
  padding: 24px;
  margin-bottom: 24px;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  border-color: var(--electric-teal);
  color: var(--electric-teal);
}

.month-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  min-width: 180px;
  text-align: center;
}

.budget-totals {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 18px;
}

.total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.total-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.total-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
}

.total-divider {
  font-size: 1.2rem;
  color: var(--text-tertiary);
  margin-top: 12px;
}

.total-remaining {
  margin-left: 8px;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  background: rgba(0, 230, 138, 0.12);
  color: var(--electric-teal);
  margin-top: 12px;
}

.total-remaining.over {
  background: rgba(244, 91, 105, 0.12);
  color: var(--persimmon);
}

@media (max-width: 1024px) {
  .monthly-header {
    padding: 18px;
  }

  .total-value {
    font-size: 1.1rem;
  }

  .month-name {
    font-size: 1.05rem;
    min-width: 140px;
  }
}
</style>
