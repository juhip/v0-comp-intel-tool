import { upsertLindyRecord, updateSpreadsheetsFor } from "@/lib/lindy-store"
import { extractSpreadsheetUrls, fetchAndParseSheet, deriveNormalizedFromSheets } from "@/utils/spreadsheet"

function authOk(req: Request) {
  const secret = process.env.LINDY_WEBHOOK_SECRET
  if (!secret) return true // demo
  const auth = req.headers.get("authorization")
  const xApiKey = req.headers.get("x-api-key")
  const xSecret = req.headers.get("x-webhook-secret")
  if (auth && auth.startsWith("Bearer ") && auth.slice(7) === secret) return true
  if (xApiKey === secret) return true
  if (xSecret === secret) return true
  return false
}

function extractCompany(body: any) {
  return (
    body?.company ||
    body?.companyName ||
    body?.company_name ||
    body?.company_intelligence?.companyName ||
    body?.company_intelligence?.company_name ||
    "Unknown"
  )
}

export async function POST(req: Request) {
  if (!authOk(req)) {
    return new Response("Unauthorized", { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const url = new URL(req.url)
  const qpId = url.searchParams.get("request_id") || url.searchParams.get("requestId")
  const bodyId = body?.request_id || body?.requestId || body?.id
  const requestId = typeof qpId === "string" ? qpId : typeof bodyId === "string" ? bodyId : crypto.randomUUID()
  const company = extractCompany(body)

  // Save raw immediately
  upsertLindyRecord({ requestId, company, raw: body })

  // Find and parse sheet URLs
  const urls = extractSpreadsheetUrls(body)
  if (urls.length) {
    const parsed = await Promise.all(urls.map((u) => fetchAndParseSheet(u)))
    const normalized = deriveNormalizedFromSheets(parsed)
    updateSpreadsheetsFor(requestId, parsed, Object.keys(normalized).length ? normalized : undefined)
  }

  return Response.json({ ok: true, request_id: requestId })
}
