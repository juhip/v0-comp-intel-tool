import { NextResponse } from "next/server"

const PARALLEL_API_KEY = process.env.PARALLEL_API_KEY || ""
const PARALLEL_API_URL = "https://api.parallel.ai/v1/tasks/runs"

export async function GET() {
  try {
    // Check if API key is configured
    if (!PARALLEL_API_KEY) {
      return NextResponse.json({
        success: false,
        message: "Parallel API key not configured",
        error: "PARALLEL_API_KEY environment variable is missing",
      })
    }

    // Test connection with a simple task
    const taskSpec = {
      output_schema: {
        type: "object",
        properties: {
          test_result: { type: "string" },
          timestamp: { type: "string" },
        },
      },
      input: "This is a connection test. Please respond with a simple confirmation message and current timestamp.",
      processor: "base",
    }

    console.log("Testing Parallel API connection...")

    const response = await fetch(PARALLEL_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": PARALLEL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task_spec: taskSpec }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        message: `Parallel API request failed: ${response.status} ${response.statusText}`,
        error: errorText,
        details: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        },
      })
    }

    const result = await response.json()

    if (!result.run_id) {
      return NextResponse.json({
        success: false,
        message: "No run ID returned from Parallel API",
        error: "Invalid response format",
        details: result,
      })
    }

    // Poll for results (simplified for testing)
    const pollUrl = `https://api.parallel.ai/v1/tasks/runs/${result.run_id}/result`
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      try {
        const pollResponse = await fetch(pollUrl, {
          headers: {
            "x-api-key": PARALLEL_API_KEY,
          },
        })

        if (pollResponse.ok) {
          const pollResult = await pollResponse.json()

          if (pollResult.status === "completed") {
            return NextResponse.json({
              success: true,
              message: "✅ Parallel API connection successful!",
              details: {
                run_id: result.run_id,
                result: pollResult.result,
                attempts: attempts + 1,
              },
            })
          } else if (pollResult.status === "failed") {
            return NextResponse.json({
              success: false,
              message: "Parallel API task failed",
              error: pollResult.error || "Task execution failed",
              details: pollResult,
            })
          }
        }

        attempts++
      } catch (pollError) {
        attempts++
        if (attempts >= maxAttempts) {
          return NextResponse.json({
            success: false,
            message: "Parallel API polling failed",
            error: pollError instanceof Error ? pollError.message : "Polling error",
            details: { attempts, maxAttempts },
          })
        }
      }
    }

    return NextResponse.json({
      success: false,
      message: "Parallel API task timed out",
      error: "Task did not complete within expected time",
      details: { attempts: maxAttempts },
    })
  } catch (error) {
    console.error("Parallel API test error:", error)
    return NextResponse.json({
      success: false,
      message: "Parallel API test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      },
    })
  }
}
