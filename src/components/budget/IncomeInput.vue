<template>
  <Card title="Income & Filing Status" subtitle="Your income sources and tax filing">
    <div class="income-form">
      <div class="form-group">
        <label class="form-label">Annual Salary</label>
        <div class="input-wrapper">
          <span class="input-prefix">$</span>
          <input
            type="number"
            class="form-input"
            :value="budgetStore.salary"
            @input="budgetStore.updateSalary(Number($event.target.value))"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Business Income</label>
        <div class="input-wrapper">
          <span class="input-prefix">$</span>
          <input
            type="number"
            class="form-input"
            :value="budgetStore.businessIncome"
            @input="budgetStore.updateBusinessIncome(Number($event.target.value))"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Filing Status</label>
        <select
          class="form-select"
          :value="budgetStore.filingStatus"
          @change="budgetStore.updateFilingStatus($event.target.value)"
        >
          <option value="single">Single</option>
          <option value="married">Married Filing Jointly</option>
          <option value="hoh">Head of Household</option>
        </select>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { useBudgetStore } from '@/stores/budget'
import Card from '@/components/common/Card.vue'

const budgetStore = useBudgetStore()
</script>

<style scoped>
.income-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(135, 206, 235, 0.08);
  border: 1px solid var(--border-glass);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: var(--electric-teal);
}

.input-prefix {
  padding: 0 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

.form-input {
  flex: 1;
  padding: 12px 16px 12px 0;
  border: none;
  background: none;
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  -moz-appearance: textfield;
}

.form-input::-webkit-outer-spin-button,
.form-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-select {
  padding: 12px 16px;
  border: 1px solid var(--border-glass);
  border-radius: 12px;
  background: rgba(135, 206, 235, 0.08);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.form-select:focus {
  border-color: var(--electric-teal);
}
</style>
