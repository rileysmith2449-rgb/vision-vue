/**
 * Credit Card Optimization Engine
 *
 * Analyzes Plaid transactions against a user's credit card portfolio
 * to recommend the best card for each purchase category.
 */

/**
 * Get the reward rate for a card + Plaid detailed category.
 * @param {object} plaidMapping - The card's plaid mapping data (from /creditcard-plaid-bycard)
 * @param {string} plaidDetailed - e.g. "FOOD_AND_DRINK_RESTAURANT"
 * @returns {{ earnMultiplier: number, effectiveValue: number, isSpendLimit: boolean, spendLimit: number, currency: string, baseRate: boolean }}
 */
export function getRewardRate(plaidMapping, plaidDetailed) {
  if (!plaidMapping) {
    return { earnMultiplier: 1, effectiveValue: 0.01, isSpendLimit: false, spendLimit: 0, currency: '', baseRate: true }
  }

  const baseAmount = plaidMapping.baseSpendAmount || 1
  const baseValuation = (plaidMapping.baseSpendEarnValuation || 1) / 100
  const currency = plaidMapping.baseSpendEarnCurrency || 'points'

  // Look up the Plaid category in the card's plaidDetailed array
  const match = plaidMapping.plaidDetailed?.find(p => p.plaidDetailed === plaidDetailed)

  if (match && !isDateExpired(match)) {
    return {
      earnMultiplier: match.earnMultiplier,
      effectiveValue: match.earnMultiplier * baseValuation,
      isSpendLimit: !!match.isSpendLimit,
      spendLimit: match.spendLimit || 0,
      spendLimitResetPeriod: match.spendLimitResetPeriod || '',
      currency,
      baseRate: false,
    }
  }

  // Fallback to base rate
  return {
    earnMultiplier: baseAmount,
    effectiveValue: baseAmount * baseValuation,
    isSpendLimit: false,
    spendLimit: 0,
    currency,
    baseRate: true,
  }
}

/** Check if a date-limited category has expired */
function isDateExpired(mapping) {
  if (!mapping.isDateLimit) return false
  if (!mapping.limitEndDate) return false
  return new Date(mapping.limitEndDate) < new Date()
}

/**
 * Find the best card for a Plaid category from the user's active portfolio.
 * @param {string} plaidDetailed - The Plaid detailed category
 * @param {object} plaidMappings - Object keyed by cardKey → mapping data
 * @param {Array} activeCards - Array of { cardKey } from portfolio
 * @param {string} [preferType] - Optional filter: "Personal" or "Business"
 * @param {object} [cardDetails] - Object keyed by cardKey → card detail (for type filtering)
 * @returns {{ recommended: string|null, rate: object }}
 */
export function findBestCard(plaidDetailed, plaidMappings, activeCards, preferType, cardDetails) {
  let bestCard = null
  let bestRate = null

  for (const card of activeCards) {
    // Filter by card type if requested
    if (preferType && cardDetails) {
      const detail = cardDetails[card.cardKey]
      if (detail && detail.cardType !== preferType) continue
    }

    const mapping = plaidMappings[card.cardKey]
    const rate = getRewardRate(mapping, plaidDetailed)

    if (!bestRate || rate.effectiveValue > bestRate.effectiveValue) {
      bestRate = rate
      bestCard = card.cardKey
    }
  }

  return { recommended: bestCard, rate: bestRate }
}

/**
 * Analyze a single transaction.
 * @param {object} transaction - Plaid transaction with personal_finance_category.detailed
 * @param {object} plaidMappings - All card plaid mappings
 * @param {Array} activeCards - User's active cards
 * @param {object} cardDetails - Card detail data
 * @returns {object} Analysis result
 */
