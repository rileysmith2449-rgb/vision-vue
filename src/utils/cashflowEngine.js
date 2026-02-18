// utils/cashflowEngine.js
// Pure functions — no Vue/Pinia dependencies. Easy to unit test.

/**
 * generateForecast
 * Produces a day-by-day array of balance checkpoints for the given window.
 *
 * @param {Object} opts
 * @param {number}   opts.startBalance       - Current account balance
 * @param {Array}    opts.incomeStreams       - Recurring income definitions
 * @param {Array}    opts.recurringExpenses  - Recurring bill definitions
 * @param {Array}    opts.plannedExpenses    - One-time future expenses
 * @param {number}   opts.days              - Forecast horizon in days
 * @returns {Array}  Array of { date, balance, events, delta }
 */
export function generateForecast({ startBalance, incomeStreams, recurringExpenses, plannedExpenses, days }) {
  const result = []
  let balance = startBalance
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = toDateStr(date)
    const events = []

    // Check income
    for (const stream of incomeStreams) {
      if (isIncomeDay(stream, date)) {
        balance += stream.amount
        events.push({ type: 'income', label: stream.label, amount: stream.amount })
      }
    }

    // Check recurring expenses
    for (const exp of recurringExpenses) {
      if (isExpenseDay(exp, date)) {
        balance -= exp.amount
        events.push({ type: 'expense', label: exp.label, amount: exp.amount, category: exp.category })
      }
    }

    // Check planned (one-time) expenses
    for (const planned of plannedExpenses) {
      if (planned.date === dateStr) {
        balance -= planned.amount
        events.push({ type: 'planned', label: planned.label, amount: planned.amount, category: planned.category })
      }
    }

    const delta = events.reduce((sum, e) => {
      return e.type === 'income' ? sum + e.amount : sum - e.amount
    }, 0)

    result.push({ date: dateStr, balance: Math.round(balance * 100) / 100, events, delta })
  }

  return result
}

/**
 * Determine if a given date is a payday for a given income stream.
 */
export function isIncomeDay(stream, date) {
  const streamStart = new Date(stream.nextDate)
  streamStart.setHours(0, 0, 0, 0)

  if (date < streamStart) return false

  const diffDays = Math.round((date - streamStart) / (1000 * 60 * 60 * 24))

  switch (stream.frequency) {
    case 'weekly':    return diffDays % 7 === 0
    case 'biweekly': return diffDays % 14 === 0
    case 'monthly':  return date.getDate() === streamStart.getDate()
    case 'custom':   return stream.dates?.includes(toDateStr(date)) ?? false
    default:         return false
  }
}

/**
 * Determine if a given date is a bill due date for a given expense.
 */
export function isExpenseDay(expense, date) {
  switch (expense.frequency) {
    case 'monthly':  return date.getDate() === expense.dueDay
    case 'weekly':   return date.getDay() === expense.dueDay
    case 'biweekly': {
      // Treat dueDay as the weekday, fire every 2 weeks from start of year
      const startOfYear = new Date(date.getFullYear(), 0, 1)
      const weekNumber = Math.floor((date - startOfYear) / (7 * 24 * 60 * 60 * 1000))
      return date.getDay() === expense.dueDay && weekNumber % 2 === 0
    }
    default: return false
  }
}

/**
 * Keyword-based bill categorizer for Plaid transaction names.
 * Extend this list as your transaction data grows.
 */
export function categorizeBill(label = '') {
  const l = label.toLowerCase()

  if (/rent|mortgage|hoa|realty/.test(l))                    return 'housing'
  if (/electric|gas|water|pg&e|utility|utilities/.test(l))   return 'utilities'
  if (/at&t|verizon|t-mobile|comcast|internet|phone/.test(l))return 'utilities'
  if (/netflix|spotify|hulu|disney|apple|youtube|hbo/.test(l))return 'subscription'
  if (/insurance|geico|progressive|allstate/.test(l))        return 'insurance'
  if (/gym|fitness|equinox|planet fitness/.test(l))          return 'health'
  if (/amazon|target|walmart|costco/.test(l))                return 'shopping'
  if (/car|auto|vehicle|dmv|registration/.test(l))           return 'auto'
  if (/student loan|sallie mae|navient/.test(l))             return 'debt'
  if (/doordash|uber eats|grubhub|instacart/.test(l))        return 'food'

  return 'other'
}

/**
 * Format a Date to YYYY-MM-DD string.
 */
export function toDateStr(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Get human-friendly label for days until a date.
 */
export function daysUntilLabel(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24))

  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff <= 7)  return `In ${diff} days`
  if (diff <= 14) return 'Next week'
  return `In ${Math.round(diff / 7)} weeks`
}

/**
 * Summarize total income and expenses within a date range.
 */
export function summarizeRange(forecastDays, startDate, endDate) {
  return forecastDays
    .filter(d => d.date >= startDate && d.date <= endDate)
    .reduce(
      (acc, day) => {
        for (const e of day.events) {
          if (e.type === 'income') acc.income += e.amount
          else acc.expenses += e.amount
        }
        return acc
      },
      { income: 0, expenses: 0 }
    )
}
