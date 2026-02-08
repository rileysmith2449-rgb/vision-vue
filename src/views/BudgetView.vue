<template>
  <div class="budget">
    <Header title="Budget" subtitle="Track spending and optimize your rewards" />

    <MonthlyHeader
      :spent="budgetStore.totalExpenses"
      :budget="budgetStore.monthlyBudget"
    />

    <BudgetChart class="budget-chart" />

    <div class="expense-list">
      <BudgetCategoryRow
        v-for="(data, name) in budgetStore.expenses"
        :key="name"
        :name="name"
        :data="data"
        @update-budget="budgetStore.updateCategoryBudget"
      />
    </div>

    <CreditCardSection />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import Header from '@/components/layout/Header.vue'
import MonthlyHeader from '@/components/budget/MonthlyHeader.vue'
import BudgetCategoryRow from '@/components/budget/BudgetCategoryRow.vue'
import CreditCardSection from '@/components/budget/CreditCardSection.vue'
import BudgetChart from '@/components/charts/BudgetChart.vue'

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

.budget-chart {
  margin-bottom: 24px;
}

.expense-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
