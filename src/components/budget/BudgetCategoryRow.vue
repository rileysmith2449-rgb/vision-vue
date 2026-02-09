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
            <button
              class="reclassify-btn"
              title="Reclassify transaction"
              @click.stop="openReclassify(subName, i, $event)"
            >
              <ArrowRightLeft :size="14" stroke-width="2" />
            </button>

            <Teleport to="body">
              <div
                v-if="reclassifyTarget && reclassifyTarget.subName === subName && reclassifyTarget.index === i"
                ref="dropdownRef"
                class="reclassify-dropdown"
                :style="dropdownStyle"
                @click.stop
              >
                <div class="dropdown-title">Move to...</div>
                <template v-for="opt in budgetStore.categoryOptions" :key="opt.category">
                  <template v-if="opt.category !== name || opt.subcategories.length > 1">
                    <div class="dropdown-category">{{ opt.category }}</div>
                    <button
                      v-for="sub in opt.subcategories"
                      :key="sub"
                      class="dropdown-item"
                      :class="{ disabled: opt.category === name && sub === subName }"
                      :disabled="opt.category === name && sub === subName"
                      @click="doReclassify(opt.category, sub)"
                    >
                      {{ sub }}
                    </button>
                  </template>
                </template>
              </div>
            </Teleport>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import { useBudgetStore } from '@/stores/budget'
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Film,
  Plane,
  Zap,
  ChevronDown,
  ArrowRightLeft,
  Monitor,
  Satellite,
  Utensils
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
const dropdownRef = ref(null)

// Reclassify state
const reclassifyTarget = ref(null)
const dropdownStyle = ref({})

const iconMap = {
  'Dining & Food': UtensilsCrossed,
  'Transportation': Car,
  'Shopping': ShoppingBag,
  'Entertainment': Film,
  'Travel': Plane,
  'Bills & Utilities': Zap,
  'Office & Software': Monitor,
  'Meals & Entertainment': Utensils,
  'Internet & Phone': Satellite
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

function openReclassify(subName, index, event) {
  if (reclassifyTarget.value?.subName === subName && reclassifyTarget.value?.index === index) {
    reclassifyTarget.value = null
    return
  }

  const rect = event.currentTarget.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    right: `${window.innerWidth - rect.right}px`,
    zIndex: 1000
  }
  reclassifyTarget.value = { subName, index }
}

function doReclassify(toCategory, toSub) {
  if (!reclassifyTarget.value) return
  budgetStore.reclassifyTransaction(
    props.name,
    reclassifyTarget.value.subName,
    reclassifyTarget.value.index,
    toCategory,
    toSub
  )
  reclassifyTarget.value = null
}

function handleClickOutside(e) {
  if (reclassifyTarget.value && !e.target.closest('.reclassify-dropdown') && !e.target.closest('.reclassify-btn')) {
    reclassifyTarget.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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
  align-items: center;
  padding: 10px 14px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
  gap: 8px;
}

.tx-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
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

/* Reclassify button */
.reclassify-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.reclassify-btn:hover {
  background: rgba(0, 230, 138, 0.1);
  color: var(--electric-teal);
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

<style>
/* Teleported dropdown — must be unscoped */
.reclassify-dropdown {
  width: 220px;
  max-height: 320px;
  overflow-y: auto;
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 8px 0;
}

.reclassify-dropdown .dropdown-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 6px 14px 8px;
}

.reclassify-dropdown .dropdown-category {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--electric-teal);
  padding: 8px 14px 4px;
  border-top: 1px solid var(--border-glass);
}

.reclassify-dropdown .dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 14px 6px 24px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.1s ease;
}

.reclassify-dropdown .dropdown-item:hover:not(.disabled) {
  background: var(--bg-subtle);
}

.reclassify-dropdown .dropdown-item.disabled {
  color: var(--text-tertiary);
  cursor: default;
  opacity: 0.5;
}
</style>
