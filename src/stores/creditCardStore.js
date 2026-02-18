import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchCardList,
  fetchCardDetail,
  fetchPlaidMapping,
  fetchCardImage,
  searchCardsByName,
} from '@/services/rewardsCCApi'
import { creditCards as localCards } from '@/utils/creditCardData'

const CACHE_PREFIX = 'vision_card_cache_'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
const PORTFOLIO_KEY = 'vision_card_portfolio'

const API_KEY = import.meta.env.VITE_REWARDSCC_API_KEY || ''
const hasApiKey = API_KEY && API_KEY !== 'your_rapidapi_key'

// ── Local card data helpers ──
// Convert creditCardData.js entries into the shapes the optimization engine expects

/** Map budget category names → Plaid detailed codes */
const CATEGORY_TO_PLAID = {
  'Dining & Food': ['FOOD_AND_DRINK_RESTAURANT', 'FOOD_AND_DRINK_GROCERIES', 'FOOD_AND_DRINK_COFFEE', 'FOOD_AND_DRINK_FAST_FOOD'],
  'Travel': ['TRAVEL_FLIGHTS', 'TRAVEL_LODGING', 'TRAVEL_OTHER_TRAVEL'],
  'Transportation': ['TRANSPORTATION_GAS', 'TRANSPORTATION_TAXIS_AND_RIDE_SHARES', 'TRANSPORTATION_PUBLIC_TRANSIT', 'TRANSPORTATION_PARKING'],
  'Shopping': ['GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE', 'GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES', 'GENERAL_MERCHANDISE_ELECTRONICS'],
  'Entertainment': ['ENTERTAINMENT_OTHER_ENTERTAINMENT', 'ENTERTAINMENT_TV_AND_MOVIES', 'ENTERTAINMENT_GAMES'],
  'Bills & Utilities': ['RENT_AND_UTILITIES_OTHER_UTILITIES', 'RENT_AND_UTILITIES_TELECOMMUNICATION_SERVICES'],
  'Housing & Rent': ['RENT_AND_UTILITIES_RENT'],
  'Office & Software': ['GENERAL_SERVICES_OTHER_GENERAL_SERVICES'],
  'Internet & Phone': ['RENT_AND_UTILITIES_TELECOMMUNICATION_SERVICES'],
  'Meals & Entertainment': ['FOOD_AND_DRINK_RESTAURANT'],
}

function toCardKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
}

function buildLocalCardDetail(card) {
  return {
    cardKey: toCardKey(card.name),
    cardIssuer: card.name.split(' ')[0],
    cardName: card.name,
    cardType: card.type === 'business' ? 'Business' : 'Personal',
    annualFee: card.annualFee || 0,
    baseSpendAmount: 1,
    baseSpendEarnType: 'Cash Back',
    baseSpendEarnCategory: 'Cash back',
    baseSpendEarnCurrency: 'cashback',
    baseSpendEarnValuation: (card.cashbackRates.default || 0.01) * 100,
    baseSpendEarnIsCash: 1,
    baseSpendEarnCashValue: card.cashbackRates.default || 0.01,
    isSignupBonus: 0,
    benefit: (card.statementCredits || []).map(sc => ({
      benefitTitle: sc.name,
      benefitDesc: `$${sc.amount} annual credit${sc.used ? ' (used)' : ''}`,
    })),
    spendBonusCategory: [],
    _color: card.color,
  }
}

function buildLocalPlaidMapping(card) {
  const defaultRate = card.cashbackRates.default || 0.01
  const valuation = defaultRate * 100 // e.g. 0.02 → 2

  const plaidDetailed = []
  for (const [budgetCat, rate] of Object.entries(card.cashbackRates)) {
    if (budgetCat === 'default') continue
    const plaidCodes = CATEGORY_TO_PLAID[budgetCat] || []
    // earnMultiplier: how many "units" per dollar. For cashback cards, express
    // the rate relative to base so the engine's effectiveValue math works:
    //   effectiveValue = earnMultiplier × (baseValuation / 100)
    // We want effectiveValue = rate (e.g. 0.04), so earnMultiplier = rate / (baseValuation/100)
    // Simpler: just set earnMultiplier = rate / defaultRate (or rate * 100 when valuation=1)
    const multiplier = rate / defaultRate
    for (const code of plaidCodes) {
      plaidDetailed.push({
        plaidDetailed: code,
        earnMultiplier: multiplier,
        isDateLimit: 0,
        limitBeginDate: '',
        limitEndDate: '',
        isSpendLimit: 0,
        spendLimit: 0,
        spendLimitResetPeriod: '',
      })
    }
  }

  return {
    cardKey: toCardKey(card.name),
    cardName: card.name,
    cardIssuer: card.name.split(' ')[0],
    baseSpendAmount: 1,
    baseSpendEarnType: 'Cash Back',
    baseSpendEarnCategory: 'Cash back',
    baseSpendEarnCurrency: 'cashback',
    baseSpendEarnValuation: valuation,
    baseSpendEarnIsCash: 1,
    baseSpendEarnCashValue: defaultRate,
    plaidDetailed,
  }
}

