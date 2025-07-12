import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const taskPayload = await request.json()

    // Use the provided API key
    const apiKey = process.env.PARALLEL_API_KEY || "fM4GEyblY61QuXZvXMvPjpB7lmpGwU77Hj23lBQ0"

    if (!apiKey) {
      console.log("No Parallel API key found, using demo data")
      return NextResponse.json({
        results: generateDemoData(taskPayload.research_query),
        demo: true,
        message: "API key not configured - using demo data",
      })
    }

    console.log("🔑 API Key found:", `${apiKey.substring(0, 8)}...`)

    // Convert our task payload to Parallel's expected format
    const parallelTaskSpec = {
      task_spec: {
        output_schema: taskPayload.structured_outputs,
        input: taskPayload.research_query,
        processor: "base", // Using base processor as shown in docs
      },
    }

    console.log("📝 Parallel Task Spec:", JSON.stringify(parallelTaskSpec, null, 2))

    try {
      // Use the correct endpoint from the documentation
      const response = await fetch("https://api.parallel.ai/v1/tasks/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(parallelTaskSpec),
        signal: AbortSignal.timeout(60000), // 60 second timeout for research tasks
      })

      console.log(`📊 Response status: ${response.status} ${response.statusText}`)
      console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Success! Response data:", JSON.stringify(data, null, 2))

        // Check if we need to poll for results (async task)
        if (data.run_id) {
          console.log("🔄 Task submitted, polling for results...")
          const results = await pollForResults(data.run_id, apiKey)
          return NextResponse.json({
            results: results,
            run_id: data.run_id,
            live_data: true,
          })
        }

        // If results are immediately available
        return NextResponse.json({
          results: data.results || data,
          live_data: true,
        })
      } else {
        const errorText = await response.text()
        console.log(`❌ Error response: ${errorText}`)

        // Parse error details
        let errorDetails
        try {
          errorDetails = JSON.parse(errorText)
        } catch {
          errorDetails = { message: errorText }
        }

        return NextResponse.json({
          results: generateDemoData(taskPayload.research_query),
          demo: true,
          error: `Parallel API error: ${response.status} - ${errorDetails.message || errorText}`,
          debug: {
            status: response.status,
            statusText: response.statusText,
            errorDetails,
            apiKeyUsed: `${apiKey.substring(0, 8)}...`,
          },
        })
      }
    } catch (err) {
      console.log(`💥 Network error:`, err)
      return NextResponse.json({
        results: generateDemoData(taskPayload.research_query),
        demo: true,
        error: "Network error - using demo data",
        debug: {
          networkError: err instanceof Error ? err.message : "Unknown network error",
          apiKeyUsed: `${apiKey.substring(0, 8)}...`,
        },
      })
    }
  } catch (error) {
    console.error("💥 API Route Error:", error)
    return NextResponse.json(
      {
        results: generateDemoData("Demo Company"),
        demo: true,
        error: "Service temporarily unavailable",
        debug: {
          routeError: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 200 },
    )
  }
}

// Function to poll for async task results
async function pollForResults(runId: string, apiKey: string, maxAttempts = 30): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`🔍 Polling attempt ${attempt + 1}/${maxAttempts} for run ${runId}`)

      const response = await fetch(`https://api.parallel.ai/v1/tasks/runs/${runId}/result`, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`📊 Poll response:`, JSON.stringify(data, null, 2))

        // Check if task is complete
        if (data.status === "completed" && data.result) {
          console.log("✅ Task completed successfully!")
          return data.result
        }

        if (data.status === "failed") {
          console.log("❌ Task failed:", data.error)
          throw new Error(`Task failed: ${data.error}`)
        }

        // Task still running, wait before next poll
        console.log(`⏳ Task status: ${data.status}, waiting...`)
        await new Promise((resolve) => setTimeout(resolve, 3000)) // Wait 3 seconds
      } else {
        console.log(`❌ Poll error: ${response.status}`)
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    } catch (error) {
      console.log(`💥 Poll attempt ${attempt + 1} failed:`, error)
      if (attempt === maxAttempts - 1) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
  }

  throw new Error("Task polling timeout - results not available")
}

