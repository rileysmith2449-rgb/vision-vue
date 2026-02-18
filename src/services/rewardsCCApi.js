const BASE_URL = import.meta.env.VITE_REWARDSCC_BASE_URL || 'https://rewards-credit-card-api.p.rapidapi.com'
const API_KEY = import.meta.env.VITE_REWARDSCC_API_KEY || ''
const API_HOST = import.meta.env.VITE_REWARDSCC_API_HOST || 'rewards-credit-card-api.p.rapidapi.com'

function getHeaders() {
  return {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': API_HOST,
  }
}

async function request(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers: getHeaders() })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`RewardsCC API error ${res.status}: ${text}`)
  }
  return res.json()
}

/** Full catalog of all cards — returns [{ cardKey, cardName, cardIssuer }] */
export function fetchCardList() {
  return request('/creditcard-detail-cardlist/')
}

/** Full card detail: fees, benefits, signup bonus, spend categories */
export function fetchCardDetail(cardKey) {
  return request(`/creditcard-detail-bycard/${encodeURIComponent(cardKey)}`)
}

/** Search cards by name — returns [{ cardKey, cardName, cardIssuer }] */
export function searchCardsByName(searchTerm) {
  return request(`/creditcard-detail-namesearch/${encodeURIComponent(searchTerm)}`)
}

/** Plaid detailed category → earn multiplier mapping for a card */
export function fetchPlaidMapping(cardKey) {
  return request(`/creditcard-plaid-bycard/${encodeURIComponent(cardKey)}`)
}

/** Card image URL */
export function fetchCardImage(cardKey) {
  return request(`/creditcard-image-bycard/${encodeURIComponent(cardKey)}`)
}

/** List of all spend bonus categories with IDs */
export function fetchBonusCategoryList() {
  return request('/creditcard-spendbonuscategory-categorylist/')
}

/** All cards earning bonuses in a specific category */
export function fetchCardsByBonusCategory(categoryId) {
  return request(`/creditcard-spendbonuscategory-categorycard/${encodeURIComponent(categoryId)}`)
}

/** Transfer partner list (Hilton, United, Hyatt, etc.) */
export function fetchTransferPartnerList() {
  return request('/creditcard-pointtransfer-transferprogramlist/')
}

/** Cards that transfer to a specific partner */
export function fetchCardsByTransferPartner(transferPartnerId) {
  return request(`/creditcard-pointtransfer-transferprogramcard/${encodeURIComponent(transferPartnerId)}`)
}

/** Earn rate at a specific Google Maps business */
export function fetchGoogleMapsSpend(cardKey, googleMapsId) {
  return request(`/creditcard-googlemapsspend/${encodeURIComponent(cardKey)}/${encodeURIComponent(googleMapsId)}`)
}
