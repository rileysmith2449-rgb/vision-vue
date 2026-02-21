const ALLOWED_ORIGINS = [
  'https://visionfinance.app',
  'capacitor://localhost',
  'http://localhost',
]

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function withCors(handler) {
  return async (req, res) => {
    setCorsHeaders(req, res)
    if (req.method === 'OPTIONS') {
      return res.status(204).end()
    }
    return handler(req, res)
  }
}