// ── Cache helpers ──

function readCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch { /* storage full — ignore */ }
}

function loadPortfolio() {
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function savePortfolio(portfolio) {
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio))
}

export const useCreditCardStore = defineStore('creditCard', () => {
  // State
  const cardCatalog = ref([])
  const cardDetails = ref({})
  const plaidMappings = ref({})
  const cardImages = ref({})
  const userPortfolio = ref(loadPortfolio())
  const loading = ref(false)
  const error = ref(null)
  const searchResults = ref([])
  const searchLoading = ref(false)
  const usingLocalData = ref(!hasApiKey)

  // Computed
  const activeCards = computed(() =>
    userPortfolio.value.filter(c => c.active)
  )

  const portfolioCardKeys = computed(() =>
    userPortfolio.value.map(c => c.cardKey)
  )

  const totalAnnualFees = computed(() =>
    activeCards.value.reduce((sum, c) => {
      const detail = cardDetails.value[c.cardKey]
      return sum + (detail?.annualFee || 0)
    }, 0)
  )

  const personalCards = computed(() =>
    activeCards.value.filter(c => {
      const detail = cardDetails.value[c.cardKey]
      return !detail || detail.cardType === 'Personal'
    })
  )

  const businessCards = computed(() =>
    activeCards.value.filter(c => {
      const detail = cardDetails.value[c.cardKey]
      return detail?.cardType === 'Business'
    })
  )

  // ── Local-only initialization ──
  function initializeLocal() {
    // Build catalog from hardcoded cards
    cardCatalog.value = localCards.map(c => ({
      cardKey: toCardKey(c.name),
      cardName: c.name,
      cardIssuer: c.name.split(' ')[0],
      _type: c.type,
    }))

    // Populate details + plaid mappings for all local cards
    for (const card of localCards) {
      const key = toCardKey(card.name)
      cardDetails.value[key] = buildLocalCardDetail(card)
      plaidMappings.value[key] = buildLocalPlaidMapping(card)
    }

    // Auto-populate portfolio on first use (if empty)
    if (userPortfolio.value.length === 0) {
      for (const card of localCards) {
        userPortfolio.value.push({
          cardKey: toCardKey(card.name),
          active: true,
          addedDate: new Date().toISOString().split('T')[0],
        })
      }
      savePortfolio(userPortfolio.value)
    } else {
      // Ensure existing portfolio cards have local data loaded
      for (const p of userPortfolio.value) {
        const local = localCards.find(c => toCardKey(c.name) === p.cardKey)
        if (local) {
          cardDetails.value[p.cardKey] = buildLocalCardDetail(local)
          plaidMappings.value[p.cardKey] = buildLocalPlaidMapping(local)
        }
      }
    }
  }

  // ── API initialization ──
  async function initializeApi() {
    // Load catalog (cached)
    const cached = readCache('catalog')
    if (cached) {
      cardCatalog.value = cached
    } else {
      const list = await fetchCardList()
      cardCatalog.value = Array.isArray(list) ? list : []
      writeCache('catalog', cardCatalog.value)
    }

    // Sync all portfolio cards data in parallel
    if (userPortfolio.value.length > 0) {
      await Promise.all(userPortfolio.value.map(c => loadCardDataFromApi(c.cardKey)))
    }
  }

  async function loadCardDataFromApi(cardKey) {
    const jobs = []

    if (!cardDetails.value[cardKey]) {
      const cached = readCache(`detail_${cardKey}`)
      if (cached) {
        cardDetails.value[cardKey] = cached
      } else {
        jobs.push(
          fetchCardDetail(cardKey).then(data => {
            const detail = Array.isArray(data) ? data[0] : data
            cardDetails.value[cardKey] = detail
            writeCache(`detail_${cardKey}`, detail)
          })
        )
      }
    }

    if (!plaidMappings.value[cardKey]) {
      const cached = readCache(`plaid_${cardKey}`)
      if (cached) {
        plaidMappings.value[cardKey] = cached
      } else {
        jobs.push(
          fetchPlaidMapping(cardKey).then(data => {
            const mapping = Array.isArray(data) ? data[0] : data
            plaidMappings.value[cardKey] = mapping
            writeCache(`plaid_${cardKey}`, mapping)
          })
        )
      }
    }

    if (!cardImages.value[cardKey]) {
      const cached = readCache(`image_${cardKey}`)
      if (cached) {
        cardImages.value[cardKey] = cached
      } else {
        jobs.push(
          fetchCardImage(cardKey).then(data => {
            cardImages.value[cardKey] = data
            writeCache(`image_${cardKey}`, data)
          }).catch(() => { /* image is optional */ })
        )
      }
    }

    if (jobs.length > 0) {
      await Promise.all(jobs)
    }
  }

  // ── Public actions ──

  async function initialize() {
    loading.value = true
    error.value = null
    try {
      if (hasApiKey) {
        usingLocalData.value = false
        await initializeApi()
      } else {
        usingLocalData.value = true
        initializeLocal()
      }
    } catch (err) {
      console.error('Credit card store init failed, falling back to local data:', err)
      error.value = err.message
      // Fallback to local data if API fails
      usingLocalData.value = true
      initializeLocal()
    } finally {
      loading.value = false
    }
  }

  async function addCardToPortfolio(cardKey) {
    if (portfolioCardKeys.value.includes(cardKey)) return

    userPortfolio.value.push({
      cardKey,
      active: true,
      addedDate: new Date().toISOString().split('T')[0],
    })
    savePortfolio(userPortfolio.value)

    if (hasApiKey && !usingLocalData.value) {
      await loadCardDataFromApi(cardKey)
    }
    // For local mode, data is already populated in cardDetails/plaidMappings
  }

  function removeCardFromPortfolio(cardKey) {
    userPortfolio.value = userPortfolio.value.filter(c => c.cardKey !== cardKey)
    savePortfolio(userPortfolio.value)
  }

  function toggleCard(cardKey) {
    const card = userPortfolio.value.find(c => c.cardKey === cardKey)
    if (card) {
      card.active = !card.active
      savePortfolio(userPortfolio.value)
    }
  }

  async function searchCards(query) {
    if (!query || query.length < 2) {
      searchResults.value = []
      return
    }

    if (usingLocalData.value) {
      // Search local catalog
      const q = query.toLowerCase()
      searchResults.value = cardCatalog.value.filter(c =>
        c.cardName.toLowerCase().includes(q) || c.cardIssuer.toLowerCase().includes(q)
      )
      return
    }

    searchLoading.value = true
    try {
      const results = await searchCardsByName(query)
      searchResults.value = Array.isArray(results) ? results : []
    } catch {
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }

  function getCardDetail(cardKey) {
    return cardDetails.value[cardKey] || null
  }

  function getPlaidMapping(cardKey) {
    return plaidMappings.value[cardKey] || null
  }

  function getCardImageUrl(cardKey) {
    const img = cardImages.value[cardKey]
    if (!img) return null
    if (typeof img === 'string') return img
    return img?.imageUrl || img?.url || null
  }

  return {
    // State
    cardCatalog,
    cardDetails,
    plaidMappings,
    cardImages,
    userPortfolio,
    loading,
    error,
    searchResults,
    searchLoading,
    usingLocalData,
    // Computed
    activeCards,
    portfolioCardKeys,
    totalAnnualFees,
    personalCards,
    businessCards,
    // Actions
    initialize,
    addCardToPortfolio,
    removeCardFromPortfolio,
    toggleCard,
    searchCards,
    getCardDetail,
    getPlaidMapping,
    getCardImageUrl,
  }
})
