// In-memory store for Lindy results, indexed by request_id and company.
// For production, persist in a database or KV store.

export type LindySheet = {
  url: string
  type: "csv" | "xlsx" | "google-sheets" | "unknown"
  parsed?: any // usually an array of row objects
  parsedAt?: string
  error?: string
}

export type StoredLindy = {
  requestId: string
  company: string
  raw: any
  spreadsheets: LindySheet[]
  normalized?: any
  updatedAt: number
}

const byRequestId = new Map<string, StoredLindy>()
const latestByCompany = new Map<string, StoredLindy>()

export function upsertLindyRecord(input: Partial<StoredLindy> & { requestId: string; company: string }) {
  const now = Date.now()
  const existing = byRequestId.get(input.requestId)
  const merged: StoredLindy = {
    requestId: input.requestId,
    company: input.company,
    raw: input.raw ?? existing?.raw ?? null,
    spreadsheets: input.spreadsheets ?? existing?.spreadsheets ?? [],
    normalized: input.normalized ?? existing?.normalized,
    updatedAt: now,
  }
  byRequestId.set(input.requestId, merged)

  const prev = latestByCompany.get(input.company)
  if (!prev || prev.updatedAt <= now) {
    latestByCompany.set(input.company, merged)
  }
  return merged
}

export function getByRequestId(requestId: string) {
  return byRequestId.get(requestId) || null
}

export function getLatestByCompany(company: string) {
  return latestByCompany.get(company) || null
}

export function updateSpreadsheetsFor(requestId: string, sheets: LindySheet[], normalized?: any) {
  const rec = byRequestId.get(requestId)
  if (!rec) return null
  rec.spreadsheets = sheets
  if (normalized) rec.normalized = normalized
  rec.updatedAt = Date.now()
  byRequestId.set(requestId, rec)

  const latest = latestByCompany.get(rec.company)
  if (!latest || latest.updatedAt <= rec.updatedAt) {
    latestByCompany.set(rec.company, rec)
  }
  return rec
}
