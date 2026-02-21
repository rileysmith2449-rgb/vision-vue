const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ECONNABORTED',
])

/**
 * Determine if an error warrants a retry.
 * Retries: HTTP 429, 5xx, network errors, Plaid API_ERROR / INTERNAL_SERVER_ERROR.
 * No retry: 4xx (except 429), Plaid INVALID_REQUEST, ITEM_ERROR, auth errors.
 */
export function isRetryable(err) {
  // Network-level errors (no HTTP response)
  if (err.code && RETRYABLE_NETWORK_CODES.has(err.code)) return true

  const status = err.response?.status ?? err.status
  const plaidType = err.response?.data?.error_type

  // Never retry client errors (except 429)
  if (status && status >= 400 && status < 500 && status !== 429) return false

  // Plaid-specific non-retryable error types
  if (plaidType === 'INVALID_REQUEST' || plaidType === 'ITEM_ERROR') return false

  // Retry rate limits
  if (status === 429) return true

  // Retry server errors
  if (status >= 500) return true

  // Retry Plaid transient error types
  if (plaidType === 'API_ERROR' || plaidType === 'INTERNAL_SERVER_ERROR') return true

  return false
}

/**
 * Calculate delay for a given retry attempt with exponential backoff,
 * jitter, and Retry-After header support.
 */
export function calculateDelay(err, attempt, opts) {
  const { baseDelay = 500, maxDelay = 10000, jitterFactor = 0.5 } = opts

  let delay = baseDelay * Math.pow(2, attempt)

  // Respect Retry-After header from 429 responses
  const retryAfter = err.response?.headers?.['retry-after']
  if (retryAfter) {
    const retryMs = Number(retryAfter) * 1000
    if (!Number.isNaN(retryMs) && retryMs > delay) {
      delay = retryMs
    }
  }

  // Add random jitter
  const jitter = Math.random() * jitterFactor * baseDelay
  delay += jitter

  return Math.min(delay, maxDelay)
}

/**
 * Wrap an async function with retry logic using exponential backoff.
 *
 * @param {Function} fn - Async function to wrap
 * @param {object} [options]
 * @param {number} [options.maxRetries=3]
 * @param {number} [options.baseDelay=500]
 * @param {number} [options.maxDelay=10000]
 * @param {number} [options.jitterFactor=0.5]
 * @param {string} [options.label] - Label for log messages
 * @returns {Promise<*>} Result of fn()
 */
export async function withRetry(fn, options = {}) {
  const { maxRetries = 3, label = 'api' } = options

  let lastError
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err

      if (attempt >= maxRetries || !isRetryable(err)) {
        throw err
      }

      const delay = calculateDelay(err, attempt, options)
      console.warn(
        `[retry] ${label} attempt ${attempt + 1}/${maxRetries} failed, retrying in ${Math.round(delay)}ms:`,
        err.message
      )
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
