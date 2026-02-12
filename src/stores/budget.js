import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { generateExpenseData, generateBusinessExpenseData, generateFamilyExpenseData, generateHistoricalTransactions } from '@/utils/demoData'
import { creditCards } from '@/utils/creditCardData'

function loadFromStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v !== null ? JSON.parse(v) : fallback
  } catch { return fallback }
}

export const useBudgetStore = defineStore('budget', () => {
  // Onboarding flag
  const settingsConfigured = ref(localStorage.getItem('vision-settings-configured') === 'true')

  // State — hydrate from localStorage if previously saved
  const rawMode = loadFromStorage('vision-budgetMode', 'personal')
  // Backward compat: old 'business' mode → convert to personal + businessEnabled
  const budgetMode = ref(rawMode === 'business' ? 'personal' : rawMode)
  const businessEnabled = ref(rawMode === 'business' ? true : loadFromStorage('vision-businessEnabled', false))
  const salary = ref(150000)
  const businessIncome = ref(50000)
  const shortTermInvestmentIncome = ref(0)
  const longTermInvestmentIncome = ref(0)
  const filingStatus = ref('married')
  const state = ref('CA')
  const personalExpenses = ref({})
  const businessExpenses = ref({})
  const familyExpenses = ref({})
  const currentCategory = ref(null)
  const currentSubcategory = ref(null)
  const historicalTransactions = ref([])

  // Family mode state — hydrate from localStorage
  const familyMembers = ref(loadFromStorage('vision-familyMembers', {
    mine: {
      id: 'mine',
      name: 'Person 1',
      salary: 120000,
      businessIncome: 0,
      shortTermInvestmentIncome: 0,
      longTermInvestmentIncome: 0,
      filingStatus: 'married',
      state: 'CA'
    },
    yours: {
      id: 'yours',
      name: 'Person 2',
      salary: 95000,
      businessIncome: 10000,
      shortTermInvestmentIncome: 0,
      longTermInvestmentIncome: 0,
      filingStatus: 'married',
      state: 'CA'
    }
  }))
  const activeMember = ref('all') // 'all' | 'mine' | 'yours' | 'ours'
  const personalMember = ref(loadFromStorage('vision-personalMember', 'mine'))

  // Persist key settings to localStorage on change
  watch(budgetMode, v => localStorage.setItem('vision-budgetMode', JSON.stringify(v)))
  watch(businessEnabled, v => localStorage.setItem('vision-businessEnabled', JSON.stringify(v)))
  watch(familyMembers, v => localStorage.setItem('vision-familyMembers', JSON.stringify(v)), { deep: true })
  watch(personalMember, v => localStorage.setItem('vision-personalMember', JSON.stringify(v)))

  // Helper: filter family expenses by owner
  function filterExpensesByMember(allExpenses, ownerId) {
    const filtered = {}
    for (const [catName, catData] of Object.entries(allExpenses)) {
      const filteredSubs = {}
      for (const [subName, transactions] of Object.entries(catData.subcategories)) {
        const ownerTxns = transactions.filter(t => t.owner === ownerId)
        if (ownerTxns.length > 0) {
          filteredSubs[subName] = ownerTxns
        }
      }
      if (Object.keys(filteredSubs).length > 0) {
        filtered[catName] = { ...catData, subcategories: filteredSubs }
      }
    }
    return filtered
  }

  // Writable computed — proxies to active mode's expense data
  const expenses = computed({
    get() {
      if (budgetMode.value === 'family') {
        if (activeMember.value === 'all') return familyExpenses.value
        return filterExpensesByMember(familyExpenses.value, activeMember.value)
      }
      return personalExpenses.value
    },
    set(val) {
      if (budgetMode.value === 'family') {
        familyExpenses.value = val
      } else {
        personalExpenses.value = val
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

  // Filtered cards by active mode (family uses personal cards, business is additive)
  const filteredCards = computed(() => {
    const mode = budgetMode.value === 'family' ? 'personal' : budgetMode.value
    return creditCards.filter(c => c.type === mode || (businessEnabled.value && c.type === 'business'))
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

  // Helper: compute taxes for a single person's settings
  function computeMemberTaxes(m) {
    const ordinary = m.salary + m.businessIncome + m.shortTermInvestmentIncome
    const gross = ordinary + m.longTermInvestmentIncome
    const deduction = getStandardDeduction(m.filingStatus)
    const taxable = Math.max(0, gross - deduction)
    const taxableOrdinary = Math.max(0, ordinary - deduction)
    const federal = calculateFederalTax(taxableOrdinary, m.filingStatus)
      + m.longTermInvestmentIncome * getLTCGRate(taxableOrdinary, m.filingStatus)
    const st = calculateStateTax(taxable, m.state)
    return { ordinary, gross, federal, state: st, total: federal + st }
  }

  // Resolved member for personal/business modes (reads from familyMembers)
  const activePersonalMember = computed(() => {
    return familyMembers.value[personalMember.value]
  })

  const ordinaryIncome = computed(() => {
    if (budgetMode.value === 'family') {
      const m1 = familyMembers.value.mine
      const m2 = familyMembers.value.yours
      return (m1.salary + m1.businessIncome + m1.shortTermInvestmentIncome)
        + (m2.salary + m2.businessIncome + m2.shortTermInvestmentIncome)
    }
    const m = activePersonalMember.value
    return m.salary + m.businessIncome + m.shortTermInvestmentIncome
  })

  const grossIncome = computed(() => {
    if (budgetMode.value === 'family') {
      const m1 = familyMembers.value.mine
      const m2 = familyMembers.value.yours
      return (m1.salary + m1.businessIncome + m1.shortTermInvestmentIncome + m1.longTermInvestmentIncome)
        + (m2.salary + m2.businessIncome + m2.shortTermInvestmentIncome + m2.longTermInvestmentIncome)
    }
    const m = activePersonalMember.value
    return (m.salary + m.businessIncome + m.shortTermInvestmentIncome) + m.longTermInvestmentIncome
  })

  const standardDeduction = computed(() => {
    const m = activePersonalMember.value
    return getStandardDeduction(m.filingStatus)
  })

  const taxableIncome = computed(() => {
    return Math.max(0, grossIncome.value - standardDeduction.value)
  })

  const taxableOrdinaryIncome = computed(() => {
    return Math.max(0, ordinaryIncome.value - standardDeduction.value)
  })

  const federalTax = computed(() => {
    if (budgetMode.value === 'family') {
      const t1 = computeMemberTaxes(familyMembers.value.mine)
      const t2 = computeMemberTaxes(familyMembers.value.yours)
      return t1.federal + t2.federal
    }
    const m = activePersonalMember.value
    const t = computeMemberTaxes(m)
    return t.federal
  })

  const stateTax = computed(() => {
    if (budgetMode.value === 'family') {
      const t1 = computeMemberTaxes(familyMembers.value.mine)
      const t2 = computeMemberTaxes(familyMembers.value.yours)
      return t1.state + t2.state
    }
    const m = activePersonalMember.value
    const t = computeMemberTaxes(m)
    return t.state
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
    if (budgetMode.value === 'family') {
      const t1 = computeMemberTaxes(familyMembers.value.mine)
      const t2 = computeMemberTaxes(familyMembers.value.yours)
      return (t1.gross - t1.total + t2.gross - t2.total) / 12
    }
    const m = activePersonalMember.value
    const t = computeMemberTaxes(m)
    return (t.gross - t.total) / 12
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
    familyExpenses.value = generateFamilyExpenseData()
  }

  function loadHistoricalData() {
    if (historicalTransactions.value.length === 0) {
      historicalTransactions.value = generateHistoricalTransactions()
    }
  }

  function setBudgetMode(mode) {
    budgetMode.value = mode
    currentCategory.value = null
    currentSubcategory.value = null
    if (mode !== 'family') {
      activeMember.value = 'all'
    }
  }

  function setBusinessEnabled(val) {
    businessEnabled.value = val
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
    // Use raw underlying data to avoid index mismatch when viewing a filtered member
    const raw = budgetMode.value === 'family' ? familyExpenses.value
      : personalExpenses.value

    // When filtering by member, find the real index in the raw data
    const source = raw[fromCategory]?.subcategories[fromSub]
    if (!source) return

    let realIndex = txIndex
    if (budgetMode.value === 'family' && activeMember.value !== 'all') {
      const filtered = source.filter(t => t.owner === activeMember.value)
      const targetTx = filtered[txIndex]
      if (!targetTx) return
      realIndex = source.indexOf(targetTx)
    }

    if (realIndex < 0 || realIndex >= source.length) return

    const target = raw[toCategory]?.subcategories[toSub]
    if (!target) return

    const [tx] = source.splice(realIndex, 1)
    target.push(tx)
  }

  function setPersonalMember(id) {
    personalMember.value = id
  }

  function completeOnboarding() {
    // Persist current settings to localStorage
    localStorage.setItem('vision-budgetMode', JSON.stringify(budgetMode.value))
    localStorage.setItem('vision-businessEnabled', JSON.stringify(businessEnabled.value))
    localStorage.setItem('vision-familyMembers', JSON.stringify(familyMembers.value))
    localStorage.setItem('vision-personalMember', JSON.stringify(personalMember.value))
    // Mark setup complete
    localStorage.setItem('vision-settings-configured', 'true')
    settingsConfigured.value = true
  }

  // Family mode actions
  function setActiveMember(id) {
    activeMember.value = id
  }

  function updateMemberName(id, name) {
    if (familyMembers.value[id]) {
      familyMembers.value[id].name = name
    }
  }

  function updateMemberSetting(id, field, value) {
    if (familyMembers.value[id] && field in familyMembers.value[id]) {
      familyMembers.value[id][field] = value
    }
  }

  return {
    // State
    settingsConfigured,
    budgetMode,
    businessEnabled,
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
    familyExpenses,
    familyMembers,
    activeMember,
    personalMember,
    activePersonalMember,
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
    historicalTransactions,
    // Actions
    loadExpenses,
    loadHistoricalData,
    setBudgetMode,
    setBusinessEnabled,
    setPersonalMember,
    setActiveMember,
    updateMemberName,
    updateMemberSetting,
    setCurrentCategory,
    setCurrentSubcategory,
    resetView,
    updateFilingStatus,
    updateCategoryBudget,
    getCategoryTransactions,
    reclassifyTransaction,
    completeOnboarding
  }
})

// Standard deduction helper (reusable for family per-member calcs)
function getStandardDeduction(status) {
  const deductions = { single: 14600, married: 29200, hoh: 21900 }
  return deductions[status] || 0
}

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
