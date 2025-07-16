"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Download, RefreshCw, Settings, AlertCircle, Info, CheckCircle } from "lucide-react"
import { CompanySearchForm } from "./components/company-search-form"
import { CompanyIntelligenceDisplay } from "./components/company-intelligence-display"
import { CompetitiveAnalysisDisplay } from "./components/competitive-analysis-display"
import { ApiSetupGuide } from "./components/api-setup-guide"
import type { CompanyIntelligence, CompetitiveAnalysis } from "./types/company"
import { useEffect } from "react"

interface ConfigStatus {
  mode: "live" | "demo"
  apis: Record<string, { configured: boolean; name: string }>
}

export default function CompanyIntelligenceDashboard() {
  const [companyData, setCompanyData] = useState<CompanyIntelligence | null>(null)
  const [competitiveData, setCompetitiveData] = useState<CompetitiveAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [dataSource, setDataSource] = useState<string>("")
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null)

  useEffect(() => {
    const fetchConfigStatus = async () => {
      try {
        const response = await fetch("/api/config-status")
        const data = await response.json()
        setConfigStatus(data)
      } catch (error) {
        console.error("Failed to fetch config status:", error)
        setConfigStatus({
          mode: "demo",
          apis: {
            parallel: { configured: false, name: "Parallel.ai" },
          },
        })
      }
    }

    fetchConfigStatus()
  }, [])

  const handleSearch = async (companyName: string) => {
    setLoading(true)
    setError(null)
    setCompanyData(null)
    setCompetitiveData(null)

    try {
      const response = await fetch("/api/parallel-research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setCompanyData(data.companyIntelligence)
      setCompetitiveData(data.competitiveAnalysis)
      setDataSource(data.dataSource || "Unknown")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (companyData?.companyName) {
      handleSearch(companyData.companyName)
    }
  }

  const handleExport = () => {
    if (!companyData || !competitiveData) return

    const exportData = {
      companyIntelligence: companyData,
      competitiveAnalysis: competitiveData,
      dataSource,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${companyData.companyName.toLowerCase().replace(/\s+/g, "-")}-analysis.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const hasParallel = configStatus?.apis.parallel?.configured || false

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Company Intelligence Dashboard</h1>
              <p className="text-slate-600 text-lg">Real-time competitive analysis and market intelligence</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSetup(true)}>
                <Settings className="w-4 h-4 mr-2" />
                API Setup
              </Button>
              {companyData && (
                <>
                  <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* API Status Display */}
          {configStatus && (
            <div className="flex gap-2 flex-wrap mb-4">
              <Badge variant={hasParallel ? "default" : "secondary"} className="flex items-center gap-1">
                {hasParallel && <CheckCircle className="h-3 w-3" />}
                Parallel.ai {hasParallel ? "✓ CONFIGURED" : "✗ NOT SET"}
              </Badge>
            </div>
          )}

          {/* Mode Indicator */}
          {configStatus && (
            <>
              {hasParallel ? (
                <Alert className="border-green-200 bg-green-50 mb-6">
                  <Info className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong>Live Mode:</strong> Parallel.ai configured for real-time web intelligence with automatic
                    competitive analysis.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-orange-200 bg-orange-50 mb-6">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <strong>Demo Mode:</strong> No API key configured. The dashboard will show comprehensive sample data
                    including competitive analysis for Tesla and Apple.
                    <br />
                    <span className="text-sm">Configure Parallel.ai for real-time data.</span>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Data Source Indicator */}
          {dataSource && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                Data Source: {dataSource}
              </Badge>
            </div>
          )}
        </div>

        {/* Setup Guide Modal */}
        {showSetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <ApiSetupGuide onClose={() => setShowSetup(false)} />
            </div>
          </div>
        )}

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Company Research</CardTitle>
          </CardHeader>
          <CardContent>
            <CompanySearchForm onSearch={handleSearch} loading={loading} />
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="mb-8" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Analyzing company data...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {companyData && competitiveData && !loading && (
          <div className="space-y-8">
            <CompanyIntelligenceDisplay data={companyData} />
            <CompetitiveAnalysisDisplay data={competitiveData} />
          </div>
        )}

        {/* Empty State */}
        {!companyData && !loading && !error && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">Ready to analyze companies</p>
                <p className="mb-4">Enter a company name above to get started with competitive intelligence</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleSearch("Tesla")}>
                    Try Tesla
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSearch("Apple")}>
                    Try Apple
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
