import { type NextRequest, NextResponse } from "next/server"
import { fetchCompanyIntel } from "@/services/parallel-api"

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json()

    if (!companyName) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    console.log(`Starting comprehensive analysis for: ${companyName}`)

    try {
      console.log("Fetching company intelligence with competitive analysis...")
      const companyIntel = await fetchCompanyIntel(companyName)
      console.log("Analysis completed successfully")

      const response = {
        success: true,
        companyName,
        companyIntel,
        timestamp: new Date().toISOString(),
        message: "Comprehensive analysis completed successfully",
      }

      return NextResponse.json(response)
    } catch (error) {
      console.error("Analysis failed:", error)

      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Analysis failed",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Parallel Research API is running",
    endpoints: {
      POST: "/api/parallel-research - Analyze a company with competitive intelligence",
      GET: "/api/test-parallel - Test Parallel.ai connection",
      GET: "/api/test-openai - Test OpenAI connection",
    },
    timestamp: new Date().toISOString(),
  })
}
