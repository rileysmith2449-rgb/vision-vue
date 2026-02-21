let _sentry = null
let initialized = false

async function loadSentry() {
  if (_sentry) return _sentry
  try {
    _sentry = await import('@sentry/node')
  } catch {
    _sentry = null
  }
  return _sentry
}

export async function captureError(err, context = {}) {
  console.error(context.label ? `[${context.label}]` : '[error]', err.message || err)

  if (!process.env.SENTRY_DSN) return

  try {
    const Sentry = await loadSentry()
    if (!Sentry) return

    if (!initialized) {
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

    Sentry.withScope(scope => {
      for (const [key, val] of Object.entries(context)) {
        scope.setExtra(key, val)
      }
      Sentry.captureException(err)
    })
  } catch {
    // Sentry failed — continue without it
  }
}
