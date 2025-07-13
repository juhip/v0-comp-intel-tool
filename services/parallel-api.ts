interface CompanyData {
  company_name: string
  location: string
  one_liner: string
  position_title: string
  industry: string
  number_of_employees: string
  funding: string
  valuation: string
  chairman_ceo: string
  leadership: string[]
  latest_deals: string[]
  investors: string[]
  company_offerings: string[]
  vision_mission: string
  values: string[]
  brands_services: string[]
  product_categories: string[]
  new_products: string[]
  future_priorities: string[]
  number_of_customers: string
  geographies: string[]
  competitors: string[]
  revenue: string
  margin: string
  pov_on_company: string
  unique_characteristics: string[]
  strengths: string[]
  weaknesses: string[]
  metrics: string[]
  opportunities: string[]
  threats: string[]
  products_like: string[]
  products_improve: string[]
  competitive_analysis?: CompetitiveAnalysis
}

interface CompetitorData {
  company_name: string
  one_liner: string
  funding: string
  investors: string[]
  positioning: string
  product_differentiation: string[]
  customers: string
  pricing: string
}

interface CompetitiveAnalysis {
  target_company: string
  competitors: CompetitorData[]
}

// Sample data for fallback
const getSampleData = (companyName: string): CompanyData => {
  const sampleCompanies: Record<string, CompanyData> = {
    Apple: {
      company_name: "Apple Inc.",
      location: "Cupertino, California, USA",
      one_liner:
        "Technology company that designs, develops, and sells consumer electronics, computer software, and online services",
      position_title: "Global leader in consumer technology and innovation",
      industry: "Consumer Electronics & Technology",
      number_of_employees: "164,000+",
      funding: "Public company (NASDAQ: AAPL)",
      valuation: "$3+ trillion market cap",
      chairman_ceo: "Tim Cook",
      leadership: [
        "Tim Cook (CEO)",
        "Luca Maestri (CFO)",
        "Katherine Adams (General Counsel)",
        "Deirdre O'Brien (SVP People & Retail)",
      ],
      latest_deals: ["Vision Pro launch", "Apple Intelligence AI integration", "Services expansion"],
      investors: ["Public shareholders", "Institutional investors", "Berkshire Hathaway"],
      company_offerings: ["iPhone", "iPad", "Mac", "Apple Watch", "AirPods", "Apple TV", "Services"],
      vision_mission:
        "To bring the best user experience to customers through innovative hardware, software, and services",
      values: ["Accessibility", "Privacy", "Environment", "Inclusion & Diversity", "Supplier Responsibility"],
      brands_services: ["iPhone", "iPad", "Mac", "Apple Watch", "AirPods", "Apple TV+", "iCloud", "App Store"],
      product_categories: ["Smartphones", "Tablets", "Computers", "Wearables", "Audio", "Services"],
      new_products: ["Vision Pro", "Apple Intelligence", "M3 chips", "iPhone 15 series"],
      future_priorities: ["AI integration", "AR/VR expansion", "Services growth", "Sustainability"],
      number_of_customers: "2+ billion active devices worldwide",
      geographies: ["Americas", "Europe", "Greater China", "Japan", "Rest of Asia Pacific"],
      competitors: ["Samsung", "Google", "Microsoft", "Amazon", "Meta"],
      revenue: "$383 billion (2023)",
      margin: "~25% gross margin",
      pov_on_company: "Market leader with strong ecosystem and premium positioning",
      unique_characteristics: ["Ecosystem integration", "Premium design", "Privacy focus", "Retail experience"],
      strengths: ["Brand loyalty", "Ecosystem lock-in", "Innovation", "Financial strength"],
      weaknesses: ["High prices", "Closed ecosystem", "China dependency"],
      metrics: ["Revenue growth", "Services revenue", "Active installed base", "Customer satisfaction"],
      opportunities: ["AI integration", "Emerging markets", "Health technology", "Autonomous vehicles"],
      threats: ["Regulatory pressure", "Competition", "Supply chain risks", "Economic downturn"],
      products_like: ["iPhone", "AirPods", "Apple Watch", "MacBook"],
      products_improve: ["Siri", "Apple Maps", "Battery life", "Pricing accessibility"],
      competitive_analysis: {
        target_company: "Apple Inc.",
        competitors: [
          {
            company_name: "Samsung",
            one_liner: "South Korean multinational conglomerate focused on electronics and technology",
            funding: "Public company with $200B+ revenue",
            investors: ["Lee family", "Public shareholders", "Institutional investors"],
            positioning: "Global technology leader with diverse product portfolio",
            product_differentiation: ["OLED displays", "Memory chips", "Android ecosystem", "Foldable phones"],
            customers: "Global consumers and B2B clients across all segments",
            pricing: "Premium to budget across all categories",
          },
          {
            company_name: "Google",
            one_liner: "Technology company specializing in Internet-related services and products",
            funding: "Public company (NASDAQ: GOOGL) with $280B+ revenue",
            investors: ["Alphabet Inc.", "Public shareholders", "Institutional investors"],
            positioning: "AI-first company with dominant search and advertising platform",
            product_differentiation: ["AI/ML capabilities", "Search dominance", "Android OS", "Cloud services"],
            customers: "Billions of users worldwide, advertisers, enterprise clients",
            pricing: "Freemium model with premium enterprise services",
          },
          {
            company_name: "Microsoft",
            one_liner: "Technology corporation developing computer software, consumer electronics, and services",
            funding: "Public company (NASDAQ: MSFT) with $200B+ revenue",
            investors: ["Public shareholders", "Institutional investors", "Bill Gates Foundation"],
            positioning: "Productivity and cloud platform leader with AI integration",
            product_differentiation: ["Office suite", "Azure cloud", "Windows OS", "AI integration"],
            customers: "Enterprise clients, consumers, developers, government",
            pricing: "Subscription-based with enterprise licensing",
          },
          {
            company_name: "Amazon",
            one_liner: "E-commerce and cloud computing company with diverse technology services",
            funding: "Public company (NASDAQ: AMZN) with $500B+ revenue",
            investors: ["Jeff Bezos", "Public shareholders", "Institutional investors"],
            positioning: "E-commerce leader expanding into cloud, AI, and logistics",
            product_differentiation: ["AWS cloud", "Prime ecosystem", "Alexa AI", "Logistics network"],
            customers: "Global consumers, businesses, developers, government",
            pricing: "Competitive pricing with Prime membership model",
          },
          {
            company_name: "Meta",
            one_liner: "Social technology company building platforms for human connection",
            funding: "Public company (NASDAQ: META) with $130B+ revenue",
            investors: ["Mark Zuckerberg", "Public shareholders", "Institutional investors"],
            positioning: "Social media leader pivoting to metaverse and AI",
            product_differentiation: ["Social platforms", "VR/AR technology", "AI algorithms", "Advertising platform"],
            customers: "3+ billion users worldwide, advertisers, developers",
            pricing: "Free platforms with advertising revenue model",
          },
        ],
      },
    },
    Tesla: {
      company_name: "Tesla, Inc.",
      location: "Austin, Texas, USA",
      one_liner: "Electric vehicle and clean energy company accelerating the world's transition to sustainable energy",
      position_title: "Leading electric vehicle manufacturer and energy storage company",
      industry: "Automotive & Clean Energy",
      number_of_employees: "140,000+",
      funding: "Public company (NASDAQ: TSLA)",
      valuation: "$800+ billion market cap",
      chairman_ceo: "Elon Musk",
      leadership: [
        "Elon Musk (CEO)",
        "Zachary Kirkhorn (CFO)",
        "Drew Baglino (SVP Powertrain & Energy)",
        "Lars Moravy (VP Vehicle Engineering)",
      ],
      latest_deals: ["Gigafactory expansion", "Supercharger network opening", "FSD Beta rollout"],
      investors: ["Public shareholders", "Elon Musk", "Institutional investors"],
      company_offerings: ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck", "Solar panels", "Energy storage"],
      vision_mission: "To accelerate the world's transition to sustainable energy",
      values: ["Sustainability", "Innovation", "Efficiency", "Safety", "Accessibility"],
      brands_services: ["Tesla vehicles", "Supercharger", "Tesla Energy", "Full Self-Driving", "Tesla Insurance"],
      product_categories: ["Electric vehicles", "Energy storage", "Solar energy", "Charging infrastructure"],
      new_products: ["Cybertruck", "Semi", "Roadster 2.0", "4680 battery cells"],
      future_priorities: ["Full self-driving", "Manufacturing scale", "Energy business", "Robotaxi network"],
      number_of_customers: "4+ million vehicles delivered",
      geographies: ["North America", "Europe", "China", "Asia-Pacific"],
      competitors: ["BYD", "Volkswagen", "GM", "Ford", "Rivian"],
      revenue: "$96 billion (2023)",
      margin: "~20% automotive gross margin",
      pov_on_company: "EV pioneer with strong technology and brand, facing increased competition",
      unique_characteristics: ["Vertical integration", "Over-the-air updates", "Supercharger network", "Direct sales"],
      strengths: ["Technology leadership", "Brand strength", "Manufacturing efficiency", "Charging network"],
      weaknesses: ["Quality issues", "Limited model range", "Dependence on Elon Musk"],
      metrics: ["Vehicle deliveries", "Production capacity", "Supercharger deployment", "FSD adoption"],
      opportunities: ["Global EV adoption", "Energy storage market", "Autonomous driving", "Emerging markets"],
      threats: ["Increased competition", "Regulatory changes", "Supply chain issues", "Economic downturn"],
      products_like: ["Model Y", "Supercharger network", "Over-the-air updates"],
      products_improve: ["Build quality", "Service experience", "Model availability"],
      competitive_analysis: {
        target_company: "Tesla, Inc.",
        competitors: [
          {
            company_name: "BYD",
            one_liner: "Chinese multinational conglomerate specializing in electric vehicles and batteries",
            funding: "Public company with $70B+ revenue",
            investors: ["Warren Buffett/Berkshire Hathaway", "Chinese government", "Public shareholders"],
            positioning: "World's largest EV manufacturer by volume with vertical battery integration",
            product_differentiation: [
              "Blade battery technology",
              "Affordable pricing",
              "Diverse EV lineup",
              "Bus and commercial vehicles",
            ],
            customers: "Global consumers with focus on China and emerging markets",
            pricing: "Competitive pricing across budget to premium segments",
          },
          {
            company_name: "Volkswagen Group",
            one_liner: "German multinational automotive manufacturing company",
            funding: "Public company with $300B+ revenue",
            investors: ["Porsche SE", "Qatar", "Public shareholders"],
            positioning: "Traditional automaker transitioning to electric with multiple brands",
            product_differentiation: [
              "Multi-brand portfolio",
              "MEB platform",
              "European market strength",
              "Premium positioning",
            ],
            customers: "Global consumers across all segments through multiple brands",
            pricing: "Premium pricing with mass market options",
          },
          {
            company_name: "General Motors",
            one_liner: "American multinational automotive manufacturing corporation",
            funding: "Public company (NYSE: GM) with $170B+ revenue",
            investors: ["Public shareholders", "US government (historically)", "Institutional investors"],
            positioning: "Traditional automaker investing heavily in electric transition",
            product_differentiation: [
              "Ultium platform",
              "Cruise autonomous",
              "OnStar services",
              "Diverse brand portfolio",
            ],
            customers: "North American consumers with global presence",
            pricing: "Mass market to luxury across brand portfolio",
          },
          {
            company_name: "Ford Motor Company",
            one_liner: "American multinational automobile manufacturer",
            funding: "Public company (NYSE: F) with $170B+ revenue",
            investors: ["Ford family", "Public shareholders", "Institutional investors"],
            positioning: "Traditional automaker with strong truck heritage transitioning to electric",
            product_differentiation: [
              "F-150 Lightning",
              "Commercial vehicle focus",
              "Ford Pro services",
              "American heritage",
            ],
            customers: "American consumers and commercial fleets",
            pricing: "Competitive mass market pricing",
          },
          {
            company_name: "Rivian",
            one_liner: "American electric vehicle manufacturer focused on trucks and delivery vans",
            funding: "Public company (NASDAQ: RIVN) backed by Amazon",
            investors: ["Amazon", "Ford", "Public shareholders", "T. Rowe Price"],
            positioning: "Electric truck and commercial vehicle specialist",
            product_differentiation: [
              "Adventure-focused trucks",
              "Amazon partnership",
              "Tank turn capability",
              "Outdoor lifestyle branding",
            ],
            customers: "Outdoor enthusiasts and Amazon delivery network",
            pricing: "Premium pricing for adventure and commercial segments",
          },
        ],
      },
    },
  }

  return (
    sampleCompanies[companyName] || {
      company_name: companyName,
      location: "Information not available",
      one_liner: `${companyName} - Company analysis in progress`,
      position_title: "Market position analysis pending",
      industry: "Industry classification pending",
      number_of_employees: "Employee count not available",
      funding: "Funding information not available",
      valuation: "Valuation not available",
      chairman_ceo: "Leadership information pending",
      leadership: ["Leadership analysis in progress"],
      latest_deals: ["Recent activity analysis pending"],
      investors: ["Investor information not available"],
      company_offerings: ["Product/service analysis pending"],
      vision_mission: "Mission and vision analysis in progress",
      values: ["Company values analysis pending"],
      brands_services: ["Brand portfolio analysis pending"],
      product_categories: ["Product categorization pending"],
      new_products: ["New product analysis pending"],
      future_priorities: ["Strategic priorities analysis pending"],
      number_of_customers: "Customer base analysis pending",
      geographies: ["Geographic presence analysis pending"],
      competitors: ["Competitive landscape analysis pending"],
      revenue: "Financial analysis pending",
      margin: "Profitability analysis pending",
      pov_on_company: "Market perspective analysis in progress",
      unique_characteristics: ["Differentiation analysis pending"],
      strengths: ["Strength analysis pending"],
      weaknesses: ["Weakness analysis pending"],
      metrics: ["KPI analysis pending"],
      opportunities: ["Opportunity analysis pending"],
      threats: ["Threat analysis pending"],
      products_like: ["Product sentiment analysis pending"],
      products_improve: ["Improvement area analysis pending"],
      competitive_analysis: {
        target_company: companyName,
        competitors: [],
      },
    }
  )
}

