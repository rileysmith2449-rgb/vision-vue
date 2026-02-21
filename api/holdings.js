import { plaidClient } from './_lib/plaid.js'
import { getUserId } from './_lib/auth.js'
import { withRetry } from './_lib/retry.js'
import { getConnection } from './_lib/kv.js'
import { mapPlaidHoldings } from './_lib/mappers.js'
import { captureError } from './_lib/sentry.js'

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

    const response = await withRetry(
      () => plaidClient.investmentsHoldingsGet({ access_token: conn.accessToken }),
      { label: 'investmentsHoldingsGet' }
    )

    const holdings = mapPlaidHoldings(response.data.holdings, response.data.securities)
    res.json({ holdings })
  } catch (err) {
    await captureError(err, { label: 'holdings', userId, memberId })
    const plaidCode = err.response?.data?.error_code
    if (plaidCode === 'ITEM_LOGIN_REQUIRED') {
      return res.status(400).json({
        error: 'Bank connection expired',
        code: 'ITEM_LOGIN_REQUIRED',
        member: memberId,
      })
    }
    res.status(500).json({ error: 'Failed to fetch holdings' })
  }
}
