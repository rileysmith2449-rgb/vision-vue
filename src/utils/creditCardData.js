export function getBestCardForCategory(category, budgetMode = 'personal') {
  const type = budgetMode === 'family' ? 'personal' : budgetMode
  const eligible = creditCards.filter(c => c.type === type)
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
