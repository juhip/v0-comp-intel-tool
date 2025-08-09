import type { CompanyIntel } from "../types/company"

type LindyCombinedResponse = {
  company_intelligence?: any
  competitive_analysis?: any
  [k: string]: any
}

async function pollForResult(requestId: string, timeoutMs = 90_000, intervalMs = 2000): Promise<any> {
  const until = Date.now() + timeoutMs
  while (Date.now() < until) {
    const res = await fetch(`/api/lindy/result?request_id=${encodeURIComponent(requestId)}`, { cache: "no-store" })
    const json = await res.json()
    if (json?.ready && json.data) {
      // Best-effort cleanup
      fetch(`/api/lindy/result?request_id=${encodeURIComponent(requestId)}`, { method: "DELETE" }).catch(() => {})
      return json.data
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  throw new Error("Timeout waiting for Lindy callback")
}

export async function fetchFromLindy(companyName: string): Promise<LindyCombinedResponse> {
  const trigger = await fetch("/api/lindy/trigger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company: companyName,
      includeCompetitive: true,
      metadata: { source: "dashboard" },
    }),
  })

  if (!trigger.ok) {
    const text = await trigger.text().catch(() => "")
    throw new Error(text || `Lindy trigger failed: ${trigger.status} ${trigger.statusText}`)
  }

  const tri = await trigger.json()
  const requestId: string = tri?.request_id
  if (!requestId) throw new Error("No request_id returned from trigger")

  // Wait for the callback response (raw)
  const data = await pollForResult(requestId)

  // After callback, our callback handler may have parsed sheets and normalized them asynchronously.
  // The latest endpoint will return normalized if available.
  const latest = await fetchLatestLindy(companyName)
  return (latest ?? data) as LindyCombinedResponse
}

export async function fetchLatestLindy(companyName: string): Promise<LindyCombinedResponse | null> {
  const res = await fetch(`/api/lindy/latest?company=${encodeURIComponent(companyName)}`, { cache: "no-store" })
  const json = await res.json()
  if (!json?.ok || !json?.found) return null
  return json.data as LindyCombinedResponse
}

export async function refreshLindy(companyName: string): Promise<LindyCombinedResponse | null> {
  const res = await fetch("/api/lindy/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company: companyName }),
  })
  if (!res.ok) return null
  const json = await res.json()
  return (json?.data ?? null) as LindyCombinedResponse | null
}

export function mapLindyCompanyIntel(input: any, fallbackCompanyName: string): CompanyIntel {
  const src = input?.company_intelligence ?? input
  return {
    companyName: src.companyName || src.company_name || fallbackCompanyName,
    location: src.location || src.headquarters || "N/A",
    oneLiner: src.oneLiner || src.description || "N/A",
    positionTitle: src.positionTitle || src.market_position || "N/A",
    industry: src.industry || "N/A",
    numberOfEmployees: src.numberOfEmployees || src.employees || "N/A",
    funding: src.funding || "N/A",
    valuation: src.valuation || src.market_cap || "N/A",
    chairmanCEO: src.chairmanCEO || src.ceo || "N/A",
    leadership: src.leadership || [],
    latestDeals: src.latestDeals || src.recent_news || [],
    investors: src.investors || [],
    companyOfferings: src.companyOfferings || src.products || [],
    visionMission: src.visionMission || src.vision_mission || "N/A",
    values: src.values || [],
    brandsServices: src.brandsServices || src.products || [],
    productServiceCategories: src.productServiceCategories || src.products || [],
    newProducts: src.newProducts || [],
    futurePriorities: src.futurePriorities || [],
    numberOfCustomers: src.numberOfCustomers || "N/A",
    geographiesOfPresence: src.geographiesOfPresence || [],
    competitors: src.competitors || [],
    revenue: src.revenue || "N/A",
    margin: src.margin || "N/A",
    povOnCompany: src.povOnCompany || src.description || "N/A",
    uniqueCharacteristics: src.uniqueCharacteristics || [],
    strengths: src.strengths || [],
    weaknesses: src.weaknesses || [],
    metrics: src.metrics || [],
    opportunities: src.opportunities || [],
    threats: src.threats || [],
    insights: src.insights || src.recent_news || [],
    productsServicesLiked: src.productsServicesLiked || [],
    productsServicesToImprove: src.productsServicesToImprove || [],
  }
}

export function mapLindyCompetitive(input: any, fallbackCompanyName: string): any {
  if (input?.competitive_analysis) return input.competitive_analysis
  return {
    main_company: input?.main_company || fallbackCompanyName,
    competitors: input?.competitors || [],
    market_analysis: input?.market_analysis || {
      market_size: "N/A",
      growth_rate: "N/A",
      key_trends: [],
      barriers_to_entry: [],
    },
    competitive_positioning: input?.competitive_positioning || {
      market_leader: "N/A",
      market_challengers: [],
      market_followers: [],
      niche_players: [],
    },
    swot_comparison: input?.swot_comparison || {
      [fallbackCompanyName]: {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      },
    },
    recommendations: input?.recommendations || [],
  }
}
