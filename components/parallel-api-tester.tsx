"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, CheckCircle, AlertCircle, Loader2, Copy, Eye, EyeOff, Zap, Database } from "lucide-react"
import { toast } from "sonner"

export function ParallelApiTester() {
  const [testCompany, setTestCompany] = useState("Apple")
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [rawResponse, setRawResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRawData, setShowRawData] = useState(false)
  const [activeTest, setActiveTest] = useState<string | null>(null)

  const hasApiKey = !!process.env.PARALLEL_API_KEY

  const testParallelAI = async (testType: "company" | "competitive") => {
    if (!hasApiKey) {
      toast.error("Parallel.ai API key not configured")
      return
    }

    setIsLoading(true)
    setError(null)
    setActiveTest(testType)

    try {
      const taskSpec =
        testType === "company"
          ? {
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
                  recent_news: { type: "array", items: { type: "string" } },
                },
              },
              input: `Extract comprehensive information about ${testCompany}. Include:
            - Company name and basic details
            - Location and headquarters
            - Industry and business description  
            - CEO and leadership
            - Number of employees
            - Revenue information
            - Founded date
            - Main competitors
            - Key products/services
            - Recent news or developments
            
            Please provide accurate, up-to-date information from reliable sources.`,
              processor: "base",
            }
          : {
              output_schema: {
                type: "object",
                properties: {
                  main_company: { type: "string" },
                  market_analysis: {
                    type: "object",
                    properties: {
                      market_size: { type: "string" },
                      growth_rate: { type: "string" },
                      key_trends: { type: "array", items: { type: "string" } },
                    },
                  },
                  competitors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        market_share: { type: "string" },
                        strengths: { type: "array", items: { type: "string" } },
                        weaknesses: { type: "array", items: { type: "string" } },
                      },
                    },
                  },
                },
              },
              input: `Provide competitive analysis for ${testCompany}. Include:
            - Market size and growth rate
            - Key market trends
            - Top 3-5 competitors with their market share
            - Strengths and weaknesses of each competitor
            - Competitive positioning analysis`,
              processor: "base",
            }

      toast.info(`Testing ${testType} analysis for ${testCompany}...`)

      // Step 1: Create the task
      const createResponse = await fetch("https://api.parallel.ai/v1/tasks/runs", {
        method: "POST",
        headers: {
          "x-api-key": process.env.PARALLEL_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task_spec: taskSpec }),
      })

      if (!createResponse.ok) {
        throw new Error(`API request failed: ${createResponse.status} ${createResponse.statusText}`)
      }

      const createResult = await createResponse.json()
      const runId = createResult.run_id

      if (!runId) {
        throw new Error("No run ID returned from API")
      }

      toast.info(`Task created with ID: ${runId}. Polling for results...`)

      // Step 2: Poll for results
      const result = await pollForResults(runId)

      setRawResponse(result)
      setTestResults({
        testType,
        company: testCompany,
        runId,
        result: result,
        timestamp: new Date().toISOString(),
      })

      toast.success(`${testType} analysis completed successfully!`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      toast.error(`Test failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
      setActiveTest(null)
    }
  }

  const pollForResults = async (runId: string, maxAttempts = 30): Promise<any> => {
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
          // If still running, continue polling
        }

        // Wait 2 seconds before next attempt
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error
        }
      }
    }

    throw new Error("Task timed out after 60 seconds")
  }

  const copyToClipboard = (data: any, label: string) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Parallel.ai API Tester
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={hasApiKey ? "default" : "secondary"} className="flex items-center gap-1">
              {hasApiKey ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              API Key: {hasApiKey ? `${process.env.PARALLEL_API_KEY?.slice(0, 8)}...` : "Not Set"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasApiKey && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Parallel.ai API key not configured. Set PARALLEL_API_KEY environment variable to test real data
                extraction.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="test-company" className="block text-sm font-medium mb-2">
                Company to Test
              </label>
              <Input
                id="test-company"
                value={testCompany}
                onChange={(e) => setTestCompany(e.target.value)}
                placeholder="Enter company name"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => testParallelAI("company")}
                disabled={!hasApiKey || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading && activeTest === "company" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Test Company Intel
              </Button>
              <Button
                onClick={() => testParallelAI("competitive")}
                disabled={!hasApiKey || isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isLoading && activeTest === "competitive" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Test Competitive Analysis
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Results: {testResults.testType} Analysis</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowRawData(!showRawData)}>
                  {showRawData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showRawData ? "Hide" : "Show"} Raw Data
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(testResults, "Test results")}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">Company: {testResults.company}</Badge>
              <Badge variant="outline">Run ID: {testResults.runId}</Badge>
              <Badge variant="outline">Time: {new Date(testResults.timestamp).toLocaleTimeString()}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="parsed" className="w-full">
              <TabsList>
                <TabsTrigger value="parsed">Parsed Results</TabsTrigger>
                <TabsTrigger value="raw">Raw Response</TabsTrigger>
              </TabsList>

              <TabsContent value="parsed" className="space-y-4">
                {testResults.result?.result && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Extracted Data:</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-auto max-h-96">
                        {JSON.stringify(testResults.result.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="raw" className="space-y-4">
                {showRawData && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Full API Response:</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-auto max-h-96">{JSON.stringify(rawResponse, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">
                {activeTest === "company" ? "Extracting company intelligence..." : "Analyzing competitive landscape..."}
              </p>
              <p className="text-xs text-muted-foreground">This may take 30-60 seconds</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
