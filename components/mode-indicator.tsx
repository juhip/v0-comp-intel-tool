"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

interface ConfigStatus {
  mode: "live" | "demo"
  primaryApi: string | null
  apis: Record<string, any>
}

export function ModeIndicator() {
  const [status, setStatus] = useState<ConfigStatus | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/config-status")
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        setStatus({ mode: "demo", primaryApi: null, apis: {} })
      }
    }

    fetchStatus()
  }, [])

  if (!status) return null

  const isLiveMode = status.mode === "live"
  const hasDatabase = status.apis.supabase?.configured

  return (
    <Alert className={isLiveMode ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
      {isLiveMode ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <AlertCircle className="h-4 w-4 text-orange-600" />
      )}
      <AlertDescription>
        {isLiveMode ? (
          <>
            <strong>Live Mode:</strong> Using {status.apis[status.primaryApi!]?.name} for real-time analysis
            {hasDatabase ? " with data persistence" : " (no database configured)"}
          </>
        ) : (
          <>
            <strong>Demo Mode:</strong> No API keys configured. Using comprehensive sample data for demonstration.
            <br />
            <span className="text-sm">Configure API keys for real-time web intelligence.</span>
          </>
        )}
      </AlertDescription>
    </Alert>
  )
}
