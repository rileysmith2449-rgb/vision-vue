import { computed } from 'vue'
import { useCreditCardStore } from '@/stores/creditCardStore'
import { creditCards, marketCards } from '@/utils/creditCardData'

function toCardKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
}

export function useApplicationSequence() {
  const cardStore = useCreditCardStore()

  // Cards currently in portfolio
  const ownedCardKeys = computed(() => new Set(cardStore.portfolioCardKeys))

  // Merge creditCards + marketCards, deduplicate by name
  const allCards = computed(() => {
    const seen = new Set()
    const result = []
    for (const card of [...creditCards, ...marketCards]) {
      if (seen.has(card.name)) continue
      seen.add(card.name)
      result.push(card)
    }
    return result
  })

  // Current 5/24 count: number of personal cards opened in last 24 months
  // that count toward 5/24 and are in the portfolio
  const currentFiveTwentyFourCount = computed(() => {
    let count = 0
    for (const p of cardStore.userPortfolio) {
      const detail = cardStore.cardDetails[p.cardKey]
      if (!detail) continue
      // Only personal cards that count toward 5/24
      if (detail.counts524 !== true) continue
      // Check if added in last 24 months
      if (p.addedDate) {
        const added = new Date(p.addedDate)
        const cutoff = new Date()
        cutoff.setMonth(cutoff.getMonth() - 24)
        if (added >= cutoff) count++
      } else {
        // If no date, assume it counts
        count++
      }
    }
    return count
  })

  // Build the application sequence
  const applicationSequence = computed(() => {
    const owned = ownedCardKeys.value
    const cards = allCards.value

    // Filter to cards with applicationPriority that aren't already owned
    const candidates = cards
      .filter(c => c.applicationPriority != null && !owned.has(toCardKey(c.name)))
      .sort((a, b) => a.applicationPriority - b.applicationPriority)

    let fiveTwentyFourSlots = Math.max(0, 5 - currentFiveTwentyFourCount.value)
    let lastChaseDate = null
    const CHASE_SPACING_DAYS = 90
    const sequence = []

    for (const card of candidates) {
      const isChase = card.name.toLowerCase().includes('chase') || card.name.toLowerCase().includes('ink')
      const isBusiness = card.type === 'business'
      const counts524 = card.counts524 !== false
      const detail = cardStore.cardDetails[toCardKey(card.name)]

      // Check 5/24 eligibility
      let fiveTwentyFourStatus = 'no-impact'
      if (counts524) {
        if (fiveTwentyFourSlots <= 0) {
          fiveTwentyFourStatus = 'blocked'
          continue // Skip cards that would put us over 5/24
        }
        fiveTwentyFourStatus = 'uses-slot'
      }

      // Calculate recommended timing
      let timing = 'Apply now'
      let waitDays = 0

      if (isChase && lastChaseDate) {
        const daysSinceLast = 0 // relative to sequence position
        waitDays = CHASE_SPACING_DAYS
        timing = `Wait ~${CHASE_SPACING_DAYS} days after previous Chase card`
      }

      // Determine application order position
      const step = {
        cardName: card.name,
        cardKey: toCardKey(card.name),
        type: isBusiness ? 'Business' : 'Personal',
        network: card.network || 'Unknown',
        annualFee: card.annualFee || 0,
        signupBonusAmount: card.signupBonus?.amount || 0,
        signupBonusType: card.signupBonus?.type || '',
        signupBonusDollarValue: card.signupBonus?.dollarValue || 0,
        spendRequired: card.signupBonus?.spendRequired || 0,
        spendMonths: card.signupBonus?.months || 3,
        fiveTwentyFourStatus,
        counts524,
        timing,
        waitDays,
        applicationNotes: card.applicationNotes || '',
        isOwned: false,
        priority: card.applicationPriority,
        perks: card.perks || [],
      }

      sequence.push(step)

      if (counts524) fiveTwentyFourSlots--
      if (isChase) lastChaseDate = true
    }

    // Also add owned cards that have applicationPriority (for display as "already done")
    const ownedWithPriority = cards
      .filter(c => c.applicationPriority != null && owned.has(toCardKey(c.name)))
      .sort((a, b) => a.applicationPriority - b.applicationPriority)

    for (const card of ownedWithPriority) {
      const isBusiness = card.type === 'business'
      sequence.push({
        cardName: card.name,
        cardKey: toCardKey(card.name),
        type: isBusiness ? 'Business' : 'Personal',
        network: card.network || 'Unknown',
        annualFee: card.annualFee || 0,
        signupBonusAmount: card.signupBonus?.amount || 0,
        signupBonusType: card.signupBonus?.type || '',
        signupBonusDollarValue: card.signupBonus?.dollarValue || 0,
        spendRequired: card.signupBonus?.spendRequired || 0,
        spendMonths: card.signupBonus?.months || 3,
        fiveTwentyFourStatus: 'completed',
        counts524: card.counts524 !== false,
        timing: 'Already in portfolio',
        waitDays: 0,
        applicationNotes: card.applicationNotes || '',
        isOwned: true,
        priority: card.applicationPriority,
        perks: card.perks || [],
      })
    }

    // Sort: owned first (as completed steps), then by priority
    return sequence.sort((a, b) => {
      if (a.isOwned && !b.isOwned) return -1
      if (!a.isOwned && b.isOwned) return 1
      return a.priority - b.priority
    })
  })

  const totalPotentialSubValue = computed(() => {
    return applicationSequence.value
      .filter(s => !s.isOwned)
      .reduce((sum, s) => sum + s.signupBonusDollarValue, 0)
  })

  const fiveTwentyFourSlotsRemaining = computed(() => {
    return Math.max(0, 5 - currentFiveTwentyFourCount.value)
  })

  return {
    applicationSequence,
    currentFiveTwentyFourCount,
    fiveTwentyFourSlotsRemaining,
    totalPotentialSubValue,
  }
}
