<template>
  <div class="budget">
    <Header title="Budget" subtitle="Track spending and optimize your rewards" />

    <!-- Family mode: filter by member -->
    <div v-if="budgetStore.budgetMode === 'family'" class="member-filter">
      <button
        class="member-btn"
        :class="{ active: budgetStore.activeMember === 'all' }"
        @click="budgetStore.setActiveMember('all')"
      >
        All
      </button>
      <button
        class="member-btn owner-mine"
        :class="{ active: budgetStore.activeMember === 'mine' }"
        @click="budgetStore.setActiveMember('mine')"
      >
        {{ budgetStore.familyMembers.mine.name }}
      </button>
      <button
        class="member-btn owner-yours"
        :class="{ active: budgetStore.activeMember === 'yours' }"
        @click="budgetStore.setActiveMember('yours')"
      >
        {{ budgetStore.familyMembers.yours.name }}
      </button>
      <button
        class="member-btn owner-ours"
        :class="{ active: budgetStore.activeMember === 'ours' }"
        @click="budgetStore.setActiveMember('ours')"
      >
        Ours
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-card-icon income-icon">
          <DollarSign :size="18" stroke-width="2" />
        </div>
        <div class="summary-card-content">
          <span class="summary-card-label">Income</span>
          <span class="summary-card-value">{{ formatCurrency(budgetStore.monthlyNetIncome) }}</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-card-icon fixed-icon">
          <Lock :size="18" stroke-width="2" />
        </div>
        <div class="summary-card-content">
          <span class="summary-card-label">Fixed Expenses</span>
          <span class="summary-card-value">{{ formatCurrency(fixedExpenses) }}</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-card-icon variable-icon">
          <TrendingDown :size="18" stroke-width="2" />
        </div>
        <div class="summary-card-content">
          <span class="summary-card-label">Variable Expenses</span>
          <span class="summary-card-value">{{ formatCurrency(targetVariableExpenses) }}</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-card-icon savings-card-icon">
          <PiggyBank :size="18" stroke-width="2" />
        </div>
        <div class="summary-card-content">
          <span class="summary-card-label">Savings</span>
          <div class="savings-target-row">
            <span class="summary-card-value positive">
              {{ formatCurrency(targetSavings) }}
            </span>
            <div class="savings-pct-input-wrap">
              <input
                type="number"
                class="savings-pct-input"
                :value="savingsRate"
                min="0"
                max="80"
                step="1"
                @input="savingsRate = Math.min(80, Math.max(0, Number($event.target.value)))"
              />
              <span class="savings-pct-symbol">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <MonthlyHeader
      :spent="budgetStore.totalExpenses"
      :budget="budgetStore.monthlyBudget"
    />

    <BudgetBridgeChart class="budget-chart" />

    <!-- Fixed Expenses -->
    <div class="expense-group">
      <div class="expense-group-header" @click="fixedOpen = !fixedOpen">
        <div class="expense-group-left">
          <Lock :size="16" stroke-width="2" class="expense-group-icon fixed-color" />
          <span class="expense-group-title">Fixed Expenses</span>
          <span class="expense-group-count">{{ fixedCategories.length }}</span>
        </div>
        <div class="expense-group-right">
          <span class="expense-group-total">{{ formatCurrency(fixedExpenses) }}</span>
          <ChevronDown :size="16" stroke-width="2" :class="['expense-group-chevron', { rotated: fixedOpen }]" />
        </div>
      </div>
      <div v-if="fixedOpen" class="expense-list">
        <BudgetCategoryRow
          v-for="[name, data] in fixedCategories"
          :key="name"
          :name="name"
          :data="data"
          @update-budget="budgetStore.updateCategoryBudget"
        />
      </div>
    </div>

    <!-- Variable Expenses -->
    <div class="expense-group">
      <div class="expense-group-header" @click="variableOpen = !variableOpen">
        <div class="expense-group-left">
          <TrendingDown :size="16" stroke-width="2" class="expense-group-icon variable-color" />
          <span class="expense-group-title">Variable Expenses</span>
          <span class="expense-group-count">{{ variableCategories.length }}</span>
        </div>
        <div class="expense-group-right">
          <span class="expense-group-total">{{ formatCurrency(variableExpenses) }}</span>
          <ChevronDown :size="16" stroke-width="2" :class="['expense-group-chevron', { rotated: variableOpen }]" />
        </div>
      </div>
      <div v-if="variableOpen" class="expense-list">
        <BudgetCategoryRow
          v-for="[name, data] in variableCategories"
          :key="name"
          :name="name"
          :data="data"
          @update-budget="budgetStore.updateCategoryBudget"
        />
      </div>
    </div>

    <div class="savings-row" :class="{ negative: budgetStore.monthlySavings < 0 }">
      <div class="savings-left">
        <div class="savings-icon">
          <PiggyBank :size="20" stroke-width="1.8" />
        </div>
        <span class="savings-label">Monthly Savings</span>
      </div>
      <div class="savings-math">
        <span class="savings-net">{{ formatCurrency(budgetStore.monthlyNetIncome) }}</span>
        <span class="savings-op">&minus;</span>
        <span class="savings-expenses">{{ formatCurrency(budgetStore.totalExpenses) }}</span>
        <span class="savings-op">=</span>
        <span class="savings-result" :class="{ negative: budgetStore.monthlySavings < 0 }">
          {{ formatCurrency(budgetStore.monthlySavings) }}
        </span>
        <span class="savings-pct" :class="{ negative: budgetStore.monthlySavings < 0 }">
          ({{ budgetStore.grossIncome > 0 ? ((budgetStore.monthlySavings / (budgetStore.grossIncome / 12)) * 100).toFixed(1) : '0' }}% of gross)
        </span>
      </div>
    </div>

    <CreditCardSection />
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { formatCurrency } from '@/utils/formatters'
import Header from '@/components/layout/Header.vue'
import MonthlyHeader from '@/components/budget/MonthlyHeader.vue'
import BudgetCategoryRow from '@/components/budget/BudgetCategoryRow.vue'
import CreditCardSection from '@/components/budget/CreditCardSection.vue'
import BudgetBridgeChart from '@/components/charts/BudgetBridgeChart.vue'
import { PiggyBank, DollarSign, Lock, TrendingDown, ChevronDown } from 'lucide-vue-next'

