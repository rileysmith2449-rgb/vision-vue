import { kv } from '@vercel/kv'

function key(userId, memberId) {
  return `plaid:${userId}:${memberId || 'default'}`
}

export async function getConnection(userId, memberId) {
  const data = await kv.get(key(userId, memberId))
  return data || null
}

export async function setConnection(userId, memberId, connection) {
  await kv.set(key(userId, memberId), connection)
}

export async function deleteConnection(userId, memberId) {
  await kv.del(key(userId, memberId))
}
