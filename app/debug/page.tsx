"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TestResult {
  test: string
  endpoint: string
  method: string
  status: number
  statusText: string
  success: boolean
  headers?: Record<string, string>
  responseData?: any
  runId?: string
  error?: string
}

interface ApiTestResponse {
  apiKeyPresent: boolean
  apiKeyLength: number
  apiKeyPrefix: string
  totalTests: number
  successfulTests: number
  failedTests: number
  results: TestResult[]
  recommendations: Array<{
    type: string
    message: string
    details?: string[]
    suggestions?: string[]
  }>
  documentation: {
    endpoint: string
    authHeader: string
    method: string
    format: string
  }
}

export default function DebugPage() {
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<ApiTestResponse | null>(null)

  const runApiTests = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-parallel")
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      console.error("Failed to run API tests:", error)
      setTestResults({
        apiKeyPresent: false,
        apiKeyLength: 0,
        apiKeyPrefix: "Error",
        totalTests: 0,
        successfulTests: 0,
        failedTests: 1,
        results: [
          {
            test: "Connection Test",
            endpoint: "/api/test-parallel",
            method: "GET",
            status: 0,
            statusText: "Network Error",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        ],
        recommendations: [
          {
            type: "error",
            message: "Failed to connect to debug API",
            suggestions: ["Check your network connection", "Refresh the page and try again"],
          },
        ],
        documentation: {
          endpoint: "https://api.parallel.ai/v1/tasks/runs",
          authHeader: "x-api-key",
          method: "POST",
          format: "Parallel Task API v1",
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600"
    if (status >= 400 && status < 500) return "text-red-600"
    if (status >= 500) return "text-purple-600"
    return "text-gray-600"
  }

  const getStatusIcon = (success: boolean, status: number) => {
    if (success) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (status === 401) return <XCircle className="h-4 w-4 text-red-600" />
    if (status === 404) return <AlertCircle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-gray-600" />
  }

  const getRecommendationStyle = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-500 text-green-800"
      case "auth_error":
        return "bg-red-50 border-red-500 text-red-800"
      case "request_error":
        return "bg-yellow-50 border-yellow-500 text-yellow-800"
      case "no_success":
        return "bg-blue-50 border-blue-500 text-blue-800"
      default:
        return "bg-gray-50 border-gray-500 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4" />
            Back to Company Intelligence Tool
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Parallel API Debug Console</h1>
          <p className="text-xl text-gray-600">Test and diagnose Parallel API integration</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API Connection Test</CardTitle>
            <CardDescription>
              Test the Parallel API using the official endpoint and authentication method from their documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Expected Configuration:</h4>
                <div className="space-y-1 text-sm font-mono">
                  <div>
                    <strong>Endpoint:</strong> https://api.parallel.ai/v1/tasks/runs
                  </div>
                  <div>
                    <strong>Method:</strong> POST
                  </div>
                  <div>
                    <strong>Auth Header:</strong> x-api-key
                  </div>
                  <div>
                    <strong>Content-Type:</strong> application/json
                  </div>
                </div>
              </div>

              <Button onClick={runApiTests} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing API Connection...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run API Tests
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {testResults && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Test Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{testResults.totalTests}</div>
                    <div className="text-sm text-gray-600">Total Tests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{testResults.successfulTests}</div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{testResults.failedTests}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{testResults.apiKeyPresent ? "✓" : "✗"}</div>
                    <div className="text-sm text-gray-600">API Key</div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <h4 className="font-semibold mb-2">API Key Status</h4>
                  <div className="space-y-1 text-sm">
                    <div>Present: {testResults.apiKeyPresent ? "✅ Yes" : "❌ No"}</div>
                    <div>Length: {testResults.apiKeyLength} characters</div>
                    <div>Preview: {testResults.apiKeyPrefix}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {testResults.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {testResults.recommendations.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${getRecommendationStyle(rec.type)}`}>
                      <h4 className="font-semibold mb-2">{rec.message}</h4>
                      {rec.details && (
                        <div className="mb-2">
                          <strong>Details:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {rec.details.map((detail, idx) => (
                              <li key={idx} className="text-sm">
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {rec.suggestions && (
                        <div>
                          <strong>Suggestions:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {rec.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-sm">
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Detailed Results */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.success, result.status)}
                          <h4 className="font-semibold">{result.test}</h4>
                        </div>
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.status} {result.statusText}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Endpoint:</strong>
                          <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">
                            {result.method} {result.endpoint}
                          </code>
                        </div>

                        {result.runId && (
                          <div>
                            <strong>Run ID:</strong>
                            <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">{result.runId}</code>
                          </div>
                        )}
                      </div>

                      {result.error && (
                        <div className="mt-3">
                          <strong className="text-red-600">Error:</strong>
                          <div className="bg-red-50 p-2 rounded mt-1 text-sm text-red-700">{result.error}</div>
                        </div>
                      )}

                      {result.responseData && (
                        <div className="mt-3">
                          <strong className="text-green-600">Response:</strong>
                          <pre className="bg-green-50 p-2 rounded mt-1 text-xs overflow-x-auto">
                            {JSON.stringify(result.responseData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
