import { mapPlaidCategory } from './categoryMap.js'

/**
 * Map Plaid holdings + securities → app holding shape
 */
const TYPE_MAP = {
  equity: { type: 'stock', category: 'Stocks', icon: '📈' },
  etf: { type: 'etf', category: 'ETFs', icon: '💎' },
  'mutual fund': { type: 'etf', category: 'ETFs', icon: '💎' },
  cryptocurrency: { type: 'crypto', category: 'Crypto', icon: '₿' },
  cash: { type: 'cash', category: 'Cash', icon: '💵' },
  fixed_income: { type: 'other', category: 'Bonds', icon: '🏦' },
  derivative: { type: 'other', category: 'Other', icon: '🎯' },
}

export function mapPlaidHoldings(holdings, securities) {
  const secMap = new Map()
  for (const sec of securities) {
    secMap.set(sec.security_id, sec)
  }

  return holdings.map((holding, i) => {
    const security = secMap.get(holding.security_id) || {}
    const plaidType = (security.type || '').toLowerCase()
    const mapped = TYPE_MAP[plaidType] || { type: 'other', category: 'Other', icon: '🎯' }

    const daysAgo = mapped.type === 'cash' ? 0 : Math.floor(Math.random() * 500)
    const purchaseDate = new Date()
    purchaseDate.setDate(purchaseDate.getDate() - daysAgo)

    return {
      id: `plaid-${i + 1}`,
      symbol: security.ticker_symbol || security.name || 'Unknown',
      type: mapped.type,
      category: mapped.category,
      icon: mapped.icon,
      shares: holding.quantity,
      purchaseDate: purchaseDate.toISOString().split('T')[0],
      costBasis: holding.cost_basis ?? holding.institution_value ?? 0,
      currentValue: holding.institution_value ?? 0,
    }
  })
}

/**
 * Map Plaid transactions → app transaction shape
 * Accounts map is used to resolve account names for the `card` field.
 */
export function mapPlaidTransactions(transactions, accounts) {
  const accountMap = new Map()
  for (const acct of accounts) {
    accountMap.set(acct.account_id, acct)
  }

  return transactions.map(tx => {
    const acct = accountMap.get(tx.account_id) || {}
    const pfc = tx.personal_finance_category
    const { category } = mapPlaidCategory(pfc)
    const subcategory = pfc?.detailed
      ? pfc.detailed.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
      : category

    return {
      merchant: tx.merchant_name || tx.name || 'Unknown',
      amount: tx.amount, // Plaid: positive = debit (spending)
      date: tx.date,
      card: acct.official_name || acct.name || 'Account',
      category,
      subcategory,
    }
  })
}

/**
 * Map Plaid liabilities → app liability shape
 */
export function mapPlaidLiabilities(liabilitiesData) {
  const results = []
  let idCounter = 1

  // Credit cards
  if (liabilitiesData.credit) {
    for (const card of liabilitiesData.credit) {
      results.push({
        id: `plaid-liab-${idCounter++}`,
        name: card.account_id,
        type: 'credit',
        category: 'Credit Cards',
        icon: '💳',
        balance: card.last_statement_balance ?? card.minimum_payment_amount ?? 0,
        interestRate: card.aprs?.[0]?.apr_percentage ?? 0,
        monthlyPayment: card.minimum_payment_amount ?? 0,
      })
    }
  }

  // Student loans
  if (liabilitiesData.student) {
    for (const loan of liabilitiesData.student) {
      results.push({
        id: `plaid-liab-${idCounter++}`,
        name: loan.loan_name || 'Student Loan',
        type: 'student',
        category: 'Student Loans',
        icon: '🎓',
        balance: loan.outstanding_interest_amount + (loan.last_payment_amount ? loan.origination_principal_amount : 0),
        interestRate: loan.interest_rate_percentage ?? 0,
        monthlyPayment: loan.last_payment_amount ?? 0,
      })
    }
  }

  // Mortgages
  if (liabilitiesData.mortgage) {
    for (const mtg of liabilitiesData.mortgage) {
      results.push({
        id: `plaid-liab-${idCounter++}`,
        name: mtg.loan_type_description || 'Mortgage',
        type: 'mortgage',
        category: 'Mortgage',
        icon: '🏠',
        balance: mtg.current_balance ?? 0,
        interestRate: mtg.interest_rate?.percentage ?? 0,
        monthlyPayment: mtg.last_payment_amount ?? 0,
      })
    }
  }

  return results
}

/**
 * Map Plaid accounts → simplified account data with balances
 */
export function mapPlaidAccounts(accounts) {
  return accounts.map(acct => ({
    id: acct.account_id,
    name: acct.official_name || acct.name,
    type: acct.type,
    subtype: acct.subtype,
    balanceCurrent: acct.balances?.current ?? 0,
    balanceAvailable: acct.balances?.available ?? null,
    mask: acct.mask,
  }))
}
