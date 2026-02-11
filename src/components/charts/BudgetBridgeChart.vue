<template>
  <Card title="Budget Overview">
    <template #actions>
      <div class="bridge-controls">
        <div class="toggle-group">
          <button
            v-for="v in viewModes"
            :key="v.key"
            class="toggle-btn"
            :class="{ active: viewMode === v.key }"
            @click="viewMode = v.key"
          >{{ v.label }}</button>
        </div>
        <div class="toggle-group">
          <button
            v-for="p in periods"
            :key="p.key"
            class="toggle-btn"
            :class="{ active: period === p.key }"
            @click="period = p.key"
          >{{ p.label }}</button>
        </div>
      </div>
    </template>
    <div class="bridge-container">
      <Bar :key="chartKey" :data="chartData" :options="chartOptions" />
    </div>
    <div v-if="viewMode === 'compare'" class="legend-row">
      <span class="legend-item"><span class="legend-dot budget-dot"></span> Budget</span>
      <span class="legend-item"><span class="legend-dot actual-dot"></span> Actual</span>
    </div>
  </Card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { useBudgetStore } from '@/stores/budget'
import { useThemeStore } from '@/stores/theme'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/components/common/Card.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const budgetStore = useBudgetStore()
const themeStore = useThemeStore()

const viewMode = ref('budget') // 'budget' | 'actual' | 'compare'
const period = ref('1m')       // '1m' | '3m' | '6m' | 'ytd' | 'year'

const viewModes = [
  { key: 'budget', label: 'Budget' },
  { key: 'actual', label: 'Actual' },
  { key: 'compare', label: 'Budget v Actual' },
]

const periods = [
  { key: '1m', label: 'Month' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: 'ytd', label: 'YTD' },
  { key: 'year', label: 'Year' },
]

// Force chart re-render when mode/period changes
const chartKey = computed(() => `${viewMode.value}-${period.value}`)

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const textColor = ref(getCSSVar('--text-secondary'))
const borderColor = ref(getCSSVar('--border-glass'))

function updateColors() {
  textColor.value = getCSSVar('--text-secondary')
  borderColor.value = getCSSVar('--border-glass')
}

onMounted(updateColors)
watch(() => themeStore.isDark, () => setTimeout(updateColors, 50))

const CATEGORY_SHORT = {
  'Housing & Rent': 'Housing',
  'Dining & Food': 'Dining',
  'Transportation': 'Transport',
  'Shopping': 'Shopping',
  'Entertainment': 'Entertain.',
  'Travel': 'Travel',
  'Bills & Utilities': 'Bills',
  'Office & Software': 'Office',
  'Meals & Entertainment': 'Meals',
  'Internet & Phone': 'Internet',
}

// Compute actual monthly averages from historical transactions for selected period
const actualCategoryTotals = computed(() => {
  const txns = budgetStore.historicalTransactions
  if (!txns || txns.length === 0) return {}

  const now = new Date(2026, 1, 10) // Feb 10, 2026
  let startDate, months

  switch (period.value) {
    case '1m':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      months = 1
      break
    case '3m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      months = 3
      break
    case '6m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      months = 6
      break
    case 'ytd':
      startDate = new Date(now.getFullYear(), 0, 1)
      months = now.getMonth() + 1 // Jan=1, Feb=2
      break
    case 'year':
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
      months = 12
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      months = 1
  }

  const filtered = txns.filter(t => {
    const d = new Date(t.date)
    return d >= startDate && d <= now
  })

  const categoryTotals = {}
  for (const t of filtered) {
    if (!categoryTotals[t.category]) categoryTotals[t.category] = 0
    categoryTotals[t.category] += t.amount
  }

  // Average to monthly
  const result = {}
  for (const [cat, total] of Object.entries(categoryTotals)) {
    result[cat] = total / months
  }
  return result
})

// Budget amounts per category (monthly)
const budgetCategoryAmounts = computed(() => {
  const result = {}
  const expenses = budgetStore.categoryExpenses
  for (const [name, data] of Object.entries(expenses)) {
    result[name] = data.budget
  }
  return result
})

