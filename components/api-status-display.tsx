"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface ApiConfig {
  configured: boolean
  name: string
  description: string
  priority: number
}

interface ConfigStatus {
  mode: "live" | "demo"
  primaryApi: string | null
  apis: Record<string, ApiConfig>
  timestamp: string
}

export function ApiStatusDisplay() {
  const [status, setStatus] = useState<ConfigStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/config-status")
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Failed to fetch config status:", error)
        // Fallback to demo mode
        setStatus({
          mode: "demo",
          primaryApi: null,
          apis: {},
          timestamp: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Checking configuration...</span>
      </div>
    )
  }

  if (!status) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Demo Mode
      </Badge>
    )
  }

  const configuredApis = Object.entries(status.apis).filter(([_, config]) => config.configured)

  return (
    <div className="flex gap-2 flex-wrap">
      {configuredApis.length > 0 ? (
        configuredApis.map(([key, config]) => (
          <Badge key={key} variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {config.name} {key === status.primaryApi ? "✓ PRIMARY" : "✓"}
          </Badge>
        ))
      ) : (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Demo Mode
        </Badge>
      )}
    </div>
  )
}
