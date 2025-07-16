import { type NextRequest, NextResponse } from "next/server"

// Enhanced sample data for fallback
const sampleData = {
  tesla: {
    companyIntelligence: {
      companyName: "Tesla, Inc.",
      industry: "Electric Vehicles & Clean Energy",
      headquarters: "Austin, Texas, USA",
      founded: "2003",
      employees: "127,855",
      revenue: "$96.8 billion (2023)",
      marketCap: "$800+ billion",
      description:
        "Tesla designs, develops, manufactures, and sells electric vehicles, energy generation and storage systems, and related services and products worldwide.",
      keyProducts: [
        "Model S",
        "Model 3",
        "Model X",
        "Model Y",
        "Cybertruck",
        "Solar Panels",
        "Powerwall",
        "Supercharger Network",
      ],
      recentNews: [
        "Tesla reports record Q4 2023 deliveries of 484,507 vehicles",
        "Cybertruck production ramp continues with first deliveries",
        "Supercharger network expansion accelerates globally",
        "Full Self-Driving beta reaches wider release",
      ],
    },
    competitiveAnalysis: {
      marketPosition: {
        marketShare: "18.7%",
        ranking: "#1 in global EV market",
        description:
          "Tesla maintains leadership in the global electric vehicle market with strong brand recognition, technological innovation, and expanding production capacity.",
      },
      keyCompetitors: [
        { name: "BYD", marketShare: "16.2%", keyStrength: "Cost-effective production and battery technology" },
        { name: "Volkswagen Group", marketShare: "8.1%", keyStrength: "Traditional automotive expertise and scale" },
        { name: "General Motors", marketShare: "6.2%", keyStrength: "Manufacturing scale and dealer network" },
        { name: "Ford", marketShare: "4.8%", keyStrength: "Strong truck heritage and F-150 Lightning" },
        { name: "Rivian", marketShare: "1.2%", keyStrength: "Electric truck focus and Amazon partnership" },
      ],
      strengths: [
        "Leading EV technology and innovation",
        "Strong brand loyalty and customer base",
        "Vertically integrated supply chain",
        "Supercharger network advantage",
        "Over-the-air software updates",
        "Energy storage and solar business",
      ],
      weaknesses: [
        "High vehicle pricing limits mass market appeal",
        "Production scalability challenges",
        "Quality control and service issues",
        "Dependence on CEO leadership and public persona",
        "Limited model variety compared to traditional automakers",
      ],
      opportunities: [
        "Expanding into emerging markets (India, Southeast Asia)",
        "Autonomous driving technology and robotaxi network",
        "Energy storage market growth",
        "Commercial vehicle segment (Semi, Cybertruck)",
        "Battery technology licensing to other manufacturers",
      ],
      threats: [
        "Increasing competition from traditional automakers",
        "Regulatory changes in key markets (China, EU)",
        "Supply chain disruptions and raw material costs",
        "Economic downturn affecting luxury vehicle purchases",
        "Potential safety issues with autonomous driving technology",
      ],
    },
  },
  apple: {
    companyIntelligence: {
      companyName: "Apple Inc.",
      industry: "Consumer Electronics & Software",
      headquarters: "Cupertino, California, USA",
      founded: "1976",
      employees: "164,000",
      revenue: "$394.3 billion (2023)",
      marketCap: "$3+ trillion",
      description:
        "Apple designs, manufactures, and markets consumer electronics, computer software, and online services worldwide.",
      keyProducts: ["iPhone", "iPad", "Mac", "Apple Watch", "AirPods", "Apple TV", "Apple Services", "Vision Pro"],
      recentNews: [
        "iPhone 15 series launch with USB-C transition",
        "Apple Vision Pro mixed reality headset announced for 2024",
        "Services revenue continues strong growth at $85B annually",
        "Apple Intelligence AI features announced for iOS 18",
      ],
    },
    competitiveAnalysis: {
      marketPosition: {
        marketShare: "28.4%",
        ranking: "#1 in premium smartphones globally",
        description:
          "Apple dominates the premium smartphone market and maintains strong ecosystem integration across all devices and services.",
      },
      keyCompetitors: [
        { name: "Samsung", marketShare: "22.3%", keyStrength: "Display technology and Android ecosystem partnership" },
        { name: "Google", marketShare: "8.2%", keyStrength: "AI capabilities and software services integration" },
        { name: "Microsoft", marketShare: "6.1%", keyStrength: "Enterprise productivity and cloud services" },
        { name: "Amazon", marketShare: "4.8%", keyStrength: "Voice AI and smart home ecosystem" },
        { name: "Meta", marketShare: "3.2%", keyStrength: "VR/AR technology and social platforms" },
      ],
      strengths: [
        "Premium brand positioning and customer loyalty",
        "Integrated hardware and software ecosystem",
        "Strong profit margins and financial performance",
        "Innovation in design and user experience",
        "Robust App Store and services revenue",
        "Privacy-focused approach",
      ],
      weaknesses: [
        "High pricing limits market reach in emerging markets",
        "Heavy dependence on iPhone revenue (52% of total)",
        "Limited customization options compared to Android",
        "Closed ecosystem approach restricts flexibility",
        "Slower adoption of new technologies (5G, USB-C)",
      ],
      opportunities: [
        "Emerging markets expansion with more affordable products",
        "Augmented and Virtual Reality market leadership",
        "Health and fitness technology integration",
        "Autonomous vehicle technology development",
        "Financial services expansion (Apple Pay, Apple Card)",
      ],
      threats: [
        "Intense smartphone market competition and saturation",
        "Regulatory scrutiny on App Store policies and fees",
        "Supply chain dependencies and geopolitical tensions",
        "Economic downturns affecting premium product purchases",
        "Increasing competition in services from Google and Microsoft",
      ],
    },
  },
  microsoft: {
    companyIntelligence: {
      companyName: "Microsoft Corporation",
      industry: "Software & Cloud Services",
      headquarters: "Redmond, Washington, USA",
      founded: "1975",
      employees: "221,000",
      revenue: "$211.9 billion (2023)",
      marketCap: "$2.8+ trillion",
      description: "Microsoft develops, licenses, and supports software, services, devices, and solutions worldwide.",
      keyProducts: ["Windows", "Microsoft 365", "Azure", "Teams", "Xbox", "Surface", "LinkedIn", "GitHub"],
      recentNews: [
        "Microsoft Copilot AI integration across all products",
        "Azure OpenAI Service expansion",
        "Record cloud revenue growth of 27%",
        "Teams reaches 300 million monthly active users",
      ],
    },
    competitiveAnalysis: {
      marketPosition: {
        marketShare: "23.1%",
        ranking: "#2 in cloud infrastructure globally",
        description:
          "Microsoft is a leader in productivity software and rapidly growing in cloud services, with strong enterprise relationships.",
      },
      keyCompetitors: [
        { name: "Amazon (AWS)", marketShare: "32.4%", keyStrength: "Cloud infrastructure market leadership" },
        { name: "Google", marketShare: "10.8%", keyStrength: "AI capabilities and search integration" },
        { name: "Apple", marketShare: "8.2%", keyStrength: "Consumer device ecosystem" },
        { name: "Oracle", marketShare: "5.1%", keyStrength: "Enterprise database and applications" },
        { name: "Salesforce", marketShare: "3.8%", keyStrength: "CRM and business applications" },
      ],
      strengths: [
        "Strong enterprise relationships and trust",
        "Comprehensive productivity suite integration",
        "Rapidly growing cloud business (Azure)",
        "AI integration across product portfolio",
        "Diverse revenue streams and business model",
        "Strong developer ecosystem",
      ],
      weaknesses: [
        "Limited mobile platform presence",
        "Consumer brand perception vs. Apple/Google",
        "Legacy software maintenance costs",
        "Regulatory scrutiny on market dominance",
        "Competition in gaming from Sony/Nintendo",
      ],
      opportunities: [
        "AI revolution and Copilot expansion",
        "Hybrid work trend benefiting Teams/365",
        "Digital transformation acceleration",
        "Gaming market growth (Xbox, Game Pass)",
        "Emerging markets cloud adoption",
      ],
      threats: [
        "Intense cloud competition from AWS/Google",
        "Regulatory pressure and antitrust concerns",
        "Cybersecurity risks and data breaches",
        "Economic downturn affecting enterprise spending",
        "Open source alternatives to proprietary software",
      ],
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json()

    if (!companyName) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    // Check for sample data first
    const sampleKey = companyName.toLowerCase()
    if (sampleData[sampleKey as keyof typeof sampleData]) {
      const data = sampleData[sampleKey as keyof typeof sampleData]
      return NextResponse.json({
        ...data,
        dataSource: "Sample Data",
      })
    }

    // Try Parallel.ai API
    if (process.env.PARALLEL_API_KEY) {
      try {
        const parallelResponse = await fetch("https://api.parallel.ai/v1/research", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PARALLEL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `Comprehensive company analysis for ${companyName} including financial data, market position, competitors, and recent developments`,
            format: "structured",
          }),
        })

        if (parallelResponse.ok) {
          const parallelData = await parallelResponse.json()
          // Process Parallel.ai response and format it
          return NextResponse.json({
            companyIntelligence: {
              companyName,
              industry: parallelData.industry || "N/A",
              headquarters: parallelData.headquarters || "N/A",
              founded: parallelData.founded || "N/A",
              employees: parallelData.employees || "N/A",
              revenue: parallelData.revenue || "N/A",
              marketCap: parallelData.marketCap || "N/A",
              description: parallelData.description || "No description available",
              keyProducts: parallelData.keyProducts || [],
              recentNews: parallelData.recentNews || [],
            },
            competitiveAnalysis: parallelData.competitiveAnalysis || {
              marketPosition: { marketShare: "N/A", ranking: "N/A", description: "No data available" },
              keyCompetitors: [],
              strengths: [],
              weaknesses: [],
              opportunities: [],
              threats: [],
            },
            dataSource: "Parallel.ai",
          })
        }
      } catch (error) {
        console.error("Parallel.ai API error:", error)
      }
    }

    // Final fallback to generic sample data
    return NextResponse.json({
      companyIntelligence: {
        companyName,
        industry: "Technology",
        headquarters: "N/A",
        founded: "N/A",
        employees: "N/A",
        revenue: "N/A",
        marketCap: "N/A",
        description: `${companyName} is a company in the technology sector. Detailed information is not available without API access.`,
        keyProducts: [],
        recentNews: ["No recent news available without API access"],
      },
      competitiveAnalysis: {
        marketPosition: {
          marketShare: "N/A",
          ranking: "N/A",
          description: "Market position data not available without API access",
        },
        keyCompetitors: [],
        strengths: ["Unable to determine without API access"],
        weaknesses: ["Unable to determine without API access"],
        opportunities: ["Unable to determine without API access"],
        threats: ["Unable to determine without API access"],
      },
      dataSource: "Demo Mode",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to analyze company" }, { status: 500 })
  }
}
