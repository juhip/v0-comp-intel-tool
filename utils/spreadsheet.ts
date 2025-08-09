import Papa from "papaparse"
import * as XLSX from "xlsx"
import type { LindySheet } from "@/lib/lindy-store"

function inferTypeFromUrl(url: string): LindySheet["type"] {
  const u = url.toLowerCase()
  if (u.includes("docs.google.com/spreadsheets")) return "google-sheets"
  if (u.endsWith(".csv") || u.includes("format=csv") || u.includes("output=csv")) return "csv"
  if (u.endsWith(".xlsx") || u.endsWith(".xls")) return "xlsx"
  return "unknown"
}

function googleSheetsToCsvUrl(url: string) {
  // Convert typical Google Sheets URLs to CSV export
  // e.g., https://docs.google.com/spreadsheets/d/<id>/edit#gid=<gid>
  // -> https://docs.google.com/spreadsheets/d/<id>/export?format=csv&gid=<gid>
  try {
    const u = new URL(url)
    if (!u.hostname.includes("docs.google.com")) return url
    const parts = u.pathname.split("/")
    const dIndex = parts.findIndex((p) => p === "d")
    const id = dIndex >= 0 ? parts[dIndex + 1] : null
    const gid = u.hash?.includes("gid=") ? u.hash.split("gid=")[1] : u.searchParams.get("gid")
    if (!id) return url
    const exp = new URL(`https://docs.google.com/spreadsheets/d/${id}/export`)
    exp.searchParams.set("format", "csv")
    if (gid) exp.searchParams.set("gid", gid)
    return exp.toString()
  } catch {
    return url
  }
}

export async function fetchAndParseSheet(url: string): Promise<LindySheet> {
  const type = inferTypeFromUrl(url)
  let finalUrl = url
  if (type === "google-sheets") {
    finalUrl = googleSheetsToCsvUrl(url)
  }

  try {
    const res = await fetch(finalUrl)
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)

    const contentType = res.headers.get("content-type") || ""
    const parsedAt = new Date().toISOString()

    if (contentType.includes("text/csv") || type === "csv" || finalUrl.includes("format=csv")) {
      const text = await res.text()
      const parsed = Papa.parse(text, { header: true }).data
      return { url, type: type === "unknown" ? "csv" : type, parsed, parsedAt }
    }

    // Try XLSX
    const buf = await res.arrayBuffer()
    const wb = XLSX.read(buf, { type: "array" })
    const first = wb.SheetNames[0]
    const ws = wb.Sheets[first]
    const parsed = XLSX.utils.sheet_to_json(ws)
    return { url, type: type === "unknown" ? "xlsx" : type, parsed, parsedAt }
  } catch (err: any) {
    return { url, type, error: err?.message || "Parse error" }
  }
}

export function extractSpreadsheetUrls(payload: any): string[] {
  // Look for common fields and any string URLs that look like sheets
  const urls = new Set<string>()

  const walk = (obj: any) => {
    if (!obj) return
    if (typeof obj === "string") {
      const s = obj.trim()
      if (
        s.startsWith("http") &&
        (s.includes("docs.google.com/spreadsheets") ||
          s.endsWith(".csv") ||
          s.endsWith(".xlsx") ||
          s.includes("format=csv"))
      ) {
        urls.add(s)
      }
      return
    }
    if (Array.isArray(obj)) {
      obj.forEach(walk)
      return
    }
    if (typeof obj === "object") {
      for (const k of Object.keys(obj)) {
        const v = obj[k]
        if (
          k.toLowerCase().includes("spreadsheet") ||
          k.toLowerCase().includes("sheet") ||
          k.toLowerCase().includes("csv")
        ) {
          if (typeof v === "string") urls.add(v)
        }
        walk(v)
      }
    }
  }

  walk(payload)
  return Array.from(urls)
}

export function deriveNormalizedFromSheets(sheets: LindySheet[]) {
  // Very flexible heuristic: try to pick objects that look like our expected shapes.
  let companyIntel: any | undefined
  let competitive: any | undefined

  for (const s of sheets) {
    if (!s.parsed || !Array.isArray(s.parsed)) continue
    const rows = s.parsed as any[]
    if (rows.length === 0) continue

    // If a row looks like company intelligence (has key signals)
    const ci = rows.find((r) =>
      ["companyName", "company_name", "location", "oneLiner", "industry", "employees", "numberOfEmployees"].some((k) =>
        Object.prototype.hasOwnProperty.call(r, k),
      ),
    )
    if (ci && !companyIntel) companyIntel = ci

    // If a row looks like a competitive analysis header
    const ca = rows.find(
      (r) =>
        Object.prototype.hasOwnProperty.call(r, "main_company") ||
        Object.prototype.hasOwnProperty.call(r, "competitors"),
    )
    if (ca && !competitive) {
      // Some sheets keep competitors as semicolon/comma-separated strings; try to split
      const clone: any = { ...ca }
      if (typeof clone.competitors === "string") {
        try {
          clone.competitors = clone.competitors
            .split(/[;,]\s*/g)
            .filter(Boolean)
            .map((name: string) => ({ name }))
        } catch {
          /* noop */
        }
      }
      competitive = clone
    }
  }

  const normalized: any = {}
  if (companyIntel) normalized.company_intelligence = companyIntel
  if (competitive) normalized.competitive_analysis = competitive
  return normalized
}
