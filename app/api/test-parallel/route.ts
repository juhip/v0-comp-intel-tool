import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Use the provided API key directly for testing
  const apiKey = process.env.PARALLEL_API_KEY || "fM4GEyblY61QuXZvXMvPjpB7lmpGwU77Hj23lBQ0"

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: "PARALLEL_API_KEY not available",
      suggestion: "API key should be configured",
    })
  }

  console.log("🔑 Testing with API key:", `${apiKey.substring(0, 8)}...`)

  // Test the correct Parallel API endpoint from documentation
  const testResults = []

  try {
    console.log("🧪 Testing Parallel API with correct endpoint and auth...")

    // Test 1: Simple task creation based on documentation
    const simpleTask = {
      task_spec: {
        output_schema: {
          company_name: "string",
          founding_date: "string (format MM-YYYY)",
          industry: "string",
          headquarters: "string",
        },
        input: "Apple Inc.",
        processor: "base",
      },
    }

    console.log("📝 Sending task:", JSON.stringify(simpleTask, null, 2))

    const response = await fetch("https://api.parallel.ai/v1/tasks/runs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(simpleTask),
      signal: AbortSignal.timeout(15000),
    })

    console.log(`📊 Response status: ${response.status} ${response.statusText}`)
    console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()))

    const responseData = await response.text()
    console.log(`📄 Raw response:`, responseData)

    let parsedData
    try {
      parsedData = JSON.parse(responseData)
    } catch {
      parsedData = { raw: responseData }
    }

    testResults.push({
      test: "Simple Task Creation",
      endpoint: "https://api.parallel.ai/v1/tasks/runs",
      method: "POST",
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      responseData: parsedData,
      rawResponse: responseData,
    })

    // Test 2: If task was created successfully, try to get results
    if (response.ok && parsedData.run_id) {
      console.log(`🔍 Testing result retrieval for run_id: ${parsedData.run_id}`)

      // Wait a moment before checking results
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const resultResponse = await fetch(`https://api.parallel.ai/v1/tasks/runs/${parsedData.run_id}/result`, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
        },
        signal: AbortSignal.timeout(10000),
      })

      const resultData = await resultResponse.text()
      console.log(`📊 Result response:`, resultData)

      let parsedResultData
      try {
        parsedResultData = JSON.parse(resultData)
      } catch {
        parsedResultData = { raw: resultData }
      }

      testResults.push({
        test: "Result Retrieval",
        endpoint: `https://api.parallel.ai/v1/tasks/runs/${parsedData.run_id}/result`,
        method: "GET",
        status: resultResponse.status,
        statusText: resultResponse.statusText,
        success: resultResponse.ok,
        headers: Object.fromEntries(resultResponse.headers.entries()),
        responseData: parsedResultData,
        runId: parsedData.run_id,
        rawResponse: resultData,
      })
    }

    // Test 3: Try a different endpoint format if the first one didn't work
    if (!response.ok) {
      console.log("🔄 Trying alternative endpoint format...")

      const altResponse = await fetch("https://api.parallel.ai/v1/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(simpleTask),
        signal: AbortSignal.timeout(10000),
      })

      const altData = await altResponse.text()
      let parsedAltData
      try {
        parsedAltData = JSON.parse(altData)
      } catch {
        parsedAltData = { raw: altData }
      }

      testResults.push({
        test: "Alternative Endpoint Test",
        endpoint: "https://api.parallel.ai/v1/tasks",
        method: "POST",
        status: altResponse.status,
        statusText: altResponse.statusText,
        success: altResponse.ok,
        headers: Object.fromEntries(altResponse.headers.entries()),
        responseData: parsedAltData,
        rawResponse: altData,
      })
    }
  } catch (error) {
    console.error("💥 Test error:", error)
    testResults.push({
      test: "API Connection Test",
      endpoint: "https://api.parallel.ai/v1/tasks/runs",
      method: "POST",
      status: 0,
      statusText: "Network Error",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Analyze results
  const successfulTests = testResults.filter((result) => result.success)
  const failedTests = testResults.filter((result) => !result.success)

  return NextResponse.json({
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 8)}...` : "Not found",
    totalTests: testResults.length,
    successfulTests: successfulTests.length,
    failedTests: failedTests.length,
    results: testResults,
    recommendations: generateRecommendations(testResults),
    documentation: {
      endpoint: "https://api.parallel.ai/v1/tasks/runs",
      authHeader: "x-api-key",
      method: "POST",
      format: "Parallel Task API v1",
    },
  })
}

function generateRecommendations(results: any[]) {
  const recommendations = []

  const successfulResults = results.filter((r) => r.success)
  const authErrors = results.filter((r) => r.status === 401)
  const badRequestErrors = results.filter((r) => r.status === 400)
  const notFoundErrors = results.filter((r) => r.status === 404)

  if (successfulResults.length > 0) {
    recommendations.push({
      type: "success",
      message: `✅ API integration working! Found ${successfulResults.length} successful test(s).`,
      details: successfulResults.map((r) => `${r.test}: ${r.status} ${r.statusText}`),
      nextSteps: [
        "Your API key is valid and working",
        "The main company intelligence tool should now work with live data",
        "You can start analyzing real companies",
      ],
    })
  }

  if (authErrors.length > 0) {
    recommendations.push({
      type: "auth_error",
      message: "❌ Authentication failed (401 Unauthorized)",
      suggestions: [
        "The API key might be invalid or expired",
        "Check if you have access to the Parallel API",
        "Verify the API key is correctly formatted",
        "Contact Parallel support if the key should be working",
      ],
    })
  }

  if (badRequestErrors.length > 0) {
    recommendations.push({
      type: "request_error",
      message: "❌ Bad request format (400 Bad Request)",
      suggestions: [
        "The task_spec format might not match Parallel's requirements",
        "Check if the processor field is valid",
        "Verify the output_schema structure",
        "Review the Parallel API documentation for required fields",
      ],
    })
  }

  if (notFoundErrors.length > 0) {
    recommendations.push({
      type: "endpoint_error",
      message: "❌ Endpoint not found (404 Not Found)",
      suggestions: [
        "The API endpoint might be incorrect",
        "Check if the API version is correct",
        "Verify the URL structure matches the documentation",
        "Try alternative endpoint formats",
      ],
    })
  }

  if (successfulResults.length === 0) {
    recommendations.push({
      type: "no_success",
      message: "❌ No successful API calls",
      suggestions: [
        "Check your internet connection and firewall settings",
        "Verify the API key is active and has proper permissions",
        "Ensure you have an active Parallel account with API access",
        "Try the alternative endpoints being tested",
        "Contact Parallel support for assistance",
      ],
    })
  }

  return recommendations
}
