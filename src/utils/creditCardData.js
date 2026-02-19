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
    ],
    signupBonus: { amount: 60000, type: 'points', dollarValue: 1200, spendRequired: 6000, months: 6 }
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
    ],
    signupBonus: { amount: 60000, type: 'points', dollarValue: 900, spendRequired: 4000, months: 3 }
  },
  {
    name: 'Citi Double',
    type: 'personal',
    annualFee: 0,
    color: '#003DA5',
    cashbackRates: {
      default: 0.02
    },
    statementCredits: [],
    signupBonus: { amount: 200, type: 'cash back', dollarValue: 200, spendRequired: 1500, months: 3 }
  },
  {
    name: 'Apple Card',
    type: 'personal',
    annualFee: 0,
    color: '#E0E0E0',
    cashbackRates: {
      default: 0.02
    },
    statementCredits: [],
    signupBonus: null
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
    statementCredits: [],
    signupBonus: { amount: 200, type: 'cash back', dollarValue: 200, spendRequired: 3000, months: 3 }
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
    ],
    signupBonus: { amount: 175000, type: 'points', dollarValue: 875, spendRequired: 6000, months: 6 }
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
    upgradeTo: 'Chase Ink Business',
    signupBonus: { amount: 750, type: 'cash back', dollarValue: 750, spendRequired: 6000, months: 3 }
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
    ],
    signupBonus: { amount: 70000, type: 'points', dollarValue: 1400, spendRequired: 10000, months: 3 }
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
    statementCredits: [],
    signupBonus: { amount: 120000, type: 'points', dollarValue: 1500, spendRequired: 8000, months: 3 }
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

// ── Points Ecosystems ──
// Cards that share a transferable points program and can pool points together.
// The best redemption multiplier applies to all pooled points.
export const pointsEcosystems = {
  'Chase Ultimate Rewards': {
    program: 'Chase Ultimate Rewards',
    unit: 'UR pts',
    cards: ['Chase Sapphire', 'Chase Freedom Unlimited', 'Chase Ink Business', 'Chase Ink Business Preferred', 'Ink Business Cash'],
    redemptions: [
      { method: 'Statement Credit', multiplier: 1.0, rate: '1¢/pt' },
      { method: 'Chase Travel Portal (Sapphire)', multiplier: 1.5, rate: '1.5¢/pt', requiresCard: 'Chase Sapphire' },
      { method: 'Airline/Hotel Transfers', multiplier: 2.0, rate: '~2¢/pt', requiresCard: 'Chase Sapphire' },
    ],
    bestMultiplier: 2.0,
    poolNote: 'Pool personal + business UR points and redeem through Sapphire Reserve at up to 2¢/pt via transfer partners',
  },
  'Amex Membership Rewards': {
    program: 'Amex Membership Rewards',
    unit: 'MR pts',
    cards: ['Amex Gold', 'Amex Business Gold', 'Amex Blue Business Plus'],
    redemptions: [
      { method: 'Statement Credit', multiplier: 0.6, rate: '0.6¢/pt' },
      { method: 'Amex Travel Portal', multiplier: 1.0, rate: '1¢/pt' },
      { method: 'Airline Transfers', multiplier: 2.0, rate: '~2¢/pt' },
    ],
    bestMultiplier: 2.0,
    poolNote: 'Pool personal + business MR points and transfer to airline/hotel partners at up to 2¢/pt',
  },
  'Capital One Miles': {
    program: 'Capital One Miles',
    unit: 'miles',
    cards: ['Capital One Savor', 'Capital One Spark Cash Plus'],
    redemptions: [
      { method: 'Statement Credit', multiplier: 1.0, rate: '1¢/mi' },
      { method: 'Travel Portal', multiplier: 1.25, rate: '1.25¢/mi' },
      { method: 'Airline Transfers', multiplier: 1.4, rate: '~1.4¢/mi' },
    ],
    bestMultiplier: 1.4,
    poolNote: 'Transfer miles to 15+ airline partners for up to 1.4¢/mile value',
  },
  'Citi ThankYou': {
    program: 'Citi ThankYou',
    unit: 'TY pts',
    cards: ['Citi Double', 'Citi Custom Cash'],
    redemptions: [
      { method: 'Statement Credit', multiplier: 1.0, rate: '1¢/pt' },
      { method: 'Airline Transfers', multiplier: 1.6, rate: '~1.6¢/pt' },
    ],
    bestMultiplier: 1.6,
    poolNote: 'Transfer ThankYou points to airline partners for up to 1.6¢/pt',
  },
  'Hilton Honors': {
    program: 'Hilton Honors',
    unit: 'pts',
    cards: ['Hilton Amex'],
    redemptions: [
      { method: 'Hotel Stays', multiplier: 0.5, rate: '~0.5¢/pt' },
      { method: 'Points + Cash', multiplier: 0.6, rate: '~0.6¢/pt' },
    ],
    bestMultiplier: 0.6,
    poolNote: 'Best value by booking Hilton stays directly with points',
  },
}

