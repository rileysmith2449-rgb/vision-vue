<template>
  <div class="budget">
    <Header title="Budget" subtitle="Track spending and optimize your rewards">
      <template #actions>
        <div class="mode-toggle">
          <button
            class="toggle-btn"
            :class="{ active: budgetStore.budgetMode === 'personal' }"
            @click="budgetStore.setBudgetMode('personal')"
          >
            <User :size="14" stroke-width="2" />
            Personal
          </button>
          <button
            class="toggle-btn"
            :class="{ active: budgetStore.budgetMode === 'family' }"
            @click="budgetStore.setBudgetMode('family')"
          >
            <Users :size="14" stroke-width="2" />
            Family
          </button>
          <button
            class="toggle-btn"
            :class="{ active: budgetStore.budgetMode === 'business' }"
            @click="budgetStore.setBudgetMode('business')"
          >
            <Briefcase :size="14" stroke-width="2" />
            Business
          </button>
        </div>
      </template>
    </Header>

    <!-- Family mode: filter by owner -->
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

    <!-- Personal/Business mode: select which person this budget files to -->
    <div v-if="budgetStore.budgetMode === 'personal' || budgetStore.budgetMode === 'business'" class="member-filter">
      <span class="person-label">Filing as</span>
      <button
        class="member-btn owner-mine"
        :class="{ active: budgetStore.personalMember === 'mine' }"
        @click="budgetStore.setPersonalMember('mine')"
      >
        {{ budgetStore.familyMembers.mine.name }}
      </button>
      <button
        class="member-btn owner-yours"
        :class="{ active: budgetStore.personalMember === 'yours' }"
        @click="budgetStore.setPersonalMember('yours')"
      >
        {{ budgetStore.familyMembers.yours.name }}
      </button>
    </div>

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
      </div>
    </div>

    <CreditCardSection />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { formatCurrency } from '@/utils/formatters'
import Header from '@/components/layout/Header.vue'
import MonthlyHeader from '@/components/budget/MonthlyHeader.vue'
import BudgetCategoryRow from '@/components/budget/BudgetCategoryRow.vue'
import CreditCardSection from '@/components/budget/CreditCardSection.vue'
import BudgetChart from '@/components/charts/BudgetChart.vue'
import { User, Users, Briefcase, PiggyBank } from 'lucide-vue-next'

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

/* Mode toggle */
.mode-toggle {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 2px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toggle-btn:hover {
  color: var(--text-primary);
}

.toggle-btn.active {
  background: var(--electric-teal);
  color: #000;
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

.person-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-tertiary);
  padding: 0 8px;
  display: flex;
  align-items: center;
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

@media (max-width: 1024px) {
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
