"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Zap, Brain, Database } from "lucide-react"
import { toast } from "sonner"

export function LiveApiTest() {
  const [parallelTest, setParallelTest] = useState<any>(null)
  const [openaiTest, setOpenaiTest] = useState<any>(null)
  const [parallelLoading, setParallelLoading] = useState(false)
  const [openaiLoading, setOpenaiLoading] = useState(false)
  const [testCompany] = useState("Apple")

  const hasParallelKey = !!process.env.PARALLEL_API_KEY
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY

  useEffect(() => {
    // Auto-run tests when component mounts
    if (hasParallelKey) {
      testParallelAPI()
    }
    if (hasOpenAIKey) {
      testOpenAIAPI()
    }
  }, [])

  const testParallelAPI = async () => {
    setParallelLoading(true)
    setParallelTest(null)

    try {
      toast.info("Testing Parallel.ai API...")

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
            founded: { type: "string" },
            competitors: { type: "array", items: { type: "string" } },
            products: { type: "array", items: { type: "string" } },
            market_cap: { type: "string" },
            headquarters: { type: "string" },
          },
        },
        input: `Extract comprehensive information about ${testCompany} including:
        - Company name and basic details
        - Location and headquarters
        - Industry and business description
        - CEO and current leadership
        - Number of employees
        - Revenue and market cap
        - Founded date
        - Main competitors (top 5)
        - Key products and services
        - Recent developments or news
        
        Please provide accurate, current information from reliable sources.`,
        processor: "base",
      }

      // Create task
      const createResponse = await fetch("https://api.parallel.ai/v1/tasks/runs", {
        method: "POST",
        headers: {
          "x-api-key": process.env.PARALLEL_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task_spec: taskSpec }),
      })

      if (!createResponse.ok) {
        throw new Error(`Parallel API failed: ${createResponse.status} ${createResponse.statusText}`)
      }

      const createResult = await createResponse.json()
      const runId = createResult.run_id

      if (!runId) {
        throw new Error("No run ID returned from Parallel API")
      }

      // Poll for results
      const result = await pollParallelResults(runId)

      setParallelTest({
        success: true,
        runId,
        data: result.result,
        timestamp: new Date().toISOString(),
        processingTime: result.processing_time || "N/A",
      })

      toast.success("Parallel.ai API test successful!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setParallelTest({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      })
      toast.error(`Parallel.ai test failed: ${errorMessage}`)
    } finally {
      setParallelLoading(false)
    }
  }

  const testOpenAIAPI = async () => {
    setOpenaiLoading(true)
    setOpenaiTest(null)

    try {
      toast.info("Testing OpenAI API...")

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a business intelligence analyst. Provide accurate company information in JSON format.",
            },
            {
              role: "user",
              content: `Provide comprehensive information about ${testCompany} in JSON format with these fields:
              {
                "company_name": "string",
                "location": "string", 
                "industry": "string",
                "description": "string",
                "ceo": "string",
                "employees": "string",
                "revenue": "string",
                "founded": "string",
                "competitors": ["array of strings"],
                "products": ["array of strings"],
                "market_cap": "string"
              }
              
              Return only valid JSON without markdown formatting.`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      const content = result.choices[0]?.message?.content

      if (!content) {
        throw new Error("No content returned from OpenAI")
      }

      // Parse JSON response
      const parsedData = JSON.parse(content)

      setOpenaiTest({
        success: true,
        data: parsedData,
        timestamp: new Date().toISOString(),
        tokensUsed: result.usage?.total_tokens || "N/A",
        cost: result.usage?.total_tokens ? `$${((result.usage.total_tokens / 1000) * 0.03).toFixed(4)}` : "N/A",
      })

      toast.success("OpenAI API test successful!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setOpenaiTest({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      })
      toast.error(`OpenAI test failed: ${errorMessage}`)
    } finally {
      setOpenaiLoading(false)
    }
  }

  const pollParallelResults = async (runId: string, maxAttempts = 30): Promise<any> => {
    const pollUrl = `https://api.parallel.ai/v1/tasks/runs/${runId}/result`

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(pollUrl, {
          headers: {
            "x-api-key": process.env.PARALLEL_API_KEY!,
          },
        })

        if (response.ok) {
          const result = await response.json()

          if (result.status === "completed") {
            return result
          } else if (result.status === "failed") {
            throw new Error("Task failed: " + (result.error || "Unknown error"))
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error
        }
      }
    }

    throw new Error("Task timed out after 60 seconds")
  }

  return (
