<!-- PlannedExpenseList.vue -->
<template>
  <div class="planned-list">
    <div v-if="!expenses.length" class="empty">
      No planned expenses yet — add upcoming trips, repairs, or purchases.
    </div>

    <div
      v-for="exp in sortedExpenses"
      :key="exp.id"
      class="planned-row"
      @mouseenter="hovered = exp.id"
      @mouseleave="hovered = null"
    >
      <div class="planned-icon">{{ categoryIcon(exp.category) }}</div>
      <div class="planned-info">
        <span class="planned-label">{{ exp.label }}</span>
        <span class="planned-date">{{ formatDate(exp.date) }} · {{ daysUntilLabel(exp.date) }}</span>
      </div>
      <div class="planned-right">
        <span class="planned-amount">{{ formatCurrency(exp.amount) }}</span>
        <button
          v-if="hovered === exp.id"
          class="remove-btn"
          @click="$emit('remove', exp.id)"
        >✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { daysUntilLabel } from '../../utils/cashflowEngine.js'

const props = defineProps({ expenses: { type: Array, default: () => [] } })
defineEmits(['remove'])

const hovered = ref(null)

const sortedExpenses = computed(() =>
  [...props.expenses].sort((a, b) => a.date.localeCompare(b.date))
)

function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}

function formatDate(str) {
  return new Date(str + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function categoryIcon(cat) {
  const icons = {
    travel: '✈️', auto: '🚗', health: '💊', home: '🏠',
    shopping: '🛍️', food: '🍽️', other: '📌'
  }
  return icons[cat] || icons.other
}
</script>

<style scoped>
.planned-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
}
.empty {
  color: #475569;
  font-size: 0.85rem;
  padding: 0.75rem 0;
  grid-column: 1 / -1;
}
.planned-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 0.75rem;
  transition: border-color 0.15s;
}
.planned-row:hover { border-color: rgba(251,191,36,0.25); }
.planned-icon { font-size: 1.25rem; }
.planned-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.planned-label { font-size: 0.875rem; color: #cbd5e1; font-weight: 500; }
.planned-date  { font-size: 0.72rem; color: #475569; }
.planned-right { display: flex; align-items: center; gap: 0.5rem; }
.planned-amount { font-size: 0.9rem; font-weight: 700; color: #fbbf24; }
.remove-btn {
  background: rgba(248,113,113,0.15);
  border: none;
  color: #f87171;
  font-size: 0.7rem;
  width: 20px; height: 20px;
  border-radius: 50%;
  cursor: pointer;
}
</style>
