import type { CompanyIntel } from "../types/company"
import { fetchCompanyIntelFromOpenAI, fetchCompetitiveAnalysisFromOpenAI } from "./openai-fallback"
import { fetchCompanyIntelFromXAI, fetchCompetitiveAnalysisFromXAI } from "./xai-integration"

const PARALLEL_API_KEY = process.env.PARALLEL_API_KEY || ""
const PARALLEL_API_URL = "https://api.parallel.ai/v1/tasks/runs"

export async function fetchCompanyIntel(companyName: string): Promise<CompanyIntel> {
  // Try multiple APIs in order: OpenAI, xAI, Parallel.ai, then sample data

  // Try OpenAI first (most reliable)
  try {
    if (process.env.OPENAI_API_KEY) {
      console.log("Trying OpenAI API...")
      return await fetchCompanyIntelFromOpenAI(companyName)
    }
  } catch (error) {
    console.log("OpenAI failed, trying xAI:", error)
  }

  // Try xAI second
  try {
    if (process.env.XAI_API_KEY) {
      console.log("Trying xAI API...")
      return await fetchCompanyIntelFromXAI(companyName)
    }
  } catch (error) {
    console.log("xAI failed, trying Parallel.ai:", error)
  }

  // Try Parallel.ai third
  try {
    if (PARALLEL_API_KEY) {
      console.log("Trying Parallel.ai API...")
      return await fetchCompanyIntelFromParallelAI(companyName)
    }
  } catch (error) {
    console.log("Parallel.ai failed, using sample data:", error)
  }

  // Final fallback to sample data
  console.log("All APIs failed, using sample data")
  return getSampleCompanyData(companyName)
}

export async function fetchCompetitiveAnalysis(companyName: string): Promise<any> {
  // Try multiple APIs in order: OpenAI, xAI, Parallel.ai, then sample data

  // Try OpenAI first
  try {
    if (process.env.OPENAI_API_KEY) {
      console.log("Trying OpenAI competitive analysis...")
      return await fetchCompetitiveAnalysisFromOpenAI(companyName)
    }
  } catch (error) {
    console.log("OpenAI competitive analysis failed, trying xAI:", error)
  }

  // Try xAI second
  try {
    if (process.env.XAI_API_KEY) {
      console.log("Trying xAI competitive analysis...")
      return await fetchCompetitiveAnalysisFromXAI(companyName)
    }
  } catch (error) {
    console.log("xAI competitive analysis failed, trying Parallel.ai:", error)
  }

  // Try Parallel.ai third
  try {
    if (PARALLEL_API_KEY) {
      console.log("Trying Parallel.ai competitive analysis...")
      return await fetchCompetitiveAnalysisFromParallelAI(companyName)
    }
  } catch (error) {
    console.log("Parallel.ai competitive analysis failed, using sample data:", error)
  }

  // Final fallback to sample data
  console.log("All competitive analysis APIs failed, using sample data")
  return getSampleCompetitiveData(companyName)
}

