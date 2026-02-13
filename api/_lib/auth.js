/**
 * Extract user ID from Descope JWT or fall back to 'local-dev' for localhost.
 */
export function getUserId(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return 'local-dev'
  }

  try {
    const token = authHeader.split(' ')[1]
    // Decode JWT payload without verification (Descope validates on the frontend)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    return payload.sub || 'local-dev'
  } catch {
    return 'local-dev'
  }
}
