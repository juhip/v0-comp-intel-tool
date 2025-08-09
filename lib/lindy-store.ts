// Simple in-memory store for Lindy async results.
// Note: In-memory storage is fine for ephemeral demos. For production,
// persist to a durable store (Upstash, Neon, etc.).
const store = new Map<string, any>()

export function saveLindyResult(requestId: string, data: any) {
  store.set(requestId, data)
}

export function getLindyResult(requestId: string) {
  return store.get(requestId)
}

export function deleteLindyResult(requestId: string) {
  store.delete(requestId)
}
