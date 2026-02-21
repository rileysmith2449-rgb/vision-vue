import { verifyWebhook } from './_lib/webhookVerify.js'
import { setWebhookFlag, setConnectionStatus } from './_lib/kv.js'
import { captureError } from './_lib/sentry.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Always return 200 to Plaid to prevent retries
  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)

    const verificationHeader = req.headers['plaid-verification']
    const claims = await verifyWebhook(body, verificationHeader, { strict: false })
    if (!claims) {
      console.warn('[webhook] Processing unverified webhook request')
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { webhook_type, webhook_code, item_id } = event

    console.log(`[webhook] ${webhook_type}.${webhook_code} for item ${item_id}`)

    switch (webhook_type) {
      case 'TRANSACTIONS':
        if (webhook_code === 'DEFAULT_UPDATE' || webhook_code === 'SYNC_UPDATES_AVAILABLE') {
          await setWebhookFlag(item_id, 'transactions_update', {
            type: 'transactions_update',
            code: webhook_code,
          })
        }
        break

      case 'HOLDINGS':
        if (webhook_code === 'DEFAULT_UPDATE') {
          await setWebhookFlag(item_id, 'holdings_update', {
            type: 'holdings_update',
            code: webhook_code,
          })
        }
        break

      case 'LIABILITIES':
        if (webhook_code === 'DEFAULT_UPDATE') {
          await setWebhookFlag(item_id, 'liabilities_update', {
            type: 'liabilities_update',
            code: webhook_code,
          })
        }
        break

      case 'ITEM':
        if (webhook_code === 'ERROR') {
          const { error: plaidError } = event
          if (plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
            await setWebhookFlag(item_id, 'login_required', {
              type: 'login_required',
              status: 'login_required',
              code: plaidError.error_code,
              message: plaidError.error_message,
            })
          } else {
            await setWebhookFlag(item_id, 'item_error', {
              type: 'item_error',
              status: 'error',
              code: plaidError?.error_code,
              message: plaidError?.error_message,
            })
          }
        } else if (webhook_code === 'PENDING_EXPIRATION') {
          await setWebhookFlag(item_id, 'pending_expiration', {
            type: 'pending_expiration',
            status: 'pending_expiration',
            consentExpirationTime: event.consent_expiration_time,
          })
        }
        break

      default:
        console.log(`[webhook] Unhandled type: ${webhook_type}.${webhook_code}`)
    }

    res.status(200).json({ received: true })
  } catch (err) {
    captureError(err, { label: 'webhook' })
    // Still return 200 to avoid Plaid retries
    res.status(200).json({ received: true })
  }
}