function generateDemoData(query: string) {
  const companyName = extractCompanyName(query)

  // Check if this is a competitive intelligence query
  if (query.includes("competitors") || query.includes("competitive")) {
    return generateCompetitiveDemoData(companyName)
  }

  return {
    company_name: companyName,
    location: "San Francisco, CA",
    one_liner: `Leading technology company specializing in innovative solutions and digital transformation`,
    position_title: "Market Leader",
    industry: "Technology/Software",
    number_of_employees: "5,000-10,000",
    funding: "$250M+ raised",
    valuation: "$2.5B (estimated)",
    chairman_ceo: "Alex Johnson",
    leadership: [
      "Sarah Chen - Chief Technology Officer",
      "Michael Rodriguez - Chief Financial Officer",
      "Emily Davis - VP of Product",
      "David Kim - VP of Engineering",
    ],
    latest_deals: [
      "Acquired AI startup TechFlow for $50M (Q3 2024)",
      "Strategic partnership with Microsoft Azure",
      "Series C funding round of $100M led by Sequoia Capital",
    ],
    investors: ["Sequoia Capital", "Andreessen Horowitz", "Google Ventures", "Kleiner Perkins", "Accel Partners"],
    company_offerings: [
      "Cloud-based SaaS Platform",
      "AI-powered Analytics Tools",
      "Enterprise Integration Solutions",
      "Mobile Applications",
    ],
    vision_mission:
      "To democratize technology and empower businesses of all sizes to achieve digital transformation through innovative, accessible solutions.",
    values: ["Innovation First", "Customer Success", "Transparency", "Diversity & Inclusion", "Sustainable Growth"],
    brands_services: [
      `${companyName} Platform`,
      `${companyName} Analytics`,
      `${companyName} Connect`,
      `${companyName} Mobile`,
    ],
    product_categories: [
      "Software as a Service (SaaS)",
      "Artificial Intelligence & Machine Learning",
      "Data Analytics & Business Intelligence",
      "Cloud Computing & Infrastructure",
    ],
    new_products: [
      "AI Assistant 3.0 with advanced NLP capabilities",
      "Real-time Collaboration Suite",
      "Predictive Analytics Dashboard",
    ],
    future_priorities: [
      "International market expansion (Europe & Asia)",
      "AI/ML capabilities enhancement",
      "Sustainability and carbon-neutral operations",
      "Strategic acquisitions in emerging tech",
    ],
    number_of_customers: "25,000+ businesses worldwide",
    geographies: [
      "North America (Primary)",
      "Europe (Expanding)",
      "Asia-Pacific (Growing)",
      "Latin America (Emerging)",
    ],
    competitors: ["Salesforce", "Microsoft", "Google Cloud", "Amazon Web Services", "Oracle"],
    revenue: "$500M+ ARR (2024 projected)",
    margin: "28% gross margin, 12% net margin",
    pov_on_company:
      "Strong market position with innovative technology stack and growing customer base. Well-positioned for continued growth in the enterprise software market.",
    unique_characteristics: [
      "Proprietary AI algorithms with 95% accuracy",
      "Industry-leading customer retention rate (98%)",
      "Strong developer ecosystem and API platform",
      "Focus on mid-market segment underserved by competitors",
    ],
    strengths: [
      "Strong technical innovation and R&D capabilities",
      "Experienced leadership team with proven track record",
      "High customer satisfaction and retention rates",
      "Scalable cloud-native architecture",
      "Strong financial performance and growth trajectory",
    ],
    weaknesses: [
      "Limited international presence compared to competitors",
      "Dependence on key technology partnerships",
      "Talent acquisition challenges in competitive market",
      "Need for increased marketing and brand awareness",
    ],
    metrics: [
      "98% customer retention rate",
      "45% year-over-year revenue growth",
      "99.9% platform uptime",
      "Net Promoter Score (NPS) of 72",
      "Average deal size increased 35% YoY",
    ],
    opportunities: [
      "International expansion into European and Asian markets",
      "Small and medium business (SMB) market penetration",
      "Vertical-specific solutions development",
      "Strategic partnerships with system integrators",
      "Emerging technologies adoption (IoT, blockchain)",
    ],
    threats: [
      "Increased competition from tech giants",
      "Economic downturn affecting enterprise spending",
      "Regulatory changes in data privacy and security",
      "Cybersecurity threats and data breaches",
      "Talent shortage in key technical roles",
    ],
    products_like: [
      "Core Platform - intuitive user interface and powerful features",
      "Customer Support - highly responsive and knowledgeable team",
      "API Documentation - comprehensive and developer-friendly",
      "Mobile App - clean design and offline capabilities",
    ],
    products_improve: [
      "Reporting Tools - need more customization options",
      "Pricing Structure - could be more transparent and flexible",
      "Integration Capabilities - expand third-party connectors",
      "Onboarding Process - streamline setup for new users",
    ],
  }
}

