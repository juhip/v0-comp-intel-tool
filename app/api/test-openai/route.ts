import { NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

export async function GET() {
  try {
    // Check if API key is configured
    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        message: "OpenAI API key not configured",
        error: "OPENAI_API_KEY environment variable is missing",
      })
    }

    // Validate API key format
    if (!OPENAI_API_KEY.startsWith("sk-")) {
      return NextResponse.json({
        success: false,
        message: "Invalid OpenAI API key format",
        error: "API key should start with 'sk-'",
      })
    }

    console.log("Testing OpenAI API connection...")

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Respond with a brief confirmation that the API connection is working.",
          },
          {
            role: "user",
            content: "This is a connection test. Please confirm the API is working.",
          },
        ],
        max_tokens: 100,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return NextResponse.json({
        success: false,
        message: `OpenAI API request failed: ${response.status} ${response.statusText}`,
        error: errorData?.error?.message || "API request failed",
        details: {
          status: response.status,
          statusText: response.statusText,
          errorData,
        },
      })
    }

    const result = await response.json()

    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      return NextResponse.json({
        success: false,
        message: "Invalid response format from OpenAI",
        error: "Unexpected response structure",
        details: result,
      })
    }

    return NextResponse.json({
      success: true,
      message: "✅ OpenAI API connection successful!",
      details: {
        model: result.model,
        response: result.choices[0].message.content,
        usage: result.usage,
      },
    })
  } catch (error) {
    console.error("OpenAI API test error:", error)
    return NextResponse.json({
      success: false,
      message: "OpenAI API test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      },
    })
  }
}
