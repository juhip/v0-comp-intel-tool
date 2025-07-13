import { NextResponse } from "next/server"

export async function GET() {
  // Server-side check of API configuration status
  const configStatus = {
    parallel: {
      configured: !!process.env.PARALLEL_API_KEY,
      name: "Parallel.ai",
      description: "Real-time web data extraction",
      priority: 1,
    },
    openai: {
      configured: !!process.env.OPENAI_API_KEY,
      name: "OpenAI",
      description: "AI-powered analysis",
      priority: 2,
    },
    xai: {
      configured: !!process.env.XAI_API_KEY,
      name: "xAI (Grok)",
      description: "Alternative AI analysis",
      priority: 3,
    },
    supabase: {
      configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      name: "Supabase",
      description: "Database and authentication",
      priority: 4,
    },
  }

  // Determine the mode based on available APIs
  const hasAnyApi = Object.values(configStatus).some((api) => api.configured)
  const mode = hasAnyApi ? "live" : "demo"

  // Get primary API
  const primaryApi = Object.entries(configStatus)
    .filter(([_, config]) => config.configured)
    .sort(([_, a], [__, b]) => a.priority - b.priority)[0]

  return NextResponse.json({
    mode,
    primaryApi: primaryApi ? primaryApi[0] : null,
    apis: configStatus,
    timestamp: new Date().toISOString(),
  })
}
