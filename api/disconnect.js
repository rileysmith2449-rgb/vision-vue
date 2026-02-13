import { plaidClient } from './_lib/plaid.js'
import { getUserId } from './_lib/auth.js'
import { getConnection, deleteConnection } from './_lib/kv.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = getUserId(req)
    const { member } = req.body || {}
    const memberId = member || 'default'

    const conn = await getConnection(userId, memberId)
    if (conn?.accessToken) {
      try {
        await plaidClient.itemRemove({ access_token: conn.accessToken })
      } catch {
        // Best-effort removal — don't fail the disconnect if itemRemove errors
      }
    }

    await deleteConnection(userId, memberId)
    res.json({ success: true })
  } catch (err) {
    console.error('Error disconnecting:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to disconnect' })
  }
}
