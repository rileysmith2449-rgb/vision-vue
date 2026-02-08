export const creditCards = [
  {
    name: 'Amex Gold',
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
    annualFee: 0,
    color: '#003DA5',
    cashbackRates: {
      default: 0.02
    },
    statementCredits: []
  },
  {
    name: 'Apple Card',
    annualFee: 0,
    color: '#E0E0E0',
    cashbackRates: {
      default: 0.02
    },
    statementCredits: []
  },
  {
    name: 'Capital One Savor',
    annualFee: 95,
    color: '#D03027',
    cashbackRates: {
      'Dining & Food': 0.04,
      'Entertainment': 0.04,
      'Shopping': 0.03,
      default: 0.01
    },
    statementCredits: []
  }
]
