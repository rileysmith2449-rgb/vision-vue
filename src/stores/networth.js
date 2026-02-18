// stores/networth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNetworthStore = defineStore('networth', () => {

  // ─── State ───────────────────────────────────────────────────────────────────

  const history = ref(generateDemoHistory())

  const accounts = ref([
    // Assets
    { id: 'a1',  name: 'Chase Checking',      type: 'depository',  subtype: 'checking',   balance: 8420,     institution: 'Chase',        plaidId: null },
    { id: 'a2',  name: 'Marcus HYSA',          type: 'depository',  subtype: 'savings',    balance: 24600,    institution: 'Goldman Sachs', plaidId: null },
    { id: 'a3',  name: 'Fidelity Brokerage',   type: 'investment',  subtype: 'brokerage',  balance: 87450,    institution: 'Fidelity',     plaidId: null },
    { id: 'a4',  name: '401(k)',               type: 'investment',  subtype: '401k',       balance: 62300,    institution: 'Vanguard',     plaidId: null },
    { id: 'a5',  name: 'Roth IRA',             type: 'investment',  subtype: 'ira',        balance: 18900,    institution: 'Fidelity',     plaidId: null },
    // Liabilities
    { id: 'l1',  name: 'Chase Sapphire',       type: 'credit',      subtype: 'credit card',balance: -2840,    institution: 'Chase',        plaidId: null },
    { id: 'l2',  name: 'Car Loan',             type: 'loan',        subtype: 'auto',       balance: -18200,   institution: 'Ally',         plaidId: null },
  ])

  const manualAssets = ref([
    { id: 'm1', name: '2017 Porsche Panamera Turbo', category: 'vehicle',  value: 68000 },
    { id: 'm2', name: 'Apartment Furnishings',        category: 'personal', value: 12000 },
  ])

  const activeTab = ref('accounts')
  const chartRange = ref('1y')

  // ─── Computed ─────────────────────────────────────────────────────────────────

  const totalAssets = computed(() => {
    const accountAssets = accounts.value
      .filter(a => a.balance > 0)
      .reduce((sum, a) => sum + a.balance, 0)
    const manual = manualAssets.value.reduce((sum, a) => sum + a.value, 0)
    return accountAssets + manual
  })

  const totalLiabilities = computed(() =>
    accounts.value
      .filter(a => a.balance < 0)
      .reduce((sum, a) => sum + Math.abs(a.balance), 0)
  )

  const netWorth = computed(() => totalAssets.value - totalLiabilities.value)

  const monthlyChange = computed(() => {
    if (history.value.length < 2) return { amount: 0, percent: 0 }
    const latest = history.value[history.value.length - 1]
    const monthAgo = history.value[Math.max(0, history.value.length - 31)]
    const amount = latest.value - monthAgo.value
    const percent = monthAgo.value !== 0 ? (amount / monthAgo.value) * 100 : 0
    return { amount, percent }
  })

  const yearlyChange = computed(() => {
    if (history.value.length < 2) return { amount: 0, percent: 0 }
    const latest = history.value[history.value.length - 1]
    const yearAgo = history.value[Math.max(0, history.value.length - 366)]
    const amount = latest.value - yearAgo.value
    const percent = yearAgo.value !== 0 ? (amount / yearAgo.value) * 100 : 0
    return { amount, percent }
  })

  const filteredHistory = computed(() => {
    const all = history.value
    if (chartRange.value === 'all') return all
    const days = { '3m': 90, '6m': 180, '1y': 365 }[chartRange.value] || 365
    return all.slice(-days)
  })

  const accountsByType = computed(() => {
    const groups = {}
    for (const acc of accounts.value) {
      if (!groups[acc.type]) groups[acc.type] = { type: acc.type, accounts: [], total: 0 }
      groups[acc.type].accounts.push(acc)
      groups[acc.type].total += acc.balance
    }
    if (manualAssets.value.length) {
      groups['manual'] = {
        type: 'manual',
        accounts: manualAssets.value.map(a => ({ ...a, balance: a.value })),
        total: manualAssets.value.reduce((s, a) => s + a.value, 0)
      }
    }
    return Object.values(groups).sort((a, b) => b.total - a.total)
  })

  const assetAllocation = computed(() => {
    const categories = {
      'Cash & Savings': 0,
      'Investments':    0,
      'Real Assets':    0,
      'Retirement':     0,
    }
    for (const acc of accounts.value) {
      if (acc.balance <= 0) continue
      if (acc.subtype === 'checking' || acc.subtype === 'savings') categories['Cash & Savings'] += acc.balance
      else if (acc.subtype === 'brokerage') categories['Investments'] += acc.balance
      else if (['401k', 'ira', 'roth', '403b'].includes(acc.subtype)) categories['Retirement'] += acc.balance
    }
    for (const a of manualAssets.value) {
      if (['real_estate', 'vehicle', 'personal'].includes(a.category)) categories['Real Assets'] += a.value
    }
    return Object.entries(categories)
      .filter(([, v]) => v > 0)
      .map(([label, value]) => ({ label, value, percent: (value / totalAssets.value * 100).toFixed(1) }))
  })

  // ─── Actions ──────────────────────────────────────────────────────────────────

  function recordSnapshot() {
    const today = toDateStr(new Date())
    const existing = history.value.find(h => h.date === today)
    const snap = { date: today, value: netWorth.value, assets: totalAssets.value, liabilities: totalLiabilities.value }
    if (existing) {
      Object.assign(existing, snap)
    } else {
      history.value.push(snap)
    }
  }

  function addManualAsset(asset) {
    manualAssets.value.push({ id: `m${Date.now()}`, ...asset })
  }

  function removeManualAsset(id) {
    manualAssets.value = manualAssets.value.filter(a => a.id !== id)
  }

  function setChartRange(range) {
    chartRange.value = range
  }

  function setActiveTab(tab) {
    activeTab.value = tab
  }

  function syncFromPlaid(plaidAccounts) {
    for (const plaidAcc of plaidAccounts) {
      const existing = accounts.value.find(a => a.plaidId === plaidAcc.account_id)
      const balance = plaidAcc.type === 'credit' || plaidAcc.type === 'loan'
        ? -(plaidAcc.balances.current || 0)
        : (plaidAcc.balances.current || 0)

      if (existing) {
        existing.balance = balance
      } else {
        accounts.value.push({
          id: `plaid-${plaidAcc.account_id}`,
          name: plaidAcc.name,
          type: plaidAcc.type,
          subtype: plaidAcc.subtype,
          balance,
          institution: plaidAcc.institution_name || '',
          plaidId: plaidAcc.account_id,
        })
      }
    }
    recordSnapshot()
  }

  return {
    history, accounts, manualAssets, activeTab, chartRange,
    totalAssets, totalLiabilities, netWorth,
    monthlyChange, yearlyChange,
    filteredHistory, accountsByType, assetAllocation,
    recordSnapshot, addManualAsset, removeManualAsset,
    setChartRange, setActiveTab, syncFromPlaid,
  }
})

function generateDemoHistory() {
  const history = []
  const today = new Date()
  let value = 195000
  let assets = 230000
  let liabilities = 35000

  for (let i = 540; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dailyGrowth = (Math.random() - 0.38) * 800
    value = Math.max(150000, value + dailyGrowth)
    assets = value + liabilities
    if (i % 7 === 0 || i === 0) {
      history.push({
        date: toDateStr(date),
        value: Math.round(value),
        assets: Math.round(assets),
        liabilities: Math.round(liabilities),
      })
    }
  }
  return history
}

function toDateStr(date) {
  return date.toISOString().split('T')[0]
}
