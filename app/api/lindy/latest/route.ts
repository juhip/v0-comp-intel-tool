import { getLatestByCompany } from "@/lib/lindy-store"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const company = url.searchParams.get("company")
  if (!company) return new Response("Missing company", { status: 400 })

  const rec = getLatestByCompany(company)
  if (!rec) {
    return Response.json({ ok: true, found: false })
  }

  // Prefer normalized (sheet-derived) if available, else raw
  const data = rec.normalized ?? rec.raw
  return Response.json({
    ok: true,
    found: true,
    company: rec.company,
    updatedAt: rec.updatedAt,
    hasSheets: !!rec.spreadsheets?.length,
    data,
  })
}
