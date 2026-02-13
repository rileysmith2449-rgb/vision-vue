/**
 * Generate demo portfolio holdings
 */
export function generateDemoHoldings() {
  const assetTypes = [
    { type: 'cash', symbols: ['Checking', 'Savings', 'Money Market'], icon: '💵', category: 'Cash' },
    { type: 'stock', symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'VOO', 'QQQ', 'VTI'], icon: '📈', category: 'Stocks' },
    { type: 'crypto', symbols: ['BTC', 'ETH', 'SOL'], icon: '₿', category: 'Crypto' },
    { type: 'realestate', symbols: ['Property A', 'Property B'], icon: '🏠', category: 'Real Estate' },
    { type: 'other', symbols: ['Gold', 'Collectibles'], icon: '🎯', category: 'Other' }
  ]

  const holdings = []
  let idCounter = 1

  assetTypes.forEach(assetType => {
    assetType.symbols.forEach(symbol => {
      const daysAgo = assetType.type === 'cash' ? 0 : Math.floor(Math.random() * 500)
      const purchaseDate = new Date()
      purchaseDate.setDate(purchaseDate.getDate() - daysAgo)

      const shares = assetType.type === 'cash' ? 1 : Math.floor(Math.random() * 100) + 10
      const costPerShare = assetType.type === 'cash'
        ? (5000 + Math.random() * 45000)
        : (100 + Math.random() * 300)
      const gainMultiplier = assetType.type === 'cash'
        ? 1
        : (Math.random() < 0.3 ? (0.85 + Math.random() * 0.1) : (1 + Math.random() * 0.4))
      const currentPerShare = costPerShare * gainMultiplier

      holdings.push({
        id: `holding-${idCounter++}`,
        symbol: symbol,
        type: assetType.type,
        category: assetType.category,
        icon: assetType.icon,
        shares: shares,
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        costBasis: shares * costPerShare,
        currentValue: shares * currentPerShare
      })
    })
  })

  return holdings
}

/**
 * Generate demo expense data
 */
export function generateExpenseData() {
  return generatePersonalExpenseData()
}

/**
 * Generate personal expense data
 */
