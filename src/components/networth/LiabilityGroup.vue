<template>
  <div class="liability-group" :class="{ expanded }">
    <div class="group-header" @click="expanded = !expanded">
      <div class="group-left">
        <span class="group-icon">{{ icon }}</span>
        <div class="group-info">
          <span class="group-name">{{ category }}</span>
          <span class="group-count">{{ items.length }} account{{ items.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
      <div class="group-right">
        <span class="group-total liability-amount">{{ formatCurrency(total) }}</span>
        <ChevronDown :size="16" stroke-width="2" :class="['expand-icon', { rotated: expanded }]" />
      </div>
    </div>

    <div v-if="expanded" class="group-details">
      <div v-for="item in items" :key="item.id" class="liability-row">
        <div class="liability-info">
          <span class="liability-name">{{ item.name }}</span>
          <span class="liability-meta">{{ item.interestRate }}% APR &middot; {{ formatCurrency(item.monthlyPayment) }}/mo</span>
        </div>
        <div class="liability-right">
          <span class="liability-balance">{{ formatCurrency(item.balance) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { formatCurrency } from '@/utils/formatters'

defineProps({
  category: { type: String, required: true },
  items: { type: Array, required: true },
  total: { type: Number, required: true },
  icon: { type: String, default: '📋' }
})

const expanded = ref(false)
</script>

<style scoped>
.liability-group {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  overflow: hidden;
  transition: all 0.2s ease;
}

.liability-group.expanded {
  border-color: rgba(239, 68, 68, 0.2);
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

.liability-amount {
  color: #ef4444;
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

.liability-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
}

.liability-row:hover {
  background: var(--bg-subtle);
}

.liability-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.liability-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.liability-meta {
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.liability-right {
  text-align: right;
}

.liability-balance {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ef4444;
}
</style>
