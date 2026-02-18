const REQUIRED_COLUMNS = ['date', 'merchant', 'amount', 'category', 'card']

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

/**
 * Parse CSV text into transaction objects.
 * @param {string} text - Raw CSV content
 * @returns {{ transactions: Array, errors: string[] }}
 */
export function parseCSV(text) {
  const errors = []
  const lines = text.split(/\r?\n/).filter(l => l.trim())

  if (lines.length < 2) {
    return { transactions: [], errors: ['CSV must include a header row and at least one data row.'] }
  }

  const headers = parseLine(lines[0]).map(h => h.toLowerCase())

  // Validate required columns
  const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c))
  if (missing.length > 0) {
    return { transactions: [], errors: [`Missing required columns: ${missing.join(', ')}`] }
  }

  const colIndex = {}
  for (const col of [...REQUIRED_COLUMNS, 'subcategory']) {
    const idx = headers.indexOf(col)
    if (idx !== -1) colIndex[col] = idx
  }

  const transactions = []

  for (let i = 1; i < lines.length; i++) {
    const fields = parseLine(lines[i])
    if (fields.length < REQUIRED_COLUMNS.length) {
      errors.push(`Row ${i + 1}: not enough columns (got ${fields.length}, expected ${REQUIRED_COLUMNS.length})`)
      continue
    }

    const amount = Number(fields[colIndex.amount])
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Row ${i + 1}: invalid amount "${fields[colIndex.amount]}"`)
      continue
    }

    const date = fields[colIndex.date]
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`Row ${i + 1}: invalid date "${date}" (expected YYYY-MM-DD)`)
      continue
    }

    const tx = {
      merchant: fields[colIndex.merchant],
      amount,
      date,
      card: fields[colIndex.card],
      category: fields[colIndex.category],
    }

    if (colIndex.subcategory !== undefined && fields[colIndex.subcategory]) {
      tx.subcategory = fields[colIndex.subcategory]
    }

    transactions.push(tx)
  }

  return { transactions, errors }
}