function generatePersonalExpenseData() {
  return {
    'Housing & Rent': {
      icon: '🏠',
      budget: 2800,
      subcategories: {
        'Rent': [
          { merchant: 'Avalon Apartments', amount: 2450.00, date: '2026-02-01', card: 'Citi Double' }
        ],
        'Renters Insurance': [
          { merchant: 'Lemonade Insurance', amount: 15.00, date: '2026-02-01', card: 'Citi Double' }
        ]
      }
    },
    'Dining & Food': {
      icon: '🍽️',
      budget: 1200,
      subcategories: {
        'Restaurants': [
          { merchant: 'Chipotle', amount: 45.23, date: '2026-02-04', card: 'Amex Gold' },
          { merchant: 'The Cheesecake Factory', amount: 127.50, date: '2026-02-03', card: 'Amex Gold' },
          { merchant: 'Starbucks', amount: 8.75, date: '2026-02-02', card: 'Amex Gold' },
          { merchant: 'Olive Garden', amount: 89.40, date: '2026-02-01', card: 'Amex Gold' }
        ],
        'Groceries': [
          { merchant: 'Whole Foods', amount: 156.78, date: '2026-02-04', card: 'Amex Gold' },
          { merchant: 'Trader Joes', amount: 87.23, date: '2026-02-02', card: 'Amex Gold' },
          { merchant: 'Costco', amount: 234.56, date: '2026-01-31', card: 'Citi Double' }
        ],
        'Coffee Shops': [
          { merchant: 'Starbucks', amount: 6.45, date: '2026-02-05', card: 'Chase Sapphire' },
          { merchant: 'Blue Bottle', amount: 12.30, date: '2026-02-04', card: 'Chase Sapphire' },
          { merchant: 'Philz Coffee', amount: 8.75, date: '2026-02-03', card: 'Chase Sapphire' }
        ]
      }
    },
    'Transportation': {
      icon: '🚗',
      budget: 800,
      subcategories: {
        'Gas & Fuel': [
          { merchant: 'Shell Gas Station', amount: 65.00, date: '2026-02-04', card: 'Citi Double' },
          { merchant: 'Chevron', amount: 58.23, date: '2026-01-31', card: 'Citi Double' }
        ],
        'Rideshare': [
          { merchant: 'Uber', amount: 23.45, date: '2026-02-05', card: 'Chase Sapphire' },
          { merchant: 'Lyft', amount: 18.90, date: '2026-02-03', card: 'Chase Sapphire' }
        ],
        'Parking': [
          { merchant: 'SpotHero', amount: 15.00, date: '2026-02-04', card: 'Chase Sapphire' }
        ]
      }
    },
    'Shopping': {
      icon: '🛍️',
      budget: 600,
      subcategories: {
        'Clothing': [
          { merchant: 'Nike', amount: 145.00, date: '2026-02-03', card: 'Apple Card' },
          { merchant: 'Zara', amount: 89.50, date: '2026-02-01', card: 'Citi Double' }
        ],
        'Amazon': [
          { merchant: 'Amazon.com', amount: 67.23, date: '2026-02-04', card: 'Apple Card' },
          { merchant: 'Amazon.com', amount: 134.56, date: '2026-02-01', card: 'Apple Card' }
        ]
      }
    },
    'Entertainment': {
      icon: '🎬',
      budget: 400,
      subcategories: {
        'Streaming': [
          { merchant: 'Netflix', amount: 15.99, date: '2026-02-01', card: 'Capital One Savor' },
          { merchant: 'Spotify', amount: 10.99, date: '2026-02-01', card: 'Capital One Savor' },
          { merchant: 'Disney+', amount: 7.99, date: '2026-02-01', card: 'Citi Double' }
        ],
        'Movies & Events': [
          { merchant: 'AMC Theaters', amount: 45.00, date: '2026-02-02', card: 'Capital One Savor' }
        ]
      }
    },
    'Travel': {
      icon: '✈️',
      budget: 500,
      subcategories: {
        'Hotels': [
          { merchant: 'Marriott', amount: 289.00, date: '2026-02-03', card: 'Chase Sapphire' }
        ],
        'Flights': [
          { merchant: 'United Airlines', amount: 456.00, date: '2026-02-01', card: 'Chase Sapphire' }
        ]
      }
    },
    'Bills & Utilities': {
      icon: '💡',
      budget: 450,
      subcategories: {
        'Internet': [
          { merchant: 'Comcast', amount: 89.99, date: '2026-02-01', card: 'Citi Double' }
        ],
        'Electric': [
          { merchant: 'PG&E', amount: 145.67, date: '2026-02-01', card: 'Citi Double' }
        ],
        'Phone': [
          { merchant: 'Verizon', amount: 75.00, date: '2026-02-01', card: 'Citi Double' }
        ]
      }
    }
  }
}

/**
 * Generate business expense data
 */
