<template>
  <div class="bill-list">
    <div v-if="!expenses.length" class="empty">No recurring bills added yet</div>

    <div
      v-for="exp in expenses"
      :key="exp.id"
      class="bill-row"
      @mouseenter="hovered = exp.id"
      @mouseleave="hovered = null"
    >
      <div class="category-icon">{{ categoryIcon(exp.category) }}</div>
      <div class="bill-info">
        <span class="bill-label">{{ exp.label }}</span>
        <span class="bill-sub">Due {{ ordinal(exp.dueDay) }} · {{ exp.category }}</span>
      </div>
      <div class="bill-right">
        <span class="bill-amount">{{ formatCurrency(exp.amount) }}</span>
        <button
          v-if="hovered === exp.id"
          class="remove-btn"
          @click="$emit('remove', exp.id)"
          title="Remove"
        >✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ expenses: { type: Array, default: () => [] } })
defineEmits(['remove'])

const hovered = ref(null)

function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v)
}

function ordinal(n) {
  const s = ['th','st','nd','rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function categoryIcon(cat) {
  const icons = {
    housing: '🏠', utilities: '⚡', subscription: '📺', insurance: '🛡️',
    health: '💪', auto: '🚗', food: '🍔', debt: '💳', shopping: '🛍️', other: '📌'
  }
  return icons[cat] || icons.other
}
</script>

<style scoped>
.bill-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 320px; overflow-y: auto; }

.empty {
  color: #475569;
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem 0;
}

.bill-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.5rem;
  border-radius: 8px;
  transition: background 0.15s;
}
.bill-row:hover { background: rgba(255,255,255,0.04); }

.category-icon { font-size: 1.1rem; width: 28px; text-align: center; }

.bill-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.bill-label { font-size: 0.875rem; color: #cbd5e1; font-weight: 500; }
.bill-sub   { font-size: 0.72rem; color: #475569; text-transform: capitalize; }

.bill-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.bill-amount { font-size: 0.875rem; color: #f1f5f9; font-weight: 600; }

.remove-btn {
  background: rgba(248,113,113,0.15);
  border: none;
  color: #f87171;
  font-size: 0.7rem;
  width: 20px; height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.remove-btn:hover { background: rgba(248,113,113,0.3); }
</style>
