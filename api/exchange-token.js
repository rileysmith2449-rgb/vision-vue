import { plaidClient } from './_lib/plaid.js'
import { getUserId } from './_lib/auth.js'
import { setConnection } from './_lib/kv.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = getUserId(req)
    const { public_token, member } = req.body
    const memberId = member || 'default'

    const response = await plaidClient.itemPublicTokenExchange({ public_token })
    const { access_token, item_id } = response.data

    await setConnection(userId, memberId, { accessToken: access_token, itemId: item_id })

    res.json({ item_id })
  } catch (err) {
    console.error('Error exchanging token:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to exchange token' })
  }
}