export function generateFamilyExpenseData() {
  return {
    'Housing & Rent': {
      icon: '🏠',
      budget: 3500,
      subcategories: {
        'Mortgage': [
          { merchant: 'Chase Mortgage', amount: 2850.00, date: '2026-02-01', card: 'Citi Double', owner: 'ours' }
        ],
        'Home Insurance': [
          { merchant: 'State Farm', amount: 125.00, date: '2026-02-01', card: 'Citi Double', owner: 'ours' }
        ]
      }
    },
    'Dining & Food': {
      icon: '🍽️',
      budget: 1800,
      subcategories: {
        'Restaurants': [
          { merchant: 'Chipotle', amount: 52.30, date: '2026-02-04', card: 'Amex Gold', owner: 'mine' },
          { merchant: 'The Cheesecake Factory', amount: 145.00, date: '2026-02-03', card: 'Amex Gold', owner: 'yours' },
          { merchant: 'Olive Garden', amount: 98.50, date: '2026-02-01', card: 'Amex Gold', owner: 'mine' }
        ],
        'Groceries': [
          { merchant: 'Whole Foods', amount: 215.40, date: '2026-02-04', card: 'Amex Gold', owner: 'ours' },
          { merchant: 'Trader Joes', amount: 132.80, date: '2026-02-02', card: 'Amex Gold', owner: 'mine' },
          { merchant: 'Costco', amount: 312.45, date: '2026-01-31', card: 'Citi Double', owner: 'ours' }
        ],
        'Coffee Shops': [
          { merchant: 'Starbucks', amount: 7.25, date: '2026-02-05', card: 'Chase Sapphire', owner: 'mine' },
          { merchant: 'Blue Bottle', amount: 14.50, date: '2026-02-04', card: 'Chase Sapphire', owner: 'yours' }
        ]
      }
    },
    'Transportation': {
      icon: '🚗',
      budget: 1200,
      subcategories: {
        'Gas & Fuel': [
          { merchant: 'Shell Gas Station', amount: 72.00, date: '2026-02-04', card: 'Citi Double', owner: 'mine' },
          { merchant: 'Chevron', amount: 65.40, date: '2026-01-31', card: 'Citi Double', owner: 'yours' }
        ],
        'Rideshare': [
          { merchant: 'Uber', amount: 28.90, date: '2026-02-05', card: 'Chase Sapphire', owner: 'yours' },
          { merchant: 'Lyft', amount: 22.10, date: '2026-02-03', card: 'Chase Sapphire', owner: 'mine' }
        ],
        'Car Payment': [
          { merchant: 'Toyota Financial', amount: 385.00, date: '2026-02-01', card: 'Citi Double', owner: 'mine' }
        ]
      }
    },
    'Shopping': {
      icon: '🛍️',
      budget: 900,
      subcategories: {
        'Clothing': [
          { merchant: 'Nike', amount: 165.00, date: '2026-02-03', card: 'Apple Card', owner: 'mine' },
          { merchant: 'Zara', amount: 112.50, date: '2026-02-01', card: 'Apple Card', owner: 'yours' }
        ],
        'Amazon': [
          { merchant: 'Amazon.com', amount: 89.99, date: '2026-02-04', card: 'Apple Card', owner: 'yours' },
          { merchant: 'Amazon.com', amount: 156.23, date: '2026-02-01', card: 'Apple Card', owner: 'mine' }
        ]
      }
    },
    'Entertainment': {
      icon: '🎬',
      budget: 500,
      subcategories: {
        'Streaming': [
          { merchant: 'Netflix', amount: 22.99, date: '2026-02-01', card: 'Capital One Savor', owner: 'ours' },
          { merchant: 'Spotify Family', amount: 16.99, date: '2026-02-01', card: 'Capital One Savor', owner: 'ours' },
          { merchant: 'Disney+', amount: 13.99, date: '2026-02-01', card: 'Citi Double', owner: 'ours' }
        ],
        'Movies & Events': [
          { merchant: 'AMC Theaters', amount: 62.00, date: '2026-02-02', card: 'Capital One Savor', owner: 'yours' }
        ]
      }
    },
    'Travel': {
      icon: '✈️',
      budget: 800,
      subcategories: {
        'Hotels': [
          { merchant: 'Marriott', amount: 345.00, date: '2026-02-03', card: 'Chase Sapphire', owner: 'mine' }
        ],
        'Flights': [
          { merchant: 'United Airlines', amount: 524.00, date: '2026-02-01', card: 'Chase Sapphire', owner: 'yours' }
        ]
      }
    },
    'Bills & Utilities': {
      icon: '💡',
      budget: 650,
      subcategories: {
        'Internet': [
          { merchant: 'Comcast', amount: 109.99, date: '2026-02-01', card: 'Citi Double', owner: 'ours' }
        ],
        'Electric': [
          { merchant: 'PG&E', amount: 178.50, date: '2026-02-01', card: 'Citi Double', owner: 'ours' }
        ],
        'Phone': [
          { merchant: 'Verizon Family', amount: 140.00, date: '2026-02-01', card: 'Citi Double', owner: 'ours' }
        ],
        'Water': [
          { merchant: 'City Water', amount: 65.00, date: '2026-02-01', card: 'Citi Double', owner: 'ours' }
        ]
      }
    }
  }
}

/**
 * Generate business expense data
 */
