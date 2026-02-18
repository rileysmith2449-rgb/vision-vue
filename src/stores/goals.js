// stores/goals.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGoalsStore = defineStore('goals', () => {

  // ─── State ───────────────────────────────────────────────────────────────────

  const goals = ref([
    {
      id: 'g1',
      title: 'Emergency Fund',
      emoji: '🛡️',
      targetAmount: 30000,
      currentAmount: 24600,
      targetDate: '2026-06-01',
      category: 'savings',
      color: '#34d399',
      linkedAccountId: 'a2',
      contributions: generateDemoContributions(24600, 18),
      archived: false,
    },
    {
      id: 'g2',
      title: 'Vegas Trip',
      emoji: '✈️',
      targetAmount: 3000,
      currentAmount: 850,
      targetDate: '2026-03-15',
      category: 'travel',
      color: '#fbbf24',
      linkedAccountId: null,
      contributions: generateDemoContributions(850, 4),
      archived: false,
    },
    {
      id: 'g3',
      title: 'Baby Prep Fund',
      emoji: '👶',
      targetAmount: 15000,
      currentAmount: 4200,
      targetDate: '2026-09-01',
      category: 'family',
      color: '#a78bfa',
      linkedAccountId: null,
      contributions: generateDemoContributions(4200, 6),
      archived: false,
    },
    {
      id: 'g4',
      title: 'Investment Portfolio',
      emoji: '📈',
      targetAmount: 150000,
      currentAmount: 87450,
      targetDate: '2028-01-01',
      category: 'investment',
      color: '#60a5fa',
      linkedAccountId: 'a3',
      contributions: generateDemoContributions(87450, 24),
      archived: false,
    },
  ])

  const selectedGoalId = ref(null)
  const sortMode = ref('progress')

  // ─── Computed ─────────────────────────────────────────────────────────────────

  const activeGoals = computed(() =>
    goals.value.filter(g => !g.archived)
  )

  const sortedGoals = computed(() => {
    const list = [...activeGoals.value]
    switch (sortMode.value) {
      case 'date':     return list.sort((a, b) => a.targetDate.localeCompare(b.targetDate))
      case 'amount':   return list.sort((a, b) => b.targetAmount - a.targetAmount)
      case 'progress': return list.sort((a, b) => progressPercent(b) - progressPercent(a))
      default:         return list
    }
  })

  const selectedGoal = computed(() =>
    goals.value.find(g => g.id === selectedGoalId.value) || null
  )

  const totalSaved = computed(() =>
    activeGoals.value.reduce((sum, g) => sum + g.currentAmount, 0)
  )

  const totalTarget = computed(() =>
    activeGoals.value.reduce((sum, g) => sum + g.targetAmount, 0)
  )

  const overallProgress = computed(() =>
    totalTarget.value > 0 ? (totalSaved.value / totalTarget.value) * 100 : 0
  )

  const goalsAtRisk = computed(() =>
    activeGoals.value.filter(g => {
      const daysLeft = daysUntil(g.targetDate)
      const pct = progressPercent(g)
      return daysLeft <= 60 && pct < 80
    })
  )

  // ─── Actions ──────────────────────────────────────────────────────────────────

  function addGoal(goal) {
    goals.value.push({
      id: `g${Date.now()}`,
      contributions: [],
      archived: false,
      ...goal,
    })
  }

  function addContribution(goalId, amount) {
    const goal = goals.value.find(g => g.id === goalId)
    if (!goal) return
    goal.currentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
    goal.contributions.push({
      date: new Date().toISOString().split('T')[0],
      amount,
      running: goal.currentAmount,
    })
  }

  function updateGoal(goalId, updates) {
    const goal = goals.value.find(g => g.id === goalId)
    if (goal) Object.assign(goal, updates)
  }

  function archiveGoal(goalId) {
    const goal = goals.value.find(g => g.id === goalId)
    if (goal) goal.archived = true
    if (selectedGoalId.value === goalId) selectedGoalId.value = null
  }

  function selectGoal(id) {
    selectedGoalId.value = selectedGoalId.value === id ? null : id
  }

  function setSortMode(mode) {
    sortMode.value = mode
  }

  function syncFromAccount(accounts) {
    for (const goal of goals.value) {
      if (!goal.linkedAccountId) continue
      const account = accounts.find(a => a.id === goal.linkedAccountId)
      if (account && account.balance > 0) {
        goal.currentAmount = account.balance
      }
    }
  }

  return {
    goals, selectedGoalId, sortMode,
    activeGoals, sortedGoals, selectedGoal,
    totalSaved, totalTarget, overallProgress, goalsAtRisk,
    addGoal, addContribution, updateGoal, archiveGoal, selectGoal, setSortMode, syncFromAccount,
  }
})

// ─── Helpers (also exported for use in components) ────────────────────────────

export function progressPercent(goal) {
  if (!goal.targetAmount) return 0
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
}

export function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.max(0, Math.round((target - today) / (1000 * 60 * 60 * 24)))
}

export function monthlyNeeded(goal) {
  const days = daysUntil(goal.targetDate)
  if (days <= 0) return 0
  const remaining = goal.targetAmount - goal.currentAmount
  const months = days / 30
  return months > 0 ? remaining / months : remaining
}

export function projectedCompletion(goal) {
  const recent = goal.contributions.slice(-12)
  if (recent.length < 2) return null
  const totalContrib = recent.reduce((s, c) => s + c.amount, 0)
  const monthsSpan = recent.length / 4
  const monthlyRate = monthsSpan > 0 ? totalContrib / monthsSpan : 0
  if (monthlyRate <= 0) return null
  const remaining = goal.targetAmount - goal.currentAmount
  const monthsNeeded = remaining / monthlyRate
  const projected = new Date()
  projected.setMonth(projected.getMonth() + Math.ceil(monthsNeeded))
  return projected.toISOString().split('T')[0]
}

function generateDemoContributions(currentAmount, monthsBack) {
  const contributions = []
  const today = new Date()
  let running = currentAmount * 0.1
  for (let i = monthsBack; i >= 0; i--) {
    const date = new Date(today)
    date.setMonth(today.getMonth() - i)
    const amount = Math.round((currentAmount * 0.9 / monthsBack) * (0.7 + Math.random() * 0.6))
    running = Math.min(currentAmount, running + amount)
    contributions.push({
      date: date.toISOString().split('T')[0],
      amount,
      running: Math.round(running),
    })
  }
  return contributions
}