export function analyzeTransaction(transaction, plaidMappings, activeCards, cardDetails) {
  const plaidDetailed = transaction.personal_finance_category?.detailed || ''
  const amount = Math.abs(transaction.amount || 0)

  // If the transaction was on a business card, only recommend business cards
  const actualCard = transaction._cardKey || null
  const actualType = actualCard && cardDetails[actualCard]?.cardType
  const preferType = actualType === 'Business' ? 'Business' : null

  const best = findBestCard(plaidDetailed, plaidMappings, activeCards, preferType, cardDetails)

  let actualRate = null
  if (actualCard && plaidMappings[actualCard]) {
    actualRate = getRewardRate(plaidMappings[actualCard], plaidDetailed)
  }

  const optimalRewards = best.rate ? best.rate.effectiveValue * amount : 0
  const actualRewards = actualRate ? actualRate.effectiveValue * amount : 0
  const missedRewards = actualRate ? Math.max(0, optimalRewards - actualRewards) : 0

  return {
    transaction_id: transaction.transaction_id,
    merchant_name: transaction.merchant_name || transaction.name,
    amount,
    plaidDetailed,
    plaidPrimary: transaction.personal_finance_category?.primary || '',
    recommendedCard: best.recommended,
    recommendedRate: best.rate,
    optimalRewards,
    actualCard,
    actualRate,
    actualRewards,
    missedRewards,
    isOptimal: !actualCard || actualCard === best.recommended,
    date: transaction.date,
  }
}

/**
 * Analyze all transactions and produce an aggregated report.
 */
export function analyzeTransactions(transactions, plaidMappings, activeCards, cardDetails) {
  if (!transactions?.length || !activeCards?.length) {
    return { analyses: [], byCategory: {}, byCard: {}, totals: { spend: 0, optimalRewards: 0, actualRewards: 0, missedRewards: 0 } }
  }

  const analyses = []
  const byCategory = {}
  const byCard = {}
  const totals = { spend: 0, optimalRewards: 0, actualRewards: 0, missedRewards: 0 }

  for (const txn of transactions) {
    const a = analyzeTransaction(txn, plaidMappings, activeCards, cardDetails)
    analyses.push(a)

    // Aggregate totals
    totals.spend += a.amount
    totals.optimalRewards += a.optimalRewards
    totals.actualRewards += a.actualRewards
    totals.missedRewards += a.missedRewards

    // Group by primary category
    const cat = a.plaidPrimary || 'OTHER'
    if (!byCategory[cat]) {
      byCategory[cat] = { category: cat, spend: 0, optimalRewards: 0, missedRewards: 0, transactions: [], bestCard: null, bestRate: null }
    }
    byCategory[cat].spend += a.amount
    byCategory[cat].optimalRewards += a.optimalRewards
    byCategory[cat].missedRewards += a.missedRewards
    byCategory[cat].transactions.push(a)
    // Track best card for this category (by highest effective value)
    if (!byCategory[cat].bestRate || (a.recommendedRate && a.recommendedRate.effectiveValue > (byCategory[cat].bestRate?.effectiveValue || 0))) {
      byCategory[cat].bestCard = a.recommendedCard
      byCategory[cat].bestRate = a.recommendedRate
    }

    // Group by recommended card
    const cardKey = a.recommendedCard || 'none'
    if (!byCard[cardKey]) {
      byCard[cardKey] = { cardKey, spend: 0, rewards: 0, transactionCount: 0, categories: new Set() }
    }
    byCard[cardKey].spend += a.amount
    byCard[cardKey].rewards += a.optimalRewards
    byCard[cardKey].transactionCount++
    byCard[cardKey].categories.add(cat)
  }

  // Convert Sets to arrays
  for (const card of Object.values(byCard)) {
    card.categories = [...card.categories]
  }

  return { analyses, byCategory, byCard, totals }
}

/**
 * Generate actionable recommendations from a report.
 */