/**
 * Generate demo liabilities
 */
export function generateDemoLiabilities() {
  return [
    { id: 'liab-1', name: 'Primary Mortgage', type: 'mortgage', category: 'Mortgage', icon: '🏠', balance: 385000, interestRate: 6.25, monthlyPayment: 2850 },
    { id: 'liab-2', name: 'Home Equity Line', type: 'heloc', category: 'Mortgage', icon: '🏠', balance: 42000, interestRate: 8.50, monthlyPayment: 315 },
    { id: 'liab-3', name: 'Toyota Camry Loan', type: 'auto', category: 'Auto Loans', icon: '🚗', balance: 18500, interestRate: 4.90, monthlyPayment: 385 },
    { id: 'liab-4', name: 'Honda CR-V Loan', type: 'auto', category: 'Auto Loans', icon: '🚗', balance: 24200, interestRate: 5.25, monthlyPayment: 445 },
    { id: 'liab-5', name: 'Federal Student Loan', type: 'student', category: 'Student Loans', icon: '🎓', balance: 32000, interestRate: 5.50, monthlyPayment: 340 },
    { id: 'liab-6', name: 'Private Student Loan', type: 'student', category: 'Student Loans', icon: '🎓', balance: 14500, interestRate: 7.20, monthlyPayment: 185 },
    { id: 'liab-7', name: 'Chase Sapphire Balance', type: 'credit', category: 'Credit Cards', icon: '💳', balance: 3200, interestRate: 21.99, monthlyPayment: 150 },
    { id: 'liab-8', name: 'Amex Gold Balance', type: 'credit', category: 'Credit Cards', icon: '💳', balance: 1850, interestRate: 19.99, monthlyPayment: 100 },
  ]
}

/**
 * Generate daily net worth history for ~2 years (730 days).
 * The last entry is pinned to the real current net-worth value;
 * earlier days are projected backwards with daily noise.
 * Each entry: { date: 'YYYY-MM-DD', value: number }
 */
export function generateNetWorthHistory(currentNetWorth) {
  const now = new Date()
  const days = 730
  const points = []
  let v = currentNetWorth

  for (let i = 0; i < days; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    points.unshift({ date: dateStr, value: Math.round(v) })
    // Walk backwards: net worth was slightly less (~0.03-0.08% daily drift)
    v = v / (1 + (Math.random() * 0.0005 + 0.0001) * (Math.random() < 0.35 ? -1 : 1))
  }
  return points
}

/**
 * Generate daily benchmark data for ~2 years (730 days).
 * Returns array of { date, sp500, inflation, bitcoin } where each
 * value is an index starting at 1.0 on the first day (so 1.15 = +15%).
 */
export function generateBenchmarkData() {
  const now = new Date()
  const days = 730
  const points = []
  let sp = 1.0
  let inf = 1.0
  let btc = 1.0

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    points.push({ date: dateStr, sp500: sp, inflation: inf, bitcoin: btc })
    // S&P 500: ~10% annual = ~0.038% daily mean, moderate vol
    sp *= 1 + (0.00038 + (Math.random() - 0.48) * 0.012)
    // Inflation (CPI): ~3.5% annual = ~0.014% daily, very low vol
    inf *= 1 + (0.000135 + (Math.random() - 0.5) * 0.0003)
    // Bitcoin: ~40% annual mean, high vol
    btc *= 1 + (0.0013 + (Math.random() - 0.47) * 0.035)
  }
  return points
}

/**
 * Generate property values
 */
export function generatePropertyValues() {
  return [
    { id: 'prop-1', name: 'Primary Residence', address: '742 Evergreen Terrace, Springfield', estimatedValue: 625000, purchasePrice: 480000, purchaseDate: '2020-06-15' },
    { id: 'prop-2', name: 'Rental Condo', address: '1200 Lake Shore Dr #405, Chicago', estimatedValue: 310000, purchasePrice: 275000, purchaseDate: '2022-03-01' },
  ]
}

/**
 * Generate 12 months of historical transactions for spending analysis.
 * Based on personal expense patterns with seasonal variance.
 */
