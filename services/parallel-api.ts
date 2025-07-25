import type { CompanyIntel } from "../types/company"
import { fetchCompanyIntelFromOpenAI, fetchCompetitiveAnalysisFromOpenAI } from "./openai-fallback"

const PARALLEL_API_KEY = process.env.PARALLEL_API_KEY || ""
const PARALLEL_API_URL = "https://api.parallel.ai/v1/tasks/runs"

export async function fetchCompanyIntel(companyName: string): Promise<CompanyIntel> {
  // NEW PRIORITY ORDER: Parallel.ai → OpenAI → Sample Data

  // Try Parallel.ai first (PRIMARY)
  try {
    if (PARALLEL_API_KEY) {
      console.log("Trying Parallel.ai API (PRIMARY)...")
      return await fetchCompanyIntelFromParallelAI(companyName)
    }
  } catch (error) {
    console.log("Parallel.ai failed, trying OpenAI fallback:", error)
  }

  // Try OpenAI second (FALLBACK)
  try {
    if (process.env.OPENAI_API_KEY) {
      console.log("Trying OpenAI API (FALLBACK)...")
      return await fetchCompanyIntelFromOpenAI(companyName)
    }
  } catch (error) {
    console.log("OpenAI fallback failed, using sample data:", error)
  }

  // Final fallback to sample data
  console.log("All APIs failed, using sample data")
  return getSampleCompanyData(companyName)
}

export async function fetchCompetitiveAnalysis(companyName: string): Promise<any> {
  // NEW PRIORITY ORDER: Parallel.ai → OpenAI → Sample Data

  // Try Parallel.ai first (PRIMARY)
  try {
    if (PARALLEL_API_KEY) {
      console.log("Trying Parallel.ai competitive analysis (PRIMARY)...")
      return await fetchCompetitiveAnalysisFromParallelAI(companyName)
    }
  } catch (error) {
    console.log("Parallel.ai competitive analysis failed, trying OpenAI fallback:", error)
  }

  // Try OpenAI second (FALLBACK)
  try {
    if (process.env.OPENAI_API_KEY) {
      console.log("Trying OpenAI competitive analysis (FALLBACK)...")
      return await fetchCompetitiveAnalysisFromOpenAI(companyName)
    }
  } catch (error) {
    console.log("OpenAI competitive analysis fallback failed, using sample data:", error)
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
        valuation: { type: "string" },
        funding: { type: "string" },
        founded: { type: "string" },
        competitors: { type: "array", items: { type: "string" } },
        products: { type: "array", items: { type: "string" } },
        recent_news: { type: "array", items: { type: "string" } },
        strengths: { type: "array", items: { type: "string" } },
        weaknesses: { type: "array", items: { type: "string" } },
        opportunities: { type: "array", items: { type: "string" } },
        threats: { type: "array", items: { type: "string" } },
        leadership: { type: "array", items: { type: "string" } },
        investors: { type: "array", items: { type: "string" } },
        vision_mission: { type: "string" },
        values: { type: "array", items: { type: "string" } },
        market_cap: { type: "string" },
        headquarters: { type: "string" },
      },
    },
    input: `Extract comprehensive company intelligence for ${companyName}. Provide detailed, accurate, and current information including:

BASIC COMPANY INFORMATION:
- Company name, location, and headquarters
- Industry classification and business description
- Number of employees and company size
- Founded date and company history

FINANCIAL DATA:
- Current revenue and financial performance
- Market capitalization and valuation
- Funding history and investment rounds
- Profit margins and financial health

LEADERSHIP & GOVERNANCE:
- CEO and chairman information
- Key leadership team members and executives
- Board of directors and governance structure
- Recent leadership changes

BUSINESS OPERATIONS:
- Main products and services offered
- Key business segments and revenue streams
- Recent product launches and innovations
- Company vision, mission, and core values

MARKET POSITION:
- Main competitors and competitive landscape
- Market share and positioning
- Geographic presence and markets served
- Customer base and target markets

STRATEGIC ANALYSIS:
- Company strengths and competitive advantages
- Weaknesses and operational challenges
- Market opportunities for growth
- Potential threats and risks
- Recent news and developments
- Key investors and stakeholders

Please provide accurate, up-to-date information from reliable sources and structure the response clearly.`,
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

  // Process the structured response from Parallel.ai
  return processParallelAIResult(taskResult, companyName)
}

