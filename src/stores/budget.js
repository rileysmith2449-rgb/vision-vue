import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateExpenseData } from '@/utils/demoData'

export const useBudgetStore = defineStore('budget', () => {
  // State
  const monthlyBudget = ref(8500)
  const salary = ref(150000)
  const businessIncome = ref(50000)
  const filingStatus = ref('married')
  const expenses = ref({})
  const currentCategory = ref(null)
  const currentSubcategory = ref(null)

  // Getters
  const totalExpenses = computed(() => {
    let total = 0
    Object.values(expenses.value).forEach(category => {
      Object.values(category.subcategories).forEach(transactions => {
        total += transactions.reduce((sum, t) => sum + t.amount, 0)
      })
    })
    return total
  })

  const budgetRemaining = computed(() => {
    return monthlyBudget.value - totalExpenses.value
  })

  const budgetPercentage = computed(() => {
    return (totalExpenses.value / monthlyBudget.value) * 100
  })

  const isOverBudget = computed(() => {
    return budgetRemaining.value < 0
  })

  const grossIncome = computed(() => {
    return salary.value + businessIncome.value
  })

  const standardDeduction = computed(() => {
    const deductions = {
      single: 14600,
      married: 29200,
      hoh: 21900
    }
    return deductions[filingStatus.value] || 0
  })

  const taxableIncome = computed(() => {
    return Math.max(0, grossIncome.value - standardDeduction.value)
  })

  const federalTax = computed(() => {
    return calculateFederalTax(taxableIncome.value, filingStatus.value)
  })

  const effectiveRate = computed(() => {
    if (grossIncome.value === 0) return 0
    return (federalTax.value / grossIncome.value) * 100
  })

  const categoryExpenses = computed(() => {
    const result = {}
    Object.keys(expenses.value).forEach(category => {
      let total = 0
      Object.values(expenses.value[category].subcategories).forEach(transactions => {
        total += transactions.reduce((sum, t) => sum + t.amount, 0)
      })
      result[category] = {
        total,
        budget: expenses.value[category].budget,
        percentage: (total / expenses.value[category].budget) * 100
      }
    })
    return result
  })

  const allTransactions = computed(() => {
    const txns = []
    Object.entries(expenses.value).forEach(([category, data]) => {
      Object.values(data.subcategories).forEach(transactions => {
        transactions.forEach(t => {
          txns.push({ ...t, category })
        })
      })
    })
    return txns
  })

  const transactionsByCard = computed(() => {
    const grouped = {}
    allTransactions.value.forEach(t => {
      if (!grouped[t.card]) grouped[t.card] = []
      grouped[t.card].push(t)
    })
    return grouped
  })

  const spendByCardAndCategory = computed(() => {
    const result = {}
    allTransactions.value.forEach(t => {
      if (!result[t.card]) result[t.card] = {}
      if (!result[t.card][t.category]) result[t.card][t.category] = 0
      result[t.card][t.category] += t.amount
    })
    return result
  })

  // Actions
  function loadExpenses() {
    expenses.value = generateExpenseData()
  }

  function setCurrentCategory(category) {
    currentCategory.value = category
    currentSubcategory.value = null
  }

  function setCurrentSubcategory(subcategory) {
    currentSubcategory.value = subcategory
  }

  function resetView() {
    currentCategory.value = null
    currentSubcategory.value = null
  }

  function updateSalary(amount) {
    salary.value = amount
  }

  function updateBusinessIncome(amount) {
    businessIncome.value = amount
  }

  function updateFilingStatus(status) {
    filingStatus.value = status
  }

  function updateCategoryBudget(name, amount) {
    if (expenses.value[name]) {
      expenses.value[name].budget = amount
      // Recalculate total monthly budget from all categories
      let total = 0
      Object.values(expenses.value).forEach(cat => {
        total += cat.budget
      })
      monthlyBudget.value = total
    }
  }

  function getCategoryTransactions(category, subcategory = null) {
    if (!expenses.value[category]) return []
    
    if (subcategory) {
      return expenses.value[category].subcategories[subcategory] || []
    }
    
    // Return all transactions for category
    const allTransactions = []
    Object.values(expenses.value[category].subcategories).forEach(transactions => {
      allTransactions.push(...transactions)
    })
    return allTransactions
  }

  return {
    // State
    monthlyBudget,
    salary,
    businessIncome,
    filingStatus,
    expenses,
    currentCategory,
    currentSubcategory,
    // Getters
    totalExpenses,
    budgetRemaining,
    budgetPercentage,
    isOverBudget,
    grossIncome,
    standardDeduction,
    taxableIncome,
    federalTax,
    effectiveRate,
    categoryExpenses,
    allTransactions,
    transactionsByCard,
    spendByCardAndCategory,
    // Actions
    loadExpenses,
    setCurrentCategory,
    setCurrentSubcategory,
    resetView,
    updateFilingStatus,
    updateCategoryBudget,
    getCategoryTransactions
  }
})

// Tax calculation helper
function calculateFederalTax(taxableIncome, filingStatus) {
  const brackets = {
    single: [
      { limit: 11600, rate: 0.10 },
      { limit: 47150, rate: 0.12 },
      { limit: 100525, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: 243725, rate: 0.32 },
      { limit: 609350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    married: [
      { limit: 23200, rate: 0.10 },
      { limit: 94300, rate: 0.12 },
      { limit: 201050, rate: 0.22 },
      { limit: 383900, rate: 0.24 },
      { limit: 487450, rate: 0.32 },
      { limit: 731200, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    hoh: [
      { limit: 16550, rate: 0.10 },
      { limit: 63100, rate: 0.12 },
      { limit: 100500, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: 243700, rate: 0.32 },
      { limit: 609350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ]
  }

  let tax = 0
  let previousLimit = 0
  const selectedBrackets = brackets[filingStatus] || brackets.married

  for (const bracket of selectedBrackets) {
    const taxableInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit
    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracket.rate
      previousLimit = bracket.limit
    } else {
      break
    }
  }

  return tax
}