function generateCompetitiveDemoData(targetCompany: string) {
  const competitors = [
    {
      company_name: "CompetitorOne",
      one_liner: "Leading enterprise software platform with AI-powered automation",
      funding: "$300M Series D",
      investors: ["Sequoia Capital", "Andreessen Horowitz", "Tiger Global"],
      positioning: "Enterprise-first platform targeting Fortune 500 companies",
      product_differentiation: ["Advanced AI automation", "Enterprise security", "Custom integrations"],
      customers: "500+ enterprise clients including Fortune 100 companies",
      pricing: "$50-200/user/month with enterprise tiers",
    },
    {
      company_name: "CompetitorTwo",
      one_liner: "Cloud-native solution for mid-market businesses",
      funding: "$150M Series C",
      investors: ["Kleiner Perkins", "Accel Partners", "GV"],
      positioning: "Mid-market focused with emphasis on ease of use",
      product_differentiation: ["No-code interface", "Rapid deployment", "SMB pricing"],
      customers: "10,000+ mid-market businesses across 50+ countries",
      pricing: "$25-75/user/month with flexible plans",
    },
    {
      company_name: "CompetitorThree",
      one_liner: "Open-source platform with enterprise support options",
      funding: "$80M Series B",
      investors: ["Index Ventures", "Bessemer Venture Partners"],
      positioning: "Developer-first open-source solution with commercial support",
      product_differentiation: ["Open source", "Developer community", "Self-hosted options"],
      customers: "25,000+ developers and 1,000+ enterprise customers",
      pricing: "Free open-source, $30-100/user/month for enterprise",
    },
    {
      company_name: "CompetitorFour",
      one_liner: "Industry-specific solution for regulated sectors",
      funding: "$200M Series C",
      investors: ["Goldman Sachs Growth", "Insight Partners"],
      positioning: "Compliance-focused platform for financial services and healthcare",
      product_differentiation: ["Regulatory compliance", "Industry expertise", "Audit trails"],
      customers: "200+ financial institutions and healthcare organizations",
      pricing: "$100-500/user/month with compliance premium",
    },
    {
      company_name: "CompetitorFive",
      one_liner: "AI-first platform with advanced analytics capabilities",
      funding: "$120M Series B",
      investors: ["NEA", "Lightspeed Venture Partners"],
      positioning: "Analytics and AI-driven insights for data-driven organizations",
      product_differentiation: ["Advanced analytics", "Machine learning", "Predictive insights"],
      customers: "5,000+ data-driven companies and analytics teams",
      pricing: "$40-150/user/month based on analytics usage",
    },
  ]

  return {
    target_company: targetCompany,
    competitors: competitors,
  }
}

function extractCompanyName(query: string): string {
  // Extract company name from the query
  const match = query.match(/analysis (?:of|for) ([^.]+)/i)
  if (match) {
    return match[1].trim()
  }

  // Fallback patterns
  const patterns = [/company[:\s]+([^,.\n]+)/i, /analyze[:\s]+([^,.\n]+)/i, /research[:\s]+([^,.\n]+)/i]

  for (const pattern of patterns) {
    const match = query.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return "Demo Company"
}
