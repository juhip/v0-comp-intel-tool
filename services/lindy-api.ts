// Client helper and mappers for Lindy integration.

import type { CompanyIntel } from "../types/company"

type LindyCombinedResponse = {
  company_intelligence?: any
  competitive_analysis?: any
  [k: string]: any
}

export async function fetchFromLindy(companyName: string): Promise<LindyCombinedResponse> {
  const res = await fetch("/api/lindy/trigger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company: companyName,
      includeCompetitive: true,
      metadata: { source: "dashboard" },
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Lindy trigger failed: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as LindyCombinedResponse
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
