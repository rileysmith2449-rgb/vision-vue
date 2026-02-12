export function getBestCardForCategory(category, budgetMode = 'personal', businessEnabled = false) {
  const type = budgetMode === 'family' ? 'personal' : budgetMode
  const eligible = creditCards.filter(c => c.type === type || (businessEnabled && c.type === 'business'))
  let bestCard = null
  let bestRate = 0
  for (const card of eligible) {
    const rate = card.cashbackRates[category] || card.cashbackRates.default || 0
    if (rate > bestRate) {
      bestRate = rate
      bestCard = card.name
    }
  }
  return { cardName: bestCard, rate: bestRate }
}

export const creditCards = [
  {
    name: 'Amex Gold',
    type: 'personal',
    annualFee: 250,
    color: '#C5A047',
    cashbackRates: {
      'Dining & Food': 0.04,
      'Travel': 0.03,
      default: 0.01
    },
    statementCredits: [
      { name: 'Dining Credit', amount: 120, used: true },
      { name: 'Uber Credit', amount: 120, used: true },
      { name: 'Dunkin Credit', amount: 84, used: false }
    ]
  },
  {
    name: 'Chase Sapphire',
    type: 'personal',
    annualFee: 550,
    color: '#1A3C6E',
    cashbackRates: {
      'Travel': 0.05,
      'Dining & Food': 0.03,
      'Entertainment': 0.03,
      default: 0.01
    },
    statementCredits: [
      { name: 'Travel Credit', amount: 300, used: true },
      { name: 'DashPass Credit', amount: 60, used: false }
    ]
  },
  {
    name: 'Citi Double',
    type: 'personal',
    annualFee: 0,
    color: '#003DA5',
    cashbackRates: {
      default: 0.02
    },
    statementCredits: []
  },
  {
    name: 'Apple Card',
    type: 'personal',
    annualFee: 0,
    color: '#E0E0E0',
    cashbackRates: {
      default: 0.02
    },
    statementCredits: []
  },
  {
    name: 'Capital One Savor',
    type: 'personal',
    annualFee: 95,
    color: '#D03027',
    cashbackRates: {
      'Dining & Food': 0.04,
      'Entertainment': 0.04,
      'Shopping': 0.03,
      default: 0.01
    },
    statementCredits: []
  },
  {
    name: 'Amex Business Gold',
    type: 'business',
    annualFee: 375,
    color: '#8B6914',
    cashbackRates: {
      'Office & Software': 0.04,
      'Travel': 0.03,
      'Meals & Entertainment': 0.03,
      default: 0.01
    },
    statementCredits: [
      { name: 'Dell Credit', amount: 200, used: false }
    ]
  },
  {
    name: 'Chase Ink Business',
    type: 'business',
    annualFee: 95,
    color: '#0A2540',
    cashbackRates: {
      'Office & Software': 0.05,
      'Internet & Phone': 0.05,
      default: 0.01
    },
    statementCredits: []
  }
]

export const marketCards = [
  {
    name: 'Wells Fargo Active Cash',
    annualFee: 0,
    cashbackRates: {
      default: 0.02
    },
    highlight: 'Flat 2% cash back on everything with no annual fee'
  },
  {
    name: 'Amex Blue Cash Preferred',
    annualFee: 95,
    cashbackRates: {
      'Dining & Food': 0.06,
      'Entertainment': 0.06,
      'Transportation': 0.03,
      default: 0.01
    },
    highlight: '6% at U.S. supermarkets & streaming, 3% transit'
  },
  {
    name: 'Citi Custom Cash',
    annualFee: 0,
    cashbackRates: {
      'Dining & Food': 0.05,
      'Shopping': 0.05,
      'Transportation': 0.05,
      'Entertainment': 0.05,
      'Travel': 0.05,
      'Bills & Utilities': 0.05,
      default: 0.01
    },
    highlight: '5% on your top eligible spend category each cycle, no fee'
  },
  {
    name: 'Chase Freedom Unlimited',
    annualFee: 0,
    cashbackRates: {
      'Dining & Food': 0.03,
      'Shopping': 0.03,
      default: 0.015
    },
    highlight: '1.5% on everything plus 3% on dining & drugstores'
  },
  {
    name: 'US Bank Altitude Go',
    annualFee: 0,
    cashbackRates: {
      'Dining & Food': 0.04,
      'Entertainment': 0.02,
      'Transportation': 0.02,
      default: 0.01
    },
    highlight: '4% dining, 2% groceries/gas/streaming, no fee'
  }
]
