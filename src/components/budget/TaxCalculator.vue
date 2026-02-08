<template>
  <Card title="Tax Summary" subtitle="Estimated federal tax breakdown">
    <div class="tax-breakdown">
      <div class="tax-row">
        <span class="tax-label">Gross Income</span>
        <span class="tax-value">{{ formatCurrency(budgetStore.grossIncome) }}</span>
      </div>
      <div class="tax-row">
        <span class="tax-label">Standard Deduction</span>
        <span class="tax-value deduction">-{{ formatCurrency(budgetStore.standardDeduction) }}</span>
      </div>
      <div class="tax-row separator">
        <span class="tax-label">Taxable Income</span>
        <span class="tax-value">{{ formatCurrency(budgetStore.taxableIncome) }}</span>
      </div>
      <div class="tax-row highlight">
        <span class="tax-label">Federal Tax</span>
        <span class="tax-value negative">{{ formatCurrency(budgetStore.federalTax) }}</span>
      </div>
      <div class="tax-row">
        <span class="tax-label">Effective Rate</span>
        <span class="tax-value">{{ budgetStore.effectiveRate.toFixed(1) }}%</span>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { useBudgetStore } from '@/stores/budget'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/components/common/Card.vue'

const budgetStore = useBudgetStore()
</script>

<style scoped>
.tax-breakdown {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tax-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tax-row.separator {
  padding-top: 14px;
  border-top: 1px solid var(--border-glass);
}

.tax-row.highlight {
  padding: 12px 16px;
  background: rgba(255, 111, 97, 0.08);
  border-radius: 12px;
}

.tax-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.tax-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.tax-value.deduction {
  color: var(--electric-teal);
}

.tax-value.negative {
  color: var(--persimmon);
}
</style>
