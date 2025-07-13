"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Loader2, AlertCircle, Settings, TestTube } from "lucide-react"

interface TestResult {
  success: boolean
  message: string
  details?: any
  error?: string
}

export default function DebugPage() {
  const [parallelResult, setParallelResult] = useState<TestResult | null>(null)
  const [openaiResult, setOpenaiResult] = useState<TestResult | null>(null)
  const [fullTestResult, setFullTestResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const testParallelAPI = async () => {
    setLoading((prev) => ({ ...prev, parallel: true }))
    try {
      const response = await fetch("/api/test-parallel")
      const result = await response.json()
      setParallelResult(result)
    } catch (error) {
      setParallelResult({
        success: false,
        message: "Failed to test Parallel API",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading((prev) => ({ ...prev, parallel: false }))
    }
  }

  const testOpenAI = async () => {
    setLoading((prev) => ({ ...prev, openai: true }))
    try {
      const response = await fetch("/api/test-openai")
      const result = await response.json()
      setOpenaiResult(result)
    } catch (error) {
      setOpenaiResult({
        success: false,
        message: "Failed to test OpenAI API",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading((prev) => ({ ...prev, openai: false }))
    }
  }

  const testFullAnalysis = async () => {
    setLoading((prev) => ({ ...prev, full: true }))
    try {
      const response = await fetch("/api/parallel-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_description: "Test analysis for Apple Inc",
          research_query: "Get basic information about Apple Inc for testing purposes",
          structured_outputs: {
            company_name: "string",
            one_liner: "string",
            industry: "string",
          },
        }),
      })
      const result = await response.json()
      setFullTestResult({
        success: response.ok,
        message: response.ok ? "Full analysis test completed successfully" : "Full analysis test failed",
        details: result,
      })
    } catch (error) {
      setFullTestResult({
        success: false,
        message: "Failed to test full analysis",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading((prev) => ({ ...prev, full: false }))
    }
  }

  const runAllTests = async () => {
    await Promise.all([testParallelAPI(), testOpenAI(), testFullAnalysis()])
  }

  const StatusIcon = ({ result }: { result: TestResult | null }) => {
    if (!result) return <AlertCircle className="h-5 w-5 text-gray-400" />
    return result.success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const StatusBadge = ({ result }: { result: TestResult | null }) => {
    if (!result) return <Badge variant="secondary">Not tested</Badge>
    return result.success ? (
      <Badge variant="default" className="bg-green-500">
        ✅ Working
      </Badge>
    ) : (
      <Badge variant="destructive">❌ Failed</Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">System Debug Console</h1>
        <p className="text-xl text-gray-600">Test and debug API integrations</p>
      </div>

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status Overview
          </CardTitle>
          <CardDescription>Current status of all API integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon result={parallelResult} />
                <div>
                  <div className="font-medium">Parallel.ai API</div>
                  <div className="text-sm text-gray-500">Primary data source</div>
                </div>
              </div>
              <StatusBadge result={parallelResult} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon result={openaiResult} />
                <div>
                  <div className="font-medium">OpenAI API</div>
                  <div className="text-sm text-gray-500">Fallback analysis</div>
                </div>
              </div>
              <StatusBadge result={openaiResult} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon result={fullTestResult} />
                <div>
                  <div className="font-medium">Full Analysis</div>
                  <div className="text-sm text-gray-500">Complete workflow</div>
                </div>
              </div>
              <StatusBadge result={fullTestResult} />
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button onClick={runAllTests} className="flex-1">
              <TestTube className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Testing */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="parallel" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="parallel">Parallel API</TabsTrigger>
              <TabsTrigger value="openai">OpenAI API</TabsTrigger>
              <TabsTrigger value="full">Full Analysis</TabsTrigger>
              <TabsTrigger value="setup">Setup Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="parallel" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Parallel.ai API Test</h3>
                  <p className="text-sm text-gray-600">Test real-time web data extraction</p>
                </div>
                <Button onClick={testParallelAPI} disabled={loading.parallel}>
                  {loading.parallel ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Parallel API"
                  )}
                </Button>
              </div>

              {parallelResult && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <StatusIcon result={parallelResult} />
                      <span className="font-medium">{parallelResult.message}</span>
                    </div>
                    {parallelResult.details && (
                      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(parallelResult.details, null, 2)}
                      </pre>
                    )}
                    {parallelResult.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">
                        {parallelResult.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="openai" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">OpenAI API Test</h3>
                  <p className="text-sm text-gray-600">Test AI analysis capabilities</p>
                </div>
                <Button onClick={testOpenAI} disabled={loading.openai}>
                  {loading.openai ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test OpenAI API"
                  )}
                </Button>
              </div>

              {openaiResult && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <StatusIcon result={openaiResult} />
                      <span className="font-medium">{openaiResult.message}</span>
                    </div>
                    {openaiResult.details && (
                      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(openaiResult.details, null, 2)}
                      </pre>
                    )}
                    {openaiResult.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">
                        {openaiResult.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="full" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Full Analysis Test</h3>
                  <p className="text-sm text-gray-600">Test complete workflow with Apple Inc</p>
                </div>
                <Button onClick={testFullAnalysis} disabled={loading.full}>
                  {loading.full ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Full Analysis"
                  )}
                </Button>
              </div>

              {fullTestResult && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <StatusIcon result={fullTestResult} />
                      <span className="font-medium">{fullTestResult.message}</span>
                    </div>
                    {fullTestResult.details && (
                      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(fullTestResult.details, null, 2)}
                      </pre>
                    )}
                    {fullTestResult.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">
                        {fullTestResult.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="setup" className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">API Setup Guide</h3>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">1. Parallel.ai API Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Status:</strong> Your Parallel.ai API key is configured
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          Key: HPGIfubbqwk9rLzdb0-hJ28cp8e6_4o7yLLt4JuK (configured)
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Parallel.ai provides real-time web data extraction and is your primary data source.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">2. OpenAI API Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Action Required:</strong> OpenAI API key needs to be configured
                        </p>
                        <p className="text-sm text-yellow-600 mt-1">
                          Visit{" "}
                          <a
                            href="https://platform.openai.com/account/api-keys"
                            className="underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            platform.openai.com
                          </a>{" "}
                          to get your API key
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        OpenAI serves as a fallback when Parallel.ai is unavailable.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">3. Environment Variables</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 border rounded p-4">
                        <pre className="text-sm">
                          {`# Add to your .env.local file:
PARALLEL_API_KEY=your-parallel-api-key
OPENAI_API_KEY=your-openai-api-key`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">4. Testing Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                        <li>Configure your API keys in the environment variables</li>
                        <li>Test individual APIs using the tabs above</li>
                        <li>Run the full analysis test to verify the complete workflow</li>
                        <li>Return to the main dashboard to analyze companies</li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