export function generateRecommendations(report, cardDetails, plaidMappings, activeCards) {
  const recommendations = []

  // 1. Optimize spend — categories where user is using the wrong card
  const categoryEntries = Object.values(report.byCategory)
    .filter(c => c.missedRewards > 0)
    .sort((a, b) => b.missedRewards - a.missedRewards)

  for (const cat of categoryEntries) {
    const cardName = cardDetails[cat.bestCard]?.cardName || cat.bestCard
    recommendations.push({
      type: 'optimize',
      priority: cat.missedRewards > 10 ? 'high' : cat.missedRewards > 3 ? 'medium' : 'low',
      title: `Switch to ${cardName}`,
      message: `Use ${cardName} for ${formatCategoryName(cat.category)} to earn ${cat.bestRate?.earnMultiplier || 1}x instead of base rate`,
      impact: cat.missedRewards,
      category: cat.category,
      cardKey: cat.bestCard,
    })
  }

  // 2. Unused benefits — card benefits with remaining credits
  for (const card of activeCards) {
    const detail = cardDetails[card.cardKey]
    if (!detail?.benefit) continue
    for (const b of detail.benefit) {
      const dollarMatch = b.benefitDesc?.match(/\$(\d+[\d,]*)/)?.[1]
      if (dollarMatch) {
        recommendations.push({
          type: 'benefit',
          priority: 'medium',
          title: b.benefitTitle,
          message: `${detail.cardName}: ${b.benefitDesc}`,
          impact: parseFloat(dollarMatch.replace(',', '')),
          cardKey: card.cardKey,
        })
      }
    }
  }

  // 3. Signup bonus tracking
  for (const card of activeCards) {
    const detail = cardDetails[card.cardKey]
    if (!detail?.isSignupBonus || !detail.signupBonusSpend) continue
    const addedDate = card.addedDate ? new Date(card.addedDate) : null
    if (!addedDate) continue
    const lengthMonths = detail.signupBonusLength || 3
    const deadline = new Date(addedDate)
    deadline.setMonth(deadline.getMonth() + lengthMonths)
    const daysLeft = Math.max(0, Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)))
    if (daysLeft <= 0) continue

    // Estimate spend from report
    const cardSpend = report.byCard[card.cardKey]?.spend || 0
    const remainingSpend = Math.max(0, detail.signupBonusSpend - cardSpend)

    recommendations.push({
      type: 'signup',
      priority: daysLeft < 30 ? 'high' : 'medium',
      title: `${detail.cardName} Signup Bonus`,
      message: `Spend $${remainingSpend.toLocaleString()} more in ${daysLeft} days to earn ${detail.signupBonusAmount} ${detail.signUpBonusItem}`,
      impact: parseFloat(detail.signupBonusAmount) || 0,
      cardKey: card.cardKey,
      daysLeft,
      remainingSpend,
    })
  }

  // 4. Card gap analysis — high-spend categories where user only earns base rate
  for (const [cat, data] of Object.entries(report.byCategory)) {
    if (data.bestRate?.baseRate && data.spend > 100) {
      recommendations.push({
        type: 'gap',
        priority: data.spend > 500 ? 'high' : 'medium',
        title: `No bonus card for ${formatCategoryName(cat)}`,
        message: `You spent $${data.spend.toFixed(0)} on ${formatCategoryName(cat)} at base rate. Consider adding a card with bonus earning in this category.`,
        impact: data.spend * 0.03,
        category: cat,
      })
    }
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2) || b.impact - a.impact
  })
}

/**
 * Generate a cheat sheet: for every known Plaid category, which card is best.
 */
export function generateCheatSheet(plaidMappings, activeCards, cardDetails) {
  const allCategories = new Set()

  // Collect all Plaid categories across portfolio
  for (const card of activeCards) {
    const mapping = plaidMappings[card.cardKey]
    if (mapping?.plaidDetailed) {
      for (const pd of mapping.plaidDetailed) {
        allCategories.add(pd.plaidDetailed)
      }
    }
  }

  const sheet = []
  for (const category of allCategories) {
    const best = findBestCard(category, plaidMappings, activeCards, null, cardDetails)
    if (!best.recommended) continue
    const cardName = cardDetails[best.recommended]?.cardName || best.recommended
    sheet.push({
      plaidCategory: category,
      displayName: formatCategoryName(category),
      cardKey: best.recommended,
      cardName,
      earnMultiplier: best.rate?.earnMultiplier || 1,
      effectiveValue: best.rate?.effectiveValue || 0,
      currency: best.rate?.currency || 'points',
      isSpendLimit: best.rate?.isSpendLimit || false,
      spendLimit: best.rate?.spendLimit || 0,
    })
  }

  return sheet.sort((a, b) => b.effectiveValue - a.effectiveValue)
}

/** Convert PLAID_CATEGORY_NAME to human-readable "Plaid Category Name" */
function formatCategoryName(name) {
  if (!name) return 'Other'
  return name
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}
