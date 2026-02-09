import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '..', '.env') })
import express from 'express'
import cors from 'cors'
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid'

const app = express()
app.use(cors())
app.use(express.json())

// Plaid client setup
const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
})

const plaidClient = new PlaidApi(config)

// In-memory storage for access tokens (per session — not production-ready)
// Keyed by connection id: 'default', 'member1', 'member2'
const connections = {
  default: { accessToken: null, itemId: null },
  member1: { accessToken: null, itemId: null },
  member2: { accessToken: null, itemId: null },
}

function getConnection(memberId) {
  const key = memberId && connections[memberId] ? memberId : 'default'
  return connections[key]
}

// --- Routes ---

// Create a link token for Plaid Link initialization
app.post('/api/link-token', async (req, res) => {
  try {
    const memberId = req.query.member || 'default'
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: `vision-vue-${memberId}` },
      client_name: 'Vision',
      products: [Products.Investments],
      country_codes: [CountryCode.Us],
      language: 'en',
    })
    res.json({ link_token: response.data.link_token })
  } catch (err) {
    console.error('Error creating link token:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to create link token' })
  }
})

// Exchange a public token for an access token
app.post('/api/exchange-token', async (req, res) => {
  try {
    const { public_token, member } = req.body
    const conn = getConnection(member)
    const response = await plaidClient.itemPublicTokenExchange({ public_token })
    conn.accessToken = response.data.access_token
    conn.itemId = response.data.item_id
    res.json({ item_id: conn.itemId })
  } catch (err) {
    console.error('Error exchanging token:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to exchange token' })
  }
})

// Get investment holdings
app.get('/api/holdings', async (req, res) => {
  const memberId = req.query.member
  const conn = getConnection(memberId)
  if (!conn.accessToken) {
    return res.status(400).json({ error: 'No account connected. Link an account first.' })
  }

  try {
    const response = await plaidClient.investmentsHoldingsGet({ access_token: conn.accessToken })
    const holdings = mapPlaidHoldings(response.data.holdings, response.data.securities)
    res.json({ holdings })
  } catch (err) {
    console.error('Error fetching holdings:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to fetch holdings' })
  }
})

// Disconnect: clear stored tokens
app.post('/api/disconnect', (req, res) => {
  const { member } = req.body || {}
  const conn = getConnection(member)
  conn.accessToken = null
  conn.itemId = null
  res.json({ success: true })
})

// --- Helpers ---

const TYPE_MAP = {
  equity: { type: 'stock', category: 'Stocks', icon: '📈' },
  etf: { type: 'etf', category: 'ETFs', icon: '💎' },
  'mutual fund': { type: 'etf', category: 'ETFs', icon: '💎' },
  cryptocurrency: { type: 'crypto', category: 'Crypto', icon: '₿' },
  cash: { type: 'cash', category: 'Cash', icon: '💵' },
  fixed_income: { type: 'other', category: 'Bonds', icon: '🏦' },
  derivative: { type: 'other', category: 'Other', icon: '🎯' },
}

function mapPlaidHoldings(holdings, securities) {
  const secMap = new Map()
  for (const sec of securities) {
    secMap.set(sec.security_id, sec)
  }

  return holdings.map((holding, i) => {
    const security = secMap.get(holding.security_id) || {}
    const plaidType = (security.type || '').toLowerCase()
    const mapped = TYPE_MAP[plaidType] || { type: 'other', category: 'Other', icon: '🎯' }

    // Sandbox doesn't provide purchase dates — assign random dates for tax calc demo
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Vision API server running on http://localhost:${PORT}`)
})