async function fetchCompetitiveAnalysisFromParallelAI(companyName: string): Promise<any> {
  const taskSpec = {
    output_schema: {
      type: "object",
      properties: {
        main_company: { type: "string" },
        market_analysis: {
          type: "object",
          properties: {
            market_size: { type: "string" },
            growth_rate: { type: "string" },
            key_trends: { type: "array", items: { type: "string" } },
            barriers_to_entry: { type: "array", items: { type: "string" } },
          },
        },
        competitors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              market_share: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              key_products: { type: "array", items: { type: "string" } },
              competitive_advantage: { type: "string" },
              threat_level: { type: "string" },
            },
          },
        },
        competitive_positioning: {
          type: "object",
          properties: {
            market_leader: { type: "string" },
            market_challengers: { type: "array", items: { type: "string" } },
            market_followers: { type: "array", items: { type: "string" } },
            niche_players: { type: "array", items: { type: "string" } },
          },
        },
        swot_analysis: {
          type: "object",
          properties: {
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            threats: { type: "array", items: { type: "string" } },
          },
        },
        recommendations: { type: "array", items: { type: "string" } },
      },
    },
    input: `Provide comprehensive competitive analysis for ${companyName}. Include detailed information about:

MARKET ANALYSIS:
- Total addressable market size and value
- Market growth rate and projections
- Key industry trends and developments
- Barriers to entry and market dynamics

COMPETITOR IDENTIFICATION & ANALYSIS:
- Top 5-7 main competitors with market share data
- Detailed strengths and weaknesses of each competitor
- Key products and services offered by competitors
- Competitive advantages and differentiation strategies
- Threat level assessment (High/Medium/Low) for each competitor

COMPETITIVE POSITIONING:
- Market leaders, challengers, followers, and niche players
- Where ${companyName} fits in the competitive landscape
- Market positioning and differentiation strategies

SWOT ANALYSIS for ${companyName}:
- Key strengths and competitive advantages
- Weaknesses and areas for improvement
- Market opportunities for growth and expansion
- Potential threats and competitive risks

STRATEGIC RECOMMENDATIONS:
- Actionable recommendations for competitive advantage
- Strategic initiatives to strengthen market position
- Areas for investment and development

Please provide current, accurate data from reliable sources and structure the analysis clearly.`,
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
  return processCompetitiveAnalysisResult(taskResult, companyName)
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

function processParallelAIResult(result: any, companyName: string): CompanyIntel {
  // Process structured JSON response from Parallel.ai
  return {
    companyName: result.company_name || companyName,
    location: result.location || result.headquarters || "N/A",
    oneLiner: result.description || "N/A",
    positionTitle: "Market Position", // Can be enhanced based on result
    industry: result.industry || "N/A",
    numberOfEmployees: result.employees || "N/A",
    funding: result.funding || "N/A",
    valuation: result.valuation || result.market_cap || "N/A",
    chairmanCEO: result.ceo || "N/A",
    leadership: result.leadership || [],
    latestDeals: result.recent_news || [],
    investors: result.investors || [],
    companyOfferings: result.products || [],
    visionMission: result.vision_mission || "N/A",
    values: result.values || [],
    brandsServices: result.products || [],
    productServiceCategories: result.products || [],
    newProducts: [],
    futurePriorities: [],
    numberOfCustomers: "N/A",
    geographiesOfPresence: [],
    competitors: result.competitors || [],
    revenue: result.revenue || "N/A",
    margin: "N/A",
    povOnCompany: result.description || "N/A",
    uniqueCharacteristics: [],
    strengths: result.strengths || [],
    weaknesses: result.weaknesses || [],
    metrics: [],
    opportunities: result.opportunities || [],
    threats: result.threats || [],
    insights: result.recent_news || [],
    productsServicesLiked: [],
    productsServicesToImprove: [],
  }
}

function processCompetitiveAnalysisResult(result: any, companyName: string): any {
  // Process structured JSON response from Parallel.ai
  return {
    main_company: result.main_company || companyName,
    competitors: result.competitors || [],
    market_analysis: result.market_analysis || {
      market_size: "N/A",
      growth_rate: "N/A",
      key_trends: [],
      barriers_to_entry: [],
    },
    competitive_positioning: result.competitive_positioning || {
      market_leader: "N/A",
      market_challengers: [],
      market_followers: [],
      niche_players: [],
    },
    swot_comparison: {
      [companyName]: result.swot_analysis || {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      },
    },
    recommendations: result.recommendations || [],
  }
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
