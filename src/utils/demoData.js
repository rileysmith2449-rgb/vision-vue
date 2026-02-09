/**
 * Generate demo portfolio holdings
 */
export function generateDemoHoldings() {
  const assetTypes = [
    { type: 'cash', symbols: ['Checking', 'Savings', 'Money Market'], icon: '💵', category: 'Cash' },
    { type: 'stock', symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'], icon: '📈', category: 'Stocks' },
    { type: 'crypto', symbols: ['BTC', 'ETH', 'SOL'], icon: '₿', category: 'Crypto' },
    { type: 'etf', symbols: ['VOO', 'QQQ', 'VTI'], icon: '💎', category: 'ETFs' },
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
export function generateBusinessExpenseData() {
  return {
    'Office & Software': {
      icon: '💻',
      budget: 800,
      subcategories: {
        'Software Subscriptions': [
          { merchant: 'Adobe Creative Cloud', amount: 54.99, date: '2026-02-01', card: 'Chase Ink Business' },
          { merchant: 'Slack', amount: 12.50, date: '2026-02-01', card: 'Chase Ink Business' },
          { merchant: 'Notion', amount: 10.00, date: '2026-02-01', card: 'Chase Ink Business' },
          { merchant: 'GitHub', amount: 4.00, date: '2026-02-01', card: 'Chase Ink Business' }
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
          { merchant: 'T-Mobile Business', amount: 85.00, date: '2026-02-01', card: 'Chase Ink Business' }
        ]
      }
    }
  }
}
