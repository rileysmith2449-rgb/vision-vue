<template>
  <div class="category-row" :class="{ expanded }">
    <div class="row-header" @click="toggle">
      <div class="row-left">
        <div class="row-icon">
          <component :is="categoryIcon" :size="18" stroke-width="1.8" />
        </div>
        <span class="row-name">{{ name }}</span>
      </div>

      <div class="row-center">
        <ProgressBar :value="percentage" />
      </div>

      <div class="row-right">
        <span class="row-spent" :class="{ over: isOver }">{{ formatCurrency(spent) }}</span>
        <span class="row-sep">/</span>
        <span
          v-if="!editing"
          class="row-budget"
          @click.stop="startEdit"
        >{{ formatCurrency(data.budget) }}</span>
        <input
          v-else
          ref="editInput"
          type="number"
          class="budget-input"
          :value="data.budget"
          @blur="saveEdit"
          @keydown.enter="saveEdit"
          @keydown.escape="cancelEdit"
          @click.stop
        />
        <ChevronDown :size="16" stroke-width="2" :class="['expand-icon', { rotated: expanded }]" />
      </div>
    </div>

    <div v-if="expanded" class="row-details">
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
import { ref, computed, nextTick } from 'vue'
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

const emit = defineEmits(['update-budget'])

const budgetStore = useBudgetStore()
const expanded = ref(false)
const editing = ref(false)
const editInput = ref(null)

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
const isOver = computed(() => spent.value > props.data.budget)

function toggle() {
  expanded.value = !expanded.value
  if (expanded.value) {
    budgetStore.setCurrentCategory(props.name)
  }
}

async function startEdit() {
  editing.value = true
  await nextTick()
  editInput.value?.focus()
  editInput.value?.select()
}

function saveEdit(e) {
  const val = Number(e.target.value)
  if (val > 0 && val !== props.data.budget) {
    emit('update-budget', props.name, val)
  }
  editing.value = false
}

function cancelEdit() {
  editing.value = false
}
</script>

<style scoped>
.category-row {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  overflow: hidden;
  transition: all 0.2s ease;
}

.category-row.expanded {
  border-color: rgba(0, 230, 138, 0.2);
}

.row-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.row-header:hover {
  background: var(--bg-subtle);
}

.row-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 160px;
}

.row-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.row-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.row-center {
  flex: 1;
  min-width: 100px;
}

.row-right {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 150px;
  justify-content: flex-end;
}

.row-spent {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
}

.row-spent.over {
  color: var(--persimmon);
}

.row-sep {
  color: var(--text-tertiary);
  font-size: 0.82rem;
}

.row-budget {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  transition: background 0.15s ease;
}

.row-budget:hover {
  background: rgba(0, 230, 138, 0.1);
  color: var(--electric-teal);
}

.budget-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid var(--electric-teal);
  border-radius: 6px;
  background: var(--bg-subtle);
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  outline: none;
  -moz-appearance: textfield;
}

.budget-input::-webkit-outer-spin-button,
.budget-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.expand-icon {
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
  flex-shrink: 0;
  margin-left: 4px;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.row-details {
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
  .row-header {
    flex-wrap: wrap;
    gap: 10px;
  }

  .row-left {
    min-width: auto;
  }

  .row-center {
    order: 3;
    width: 100%;
    min-width: auto;
  }

  .row-right {
    min-width: auto;
    margin-left: auto;
  }
}
</style>
