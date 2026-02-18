// stores/cashflow.js
// Drop into src/stores/ alongside your existing portfolio.js and budget.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateForecast, categorizeBill } from '../utils/cashflowEngine.js'

export const useCashflowStore = defineStore('cashflow', () => {

  // ─── State ───────────────────────────────────────────────────────────────────

  // Starting balance — in production, pull from Plaid's item/get or accounts endpoint
  const currentBalance = ref(12450.00)

  // Recurring income streams (e.g. salary, freelance, rental)
  const incomeStreams = ref([
    {
      id: 'inc-1',
      label: 'Salary',
      amount: 5800,
      frequency: 'biweekly',     // 'weekly' | 'biweekly' | 'monthly' | 'custom'
      nextDate: getNextBiweekly(),
      category: 'income',
      source: 'manual',           // 'plaid' | 'manual'
    },
  ])

  // Recurring bills & expenses
  const recurringExpenses = ref([
    { id: 'exp-1',  label: 'Rent',          amount: 2200,  dueDay: 1,  frequency: 'monthly', category: 'housing',      source: 'manual' },
    { id: 'exp-2',  label: 'Car Insurance', amount: 280,   dueDay: 8,  frequency: 'monthly', category: 'auto',         source: 'manual' },
    { id: 'exp-3',  label: 'Utilities',     amount: 140,   dueDay: 15, frequency: 'monthly', category: 'utilities',    source: 'manual' },
    { id: 'exp-4',  label: 'Spotify',       amount: 11,    dueDay: 22, frequency: 'monthly', category: 'subscription', source: 'manual' },
    { id: 'exp-5',  label: 'Internet',      amount: 65,    dueDay: 18, frequency: 'monthly', category: 'utilities',    source: 'manual' },
    { id: 'exp-6',  label: 'Phone',         amount: 85,    dueDay: 5,  frequency: 'monthly', category: 'utilities',    source: 'manual' },
    { id: 'exp-7',  label: 'Gym',           amount: 45,    dueDay: 1,  frequency: 'monthly', category: 'health',       source: 'manual' },
    { id: 'exp-8',  label: 'Netflix',       amount: 15.49, dueDay: 12, frequency: 'monthly', category: 'subscription', source: 'manual' },
  ])

  // One-time future expenses (e.g. upcoming trip, car service)
  const plannedExpenses = ref([
    { id: 'plan-1', label: 'Vegas Trip',   amount: 1200, date: '2026-03-15', category: 'travel',   source: 'manual' },
    { id: 'plan-2', label: 'Car Service',  amount: 350,  date: '2026-02-28', category: 'auto',     source: 'manual' },
  ])

  // Forecast window in days
  const forecastDays = ref(90)

  // Category to highlight / filter in chart
  const activeFilter = ref(null)

  // ─── Computed ─────────────────────────────────────────────────────────────────

  // Full forecast: array of daily balance checkpoints for the next N days
  const forecast = computed(() =>
    generateForecast({
      startBalance: currentBalance.value,
      incomeStreams: incomeStreams.value,
      recurringExpenses: recurringExpenses.value,
      plannedExpenses: plannedExpenses.value,
      days: forecastDays.value,
    })
  )

  // Projected balance at end of forecast window
  const projectedEndBalance = computed(() =>
    forecast.value.length ? forecast.value[forecast.value.length - 1].balance : currentBalance.value
  )

  // Net monthly cash flow (income minus recurring expenses, no one-offs)
  const monthlyNetFlow = computed(() => {
    const monthlyIncome = incomeStreams.value.reduce((sum, s) => {
      if (s.frequency === 'monthly')   return sum + s.amount
      if (s.frequency === 'biweekly') return sum + (s.amount * 26 / 12)
      if (s.frequency === 'weekly')   return sum + (s.amount * 52 / 12)
      return sum + s.amount
    }, 0)

    const monthlyExpenses = recurringExpenses.value.reduce((sum, e) => {
      if (e.frequency === 'monthly')   return sum + e.amount
      if (e.frequency === 'biweekly') return sum + (e.amount * 26 / 12)
      return sum + e.amount
    }, 0)

    return monthlyIncome - monthlyExpenses
  })

  // Upcoming events in the next 14 days — used for the "upcoming" timeline strip
  const upcomingEvents = computed(() => {
    const today = new Date()
    const cutoff = new Date()
    cutoff.setDate(today.getDate() + 14)

    return forecast.value
      .filter(day => day.events.length && new Date(day.date) <= cutoff)
      .flatMap(day => day.events.map(e => ({ ...e, date: day.date })))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  })

  // Lowest projected balance within the window — critical for detecting cash crunches
  const lowestProjectedBalance = computed(() =>
    forecast.value.reduce(
      (min, day) => (day.balance < min.balance ? day : min),
      { balance: Infinity, date: null }
    )
  )

  // Is there a risk of going negative?
  const hasCashCrunchRisk = computed(() => lowestProjectedBalance.value.balance < 500)

  // Monthly expense breakdown by category
  const expensesByCategory = computed(() => {
    const map = {}
    for (const exp of recurringExpenses.value) {
      const cat = exp.category
      if (!map[cat]) map[cat] = { label: cat, amount: 0, count: 0 }
      map[cat].amount += exp.amount
      map[cat].count++
    }
    return Object.values(map).sort((a, b) => b.amount - a.amount)
  })

  // ─── Actions ──────────────────────────────────────────────────────────────────

  function addIncome(stream) {
    incomeStreams.value.push({ id: `inc-${Date.now()}`, source: 'manual', ...stream })
  }

  function addExpense(expense) {
    recurringExpenses.value.push({ id: `exp-${Date.now()}`, source: 'manual', ...expense })
  }

  function addPlannedExpense(expense) {
    plannedExpenses.value.push({ id: `plan-${Date.now()}`, source: 'manual', ...expense })
  }

  function removeExpense(id) {
    recurringExpenses.value = recurringExpenses.value.filter(e => e.id !== id)
  }

  function removePlanned(id) {
    plannedExpenses.value = plannedExpenses.value.filter(e => e.id !== id)
  }

  function setForecastDays(days) {
    forecastDays.value = days
  }

  function setCurrentBalance(balance) {
    currentBalance.value = balance
  }

  // Sync income/expenses detected from Plaid transactions
  // In production, call this after fetching /transactions endpoint
  function syncFromPlaid(plaidTransactions) {
    const recurring = detectRecurringFromPlaid(plaidTransactions)
    recurring.forEach(item => {
      const exists = recurringExpenses.value.find(e => e.label === item.label)
      if (!exists) {
        recurringExpenses.value.push({ id: `plaid-${Date.now()}-${Math.random()}`, source: 'plaid', ...item })
      }
    })
  }

  return {
    // state
    currentBalance,
    incomeStreams,
    recurringExpenses,
    plannedExpenses,
    forecastDays,
    activeFilter,
    // computed
    forecast,
    projectedEndBalance,
    monthlyNetFlow,
    upcomingEvents,
    lowestProjectedBalance,
    hasCashCrunchRisk,
    expensesByCategory,
    // actions
    addIncome,
    addExpense,
    addPlannedExpense,
    removeExpense,
    removePlanned,
    setForecastDays,
    setCurrentBalance,
    syncFromPlaid,
  }
})

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getNextBiweekly() {
  const today = new Date()
  const day = today.getDay()
  const daysUntilFriday = (5 - day + 7) % 7 || 7
  const next = new Date(today)
  next.setDate(today.getDate() + daysUntilFriday)
  return next.toISOString().split('T')[0]
}

// Naive recurring detection from Plaid — expand as needed in production
function detectRecurringFromPlaid(transactions) {
  const frequency = {}
  for (const tx of transactions) {
    const key = tx.merchant_name || tx.name
    if (!frequency[key]) frequency[key] = { count: 0, amount: tx.amount, label: key }
    frequency[key].count++
  }
  return Object.values(frequency)
    .filter(t => t.count >= 2)
    .map(t => ({
      label: t.label,
      amount: Math.abs(t.amount),
      dueDay: new Date().getDate(),
      frequency: 'monthly',
      category: categorizeBill(t.label),
    }))
}
