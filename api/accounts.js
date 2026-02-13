import { plaidClient } from './_lib/plaid.js'
import { getUserId } from './_lib/auth.js'
import { getConnection } from './_lib/kv.js'
import { mapPlaidAccounts } from './_lib/mappers.js'

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

    const response = await plaidClient.accountsGet({
      access_token: conn.accessToken,
    })

    const accounts = mapPlaidAccounts(response.data.accounts)
    res.json({ accounts })
  } catch (err) {
    console.error('Error fetching accounts:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to fetch accounts' })
  }
}
