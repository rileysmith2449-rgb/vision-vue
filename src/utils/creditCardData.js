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
    name: 'Hilton Amex',
    type: 'personal',
    annualFee: 450,
    color: '#1A1A2E',
    cashbackRates: {
      'Travel': 0.07,
      'Dining & Food': 0.035,
      default: 0.015
    },
    statementCredits: [
      { name: 'Hilton Resort Credit', amount: 200, used: false },
      { name: 'Airline Credit', amount: 250, used: false }
    ]
  },
  {
    name: 'Ink Business Cash',
    type: 'business',
    annualFee: 0,
    color: '#1A1A2E',
    cashbackRates: {
      'Office & Software': 0.02,
      'Internet & Phone': 0.02,
      'Meals & Entertainment': 0.01,
      default: 0.01
    },
    statementCredits: [],
    upgradeTo: 'Chase Ink Business'
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

export function getUpgradeRecommendation(card, annualSpendOnBonusCategories) {
  if (!card.upgradeTo) return null
  const target = creditCards.find(c => c.name === card.upgradeTo)
  if (!target) return null
  const extraRewardRate = 0.03 // difference: 5% - 2% on bonus categories
  const extraAnnualRewards = annualSpendOnBonusCategories * extraRewardRate
  const netBenefit = extraAnnualRewards - target.annualFee
  if (netBenefit > 0) {
    return { targetCard: target, extraRewards: extraAnnualRewards, netBenefit }
  }
  return null
}

export const marketCards = [
  // Personal
  {
    name: 'Wells Fargo Active Cash',
    type: 'personal',
    annualFee: 0,
    cashbackRates: {
      default: 0.02
    },
    highlight: 'Flat 2% cash back on everything with no annual fee'
  },
  {
    name: 'Amex Blue Cash Preferred',
    type: 'personal',
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
    type: 'personal',
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
    type: 'personal',
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
    type: 'personal',
    annualFee: 0,
    cashbackRates: {
      'Dining & Food': 0.04,
      'Entertainment': 0.02,
      'Transportation': 0.02,
      default: 0.01
    },
    highlight: '4% dining, 2% groceries/gas/streaming, no fee'
  },
  // Business
  {
    name: 'Chase Ink Business Preferred',
    type: 'business',
    annualFee: 95,
    cashbackRates: {
      'Travel': 0.03,
      'Internet & Phone': 0.03,
      'Office & Software': 0.03,
      'Business': 0.03,
      default: 0.01
    },
    highlight: '3x on travel, shipping, internet, phone & advertising'
  },
  {
    name: 'Amex Blue Business Plus',
    type: 'business',
    annualFee: 0,
    cashbackRates: {
      default: 0.02
    },
    highlight: '2x on all purchases up to $50K/yr with no annual fee'
  },
  {
    name: 'Capital One Spark Cash Plus',
    type: 'business',
    annualFee: 150,
    cashbackRates: {
      default: 0.02
    },
    highlight: 'Unlimited 2% cash back on every business purchase'
  },
]