const budgetStore = useBudgetStore()

const FIXED_CATEGORIES = ['Housing & Rent', 'Bills & Utilities', 'Internet & Phone']

const fixedExpenses = computed(() => {
  const expenses = budgetStore.categoryExpenses
  let total = 0
  for (const [name, data] of Object.entries(expenses)) {
    if (FIXED_CATEGORIES.includes(name)) total += data.total
  }
  return total
})

const variableExpenses = computed(() => {
  return budgetStore.totalExpenses - fixedExpenses.value
})

const fixedOpen = ref(true)
const variableOpen = ref(true)

const fixedCategories = computed(() => {
  return Object.entries(budgetStore.expenses).filter(([name]) => FIXED_CATEGORIES.includes(name))
})

const variableCategories = computed(() => {
  return Object.entries(budgetStore.expenses).filter(([name]) => !FIXED_CATEGORIES.includes(name))
})

const savingsRate = ref(20)

const targetSavings = computed(() => {
  return budgetStore.monthlyNetIncome * (savingsRate.value / 100)
})

const targetVariableExpenses = computed(() => {
  return Math.max(0, budgetStore.monthlyNetIncome - fixedExpenses.value - targetSavings.value)
})

onMounted(() => {
  if (Object.keys(budgetStore.expenses).length === 0) {
    budgetStore.loadExpenses()
  }
  budgetStore.loadHistoricalData()
})
</script>

<style scoped>
.budget {
  max-width: 1200px;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
}

.summary-card.summary-negative {
  border-color: rgba(255, 99, 71, 0.2);
}

.summary-card-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.income-icon {
  background: rgba(0, 230, 138, 0.1);
  color: var(--electric-teal);
}

