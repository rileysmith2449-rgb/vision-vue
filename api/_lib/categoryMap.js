/**
 * Maps Plaid's personal_finance_category to app expense categories.
 * Tries `detailed` first, falls back to `primary`.
 */

const DETAILED_MAP = {
  'RENT_AND_UTILITIES_RENT': 'Housing & Rent',
  'RENT_AND_UTILITIES_ELECTRICITY': 'Bills & Utilities',
  'RENT_AND_UTILITIES_GAS': 'Bills & Utilities',
  'RENT_AND_UTILITIES_INTERNET_AND_CABLE': 'Bills & Utilities',
  'RENT_AND_UTILITIES_PHONE': 'Bills & Utilities',
  'RENT_AND_UTILITIES_SEWAGE_AND_WASTE_MANAGEMENT': 'Bills & Utilities',
  'RENT_AND_UTILITIES_WATER': 'Bills & Utilities',
  'RENT_AND_UTILITIES_OTHER_UTILITIES': 'Bills & Utilities',
  'FOOD_AND_DRINK_RESTAURANT': 'Dining & Food',
  'FOOD_AND_DRINK_COFFEE': 'Dining & Food',
  'FOOD_AND_DRINK_FAST_FOOD': 'Dining & Food',
  'FOOD_AND_DRINK_GROCERIES': 'Dining & Food',
  'FOOD_AND_DRINK_BAR_AND_LOUNGE': 'Dining & Food',
}

const PRIMARY_MAP = {
  'FOOD_AND_DRINK': 'Dining & Food',
  'TRANSPORTATION': 'Transportation',
  'GENERAL_MERCHANDISE': 'Shopping',
  'ENTERTAINMENT': 'Entertainment',
  'TRAVEL': 'Travel',
  'RENT_AND_UTILITIES': 'Bills & Utilities',
  'LOAN_PAYMENTS': 'Housing & Rent',
  'GENERAL_SERVICES': 'Bills & Utilities',
  'PERSONAL_CARE': 'Shopping',
  'MEDICAL': 'Bills & Utilities',
  'GOVERNMENT_AND_NON_PROFIT': 'Bills & Utilities',
  'HOME_IMPROVEMENT': 'Shopping',
  'TRANSFER_IN': 'Shopping',
  'TRANSFER_OUT': 'Shopping',
  'INCOME': 'Shopping',
  'BANK_FEES': 'Bills & Utilities',
}

const CATEGORY_ICONS = {
  'Housing & Rent': '🏠',
  'Dining & Food': '🍽️',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Travel': '✈️',
  'Bills & Utilities': '💡',
}

const DEFAULT_BUDGETS = {
  'Housing & Rent': 2800,
  'Dining & Food': 1200,
  'Transportation': 800,
  'Shopping': 600,
  'Entertainment': 400,
  'Travel': 500,
  'Bills & Utilities': 450,
}

export function mapPlaidCategory(personalFinanceCategory) {
  if (!personalFinanceCategory) {
    return { category: 'Shopping', icon: '🛍️', budget: 600 }
  }

  const { primary, detailed } = personalFinanceCategory

  // Try detailed first
  const detailedKey = detailed?.toUpperCase()
  if (detailedKey && DETAILED_MAP[detailedKey]) {
    const cat = DETAILED_MAP[detailedKey]
    return { category: cat, icon: CATEGORY_ICONS[cat] || '🛍️', budget: DEFAULT_BUDGETS[cat] || 600 }
  }

  // Fall back to primary
  const primaryKey = primary?.toUpperCase()
  if (primaryKey && PRIMARY_MAP[primaryKey]) {
    const cat = PRIMARY_MAP[primaryKey]
    return { category: cat, icon: CATEGORY_ICONS[cat] || '🛍️', budget: DEFAULT_BUDGETS[cat] || 600 }
  }

  // Default fallback
  return { category: 'Shopping', icon: '🛍️', budget: 600 }
}

export { CATEGORY_ICONS, DEFAULT_BUDGETS }
