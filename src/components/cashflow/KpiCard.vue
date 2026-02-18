<template>
  <div class="kpi-card">
    <div class="kpi-top">
      <span class="kpi-icon">{{ icon }}</span>
      <span v-if="delta !== undefined" class="kpi-delta" :class="delta >= 0 ? 'pos' : 'neg'">
        {{ delta >= 0 ? '▲' : '▼' }} {{ formatCurrency(Math.abs(delta)) }}
      </span>
    </div>
    <div class="kpi-value" :class="{ 'value-pos': positive === true, 'value-neg': positive === false }">
      {{ type === 'currency' ? formatCurrency(value) : value }}
    </div>
    <div class="kpi-label">{{ label }}</div>
  </div>
</template>

<script setup>
defineProps({
  label:    { type: String,  required: true },
  value:    { type: Number,  required: true },
  type:     { type: String,  default: 'currency' },
  icon:     { type: String,  default: '' },
  delta:    { type: Number,  default: undefined },
  positive: { type: Boolean, default: undefined },
})

function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}
</script>

<style scoped>
.kpi-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 1.1rem;
}
.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}
.kpi-icon { font-size: 1.25rem; }
.kpi-delta {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
}
.kpi-delta.pos { background: rgba(52,211,153,0.15); color: #34d399; }
.kpi-delta.neg { background: rgba(248,113,113,0.15); color: #f87171; }

.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1;
  margin-bottom: 0.35rem;
}
.kpi-value.value-pos { color: #34d399; }
.kpi-value.value-neg { color: #f87171; }

.kpi-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
