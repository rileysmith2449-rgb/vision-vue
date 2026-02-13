import { plaidClient } from './_lib/plaid.js'
import { getUserId } from './_lib/auth.js'
import { Products, CountryCode } from 'plaid'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = getUserId(req)
    const memberId = req.query.member || 'default'
    const products = req.body?.products || [
      Products.Transactions,
      Products.Investments,
      Products.Liabilities,
    ]

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: `${userId}-${memberId}` },
      client_name: 'Vision',
      products,
      country_codes: [CountryCode.Us],
      language: 'en',
    })

    res.json({ link_token: response.data.link_token })
  } catch (err) {
    console.error('Error creating link token:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to create link token' })
  }
}
