import { getLatestByCompany, updateSpreadsheetsFor } from "@/lib/lindy-store"
import { extractSpreadsheetUrls, fetchAndParseSheet, deriveNormalizedFromSheets } from "@/utils/spreadsheet"

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON body", { status: 400 })
  }
  const company = body?.company
  if (!company || typeof company !== "string") {
    return new Response("Missing company", { status: 400 })
  }

  const rec = getLatestByCompany(company)
  if (!rec) return new Response("No record for company", { status: 404 })

  const urls = rec.spreadsheets?.length ? rec.spreadsheets.map((s) => s.url) : extractSpreadsheetUrls(rec.raw)
  if (!urls.length) return Response.json({ ok: true, refreshed: false })

  const parsed = await Promise.all(urls.map((u) => fetchAndParseSheet(u)))
  const normalized = deriveNormalizedFromSheets(parsed)
  const updated = updateSpreadsheetsFor(rec.requestId, parsed, Object.keys(normalized).length ? normalized : undefined)

  return Response.json({
    ok: true,
    refreshed: true,
    updatedAt: updated?.updatedAt,
    data: updated?.normalized ?? updated?.raw,
  })
}