async function callParallelAPI(taskPayload: any): Promise<any> {
  const apiKey = process.env.PARALLEL_API_KEY

  if (!apiKey) {
    throw new Error("Parallel API key not configured")
  }

  try {
    console.log("🔄 Calling Parallel API with task:", taskPayload.task_description)

    const response = await fetch("https://api.parallel.ai/v1/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Parallel API error:", response.status, errorText)
      throw new Error(`Parallel API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("✅ Parallel API response received")
    return result
  } catch (error) {
    console.error("❌ Parallel API call failed:", error)
    throw error
  }
}

async function callOpenAIAPI(companyName: string): Promise<CompanyData> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  try {
    console.log("🔄 Calling OpenAI API for company:", companyName)

    const prompt = `Provide a comprehensive business intelligence analysis for ${companyName}. Include company overview, financial information, competitive analysis, and strategic insights. Format the response as a detailed JSON object with the following structure:

{
  "company_name": "string",
  "location": "string",
  "one_liner": "string",
  "position_title": "string",
  "industry": "string",
  "number_of_employees": "string",
  "funding": "string",
  "valuation": "string",
  "chairman_ceo": "string",
  "leadership": ["array of leadership team"],
  "latest_deals": ["recent deals and partnerships"],
  "investors": ["key investors"],
  "company_offerings": ["main products/services"],
  "vision_mission": "string",
  "values": ["company values"],
  "brands_services": ["brand portfolio"],
  "product_categories": ["product categories"],
  "new_products": ["recent launches"],
  "future_priorities": ["strategic priorities"],
  "number_of_customers": "string",
  "geographies": ["markets served"],
  "competitors": ["main competitors"],
  "revenue": "string",
  "margin": "string",
  "pov_on_company": "string",
  "unique_characteristics": ["differentiators"],
  "strengths": ["company strengths"],
  "weaknesses": ["areas for improvement"],
  "metrics": ["key metrics"],
  "opportunities": ["market opportunities"],
  "threats": ["potential threats"],
  "products_like": ["well-regarded products"],
  "products_improve": ["products needing improvement"],
  "competitive_analysis": {
    "target_company": "string",
    "competitors": [
      {
        "company_name": "string",
        "one_liner": "string",
        "funding": "string",
        "investors": ["array"],
        "positioning": "string",
        "product_differentiation": ["array"],
        "customers": "string",
        "pricing": "string"
      }
    ]
  }
}`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a business intelligence analyst. Provide comprehensive, accurate company analysis in the requested JSON format.",
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
      const errorText = await response.text()
      console.error("❌ OpenAI API error:", response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    const content = result.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content received from OpenAI")
    }

    try {
      const parsedData = JSON.parse(content)
      console.log("✅ OpenAI API response parsed successfully")
      return parsedData
    } catch (parseError) {
      console.error("❌ Failed to parse OpenAI response:", parseError)
      throw new Error("Failed to parse OpenAI response")
    }
  } catch (error) {
    console.error("❌ OpenAI API call failed:", error)
    throw error
  }
}

export async function fetchCompanyIntel(companyName: string): Promise<CompanyData> {
  console.log(`🔍 Starting analysis for: ${companyName}`)

  // Try Parallel API first
  try {
    const companyTaskPayload = {
      task_description: `Comprehensive company intelligence analysis for ${companyName}`,
      research_query: `Conduct a comprehensive business intelligence analysis of ${companyName}. Gather detailed information about the company's business model, leadership, financials, competitive position, and strategic outlook. Focus on publicly available information from official sources, news articles, financial reports, and industry analyses.`,
      structured_outputs: {
        company_name: "string",
        location: "string (headquarters location)",
        one_liner: "string (brief company description)",
        position_title: "string (market position/category leader)",
        industry: "string",
        number_of_employees: "string",
        funding: "string (total funding raised)",
        valuation: "string (latest valuation)",
        chairman_ceo: "string (current CEO/Chairman name)",
        leadership: ["array of key leadership team members"],
        latest_deals: ["array of recent acquisitions, partnerships, or major deals"],
        investors: ["array of key investors and VCs"],
        company_offerings: ["array of main products/services"],
        vision_mission: "string (company vision and mission statement)",
        values: ["array of company core values"],
        brands_services: ["array of brand names and service offerings"],
        product_categories: ["array of product/service categories"],
        new_products: ["array of recently launched products/services"],
        future_priorities: ["array of strategic priorities and future plans"],
        number_of_customers: "string (customer base size)",
        geographies: ["array of geographic markets served"],
        competitors: ["array of main competitors"],
        revenue: "string (latest annual revenue)",
        margin: "string (profit margin information)",
        pov_on_company: "string (market perspective and analyst view)",
        unique_characteristics: ["array of unique differentiators"],
        strengths: ["array of company strengths"],
        weaknesses: ["array of company weaknesses"],
        metrics: ["array of key performance metrics"],
        opportunities: ["array of market opportunities"],
        threats: ["array of potential threats"],
        products_like: ["array of well-regarded products/services"],
        products_improve: ["array of products/services needing improvement"],
      },
      research_sources: [
        "Company official website and investor relations",
        "SEC filings and financial reports",
        "Recent news articles and press releases",
        "Industry analyst reports",
        "LinkedIn company page and leadership profiles",
        "Crunchbase and funding databases",
        "Customer reviews and testimonials",
        "Competitor analysis reports",
      ],
    }

    const competitiveTaskPayload = {
      task_description: `Competitive intelligence analysis for ${companyName} and its main competitors`,
      research_query: `Identify the top 5-7 direct competitors of ${companyName} and analyze their positioning, funding, products, customers, and pricing strategies. Focus on companies in the same industry and market segment.`,
      structured_outputs: {
        target_company: "string",
        competitors: [
          {
            company_name: "string",
            one_liner: "string (brief company description)",
            funding: "string (total funding raised or revenue if public)",
            investors: ["array of key investors"],
            positioning: "string (market positioning and value proposition)",
            product_differentiation: ["array of key differentiators and unique features"],
            customers: "string (target customer segments and notable clients)",
            pricing: "string (pricing model and typical price points)",
          },
        ],
      },
      research_sources: [
        "Company websites and about pages",
        "Crunchbase and funding databases",
        "Pricing pages and product documentation",
        "Customer case studies and testimonials",
        "Industry reports and competitive analyses",
        "Recent funding announcements",
        "Product comparison sites",
      ],
    }

    // Fetch both company data and competitive intelligence in parallel
    const [companyResult, competitiveResult] = await Promise.all([
      callParallelAPI(companyTaskPayload),
      callParallelAPI(competitiveTaskPayload),
    ])

    // Combine the results
    const combinedData = {
      ...companyResult,
      competitive_analysis: competitiveResult,
    }

    console.log("✅ Parallel API analysis completed successfully")
    return combinedData
  } catch (parallelError) {
    console.log("⚠️ Parallel API failed, trying OpenAI fallback...")

    // Try OpenAI as fallback
    try {
      const openaiResult = await callOpenAIAPI(companyName)
      console.log("✅ OpenAI fallback analysis completed successfully")
      return openaiResult
    } catch (openaiError) {
      console.log("⚠️ OpenAI also failed, using sample data...")

      // Final fallback to sample data
      const sampleData = getSampleData(companyName)
      console.log("✅ Using sample data for analysis")
      return sampleData
    }
  }
}
