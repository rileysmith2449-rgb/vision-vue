import { plaidClient } from './_lib/plaid.js'
import { getUserId } from './_lib/auth.js'
import { getConnection } from './_lib/kv.js'
import { mapPlaidHoldings } from './_lib/mappers.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = getUserId(req)
    const memberId = req.query.member || 'default'

    const conn = await getConnection(userId, memberId)
    if (!conn) {
      return res.status(400).json({ error: 'No account connected. Link an account first.' })
    }

    const response = await plaidClient.investmentsHoldingsGet({
      access_token: conn.accessToken,
    })

    const holdings = mapPlaidHoldings(response.data.holdings, response.data.securities)
    res.json({ holdings })
  } catch (err) {
    console.error('Error fetching holdings:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to fetch holdings' })
  }
}
