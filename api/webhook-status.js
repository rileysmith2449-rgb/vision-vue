import { getUserId } from './_lib/auth.js'
import { getConnection, getWebhookFlag } from './_lib/kv.js'
import { withCors } from './_lib/cors.js'

const FLAG_TYPES = [
  'transactions_update',
  'holdings_update',
  'liabilities_update',
  'item_error',
  'pending_expiration',
  'login_required',
]

export default withCors(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = getUserId(req)
    const memberId = req.query.member || 'default'

    const connection = await getConnection(userId, memberId)
    if (!connection) {
      return res.json({ hasUpdates: false, flags: [] })
    }

    const { itemId } = connection
    const flags = []

    for (const type of FLAG_TYPES) {
      const flag = await getWebhookFlag(itemId, type)
      if (flag) flags.push(flag)
    }

    res.json({ hasUpdates: flags.length > 0, flags })
  } catch (err) {
    console.error('[webhook-status] Error:', err.message)
    res.status(500).json({ error: 'Failed to check webhook status' })
  }
})
