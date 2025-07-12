import type { CompanyIntel } from "../types/company"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

export async function fetchCompanyIntelFromOpenAI(companyName: string): Promise<CompanyIntel> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured")
  }

  const prompt = `Provide comprehensive company intelligence for ${companyName} in JSON format. Include all available information about:

BASIC INFORMATION:
- company_intel (overview)
- location (headquarters)
- one_liner (company description)
- position_title (market position)
- industry
- number_of_employees

FINANCIAL INFORMATION:
- funding
- valuation
- revenue
- margin

LEADERSHIP & ORGANIZATION:
- chairman_ceo
- leadership (array of key executives)
- latest_deals (array)
- investors (array)

PRODUCTS & SERVICES:
- company_offerings (array)
- vision_mission
- values (array)
- brands_services_offered (array)
- product_service_categories (array)
- new_products_services (array)
- future_priorities (array)

MARKET PRESENCE:
- number_of_customers
- geographies_of_presence (array)
- competitors (array)

STRATEGIC ANALYSIS:
- pov_on_company
- unique_characteristics (array)
- strengths (array)
- weaknesses (array)
- metrics (array)
- opportunities (array)
- threats (array)
- insights (array)
- products_services_you_like (array)
- products_services_to_improve (array)

Return only valid JSON without any markdown formatting.`

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a business intelligence analyst. Provide accurate, comprehensive company information in the requested JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    const content = result.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content returned from OpenAI")
    }

    // Parse the JSON response
    const parsedData = JSON.parse(content)

    return processOpenAIResult(parsedData, companyName)
  } catch (error) {
    console.error("Error fetching from OpenAI:", error)
    throw error
  }
}

function processOpenAIResult(result: any, companyName: string): CompanyIntel {
  return {
    companyName,
    location: result.location || "N/A",
    oneLiner: result.one_liner || "N/A",
    positionTitle: result.position_title || "N/A",
    industry: result.industry || "N/A",
    numberOfEmployees: result.number_of_employees || "N/A",
    funding: result.funding || "N/A",
    valuation: result.valuation || "N/A",
    chairmanCEO: result.chairman_ceo || "N/A",
    leadership: result.leadership || [],
    latestDeals: result.latest_deals || [],
    investors: result.investors || [],
    companyOfferings: result.company_offerings || [],
    visionMission: result.vision_mission || "N/A",
    values: result.values || [],
    brandsServices: result.brands_services_offered || [],
    productServiceCategories: result.product_service_categories || [],
    newProducts: result.new_products_services || [],
    futurePriorities: result.future_priorities || [],
    numberOfCustomers: result.number_of_customers || "N/A",
    geographiesOfPresence: result.geographies_of_presence || [],
    competitors: result.competitors || [],
    revenue: result.revenue || "N/A",
    margin: result.margin || "N/A",
    povOnCompany: result.pov_on_company || "N/A",
    uniqueCharacteristics: result.unique_characteristics || [],
    strengths: result.strengths || [],
    weaknesses: result.weaknesses || [],
    metrics: result.metrics || [],
    opportunities: result.opportunities || [],
    threats: result.threats || [],
    insights: result.insights || [],
    productsServicesLiked: result.products_services_you_like || [],
    productsServicesToImprove: result.products_services_to_improve || [],
  }
}

export async function fetchCompetitiveAnalysisFromOpenAI(companyName: string): Promise<any> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured")
  }

  const prompt = `Provide a comprehensive competitive analysis for ${companyName}. Return the response in JSON format with the following structure:

{
  "main_company": "${companyName}",
  "competitors": [
    {
      "name": "Competitor Name",
      "market_share": "percentage or description",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "key_products": ["product1", "product2"],
      "competitive_advantage": "description",
      "threat_level": "High/Medium/Low"
    }
  ],
  "market_analysis": {
    "market_size": "description",
    "growth_rate": "percentage",
    "key_trends": ["trend1", "trend2"],
    "barriers_to_entry": ["barrier1", "barrier2"]
  },
  "competitive_positioning": {
    "market_leader": "company name",
    "market_challengers": ["company1", "company2"],
    "market_followers": ["company1", "company2"],
    "niche_players": ["company1", "company2"]
  },
  "swot_comparison": {
    "${companyName}": {
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "opportunities": ["opportunity1", "opportunity2"],
      "threats": ["threat1", "threat2"]
    }
  },
  "recommendations": ["recommendation1", "recommendation2"]
}

Return only valid JSON without any markdown formatting.`

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a competitive intelligence analyst. Provide accurate, comprehensive competitive analysis in the requested JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    const content = result.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content returned from OpenAI")
    }

    return JSON.parse(content)
  } catch (error) {
    console.error("Error fetching competitive analysis from OpenAI:", error)
    throw error
  }
}