export function generateHistoricalTransactions() {
  const now = new Date(2026, 1, 10) // Feb 10, 2026
  const txns = []

  const templates = [
    { category: 'Housing & Rent', merchant: 'Avalon Apartments', base: 2450, card: 'Citi Double', recurring: true },
    { category: 'Housing & Rent', merchant: 'Lemonade Insurance', base: 15, card: 'Citi Double', recurring: true },
    { category: 'Dining & Food', merchant: 'Chipotle', base: 44, card: 'Amex Gold' },
    { category: 'Dining & Food', merchant: 'The Cheesecake Factory', base: 125, card: 'Amex Gold' },
    { category: 'Dining & Food', merchant: 'Starbucks', base: 8.5, card: 'Amex Gold' },
    { category: 'Dining & Food', merchant: 'Olive Garden', base: 88, card: 'Amex Gold' },
    { category: 'Dining & Food', merchant: 'Whole Foods', base: 155, card: 'Amex Gold' },
    { category: 'Dining & Food', merchant: 'Trader Joes', base: 86, card: 'Amex Gold' },
    { category: 'Dining & Food', merchant: 'Costco', base: 228, card: 'Citi Double' },
    { category: 'Dining & Food', merchant: 'Blue Bottle', base: 12, card: 'Chase Sapphire' },
    { category: 'Dining & Food', merchant: 'Philz Coffee', base: 8.5, card: 'Chase Sapphire' },
    { category: 'Transportation', merchant: 'Shell Gas Station', base: 64, card: 'Citi Double' },
    { category: 'Transportation', merchant: 'Chevron', base: 57, card: 'Citi Double' },
    { category: 'Transportation', merchant: 'Uber', base: 23, card: 'Chase Sapphire' },
    { category: 'Transportation', merchant: 'Lyft', base: 18, card: 'Chase Sapphire' },
    { category: 'Transportation', merchant: 'SpotHero', base: 15, card: 'Chase Sapphire' },
    { category: 'Shopping', merchant: 'Nike', base: 142, card: 'Apple Card', skip: 0.4 },
    { category: 'Shopping', merchant: 'Zara', base: 88, card: 'Citi Double', skip: 0.5 },
    { category: 'Shopping', merchant: 'Amazon.com', base: 65, card: 'Apple Card' },
    { category: 'Shopping', merchant: 'Amazon.com', base: 130, card: 'Apple Card' },
    { category: 'Entertainment', merchant: 'Netflix', base: 15.99, card: 'Capital One Savor', recurring: true },
    { category: 'Entertainment', merchant: 'Spotify', base: 10.99, card: 'Capital One Savor', recurring: true },
    { category: 'Entertainment', merchant: 'Disney+', base: 7.99, card: 'Citi Double', recurring: true },
    { category: 'Entertainment', merchant: 'AMC Theaters', base: 44, card: 'Capital One Savor', skip: 0.3 },
    { category: 'Travel', merchant: 'Marriott', base: 285, card: 'Chase Sapphire', skip: 0.4 },
    { category: 'Travel', merchant: 'United Airlines', base: 450, card: 'Chase Sapphire', skip: 0.5 },
    { category: 'Bills & Utilities', merchant: 'Comcast', base: 89.99, card: 'Citi Double', recurring: true },
    { category: 'Bills & Utilities', merchant: 'PG&E', base: 144, card: 'Citi Double', recurring: true },
    { category: 'Bills & Utilities', merchant: 'Verizon', base: 75, card: 'Citi Double', recurring: true },
  ]

  // Seasonal multipliers by month index (0=Jan ... 11=Dec)
  const seasonal = {
    'Dining & Food':  [0.90, 0.88, 0.95, 1.00, 1.05, 1.10, 1.12, 1.08, 1.00, 0.95, 1.10, 1.25],
    'Shopping':       [0.70, 0.65, 0.80, 0.85, 0.90, 0.95, 0.85, 0.90, 1.00, 1.05, 1.50, 1.80],
    'Travel':         [0.50, 0.45, 0.70, 0.80, 1.00, 1.40, 1.70, 1.50, 1.00, 0.70, 0.50, 0.80],
    'Entertainment':  [1.00, 1.00, 1.00, 1.05, 1.05, 1.15, 1.20, 1.15, 1.00, 1.00, 1.05, 1.10],
    'Transportation': [1.00, 1.00, 1.00, 1.05, 1.10, 1.15, 1.20, 1.15, 1.05, 1.00, 1.00, 1.00],
  }

  // Use a seeded-like approach with deterministic pseudo-random for consistency
  let seed = 42
  function rand() {
    seed = (seed * 16807 + 0) % 2147483647
    return seed / 2147483647
  }

  for (let m = 0; m < 12; m++) {
    const target = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const year = target.getFullYear()
    const month = target.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (const t of templates) {
      if (m > 0 && t.skip && rand() < t.skip) continue
      const sFactor = seasonal[t.category]?.[month] ?? 1.0
      const variance = t.recurring ? 1.0 : (0.82 + rand() * 0.36)
      const amount = +(t.base * variance * sFactor).toFixed(2)
      const day = t.recurring ? 1 : Math.min(Math.floor(rand() * 27) + 1, daysInMonth)

      txns.push({
        merchant: t.merchant,
        amount,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        card: t.card,
        category: t.category,
      })
    }
  }

  return txns.sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Generate business expense data
 */
export function generateBusinessExpenseData() {
  return {
    'Office & Software': {
      icon: '💻',
      budget: 800,
      subcategories: {
        'Software Subscriptions': [
          { merchant: 'Adobe Creative Cloud', amount: 54.99, date: '2026-02-01', card: 'Chase Ink Business' },
          { merchant: 'Slack', amount: 12.50, date: '2026-02-01', card: 'Chase Ink Business' },
          { merchant: 'Notion', amount: 10.00, date: '2026-02-01', card: 'Ink Business Cash' },
          { merchant: 'GitHub', amount: 4.00, date: '2026-02-01', card: 'Ink Business Cash' }
        ],
        'Office Supplies': [
          { merchant: 'Staples', amount: 87.45, date: '2026-02-03', card: 'Amex Business Gold' },
          { merchant: 'Amazon Business', amount: 134.20, date: '2026-02-02', card: 'Amex Business Gold' }
        ]
      }
    },
    'Travel': {
      icon: '✈️',
      budget: 1500,
      subcategories: {
        'Flights': [
          { merchant: 'Delta Airlines', amount: 389.00, date: '2026-02-04', card: 'Amex Business Gold' },
          { merchant: 'United Airlines', amount: 275.00, date: '2026-02-01', card: 'Amex Business Gold' }
        ],
        'Hotels': [
          { merchant: 'Hilton', amount: 245.00, date: '2026-02-03', card: 'Amex Business Gold' }
        ],
        'Ground Transport': [
          { merchant: 'Uber Business', amount: 42.50, date: '2026-02-04', card: 'Amex Business Gold' },
          { merchant: 'Hertz', amount: 156.00, date: '2026-02-02', card: 'Amex Business Gold' }
        ]
      }
    },
    'Meals & Entertainment': {
      icon: '🍽️',
      budget: 600,
      subcategories: {
        'Client Meals': [
          { merchant: 'Ruth\'s Chris', amount: 187.50, date: '2026-02-04', card: 'Amex Business Gold' },
          { merchant: 'Nobu', amount: 234.00, date: '2026-02-02', card: 'Amex Business Gold' }
        ],
        'Team Lunches': [
          { merchant: 'Panera Bread', amount: 67.80, date: '2026-02-03', card: 'Amex Business Gold' },
          { merchant: 'Sweetgreen', amount: 45.20, date: '2026-02-01', card: 'Amex Business Gold' }
        ]
      }
    },
    'Internet & Phone': {
      icon: '📡',
      budget: 300,
      subcategories: {
        'Internet': [
          { merchant: 'AT&T Business', amount: 129.99, date: '2026-02-01', card: 'Chase Ink Business' }
        ],
        'Phone Lines': [
          { merchant: 'T-Mobile Business', amount: 85.00, date: '2026-02-01', card: 'Ink Business Cash' }
        ]
      }
    }
  }
}
