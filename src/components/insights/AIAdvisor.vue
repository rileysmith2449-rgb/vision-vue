<template>
  <div class="ai-advisor">
    <div class="advisor-header">
      <div class="advisor-icon-wrap">
        <Sparkles :size="22" stroke-width="2" />
      </div>
      <div>
        <h3 class="advisor-title">AI Tax Advisor</h3>
        <p class="advisor-subtitle">Personalized recommendations based on your portfolio</p>
      </div>
    </div>

    <div class="insights-list">
      <InsightCard
        v-for="(insight, index) in insights"
        :key="index"
        :title="insight.title"
        :description="insight.description"
        :type="insight.type"
        :value="insight.value"
        :details="insight.details"
        :expanded="expandedIndex === index"
        @toggle="toggleExpanded(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { useBudgetStore } from '@/stores/budget'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { daysUntilLongTerm, calculateTaxTreatment } from '@/utils/taxCalculations'
import { Sparkles } from 'lucide-vue-next'
import InsightCard from './InsightCard.vue'

const portfolioStore = usePortfolioStore()
const budgetStore = useBudgetStore()

const expandedIndex = ref(null)

function toggleExpanded(index) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

const insights = computed(() => {
  const results = []

  if (portfolioStore.harvestableAmount > 0) {
    results.push({
      title: 'Tax-Loss Harvesting Opportunity',
      description: `You have ${portfolioStore.harvestableHoldings.length} holdings with unrealized losses. Consider selling to offset gains and reduce your tax bill.`,
      type: 'opportunity',
      value: `Potential savings: ${formatCurrency(portfolioStore.harvestableAmount * 0.32)}`,
      details: {
        summary: `${portfolioStore.harvestableHoldings.length} holdings with unrealized losses available for harvesting`,
        columns: ['Symbol', 'Unrealized Loss', 'Potential Savings'],
        rows: portfolioStore.harvestableHoldings.map(h => {
          const loss = Math.abs(h.currentValue - h.costBasis)
          return [
            h.symbol,
            formatCurrency(loss),
            formatCurrency(loss * 0.32)
          ]
        })
      }
    })
  }

  const nearLongTerm = portfolioStore.holdings.filter(h => {
    if (h.type === 'cash') return false
    const days = daysUntilLongTerm(h.purchaseDate)
    return days > 0 && days <= 60
  })
  if (nearLongTerm.length > 0) {
    results.push({
      title: 'Long-Term Transition Alert',
      description: `${nearLongTerm.length} holding(s) will qualify for long-term capital gains treatment within 60 days. Hold to save on taxes.`,
      type: 'info',
      value: `${nearLongTerm.map(h => h.symbol).join(', ')}`,
      details: {
        summary: 'Holdings approaching long-term capital gains eligibility',
        columns: ['Symbol', 'Days Remaining', 'Purchase Date'],
        rows: nearLongTerm.map(h => [
          h.symbol,
          `${daysUntilLongTerm(h.purchaseDate)} days`,
          formatDate(h.purchaseDate)
        ])
      }
    })
  }

  if (budgetStore.isOverBudget) {
    const overBudgetCategories = Object.entries(budgetStore.categoryExpenses)
      .filter(([, data]) => data.total > data.budget)
    results.push({
      title: 'Budget Warning',
      description: `You've exceeded your monthly budget by ${formatCurrency(Math.abs(budgetStore.budgetRemaining))}. Consider cutting discretionary spending.`,
      type: 'warning',
      value: `Over by ${formatCurrency(Math.abs(budgetStore.budgetRemaining))}`,
      details: {
        summary: `${overBudgetCategories.length} categor${overBudgetCategories.length === 1 ? 'y' : 'ies'} over budget`,
        columns: ['Category', 'Spent', 'Budget', 'Over By'],
        rows: overBudgetCategories.map(([name, data]) => [
          name,
          formatCurrency(data.total),
          formatCurrency(data.budget),
          formatCurrency(data.total - data.budget)
        ])
      }
    })
  }

  if (budgetStore.effectiveRate > 25) {
    results.push({
      title: 'High Effective Tax Rate',
      description: `Your effective tax rate is ${budgetStore.effectiveRate.toFixed(1)}%. Consider maximizing pre-tax retirement contributions to reduce taxable income.`,
      type: 'warning',
      value: `${budgetStore.effectiveRate.toFixed(1)}% effective rate`,
      details: {
        summary: 'Breakdown of your tax liability',
        columns: ['Component', 'Amount', 'Effective Rate'],
        rows: [
          ['Gross Income', formatCurrency(budgetStore.grossIncome), '—'],
          ['Federal Tax', formatCurrency(budgetStore.federalTax), `${budgetStore.grossIncome > 0 ? ((budgetStore.federalTax / budgetStore.grossIncome) * 100).toFixed(1) : 0}%`],
          ['State Tax', formatCurrency(budgetStore.stateTax), `${budgetStore.grossIncome > 0 ? ((budgetStore.stateTax / budgetStore.grossIncome) * 100).toFixed(1) : 0}%`],
          ['Total Tax', formatCurrency(budgetStore.totalTax), `${budgetStore.effectiveRate.toFixed(1)}%`]
        ]
      }
    })
  }

  if (portfolioStore.longTermGains > 0) {
    const longTermHoldings = portfolioStore.holdings.filter(h => {
      if (h.type === 'cash') return false
      const treatment = calculateTaxTreatment(h.purchaseDate)
      const gain = h.currentValue - h.costBasis
      return treatment === 'long-term' && gain > 0
    })
    results.push({
      title: 'Long-Term Gains Advantage',
      description: `You have ${formatCurrency(portfolioStore.longTermGains)} in long-term gains taxed at preferential rates (15%) instead of ordinary income rates (up to 37%).`,
      type: 'opportunity',
      value: `Saving ${formatCurrency(portfolioStore.longTermGains * 0.17)}`,
      details: {
        summary: 'Long-term holdings with positive gains',
        columns: ['Symbol', 'Gain', 'Tax at 15%', 'Tax at 37%'],
        rows: longTermHoldings.map(h => {
          const gain = h.currentValue - h.costBasis
          return [
            h.symbol,
            formatCurrency(gain),
            formatCurrency(gain * 0.15),
            formatCurrency(gain * 0.37)
          ]
        })
      }
    })
  }

  const categories = Object.keys(portfolioStore.holdingsByCategory)
  if (categories.length > 0) {
    results.push({
      title: 'Portfolio Diversification',
      description: `Your portfolio spans ${categories.length} asset categories. Diversification helps manage risk and may provide tax optimization opportunities across asset classes.`,
      type: 'info',
      value: `${categories.length} categories`,
      details: {
        summary: 'Asset allocation across categories',
        columns: ['Category', 'Holdings', 'Value'],
        rows: categories.map(cat => [
          cat,
          `${portfolioStore.holdingsByCategory[cat].length}`,
          formatCurrency(portfolioStore.categoryTotals[cat] || 0)
        ])
      }
    })
  }

  return results
})
</script>

<style scoped>
.ai-advisor {
  margin-bottom: 32px;
}

.advisor-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.advisor-icon-wrap {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-pop);
  border-radius: var(--radius-md);
  color: #0f172a;
}

.advisor-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.advisor-subtitle {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-top: 1px;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
