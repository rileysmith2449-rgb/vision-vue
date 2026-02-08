<template>
  <div class="expense-category" :class="{ expanded }">
    <div class="expense-header" @click="toggle">
      <div class="expense-left">
        <span class="expense-icon">{{ data.icon }}</span>
        <div class="expense-info">
          <h4 class="expense-name">{{ name }}</h4>
          <span class="expense-summary">
            {{ formatCurrency(spent) }} / {{ formatCurrency(data.budget) }}
          </span>
        </div>
      </div>
      <div class="expense-right">
        <ProgressBar :value="percentage" :show-percent="true" />
        <span class="expand-icon">{{ expanded ? '▾' : '▸' }}</span>
      </div>
    </div>

    <div v-if="expanded" class="expense-details">
      <div v-for="(transactions, subName) in data.subcategories" :key="subName" class="subcategory">
        <h5 class="subcategory-name">{{ subName }}</h5>
        <div class="transaction-list">
          <div v-for="(tx, i) in transactions" :key="i" class="transaction">
            <div class="tx-info">
              <span class="tx-merchant">{{ tx.merchant }}</span>
              <span class="tx-card">{{ tx.card }}</span>
            </div>
            <div class="tx-right">
              <span class="tx-amount">{{ formatCurrency(tx.amount) }}</span>
              <span class="tx-date">{{ tx.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import { useBudgetStore } from '@/stores/budget'
import ProgressBar from '@/components/common/ProgressBar.vue'

const props = defineProps({
  name: { type: String, required: true },
  data: { type: Object, required: true }
})

const budgetStore = useBudgetStore()
const expanded = ref(false)

const spent = computed(() => {
  let total = 0
  Object.values(props.data.subcategories).forEach(transactions => {
    total += transactions.reduce((sum, t) => sum + t.amount, 0)
  })
  return total
})

const percentage = computed(() => (spent.value / props.data.budget) * 100)

function toggle() {
  expanded.value = !expanded.value
  if (expanded.value) {
    budgetStore.setCurrentCategory(props.name)
  }
}
</script>

<style scoped>
.expense-category {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 16px;
  box-shadow: var(--shadow-glass);
  overflow: hidden;
  transition: all 0.3s ease;
}

.expense-category.expanded {
  border-color: var(--electric-teal);
}

.expense-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.expense-header:hover {
  background: rgba(135, 206, 235, 0.05);
}

.expense-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.expense-icon {
  font-size: 1.5rem;
}

.expense-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.expense-summary {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.expense-right {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 180px;
}

.expand-icon {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.expense-details {
  padding: 0 24px 20px;
  border-top: 1px solid var(--border-glass);
}

.subcategory {
  padding-top: 16px;
}

.subcategory-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transaction {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(135, 206, 235, 0.05);
  border-radius: 10px;
}

.tx-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tx-merchant {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.tx-card {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.tx-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tx-amount {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tx-date {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .expense-right {
    min-width: 120px;
  }
}
</style>
