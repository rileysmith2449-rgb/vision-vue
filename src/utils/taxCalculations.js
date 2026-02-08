/**
 * Calculate tax treatment based on purchase date
 * @param {string} purchaseDate - ISO date string
 * @returns {string} 'long-term' or 'short-term'
 */
export function calculateTaxTreatment(purchaseDate) {
  const purchase = new Date(purchaseDate)
  const today = new Date()
  const daysHeld = (today - purchase) / (1000 * 60 * 60 * 24)
  return daysHeld > 365 ? 'long-term' : 'short-term'
}

/**
 * Calculate days until long-term treatment
 * @param {string} purchaseDate - ISO date string
 * @returns {number} Days remaining, or 0 if already long-term
 */
export function daysUntilLongTerm(purchaseDate) {
  const purchase = new Date(purchaseDate)
  const oneYearLater = new Date(purchase)
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)
  oneYearLater.setDate(oneYearLater.getDate() + 1)
  
  const today = new Date()
  const daysRemaining = Math.ceil((oneYearLater - today) / (1000 * 60 * 60 * 24))
  
  return daysRemaining > 0 ? daysRemaining : 0
}

/**
 * Calculate estimated tax savings from long-term treatment
 * @param {number} gainAmount - Capital gain amount
 * @param {number} ordinaryRate - Ordinary income tax rate (default 0.32)
 * @param {number} longTermRate - Long-term capital gains rate (default 0.15)
 * @returns {number} Estimated savings
 */
export function calculateTaxSavings(gainAmount, ordinaryRate = 0.32, longTermRate = 0.15) {
  return gainAmount * (ordinaryRate - longTermRate)
}

/**
 * Calculate total tax impact for portfolio
 * @param {number} shortTermGains
 * @param {number} longTermGains
 * @returns {number} Total estimated tax
 */
export function calculateTotalTaxImpact(shortTermGains, longTermGains) {
  return shortTermGains * 0.32 + longTermGains * 0.15
}
