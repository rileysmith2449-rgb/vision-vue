import { createHash, createVerify } from 'crypto'
import { plaidClient } from './plaid.js'
import { withRetry } from './retry.js'

// Cache verification keys for 5 minutes
const keyCache = new Map()
const KEY_TTL = 5 * 60 * 1000

async function getVerificationKey(kid) {
  const cached = keyCache.get(kid)
  if (cached && Date.now() - cached.fetchedAt < KEY_TTL) {
    return cached.key
  }

  const response = await withRetry(
    () => plaidClient.webhookVerificationKeyGet({ key_id: kid }),
    { maxRetries: 2, label: 'webhookVerificationKeyGet' }
  )
  const jwk = response.data.key
  keyCache.set(kid, { key: jwk, fetchedAt: Date.now() })
  return jwk
}

function evictKey(kid) {
  keyCache.delete(kid)
}

function base64urlDecode(str) {
  return Buffer.from(str, 'base64url')
}

function jwkToPem(jwk) {
  // Build a DER-encoded SubjectPublicKeyInfo for an EC P-256 key
  // then wrap in PEM. Node's crypto.createVerify needs PEM or KeyObject.
  const x = base64urlDecode(jwk.x)
  const y = base64urlDecode(jwk.y)

  // Uncompressed EC point: 0x04 || x || y
  const point = Buffer.concat([Buffer.from([0x04]), x, y])

  // ASN.1 DER for EC SubjectPublicKeyInfo with P-256 OID
  const header = Buffer.from(
    '3059301306072a8648ce3d020106082a8648ce3d030107034200',
    'hex'
  )
  const der = Buffer.concat([header, point])
  const b64 = der.toString('base64')
  const lines = b64.match(/.{1,64}/g).join('\n')
  return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`
}

function verifySignature(headerB64, payloadB64, signatureB64, pem) {
  const signedData = `${headerB64}.${payloadB64}`
  const signature = base64urlDecode(signatureB64)

  // ES256 uses SHA-256 with ECDSA — convert JWS r||s signature to DER
  const r = signature.subarray(0, 32)
  const s = signature.subarray(32, 64)

  function intToDer(int) {
    if (int[0] & 0x80) {
      return Buffer.concat([Buffer.from([0x00]), int])
    }
    let i = 0
    while (i < int.length - 1 && int[i] === 0 && !(int[i + 1] & 0x80)) i++
    return int.subarray(i)
  }

  const rDer = intToDer(r)
  const sDer = intToDer(s)
  const derSig = Buffer.concat([
    Buffer.from([0x30, rDer.length + sDer.length + 4]),
    Buffer.from([0x02, rDer.length]),
    rDer,
    Buffer.from([0x02, sDer.length]),
    sDer,
  ])

  const verifier = createVerify('SHA256')
  verifier.update(signedData)
  return verifier.verify(pem, derSig)
}

/**
 * Verify a Plaid webhook request body.
 * Plaid signs webhook bodies as JWS (JWT) in the `Plaid-Verification` header.
 *
 * @param {string} body - Raw request body string
 * @param {string} plaidVerificationHeader - Plaid-Verification header value
 * @param {object} [options]
 * @param {boolean} [options.strict=true] - If false, missing header logs warning and returns null
 * @returns {Promise<object|null>} Decoded claims if valid, null if non-strict and no header
 */
export async function verifyWebhook(body, plaidVerificationHeader, { strict = true } = {}) {
  if (!plaidVerificationHeader) {
    if (!strict) {
      console.warn('[webhook] Missing Plaid-Verification header — processing unverified')
      return null
    }
    throw new Error('Missing Plaid-Verification header')
  }

  const token = plaidVerificationHeader
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error(`Invalid JWT structure: expected 3 parts, got ${parts.length}`)
  }
  const [headerB64, payloadB64, signatureB64] = parts

  // Decode header to get kid
  const header = JSON.parse(base64urlDecode(headerB64).toString())
  const { kid, alg } = header

  if (alg !== 'ES256') {
    throw new Error(`Unsupported JWT algorithm: ${alg}`)
  }

  // Fetch the verification key and verify signature
  let jwk = await getVerificationKey(kid)
  let pem = jwkToPem(jwk)
  let valid = verifySignature(headerB64, payloadB64, signatureB64, pem)

  // Stale key retry: if verification fails and key was cached, evict and re-fetch once
  if (!valid && keyCache.has(kid)) {
    evictKey(kid)
    jwk = await getVerificationKey(kid)
    pem = jwkToPem(jwk)
    valid = verifySignature(headerB64, payloadB64, signatureB64, pem)
  }

  if (!valid) {
    throw new Error('Invalid webhook signature')
  }

  // Decode and validate payload
  const claims = JSON.parse(base64urlDecode(payloadB64).toString())

  // Plaid signs the SHA-256 hash of the body in the request_body_sha256 claim
  const bodyHash = createHash('sha256').update(body, 'utf8').digest('hex')
  if (claims.request_body_sha256 !== bodyHash) {
    throw new Error('Webhook body hash mismatch')
  }

  // Check timestamp — reject if older than 5 minutes
  const iat = claims.iat
  if (!iat) {
    console.warn('[webhook] Missing iat claim in webhook token')
  } else if (Date.now() / 1000 - iat > 300) {
    throw new Error('Webhook too old')
  }

  return claims
}