.fixed-icon {
  background: rgba(100, 149, 237, 0.1);
  color: #6495ed;
}

.variable-icon {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.savings-card-icon {
  background: rgba(139, 92, 246, 0.1);
  color: var(--violet-pop);
}

.savings-card-icon.negative {
  background: rgba(255, 99, 71, 0.1);
  color: var(--persimmon);
}

.summary-card-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-card-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-card-value {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  font-family: 'Lexend', sans-serif;
}

.summary-card-value.positive {
  color: var(--electric-teal);
}

.summary-card-value.neg {
  color: var(--persimmon);
}

.summary-card.summary-warn {
  border-color: rgba(249, 115, 22, 0.25);
}

.summary-card-hint {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 1px;
}

.over-hint {
  color: var(--persimmon);
}

.under-hint {
  color: var(--electric-teal);
}

.savings-target-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.savings-pct-input-wrap {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: 6px;
  padding: 2px 6px;
  transition: border-color 0.2s ease;
}

.savings-pct-input-wrap:focus-within {
  border-color: var(--violet-pop);
}

.savings-pct-input {
  width: 36px;
  border: none;
  background: transparent;
  color: var(--violet-pop);
  font-size: 0.85rem;
  font-weight: 800;
  font-family: 'Lexend', sans-serif;
  text-align: right;
  outline: none;
  -moz-appearance: textfield;
}

.savings-pct-input::-webkit-outer-spin-button,
.savings-pct-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.savings-pct-symbol {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--violet-pop);
}

/* Expense Groups */
.expense-group {
  margin-bottom: 16px;
}

.expense-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  cursor: pointer;
  margin-bottom: 10px;
  transition: background 0.15s ease;
}

.expense-group-header:hover {
  background: var(--bg-subtle);
}

.expense-group-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expense-group-icon {
  flex-shrink: 0;
}

.fixed-color {
  color: #6495ed;
}

.variable-color {
  color: #f97316;
}

.expense-group-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.expense-group-count {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 10px;
  background: var(--bg-subtle);
  color: var(--text-tertiary);
}

.expense-group-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expense-group-total {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Lexend', sans-serif;
}

.expense-group-chevron {
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.expense-group-chevron.rotated {
  transform: rotate(180deg);
}

.budget-chart {
  margin-bottom: 24px;
}

.expense-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Member filter */
.member-filter {
  display: flex;
  gap: 2px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 3px;
  margin-bottom: 16px;
  width: fit-content;
}

.member-btn {
  padding: 5px 14px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.member-btn:hover {
  color: var(--text-primary);
}

.member-btn.active {
  background: var(--violet-pop);
  color: #fff;
}

.member-btn.owner-mine.active {
  background: #14b8a6;
  color: #fff;
}

.member-btn.owner-yours.active {
  background: #f97316;
  color: #fff;
}

.member-btn.owner-ours.active {
  background: #a855f7;
  color: #fff;
}

/* Savings row */
.savings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding: 18px 20px;
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(0, 230, 138, 0.15);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
}

.savings-row.negative {
  border-color: rgba(255, 99, 71, 0.2);
}

.savings-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.savings-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 230, 138, 0.1);
  border-radius: var(--radius-sm);
  color: var(--electric-teal);
}

.savings-row.negative .savings-icon {
  background: rgba(255, 99, 71, 0.1);
  color: var(--persimmon);
}

.savings-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.savings-math {
  display: flex;
  align-items: center;
  gap: 8px;
}

.savings-net {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.savings-expenses {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.savings-op {
  font-size: 0.82rem;
  color: var(--text-tertiary);
}

.savings-result {
  font-size: 1rem;
  font-weight: 700;
  color: var(--electric-teal);
  padding-left: 4px;
}

.savings-result.negative {
  color: var(--persimmon);
}

.savings-pct {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--electric-teal);
  padding-left: 4px;
}

.savings-pct.negative {
  color: var(--persimmon);
}

@media (max-width: 1024px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .savings-row {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .savings-math {
    flex-wrap: wrap;
  }
}
</style>
