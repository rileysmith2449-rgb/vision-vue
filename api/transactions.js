import { plaidClient } from './_lib/plaid.js'
import { getUserId } from './_lib/auth.js'
import { withRetry } from './_lib/retry.js'
import { getConnection } from './_lib/kv.js'
import { mapPlaidTransactions } from './_lib/mappers.js'
import { captureError } from './_lib/sentry.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = getUserId(req)
    const memberId = req.query.member || 'default'
    const start = req.query.start
    const end = req.query.end

    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query params required (YYYY-MM-DD)' })
    }

    const conn = await getConnection(userId, memberId)
    if (!conn) {
      return res.status(400).json({ error: 'No account connected. Link an account first.' })
    }

    // Paginate through all transactions
    let allTransactions = []
    let allAccounts = []
    let hasMore = true
    let offset = 0

    while (hasMore) {
      const response = await withRetry(
        () => plaidClient.transactionsGet({
          access_token: conn.accessToken,
          start_date: start,
          end_date: end,
          options: { count: 500, offset },
        }),
        { label: 'transactionsGet' }
      )

      allTransactions = allTransactions.concat(response.data.transactions)
      if (offset === 0) {
        allAccounts = response.data.accounts
      }
      offset += response.data.transactions.length
      hasMore = offset < response.data.total_transactions
    }

    const transactions = mapPlaidTransactions(allTransactions, allAccounts)
    res.json({ transactions })
  } catch (err) {
    await captureError(err, { label: 'transactions', userId, memberId })
    const plaidCode = err.response?.data?.error_code
    if (plaidCode === 'ITEM_LOGIN_REQUIRED') {
      return res.status(400).json({
        error: 'Bank connection expired',
        code: 'ITEM_LOGIN_REQUIRED',
        member: memberId,
      })
    }
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
}
