<template>
  <div class="asset-group" :class="{ expanded }">
    <div class="group-header" @click="expanded = !expanded">
      <div class="group-left">
        <span class="group-icon">{{ icon }}</span>
        <div class="group-info">
          <span class="group-name">{{ category }}</span>
          <span class="group-count">{{ holdings.length }} holding{{ holdings.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
      <div class="group-right">
        <span class="group-total">{{ formatCurrency(total) }}</span>
        <ChevronDown :size="16" stroke-width="2" :class="['expand-icon', { rotated: expanded }]" />
      </div>
    </div>

    <div v-if="expanded" class="group-details">
      <router-link
        v-for="h in holdings"
        :key="h.id"
        :to="'/net-worth/' + encodeURIComponent(category)"
        class="holding-row"
      >
        <div class="holding-info">
          <span class="holding-symbol">{{ h.symbol }}</span>
          <span class="holding-shares">{{ h.type === 'cash' ? '' : h.shares + ' shares' }}</span>
        </div>
        <div class="holding-right">
          <span class="holding-value">{{ formatCurrency(h.currentValue) }}</span>
          <span
            class="holding-gain"
            :class="{ positive: h.currentValue >= h.costBasis, negative: h.currentValue < h.costBasis }"
          >{{ h.type === 'cash' ? '' : formatGain(h) }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { formatCurrency } from '@/utils/formatters'

defineProps({
  category: { type: String, required: true },
  holdings: { type: Array, required: true },
  total: { type: Number, required: true },
  icon: { type: String, default: '📊' }
})

const expanded = ref(false)

function formatGain(h) {
  const gain = h.currentValue - h.costBasis
  const pct = h.costBasis > 0 ? ((gain / h.costBasis) * 100).toFixed(1) : '0.0'
  const sign = gain >= 0 ? '+' : ''
  return `${sign}${formatCurrency(gain)} (${sign}${pct}%)`
}
</script>

<style scoped>
.asset-group {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  overflow: hidden;
  transition: all 0.2s ease;
}

.asset-group.expanded {
  border-color: rgba(100, 149, 237, 0.2);
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.group-header:hover {
  background: var(--bg-subtle);
}

.group-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-icon {
  font-size: 1.3rem;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.group-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
}

.group-count {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.group-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-total {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.expand-icon {
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.group-details {
  border-top: 1px solid var(--border-glass);
  padding: 8px 20px 16px;
}

.holding-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: background 0.15s ease;
}

.holding-row:hover {
  background: var(--bg-subtle);
}

.holding-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.holding-symbol {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.holding-shares {
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.holding-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.holding-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.holding-gain {
  font-size: 0.7rem;
  font-weight: 500;
}

.holding-gain.positive {
  color: var(--electric-teal);
}

.holding-gain.negative {
  color: var(--persimmon);
}
</style>
