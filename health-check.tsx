"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function HealthCheck() {
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runHealthCheck = async () => {
    setChecking(true)

    const healthResults = {
      environment: {
        openai: !!process.env.OPENAI_API_KEY,
        xai: !!process.env.XAI_API_KEY,
        parallel: !!process.env.PARALLEL_API_KEY,
      },
      apis: {
        openai: false,
        xai: false,
        parallel: false,
      },
    }

    // Test OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch("/api/test-openai")
        healthResults.apis.openai = response.ok
      } catch (error) {
        healthResults.apis.openai = false
      }
    }

    setResults(healthResults)
    setChecking(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Dashboard Health Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Badge variant={process.env.OPENAI_API_KEY ? "default" : "secondary"}>
            {process.env.OPENAI_API_KEY ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            OpenAI {process.env.OPENAI_API_KEY ? "✓" : "✗"}
          </Badge>
          <Badge variant={process.env.XAI_API_KEY ? "default" : "secondary"}>
            {process.env.XAI_API_KEY ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            xAI {process.env.XAI_API_KEY ? "✓" : "✗"}
          </Badge>
          <Badge variant={process.env.PARALLEL_API_KEY ? "default" : "secondary"}>
            {process.env.PARALLEL_API_KEY ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            Parallel {process.env.PARALLEL_API_KEY ? "✓" : "✗"}
          </Badge>
        </div>

        <Button onClick={runHealthCheck} disabled={checking}>
          {checking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Run Health Check
        </Button>

        {results && (
          <div className="space-y-2">
            <h3 className="font-semibold">Results:</h3>
            <div className="text-sm space-y-1">
              <p>
                Environment Variables:{" "}
                {Object.values(results.environment).some(Boolean) ? "✅ Configured" : "❌ Missing"}
              </p>
              <p>API Connectivity: {Object.values(results.apis).some(Boolean) ? "✅ Working" : "❌ Issues"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
