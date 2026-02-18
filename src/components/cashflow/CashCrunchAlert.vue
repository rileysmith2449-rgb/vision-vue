<template>
  <div class="crunch-alert">
    <span class="crunch-icon">⚠️</span>
    <div class="crunch-body">
      <strong>Cash Crunch Risk</strong>
      <span>
        Your balance is projected to drop to
        <strong>{{ formatCurrency(day.balance) }}</strong>
        around <strong>{{ formatDate(day.date) }}</strong>.
        Consider moving a planned expense or adjusting spending.
      </span>
    </div>
    <button class="dismiss" @click="$emit('dismiss')">✕</button>
  </div>
</template>

<script setup>
defineProps({
  day: { type: Object, required: true }  // { balance, date }
})
defineEmits(['dismiss'])

function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}
function formatDate(str) {
  return new Date(str + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.crunch-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: rgba(251,191,36,0.1);
  border: 1px solid rgba(251,191,36,0.3);
  border-radius: 12px;
  padding: 1rem 1.1rem;
  color: #fcd34d;
}
.crunch-icon { font-size: 1.25rem; flex-shrink: 0; }
.crunch-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.875rem;
  line-height: 1.5;
}
.crunch-body strong { color: #fde68a; }
.dismiss {
  background: transparent;
  border: none;
  color: #92400e;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0 0.25rem;
}
</style>
