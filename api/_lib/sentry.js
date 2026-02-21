import * as Sentry from '@sentry/node'

let initialized = false

export function initSentry() {
  if (initialized) return
  if (!process.env.SENTRY_DSN) return
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.PLAID_ENV || 'unknown',
    tracesSampleRate: 0,
    beforeSend(event) {
      const msg = event.exception?.values?.[0]?.value || ''
      if (msg.includes('ITEM_LOGIN_REQUIRED')) return null
      if (msg.includes('ITEM_ERROR')) return null
      return event
    },
  })
  initialized = true
}

export function captureError(err, context = {}) {
  initSentry()
  console.error(context.label ? `[${context.label}]` : '[error]', err.message || err)
  Sentry.withScope(scope => {
    for (const [key, val] of Object.entries(context)) {
      scope.setExtra(key, val)
    }
    Sentry.captureException(err)
  })
}
