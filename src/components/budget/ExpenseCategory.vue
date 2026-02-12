<template>
  <div class="expense-category" :class="{ expanded }">
    <div class="expense-header" @click="toggle">
      <div class="expense-left">
        <div class="expense-icon-wrap">
          <component :is="categoryIcon" :size="18" stroke-width="1.8" />
        </div>
        <div class="expense-info">
          <h4 class="expense-name">{{ name }}</h4>
          <span class="expense-summary">
            {{ formatCurrency(spent) }} / {{ formatCurrency(data.budget) }}
          </span>
        </div>
      </div>
      <div class="expense-right">
        <ProgressBar :value="percentage" :show-percent="true" />
        <ChevronDown :size="16" stroke-width="2" :class="['expand-icon', { rotated: expanded }]" />
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
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Film,
  Plane,
  Zap,
  ChevronDown
} from 'lucide-vue-next'
import ProgressBar from '@/components/common/ProgressBar.vue'

const props = defineProps({
  name: { type: String, required: true },
  data: { type: Object, required: true }
})

const budgetStore = useBudgetStore()
const expanded = ref(false)

const iconMap = {
  'Dining & Food': UtensilsCrossed,
  'Transportation': Car,
  'Shopping': ShoppingBag,
  'Entertainment': Film,
  'Travel': Plane,
  'Bills & Utilities': Zap
}

const categoryIcon = computed(() => iconMap[props.name] || ShoppingBag)

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
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  overflow: hidden;
  transition: all 0.2s ease;
}

.expense-category.expanded {
  border-color: var(--border-focus);
}

.expense-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.expense-header:hover {
  background: var(--bg-subtle);
}

.expense-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.expense-icon-wrap {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.expense-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.expense-summary {
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

.expense-right {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 180px;
}

.expand-icon {
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.expense-details {
  padding: 0 20px 20px;
  border-top: 1px solid var(--border-glass);
}

.subcategory {
  padding-top: 16px;
}

.subcategory-name {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.transaction {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
}

.tx-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.tx-merchant {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
}

.tx-card {
  font-size: 0.68rem;
  color: var(--text-tertiary);
}

.tx-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.tx-amount {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tx-date {
  font-size: 0.68rem;
  color: var(--text-tertiary);
}

@media (max-width: 1024px) {
  .expense-right {
    min-width: 120px;
  }
}
</style>
