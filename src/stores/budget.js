import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateExpenseData, generateBusinessExpenseData } from '@/utils/demoData'
import { creditCards } from '@/utils/creditCardData'

export const useBudgetStore = defineStore('budget', () => {
  // State
  const budgetMode = ref('personal') // 'personal' | 'business'
  const salary = ref(150000)
  const businessIncome = ref(50000)
  const shortTermInvestmentIncome = ref(0)
  const longTermInvestmentIncome = ref(0)
  const filingStatus = ref('married')
  const state = ref('CA')
  const personalExpenses = ref({})
  const businessExpenses = ref({})
  const currentCategory = ref(null)
  const currentSubcategory = ref(null)

  // Writable computed — proxies to active mode's expense data
  const expenses = computed({
    get() {
      return budgetMode.value === 'personal'
        ? personalExpenses.value
        : businessExpenses.value
    },
    set(val) {
      if (budgetMode.value === 'personal') {
        personalExpenses.value = val
      } else {
        businessExpenses.value = val
      }
    }
  })

  // Monthly budget derived from active category budgets
  const monthlyBudget = computed(() => {
    let total = 0
    Object.values(expenses.value).forEach(cat => {
      total += cat.budget
    })
    return total
  })

  // Filtered cards by active mode
  const filteredCards = computed(() => {
    return creditCards.filter(c => c.type === budgetMode.value)
  })

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
    if (monthlyBudget.value === 0) return 0
    return (totalExpenses.value / monthlyBudget.value) * 100
  })

  const isOverBudget = computed(() => {
    return budgetRemaining.value < 0
  })

  const ordinaryIncome = computed(() => {
    return salary.value + businessIncome.value + shortTermInvestmentIncome.value
  })

  const grossIncome = computed(() => {
    return ordinaryIncome.value + longTermInvestmentIncome.value
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

  const taxableOrdinaryIncome = computed(() => {
    return Math.max(0, ordinaryIncome.value - standardDeduction.value)
  })

  const federalTax = computed(() => {
    const ordinaryTax = calculateFederalTax(taxableOrdinaryIncome.value, filingStatus.value)
    const ltcgTax = longTermInvestmentIncome.value * getLTCGRate(taxableOrdinaryIncome.value, filingStatus.value)
    return ordinaryTax + ltcgTax
  })

  const stateTax = computed(() => {
    return calculateStateTax(taxableIncome.value, state.value)
  })

  const totalTax = computed(() => {
    return federalTax.value + stateTax.value
  })

  const effectiveRate = computed(() => {
    if (grossIncome.value === 0) return 0
    return (totalTax.value / grossIncome.value) * 100
  })

  const federalEffectiveRate = computed(() => {
    if (grossIncome.value === 0) return 0
    return (federalTax.value / grossIncome.value) * 100
  })

  const stateEffectiveRate = computed(() => {
    if (grossIncome.value === 0) return 0
    return (stateTax.value / grossIncome.value) * 100
  })

  // Savings
  const monthlyNetIncome = computed(() => {
    return (grossIncome.value - totalTax.value) / 12
  })

  const monthlySavings = computed(() => {
    return monthlyNetIncome.value - totalExpenses.value
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

  // Reclassify — category options for dropdown
  const categoryOptions = computed(() => {
    const options = []
    Object.entries(expenses.value).forEach(([catName, catData]) => {
      const subs = Object.keys(catData.subcategories)
      options.push({ category: catName, subcategories: subs })
    })
    return options
  })

  // Actions
  function loadExpenses() {
    personalExpenses.value = generateExpenseData()
    businessExpenses.value = generateBusinessExpenseData()
  }

  function setBudgetMode(mode) {
    budgetMode.value = mode
    currentCategory.value = null
    currentSubcategory.value = null
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
    }
  }

  function getCategoryTransactions(category, subcategory = null) {
    if (!expenses.value[category]) return []

    if (subcategory) {
      return expenses.value[category].subcategories[subcategory] || []
    }

    const allTxns = []
    Object.values(expenses.value[category].subcategories).forEach(transactions => {
      allTxns.push(...transactions)
    })
    return allTxns
  }

  function reclassifyTransaction(fromCategory, fromSub, txIndex, toCategory, toSub) {
    const source = expenses.value[fromCategory]?.subcategories[fromSub]
    if (!source || txIndex < 0 || txIndex >= source.length) return

    const target = expenses.value[toCategory]?.subcategories[toSub]
    if (!target) return

    const [tx] = source.splice(txIndex, 1)
    target.push(tx)
  }

  return {
    // State
    budgetMode,
    monthlyBudget,
    salary,
    businessIncome,
    shortTermInvestmentIncome,
    longTermInvestmentIncome,
    filingStatus,
    state,
    expenses,
    personalExpenses,
    businessExpenses,
    currentCategory,
    currentSubcategory,
    // Getters
    filteredCards,
    totalExpenses,
    budgetRemaining,
    budgetPercentage,
    isOverBudget,
    ordinaryIncome,
    grossIncome,
    standardDeduction,
    taxableIncome,
    federalTax,
    stateTax,
    totalTax,
    effectiveRate,
    federalEffectiveRate,
    stateEffectiveRate,
    monthlyNetIncome,
    monthlySavings,
    categoryExpenses,
    allTransactions,
    transactionsByCard,
    spendByCardAndCategory,
    categoryOptions,
    // Actions
    loadExpenses,
    setBudgetMode,
    setCurrentCategory,
    setCurrentSubcategory,
    resetView,
    updateFilingStatus,
    updateCategoryBudget,
    getCategoryTransactions,
    reclassifyTransaction
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

// State income tax rates (simplified — top marginal flat approximation for common states)
const STATE_TAX_RATES = {
  AL: 0.050, AK: 0, AZ: 0.025, AR: 0.044, CA: 0.093,
  CO: 0.044, CT: 0.065, DE: 0.066, FL: 0, GA: 0.055,
  HI: 0.075, ID: 0.058, IL: 0.0495, IN: 0.0315, IA: 0.057,
  KS: 0.057, KY: 0.040, LA: 0.0425, ME: 0.0715, MD: 0.0575,
  MA: 0.050, MI: 0.0425, MN: 0.0785, MS: 0.050, MO: 0.048,
  MT: 0.059, NE: 0.0584, NV: 0, NH: 0, NJ: 0.0897,
  NM: 0.059, NY: 0.0685, NC: 0.045, ND: 0.0195, OH: 0.035,
  OK: 0.0475, OR: 0.0875, PA: 0.0307, RI: 0.0599, SC: 0.064,
  SD: 0, TN: 0, TX: 0, UT: 0.0465, VT: 0.066,
  VA: 0.0575, WA: 0, WV: 0.055, WI: 0.0653, WY: 0, DC: 0.085,
}

function calculateStateTax(taxableIncome, stateCode) {
  const rate = STATE_TAX_RATES[stateCode] || 0
  return taxableIncome * rate
}

// Long-term capital gains rate based on ordinary taxable income
function getLTCGRate(ordinaryTaxableIncome, filingStatus) {
  const thresholds = {
    single:  { zero: 47025, fifteen: 518900 },
    married: { zero: 94050, fifteen: 583750 },
    hoh:     { zero: 63000, fifteen: 551350 },
  }
  const t = thresholds[filingStatus] || thresholds.married
  if (ordinaryTaxableIncome <= t.zero) return 0
  if (ordinaryTaxableIncome <= t.fifteen) return 0.15
  return 0.20
}