// ── Card Ecosystems / Combos ──
// Curated card combinations for personal, business, and combined use
export const cardEcosystems = [
  {
    name: 'Chase Trifecta',
    scope: 'personal',
    description: 'The classic combo: earn UR on everything and redeem at premium rates through Sapphire',
    cards: [
      { name: 'Chase Sapphire', role: 'Travel & Dining anchor, 1.5-2¢ redemption', required: true },
      { name: 'Chase Freedom Unlimited', role: 'Everyday 1.5% base + 3% dining', required: true },
      { name: 'Citi Custom Cash', role: '5% on top rotating category', required: false },
    ],
    totalAnnualFee: 550,
    highlight: 'Earn 1.5-5x on everything, redeem UR at up to 2¢/pt',
  },
  {
    name: 'Amex Rewards Suite',
    scope: 'personal',
    description: 'Premium dining & travel rewards with transfer partner access',
    cards: [
      { name: 'Amex Gold', role: '4x dining & groceries', required: true },
      { name: 'Amex Blue Cash Preferred', role: '6% groceries & streaming', required: false },
      { name: 'Citi Double', role: 'Flat 2% catch-all', required: false },
    ],
    totalAnnualFee: 345,
    highlight: '4-6x on dining & groceries, 2x everywhere else',
  },
  {
    name: 'Chase Business Stack',
    scope: 'business',
    description: 'Maximize UR on business spend and pool with personal Chase cards',
    cards: [
      { name: 'Chase Ink Business', role: '5x office & internet', required: true },
      { name: 'Chase Ink Business Preferred', role: '3x travel, shipping, advertising', required: false },
      { name: 'Amex Blue Business Plus', role: '2x on everything (catch-all)', required: false },
    ],
    totalAnnualFee: 190,
    highlight: '3-5x on business categories, pool UR with personal cards',
  },
  {
    name: 'Amex Business Suite',
    scope: 'business',
    description: 'Premium business rewards with MR transfer partners',
    cards: [
      { name: 'Amex Business Gold', role: '4x top 2 categories each month', required: true },
      { name: 'Amex Blue Business Plus', role: '2x on everything up to $50K', required: true },
      { name: 'Ink Business Cash', role: '2% office & internet (no fee)', required: false },
    ],
    totalAnnualFee: 375,
    highlight: '2-4x on business spend, pool MR with personal Amex cards',
  },
  {
    name: 'Ultimate Combined Setup',
    scope: 'combined',
    description: 'Best of both worlds: maximize every category across personal and business',
    cards: [
      { name: 'Chase Sapphire', role: 'Anchor: 5x travel, 1.5-2¢ UR redemption', required: true },
      { name: 'Amex Gold', role: '4x dining & groceries', required: true },
      { name: 'Chase Ink Business', role: '5x office & internet', required: true },
      { name: 'Citi Custom Cash', role: '5% on top category gap', required: false },
    ],
    totalAnnualFee: 895,
    highlight: '4-5x on travel, dining, office, internet — catch-all for gaps',
  },
]