// Get category names sorted by the relevant amounts
function getSortedCategories(amounts) {
  return Object.entries(amounts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
}

// Build waterfall items for a single mode (budget or actual)
function buildWaterfall(categoryAmounts) {
  const income = budgetStore.monthlyNetIncome
  const categories = getSortedCategories(categoryAmounts)

  const items = []
  let running = income

  items.push({ label: 'Net Income', value: income, bottom: 0, top: income, type: 'income' })

  for (const [name, amount] of categories) {
    if (amount <= 0) continue
    const top = running
    running -= amount
    items.push({ label: CATEGORY_SHORT[name] || name, value: amount, bottom: running, top, type: 'expense' })
  }

  const savings = running
  items.push({
    label: 'Savings',
    value: Math.abs(savings),
    bottom: savings >= 0 ? 0 : savings,
    top: savings >= 0 ? savings : 0,
    type: savings >= 0 ? 'savings' : 'deficit'
  })

  return items
}

// Current bridge data based on view mode
const bridgeData = computed(() => {
  if (viewMode.value === 'budget') {
    return buildWaterfall(budgetCategoryAmounts.value)
  }
  // For 'actual' and 'compare', use period-filtered actual data
  if (period.value === '1m') {
    // Use current month from store
    const amounts = {}
    const expenses = budgetStore.categoryExpenses
    for (const [name, data] of Object.entries(expenses)) {
      amounts[name] = data.total
    }
    return buildWaterfall(amounts)
  }
  return buildWaterfall(actualCategoryTotals.value)
})

// Budget bridge data for compare mode
const budgetBridgeData = computed(() => {
  return buildWaterfall(budgetCategoryAmounts.value)
})

// For compare mode: build grouped bar data
const compareData = computed(() => {
  const budgetAmounts = budgetCategoryAmounts.value
  let actualAmounts
  if (period.value === '1m') {
    actualAmounts = {}
    const expenses = budgetStore.categoryExpenses
    for (const [name, data] of Object.entries(expenses)) {
      actualAmounts[name] = data.total
    }
  } else {
    actualAmounts = actualCategoryTotals.value
  }

  // Merge all category names from both
  const allCats = new Set([...Object.keys(budgetAmounts), ...Object.keys(actualAmounts)])
  const categories = [...allCats]
    .map(name => ({
      name,
      short: CATEGORY_SHORT[name] || name,
      budget: budgetAmounts[name] || 0,
      actual: actualAmounts[name] || 0,
    }))
    .filter(c => c.budget > 0 || c.actual > 0)
    .sort((a, b) => Math.max(b.budget, b.actual) - Math.max(a.budget, a.actual))

  const income = budgetStore.monthlyNetIncome
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0)
  const totalActual = categories.reduce((s, c) => s + c.actual, 0)

  const labels = ['Net Income', ...categories.map(c => c.short), 'Savings']
  const budgetValues = [income, ...categories.map(c => c.budget), Math.max(0, income - totalBudget)]
  const actualValues = [income, ...categories.map(c => c.actual), Math.max(0, income - totalActual)]

  return { labels, budgetValues, actualValues, categories }
})

function getWaterfallColor(type, alpha = 1) {
  if (type === 'income') return alpha < 1 ? `rgba(0, 230, 138, ${alpha})` : '#00e68a'
  if (type === 'savings') return alpha < 1 ? `rgba(100, 149, 237, ${alpha})` : '#6495ed'
  if (type === 'deficit') return alpha < 1 ? `rgba(255, 99, 71, ${alpha})` : '#ff6347'
  return alpha < 1 ? `rgba(255, 99, 71, ${alpha})` : 'rgba(255, 99, 71, 0.7)'
}

const chartData = computed(() => {
  if (viewMode.value === 'compare') {
    const { labels, budgetValues, actualValues } = compareData.value
    return {
      labels,
      datasets: [
        {
          label: 'Budget',
          data: budgetValues,
          backgroundColor: 'rgba(100, 149, 237, 0.6)',
          borderColor: '#6495ed',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Actual',
          data: actualValues,
          backgroundColor: actualValues.map((v, i) => {
            if (i === 0) return 'rgba(0, 230, 138, 0.7)'
            if (i === labels.length - 1) return 'rgba(139, 92, 246, 0.7)'
            return v > budgetValues[i] ? 'rgba(255, 99, 71, 0.7)' : 'rgba(0, 230, 138, 0.7)'
          }),
          borderColor: actualValues.map((v, i) => {
            if (i === 0) return '#00e68a'
            if (i === labels.length - 1) return '#8b5cf6'
            return v > budgetValues[i] ? '#ff6347' : '#00e68a'
          }),
          borderWidth: 1,
          borderRadius: 4,
        }
      ]
    }
  }

  // Waterfall mode (budget or actual)
  const items = bridgeData.value
  const labels = items.map(i => i.label)
  const data = items.map(i => [i.bottom, i.top])
  const colors = items.map(i => getWaterfallColor(i.type))
  const borderColors = items.map(i => getWaterfallColor(i.type, 0.9))

  return {
    labels,
    datasets: [{
      label: 'Amount',
      data,
      backgroundColor: colors,
      borderColor: borderColors,
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items) => items[0]?.label || '',
        label: (context) => {
          if (viewMode.value === 'compare') {
            const val = context.raw
            const label = context.dataset.label
            return ` ${label}: ${formatCurrency(val)}`
          }
          const item = bridgeData.value[context.dataIndex]
          if (!item) return ''
          if (item.type === 'income') return ` Income: ${formatCurrency(item.value)}`
          if (item.type === 'savings') return ` Savings: ${formatCurrency(item.value)}`
          if (item.type === 'deficit') return ` Deficit: -${formatCurrency(item.value)}`
          return ` Spent: -${formatCurrency(item.value)}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: textColor.value,
        font: { size: 11, weight: '600' },
        maxRotation: 45,
        minRotation: 0,
      },
      border: { display: false },
    },
    y: {
      grid: { color: borderColor.value },
      ticks: {
        color: textColor.value,
        callback: (value) => formatCurrency(value),
      },
      border: { display: false },
      beginAtZero: true,
    }
  }
}))
</script>

<style scoped>
.bridge-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.toggle-group {
  display: flex;
  gap: 2px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: 8px;
  padding: 2px;
}

.toggle-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.7rem;
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
  background: var(--violet-pop);
  color: #fff;
}

.bridge-container {
  position: relative;
  height: 320px;
}

.legend-row {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.budget-dot {
  background: rgba(100, 149, 237, 0.6);
  border: 1px solid #6495ed;
}

.actual-dot {
  background: rgba(0, 230, 138, 0.7);
  border: 1px solid #00e68a;
}
</style>
