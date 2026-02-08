<template>
  <div class="budget">
    <Header title="Budget & Cashflow" subtitle="Track expenses and optimize your tax strategy" />

    <div class="budget-top">
      <IncomeInput />
      <TaxCalculator />
    </div>

    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Monthly Expenses</h2>
        <div class="budget-summary">
          <span class="budget-spent">{{ formatCurrency(budgetStore.totalExpenses) }}</span>
          <span class="budget-sep">/</span>
          <span class="budget-total">{{ formatCurrency(budgetStore.monthlyBudget) }}</span>
        </div>
      </div>

      <ProgressBar
        :value="budgetStore.budgetPercentage"
        :show-percent="true"
        :label="budgetStore.isOverBudget ? 'Over budget!' : 'Budget used'"
        class="overall-progress"
      />

      <div class="expense-list">
        <ExpenseCategory
          v-for="(data, name) in budgetStore.expenses"
          :key="name"
          :name="name"
          :data="data"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { formatCurrency } from '@/utils/formatters'
import Header from '@/components/layout/Header.vue'
import IncomeInput from '@/components/budget/IncomeInput.vue'
import TaxCalculator from '@/components/budget/TaxCalculator.vue'
import ExpenseCategory from '@/components/budget/ExpenseCategory.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'

const budgetStore = useBudgetStore()

onMounted(() => {
  if (Object.keys(budgetStore.expenses).length === 0) {
    budgetStore.loadExpenses()
  }
})
</script>

<style scoped>
.budget {
  max-width: 1200px;
}

.budget-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}

.section {
  margin-top: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.budget-summary {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.budget-spent {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.budget-sep {
  color: var(--text-secondary);
}

.budget-total {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.overall-progress {
  margin-bottom: 24px;
}

.expense-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 1024px) {
  .budget-top {
    grid-template-columns: 1fr;
  }
}
</style>
