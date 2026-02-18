/**
 * Parse a CSV line handling quoted fields (e.g. "Smith, John")
 */
function parseLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++ // skip escaped quote
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

// --- Date helpers ---

function parseDate(raw) {
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  // M/D/YYYY or MM/DD/YYYY
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`
  }
  return null
}

// --- Category mapping: statement categories → app categories ---

const CATEGORY_MAP = {
  // Dining & Food
  'restaurant-restaurant': { category: 'Dining & Food', subcategory: 'Restaurants' },
  'restaurant-bar & café': { category: 'Dining & Food', subcategory: 'Restaurants' },
  'food & drink': { category: 'Dining & Food', subcategory: 'Restaurants' },
  'groceries': { category: 'Dining & Food', subcategory: 'Groceries' },
  'merchandise & supplies-groceries': { category: 'Dining & Food', subcategory: 'Groceries' },

  // Transportation
  'transportation-fuel': { category: 'Transportation', subcategory: 'Gas & Fuel' },
  'transportation-parking charges': { category: 'Transportation', subcategory: 'Parking' },
  'transportation-taxis & coach': { category: 'Transportation', subcategory: 'Rideshare' },
  'gas': { category: 'Transportation', subcategory: 'Gas & Fuel' },
  'automotive': { category: 'Transportation', subcategory: 'Auto' },
  'repair & maintenance': { category: 'Transportation', subcategory: 'Auto' },

  // Travel
  'travel': { category: 'Travel' },
  'travel-lodging': { category: 'Travel', subcategory: 'Hotels' },
  'travel-travel agencies': { category: 'Travel', subcategory: 'Bookings' },

  // Entertainment
  'entertainment': { category: 'Entertainment' },
  'entertainment-sports events': { category: 'Entertainment', subcategory: 'Events' },

  // Bills & Utilities
  'bills & utilities': { category: 'Bills & Utilities' },
  'communications-cable & internet comm': { category: 'Bills & Utilities', subcategory: 'Internet & Phone' },
  'communications-mobile telecom': { category: 'Bills & Utilities', subcategory: 'Internet & Phone' },
  'business services-insurance services': { category: 'Business', subcategory: 'Insurance' },
  'business services-banking services': { category: 'Business', subcategory: 'Banking' },
  'business services-health care services': { category: 'Business', subcategory: 'Healthcare' },
  'professional services': { category: 'Business', subcategory: 'Services' },

  // Housing & Rent
  'home': { category: 'Housing & Rent' },

  // Shopping (catch-all for merchandise)
  'shopping': { category: 'Shopping' },
  'merchandise & supplies-internet purchase': { category: 'Shopping', subcategory: 'Online' },
  'merchandise & supplies-mail order': { category: 'Shopping', subcategory: 'Online' },
  'merchandise & supplies-clothing stores': { category: 'Shopping', subcategory: 'Clothing' },
  'merchandise & supplies-general retail': { category: 'Shopping', subcategory: 'Retail' },
  'merchandise & supplies-wholesale stores': { category: 'Shopping', subcategory: 'Retail' },
  'merchandise & supplies-pharmacies': { category: 'Shopping', subcategory: 'Health' },
  'merchandise & supplies-sporting goods stores': { category: 'Shopping', subcategory: 'Retail' },
  'merchandise & supplies-hardware supplies': { category: 'Shopping', subcategory: 'Hardware' },
  'merchandise & supplies-appliance stores': { category: 'Shopping', subcategory: 'Electronics' },
  'merchandise & supplies-arts & jewelry': { category: 'Shopping', subcategory: 'Retail' },
  'merchandise & inventory': { category: 'Shopping', subcategory: 'Retail' },
  'gifts & donations': { category: 'Shopping', subcategory: 'Gifts' },
  'health & wellness': { category: 'Shopping', subcategory: 'Health' },
  'education': { category: 'Shopping', subcategory: 'Education' },
  'personal': { category: 'Shopping' },
  'miscellaneous': { category: 'Shopping' },
  'other-miscellaneous': { category: 'Shopping' },
  'other-government services': { category: 'Bills & Utilities', subcategory: 'Government' },
  'business services-other services': { category: 'Business', subcategory: 'Services' },
  'business services-conferences & training': { category: 'Business', subcategory: 'Education' },
  'business services-contracting services': { category: 'Business', subcategory: 'Services' },
}

function mapCategory(rawCategory) {
  if (!rawCategory) return null
  const key = rawCategory.toLowerCase().trim()
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key]
  // Try matching just the primary part (before hyphen)
  const primary = key.split('-')[0].trim()
  if (CATEGORY_MAP[primary]) return CATEGORY_MAP[primary]
  // Fallback
  return { category: 'Shopping' }
}

// --- Card name mapping: statement names → app card names ---

const CARD_NAME_MAP = {
  'chase sapphire preferred': 'Chase Sapphire',
  'chase saphire preferred': 'Chase Sapphire', // common typo in statements
  'chase sapphire reserve': 'Chase Sapphire',
  'chase freedom unlimited': 'Chase Freedom Unlimited',
  'chase ink business unlimited': 'Ink Business Cash',
  'chase ink business preferred': 'Chase Ink Business',
  'chase ink business cash': 'Ink Business Cash',
  'american express gold': 'Amex Gold',
  'amex gold': 'Amex Gold',
  'american express hilton aspire': 'Hilton Amex',
  'american express business gold': 'Amex Business Gold',
  'citi double cash': 'Citi Double',
  'apple card': 'Apple Card',
  'capital one savor': 'Capital One Savor',
  'capital one savor one': 'Capital One Savor',
  'wells fargo active cash': 'Wells Fargo Active Cash',
}

function mapCardName(rawCard) {
  if (!rawCard) return rawCard
  const key = rawCard.toLowerCase().trim()
  return CARD_NAME_MAP[key] || rawCard
}

// --- Detect format ---

const STATEMENT_COLUMNS = ['date', 'merchant', 'category', 'account #', 'amount', 'card']
const SIMPLE_REQUIRED = ['date', 'merchant', 'amount', 'category', 'card']

/**
 * Parse CSV text into transaction objects.
 * Auto-detects statement format (Date,Merchant,Category,Account #,Amount,Card)
 * vs simple format (date,merchant,amount,category,card).
 * @param {string} text - Raw CSV content
 * @returns {{ transactions: Array, errors: string[] }}
 */
export function parseCSV(text) {
  const errors = []
  const lines = text.split(/\r?\n/).filter(l => l.trim())

  if (lines.length < 2) {
    return { transactions: [], errors: ['CSV must include a header row and at least one data row.'] }
  }

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim())

  // Detect which format we're dealing with
  const isStatementFormat = headers.includes('account #')
  const requiredCols = isStatementFormat ? ['date', 'merchant', 'category', 'amount', 'card'] : SIMPLE_REQUIRED

  const missing = requiredCols.filter(c => !headers.includes(c))
  if (missing.length > 0) {
    return { transactions: [], errors: [`Missing required columns: ${missing.join(', ')}`] }
  }

  const colIndex = {}
  for (const col of [...headers]) {
    const idx = headers.indexOf(col)
    if (idx !== -1) colIndex[col] = idx
  }

  const acctIdx = isStatementFormat ? colIndex['account #'] : -1
  const SKIP_TYPES = new Set(['payment', 'return', 'refund', 'reversal', 'fee'])

  const transactions = []
  let skippedPayments = 0

  for (let i = 1; i < lines.length; i++) {
    const fields = parseLine(lines[i])
    if (fields.length < requiredCols.length) continue

    const rawAmount = Number(fields[colIndex['amount']])
    if (isNaN(rawAmount) || rawAmount === 0) continue

    // Detect per-row whether this is Amex-style (Account # is numeric)
    // or Chase-style (Account # is a type string like "Sale")
    let amount
    if (isStatementFormat && acctIdx !== -1) {
      const acctVal = fields[acctIdx]
      const isAmexRow = /^-?\d+$/.test(acctVal)

      if (isAmexRow) {
        // Amex: positive = charge, negative = return/payment
        if (rawAmount <= 0) { skippedPayments++; continue }
        amount = rawAmount
      } else {
        // Chase-style: type column — skip payments/returns/fees
        if (SKIP_TYPES.has(acctVal.toLowerCase())) { skippedPayments++; continue }
        // Charges are negative, take absolute value
        amount = Math.abs(rawAmount)
      }
    } else {
      // Simple format: positive = charge
      if (rawAmount <= 0) { skippedPayments++; continue }
      amount = rawAmount
    }

    const rawCategory = fields[colIndex['category']] || ''

    // Skip rows with no category (payments) or fee adjustments
    if (!rawCategory || rawCategory.toLowerCase().startsWith('fees & adjustments')) {
      skippedPayments++
      continue
    }

    const rawDate = fields[colIndex['date']]
    const date = parseDate(rawDate)
    if (!date) {
      errors.push(`Row ${i + 1}: invalid date "${rawDate}"`)
      continue
    }

    const rawCard = fields[colIndex['card']]
    const mapped = mapCategory(rawCategory)

    const tx = {
      merchant: fields[colIndex['merchant']],
      amount,
      date,
      card: isStatementFormat ? mapCardName(rawCard) : rawCard,
      category: mapped.category,
    }

    if (mapped.subcategory) {
      tx.subcategory = mapped.subcategory
    } else if (!isStatementFormat && colIndex['subcategory'] !== undefined && fields[colIndex['subcategory']]) {
      tx.subcategory = fields[colIndex['subcategory']]
    }

    transactions.push(tx)
  }

  if (skippedPayments > 0) {
    errors.push(`Skipped ${skippedPayments} payments, returns, and fee rows.`)
  }

  return { transactions, errors }
}
