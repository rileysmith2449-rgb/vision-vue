import { kv } from '@vercel/kv'
import { encrypt, decrypt } from './crypto.js'

function key(userId, memberId) {
  return `plaid:${userId}:${memberId || 'default'}`
}

export async function getConnection(userId, memberId) {
  const data = await kv.get(key(userId, memberId))
  if (!data) return null

  // Backward compat: plaintext tokens have accessToken, encrypted have encryptedToken
  if (data.accessToken) {
    console.warn(`[kv] Plaintext token found for ${userId}:${memberId} — re-encrypt recommended`)
    return data
  }

  if (data.encryptedToken) {
    return { accessToken: decrypt(data.encryptedToken), itemId: data.itemId }
  }

  return data
}

export async function setConnection(userId, memberId, connection) {
  const stored = {
    encryptedToken: encrypt(connection.accessToken),
    itemId: connection.itemId,
  }
  await kv.set(key(userId, memberId), stored)
}

export async function deleteConnection(userId, memberId) {
  await kv.del(key(userId, memberId))
}

// --- Webhook flag helpers ---

function webhookKey(itemId, type) {
  return `webhook:${itemId}:${type}`
}

function statusKey(userId, memberId) {
  return `plaid-status:${userId}:${memberId || 'default'}`
}

export async function setWebhookFlag(itemId, type, data) {
  await kv.set(webhookKey(itemId, type), { ...data, timestamp: Date.now() })
}

export async function getWebhookFlag(itemId, type) {
  return await kv.get(webhookKey(itemId, type))
}

export async function clearWebhookFlag(itemId, type) {
  await kv.del(webhookKey(itemId, type))
}

export async function setConnectionStatus(userId, memberId, status) {
  await kv.set(statusKey(userId, memberId), status)
}

export async function getConnectionStatus(userId, memberId) {
  return await kv.get(statusKey(userId, memberId))
}
