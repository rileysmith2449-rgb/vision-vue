<template>
  <div class="timeline">
    <div v-if="!events.length" class="empty">No events in the next 14 days</div>

    <div
      v-for="event in events"
      :key="event.label + event.date"
      class="timeline-row"
    >
      <div class="event-dot" :class="event.type"></div>
      <div class="event-info">
        <span class="event-label">{{ event.label }}</span>
        <span class="event-date">{{ daysUntilLabel(event.date) }}</span>
      </div>
      <div class="event-amount" :class="event.type">
        {{ event.type === 'income' ? '+' : '-' }}{{ formatCurrency(event.amount) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { daysUntilLabel } from '../../utils/cashflowEngine.js'

defineProps({
  events: { type: Array, default: () => [] }
})

function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}
</script>

<style scoped>
.timeline { display: flex; flex-direction: column; gap: 0.65rem; }

.empty {
  color: #475569;
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem 0;
}

.timeline-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.timeline-row:last-child { border-bottom: none; }

.event-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.event-dot.income  { background: #34d399; }
.event-dot.expense { background: #f87171; }
.event-dot.planned { background: #fbbf24; }

.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.event-label { font-size: 0.875rem; color: #cbd5e1; font-weight: 500; }
.event-date  { font-size: 0.75rem; color: #475569; }

.event-amount {
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}
.event-amount.income  { color: #34d399; }
.event-amount.expense { color: #f87171; }
.event-amount.planned { color: #fbbf24; }
</style>