async function fetchCompanyIntelFromParallelAI(companyName: string): Promise<CompanyIntel> {
  const taskSpec = {
    output_schema: {
      type: "object",
      properties: {
        company_name: { type: "string" },
        location: { type: "string" },
        industry: { type: "string" },
        description: { type: "string" },
        ceo: { type: "string" },
        employees: { type: "string" },
        revenue: { type: "string" },
        founded: { type: "string" },
        competitors: { type: "array", items: { type: "string" } },
        products: { type: "array", items: { type: "string" } },
        recent_news: { type: "array", items: { type: "string" } },
      },
    },
    input: `Extract comprehensive information about ${companyName}. Include:
    - Company name and basic details
    - Location and headquarters
    - Industry and business description  
    - CEO and leadership
    - Number of employees
    - Revenue information
    - Founded date
    - Main competitors
    - Key products/services
    - Recent news or developments
    
    Please provide accurate, up-to-date information from reliable sources.`,
    processor: "base",
  }

  const response = await fetch(PARALLEL_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": PARALLEL_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task_spec: taskSpec }),
  })

  if (!response.ok) {
    throw new Error(`Parallel API request failed: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()
  const runId = result.run_id

  if (!runId) {
    throw new Error("No run ID returned from Parallel API")
  }

  // Poll for results
  const taskResult = await pollForResults(runId)

  // Since the API returns text, we need to parse it into our structure
  return parseParallelAIResponse(taskResult, companyName)
}

async function fetchCompetitiveAnalysisFromParallelAI(companyName: string): Promise<any> {
  const taskSpec = {
    output_schema: "Competitive analysis data in structured format",
    input: `Provide a comprehensive competitive analysis for ${companyName}. Include:

MARKET ANALYSIS:
- Market size and growth rate
- Key market trends
- Barriers to entry

COMPETITOR IDENTIFICATION:
- Main competitors and their market share
- Strengths and weaknesses of each competitor
- Key products/services of competitors
- Competitive advantages
- Threat level assessment

COMPETITIVE POSITIONING:
- Market leaders, challengers, followers, and niche players
- Where ${companyName} fits in the competitive landscape

SWOT ANALYSIS:
- Strengths, Weaknesses, Opportunities, and Threats for ${companyName}

STRATEGIC RECOMMENDATIONS:
- Actionable recommendations for competitive advantage

Please provide this in a structured format that clearly separates each section.`,
    processor: "base",
  }

  const response = await fetch(PARALLEL_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": PARALLEL_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task_spec: taskSpec }),
  })

  if (!response.ok) {
    throw new Error(`Parallel API request failed: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()
  const runId = result.run_id

  if (!runId) {
    throw new Error("No run ID returned from Parallel API")
  }

  const taskResult = await pollForResults(runId)
  return parseCompetitiveAnalysisResponse(taskResult, companyName)
}

async function pollForResults(runId: string, maxAttempts = 30): Promise<any> {
  const pollUrl = `https://api.parallel.ai/v1/tasks/runs/${runId}/result`

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(pollUrl, {
        headers: {
          "x-api-key": PARALLEL_API_KEY,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.status === "completed") {
          return result.result
        } else if (result.status === "failed") {
          throw new Error("Task failed: " + result.error)
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error
      }
    }
  }

  throw new Error("Task timed out")
}

function parseParallelAIResponse(response: string, companyName: string): CompanyIntel {
  // Since Parallel AI returns text, we need to parse it
  // This is a simplified parser - in practice, you might want more sophisticated parsing

  return {
    companyName,
    location: extractField(response, "location") || "N/A",
    oneLiner: extractField(response, "description") || "N/A",
    positionTitle: extractField(response, "position") || "N/A",
    industry: extractField(response, "industry") || "N/A",
    numberOfEmployees: extractField(response, "employees") || "N/A",
    funding: extractField(response, "funding") || "N/A",
    valuation: extractField(response, "valuation") || "N/A",
    chairmanCEO: extractField(response, "ceo") || "N/A",
    leadership: extractList(response, "leadership") || [],
    latestDeals: extractList(response, "deals") || [],
    investors: extractList(response, "investors") || [],
    companyOfferings: extractList(response, "offerings") || [],
    visionMission: extractField(response, "mission") || "N/A",
    values: extractList(response, "values") || [],
    brandsServices: extractList(response, "brands") || [],
    productServiceCategories: extractList(response, "categories") || [],
    newProducts: extractList(response, "new products") || [],
    futurePriorities: extractList(response, "priorities") || [],
    numberOfCustomers: extractField(response, "customers") || "N/A",
    geographiesOfPresence: extractList(response, "geographies") || [],
    competitors: extractList(response, "competitors") || [],
    revenue: extractField(response, "revenue") || "N/A",
    margin: extractField(response, "margin") || "N/A",
    povOnCompany: extractField(response, "analysis") || "N/A",
    uniqueCharacteristics: extractList(response, "characteristics") || [],
    strengths: extractList(response, "strengths") || [],
    weaknesses: extractList(response, "weaknesses") || [],
    metrics: extractList(response, "metrics") || [],
    opportunities: extractList(response, "opportunities") || [],
    threats: extractList(response, "threats") || [],
    insights: extractList(response, "insights") || [],
    productsServicesLiked: extractList(response, "liked") || [],
    productsServicesToImprove: extractList(response, "improve") || [],
  }
}

function parseCompetitiveAnalysisResponse(response: string, companyName: string): any {
  // Parse the competitive analysis response
  return {
    main_company: companyName,
    competitors: extractCompetitors(response),
    market_analysis: {
      market_size: extractField(response, "market size") || "N/A",
      growth_rate: extractField(response, "growth rate") || "N/A",
      key_trends: extractList(response, "trends") || [],
      barriers_to_entry: extractList(response, "barriers") || [],
    },
    competitive_positioning: {
      market_leader: extractField(response, "leader") || "N/A",
      market_challengers: extractList(response, "challengers") || [],
      market_followers: extractList(response, "followers") || [],
      niche_players: extractList(response, "niche") || [],
    },
    swot_comparison: {
      [companyName]: {
        strengths: extractList(response, "strengths") || [],
        weaknesses: extractList(response, "weaknesses") || [],
        opportunities: extractList(response, "opportunities") || [],
        threats: extractList(response, "threats") || [],
      },
    },
    recommendations: extractList(response, "recommendations") || [],
  }
}

// Helper functions for parsing text responses
function extractField(text: string, field: string): string | null {
  const regex = new RegExp(`${field}[:\\s]*([^\\n]+)`, "i")
  const match = text.match(regex)
  return match ? match[1].trim() : null
}

function extractList(text: string, field: string): string[] {
  const regex = new RegExp(`${field}[:\\s]*([^\\n]+(?:\\n[^\\n]+)*)`, "i")
  const match = text.match(regex)
  if (!match) return []

  return match[1]
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function extractCompetitors(text: string): any[] {
  // This would need more sophisticated parsing based on the actual response format
  // For now, return a basic structure
  return [
    {
      name: "Competitor 1",
      market_share: "Market share not available",
      strengths: ["Strength 1", "Strength 2"],
      weaknesses: ["Weakness 1", "Weakness 2"],
      key_products: ["Product 1", "Product 2"],
      competitive_advantage: "Advantage not specified",
      threat_level: "Medium",
    },
  ]
}

function getSampleCompanyData(companyName: string): CompanyIntel {
  const normalizedName = companyName.toLowerCase().trim()

  if (normalizedName === "apple" || normalizedName === "apple inc" || normalizedName === "apple inc.") {
    return {
      companyName: "Apple Inc.",
      location: "Cupertino, California, USA",
      oneLiner:
        "Technology company that designs, develops, and sells consumer electronics, computer software, and online services",
      positionTitle: "Global Technology Leader",
      industry: "Technology/Consumer Electronics",
      numberOfEmployees: "164,000+",
      funding: "Public Company (NASDAQ: AAPL)",
      valuation: "$3.0 Trillion",
      chairmanCEO: "Tim Cook",
      leadership: [
        "Tim Cook (CEO)",
        "Luca Maestri (CFO)",
        "Katherine Adams (General Counsel)",
        "Craig Federighi (SVP Software Engineering)",
        "Johnny Srouji (SVP Hardware Technologies)",
      ],
      latestDeals: [
        "Vision Pro Launch Partnership with Disney",
        "AI Partnership Discussions with OpenAI",
        "Services Expansion in India",
        "Carbon Neutral Supply Chain Initiatives",
      ],
      investors: [
        "Berkshire Hathaway",
        "Vanguard Group",
        "BlackRock",
        "State Street Corporation",
        "Public Shareholders",
      ],
      companyOfferings: ["iPhone", "iPad", "Mac", "Apple Watch", "AirPods", "Apple TV", "Apple Services"],
      visionMission:
        "To bring the best user experience to customers through innovative hardware, software, and services that enrich people's lives",
      values: [
        "Accessibility for All",
        "Privacy as a Fundamental Right",
        "Environmental Responsibility",
        "Inclusion and Diversity",
        "Education and Learning",
      ],
      brandsServices: [
        "iPhone",
        "iPad",
        "Mac",
        "Apple Watch",
        "AirPods",
        "Apple TV+",
        "iCloud",
        "App Store",
        "Apple Music",
        "Apple Pay",
      ],
      productServiceCategories: [
        "Smartphones",
        "Tablets",
        "Personal Computers",
        "Wearables",
        "Audio Devices",
        "Streaming Services",
        "Cloud Services",
        "Digital Payments",
      ],
      newProducts: [
        "Vision Pro (Mixed Reality Headset)",
        "M3 Pro and M3 Max Chips",
        "iPhone 15 Series with USB-C",
        "Apple Watch Series 9",
        "Updated AirPods Pro",
      ],
      futurePriorities: [
        "AI Integration Across Products",
        "Augmented Reality and Virtual Reality",
        "Health Technology Innovation",
        "Autonomous Vehicle Technology",
        "Carbon Neutral by 2030",
        "Expanding Services Revenue",
      ],
      numberOfCustomers: "1.8+ billion active devices worldwide",
      geographiesOfPresence: [
        "Americas",
        "Europe",
        "Greater China",
        "Japan",
        "Rest of Asia Pacific",
        "India (Growing Market)",
        "Middle East and Africa",
      ],
      competitors: ["Samsung", "Google", "Microsoft", "Meta", "Amazon", "Huawei", "Xiaomi", "Sony"],
      revenue: "$383.3 billion (FY 2023)",
      margin: "25.3% gross margin",
      povOnCompany:
        "Apple maintains its position as the world's most valuable company through premium product positioning, ecosystem integration, and strong brand loyalty. The company successfully balances innovation with profitability while expanding into services and new product categories.",
      uniqueCharacteristics: [
        "Seamless Ecosystem Integration",
        "Premium Brand Positioning",
        "Design Excellence and Innovation",
        "Privacy-First Approach",
        "Vertical Integration Strategy",
        "Strong Retail Presence",
      ],
      strengths: [
        "Unmatched Brand Loyalty",
        "Strong Financial Performance",
        "Innovation Leadership",
        "Ecosystem Lock-in Effect",
        "Premium Pricing Power",
        "Global Supply Chain Mastery",
      ],
      weaknesses: [
        "High Product Prices",
        "Dependence on iPhone Revenue",
        "Closed Ecosystem Limitations",
        "China Market Vulnerability",
        "Limited Customization Options",
      ],
      metrics: [
        "Market Cap: $3.0 Trillion",
        "P/E Ratio: 29.2",
        "Revenue Growth: 3% YoY",
        "Services Revenue: $85.2B",
        "iPhone Revenue: 52% of total",
        "Cash on Hand: $162.1B",
      ],
      opportunities: [
        "AI Integration and Machine Learning",
        "Emerging Markets Expansion",
        "Health Technology Growth",
        "AR/VR Market Leadership",
        "Services Revenue Expansion",
        "Autonomous Vehicle Market",
      ],
      threats: [
        "Regulatory Pressure and Antitrust",
        "China-US Trade Relations",
        "Intense Competition in Key Markets",
        "Economic Downturn Impact",
        "Supply Chain Disruptions",
        "Privacy Regulation Changes",
      ],
      insights: [
        "Services business growing faster than hardware, providing recurring revenue",
        "Vision Pro represents Apple's bet on the next computing platform",
        "AI strategy focuses on on-device processing for privacy",
        "India becoming increasingly important growth market",
        "Carbon neutral supply chain initiative ahead of schedule",
      ],
      productsServicesLiked: [
        "iPhone Camera System and Computational Photography",
        "Apple Watch Health and Fitness Features",
        "AirPods Pro Noise Cancellation",
        "M-Series Chip Performance",
        "App Store Ecosystem",
        "iMessage and FaceTime Integration",
      ],
      productsServicesToImprove: [
        "Siri AI Assistant Capabilities",
        "Apple Maps Accuracy and Features",
        "Battery Life Across Product Line",
        "Pricing Accessibility in Emerging Markets",
        "Gaming Performance and Library",
        "Cross-Platform Compatibility",
      ],
    }
  }

  // Default fallback for unknown companies
  return {
    companyName,
    location: "Location data not available",
    oneLiner: `${companyName} is a company in the business sector`,
    positionTitle: "N/A",
    industry: "Industry data not available",
    numberOfEmployees: "Employee count not available",
    funding: "Funding information not available",
    valuation: "Valuation not available",
    chairmanCEO: "Leadership information not available",
    leadership: [],
    latestDeals: [],
    investors: [],
    companyOfferings: [],
    visionMission: "Mission and vision information not available",
    values: [],
    brandsServices: [],
    productServiceCategories: [],
    newProducts: [],
    futurePriorities: [],
    numberOfCustomers: "Customer data not available",
    geographiesOfPresence: [],
    competitors: [],
    revenue: "Revenue data not available",
    margin: "Margin data not available",
    povOnCompany: "Analysis not available for this company",
    uniqueCharacteristics: [],
    strengths: [],
    weaknesses: [],
    metrics: [],
    opportunities: [],
    threats: [],
    insights: [],
    productsServicesLiked: [],
    productsServicesToImprove: [],
  }
}

function getSampleCompetitiveData(companyName: string): any {
  const normalizedName = companyName.toLowerCase().trim()

  if (normalizedName === "apple" || normalizedName === "apple inc" || normalizedName === "apple inc.") {
    return {
      main_company: "Apple Inc.",
      competitors: [
        {
          name: "Samsung",
          market_share: "22% global smartphone market",
          strengths: ["Manufacturing Scale", "Display Technology", "Android Partnership", "Global Reach"],
          weaknesses: ["Brand Fragmentation", "Software Ecosystem", "Premium Positioning"],
          key_products: ["Galaxy Series", "Galaxy Watch", "Galaxy Buds", "Tablets"],
          competitive_advantage: "Leading display technology and manufacturing capabilities",
          threat_level: "High",
        },
        {
          name: "Google",
          market_share: "3% smartphone market, dominant in services",
          strengths: ["AI and Software", "Search Integration", "Cloud Services", "Android OS"],
          weaknesses: ["Hardware Market Share", "Consumer Trust", "Hardware Quality"],
          key_products: ["Pixel Phones", "Nest Devices", "Chromebooks", "Google Services"],
          competitive_advantage: "AI integration and software services",
          threat_level: "High",
        },
        {
          name: "Microsoft",
          market_share: "Dominant in productivity software",
          strengths: ["Enterprise Focus", "Cloud Services", "Productivity Suite", "Gaming"],
          weaknesses: ["Mobile Presence", "Consumer Hardware", "Brand Appeal"],
          key_products: ["Surface Devices", "Xbox", "Office 365", "Azure"],
          competitive_advantage: "Enterprise software and cloud services",
          threat_level: "Medium",
        },
      ],
      market_analysis: {
        market_size: "$1.4 trillion global technology market",
        growth_rate: "5-7% annually",
        key_trends: ["AI Integration", "5G Adoption", "Sustainability Focus", "Privacy Concerns"],
        barriers_to_entry: ["High R&D Costs", "Supply Chain Complexity", "Brand Recognition", "Ecosystem Lock-in"],
      },
      competitive_positioning: {
        market_leader: "Apple",
        market_challengers: ["Samsung", "Google"],
        market_followers: ["Microsoft", "Huawei"],
        niche_players: ["OnePlus", "Nothing", "Fairphone"],
      },
      swot_comparison: {
        Apple: {
          strengths: ["Brand Loyalty", "Ecosystem Integration", "Premium Positioning", "Innovation"],
          weaknesses: ["High Prices", "Closed Ecosystem", "China Dependence"],
          opportunities: ["AI Integration", "Health Tech", "Emerging Markets"],
          threats: ["Regulatory Pressure", "Competition", "Economic Downturn"],
        },
      },
      recommendations: [
        "Accelerate AI integration across all products to maintain competitive edge",
        "Expand affordable product lines for emerging markets",
        "Strengthen supply chain diversification beyond China",
        "Invest in health technology as a key differentiator",
        "Enhance services revenue to reduce hardware dependence",
      ],
    }
  }

  // Default competitive analysis
  return {
    main_company: companyName,
    competitors: [
      {
        name: "Competitor A",
        market_share: "Market share data not available",
        strengths: ["Strength 1", "Strength 2"],
        weaknesses: ["Weakness 1", "Weakness 2"],
        key_products: ["Product 1", "Product 2"],
        competitive_advantage: "Competitive advantage not available",
        threat_level: "Medium",
      },
    ],
    market_analysis: {
      market_size: "Market size data not available",
      growth_rate: "Growth rate not available",
      key_trends: ["Trend 1", "Trend 2"],
      barriers_to_entry: ["Barrier 1", "Barrier 2"],
    },
    competitive_positioning: {
      market_leader: "Leader not identified",
      market_challengers: ["Challenger 1"],
      market_followers: ["Follower 1"],
      niche_players: ["Niche Player 1"],
    },
    swot_comparison: {
      [companyName]: {
        strengths: ["Strength 1", "Strength 2"],
        weaknesses: ["Weakness 1", "Weakness 2"],
        opportunities: ["Opportunity 1", "Opportunity 2"],
        threats: ["Threat 1", "Threat 2"],
      },
    },
    recommendations: ["Recommendation 1", "Recommendation 2"],
  }
}
