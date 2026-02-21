import { plaidClient } from './_lib/plaid.js'
import { getUserId } from './_lib/auth.js'
import { withRetry } from './_lib/retry.js'
import { setConnection } from './_lib/kv.js'
import { captureError } from './_lib/sentry.js'
import { withCors } from './_lib/cors.js'

export default withCors(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userId = getUserId(req)
  const memberId = req.body?.member || 'default'

  try {
    const { public_token } = req.body

    const response = await withRetry(
      () => plaidClient.itemPublicTokenExchange({ public_token }),
      { label: 'itemPublicTokenExchange' }
    )
    const { access_token, item_id } = response.data

    await setConnection(userId, memberId, { accessToken: access_token, itemId: item_id })

    res.json({ item_id })
  } catch (err) {
    await captureError(err, { label: 'exchange-token', userId, memberId })
    res.status(500).json({ error: 'Failed to exchange token' })
  }
})
