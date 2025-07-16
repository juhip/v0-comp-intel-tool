import { NextResponse } from "next/server"

export async function GET() {
  try {
    const hasParallel = !!process.env.PARALLEL_API_KEY

    const mode = hasParallel ? "live" : "demo"

    return NextResponse.json({
      mode,
      apis: {
        parallel: {
          configured: hasParallel,
          name: "Parallel.ai",
          description: "Real-time web data extraction",
        },
      },
    })
  } catch (error) {
    return NextResponse.json({
      mode: "demo",
      apis: {},
    })
  }
}
