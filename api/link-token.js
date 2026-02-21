import { plaidClient } from './_lib/plaid.js'
import { getUserId } from './_lib/auth.js'
import { withRetry } from './_lib/retry.js'
import { getConnection } from './_lib/kv.js'
import { captureError } from './_lib/sentry.js'
import { Products, CountryCode } from 'plaid'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = getUserId(req)
    const memberId = req.query.member || 'default'

    // Update mode: create link token with existing access_token for re-auth
    if (req.query.update === 'true') {
      const conn = await getConnection(userId, memberId)
      if (!conn) return res.status(400).json({ error: 'No connection to update' })

      const response = await withRetry(
        () => plaidClient.linkTokenCreate({
          user: { client_user_id: `${userId}-${memberId}` },
          client_name: 'Vision',
          access_token: conn.accessToken,
          webhook: process.env.PLAID_WEBHOOK_URL || undefined,
        }),
        { label: 'linkTokenCreate:update' }
      )
      return res.json({ link_token: response.data.link_token })
    }

    const products = req.body?.products || [
      Products.Transactions,
      Products.Investments,
      Products.Liabilities,
    ]

    const response = await withRetry(
      () => plaidClient.linkTokenCreate({
        user: { client_user_id: `${userId}-${memberId}` },
        client_name: 'Vision',
        products,
        country_codes: [CountryCode.Us],
        language: 'en',
        webhook: process.env.PLAID_WEBHOOK_URL || undefined,
      }),
      { label: 'linkTokenCreate' }
    )

    res.json({ link_token: response.data.link_token })
  } catch (err) {
    captureError(err, { label: 'link-token', userId: req.query.member })
    res.status(500).json({ error: 'Failed to create link token' })
  }
}
