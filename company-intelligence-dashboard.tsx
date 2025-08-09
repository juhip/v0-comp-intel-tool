"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompanySearchForm } from "./components/company-search-form"
import { CompanyIntelligenceDisplay } from "./components/company-intelligence-display"
import { CompetitiveAnalysisDisplay } from "./components/competitive-analysis-display"
import { fetchCompanyIntel, fetchCompetitiveAnalysis } from "./services/parallel-api"
import type { CompanySearchResult } from "./types/company"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, CheckCircle } from "lucide-react"
import { ApiSetupGuide } from "./components/api-setup-guide"
import { Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { WebhookTester } from "./components/webhook-tester"
import { LindyTester } from "./components/lindy-tester"

export default function CompanyIntelligenceDashboard() {
  const [currentCompany, setCurrentCompany] = useState<CompanySearchResult | null>(null)
  const [competitiveData, setCompetitiveData] = useState<any>(null)
  const [competitiveLoading, setCompetitiveLoading] = useState(false)
  const [competitiveError, setCompetitiveError] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState("company-intel")
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  const searchCompany = useCallback(async (companyName: string) => {
    // Set loading state for company intelligence
    setCurrentCompany({
      company: companyName,
      data: {} as any,
      loading: true,
    })

    // Set loading state for competitive analysis immediately
    setCompetitiveData(null)
    setCompetitiveLoading(true)
    setCompetitiveError(undefined)

    try {
      toast.info(`Analyzing ${companyName} with Parallel.ai. This may take a few moments...`)

      const companyData = await fetchCompanyIntel(companyName)

      setCurrentCompany({
        company: companyName,
        data: companyData,
        loading: false,
      })

      toast.success(`Successfully analyzed ${companyName}`)

      // Always load competitive analysis automatically
      loadCompetitiveAnalysis(companyName)
    } catch (error) {
      console.error("Error analyzing company:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      setCurrentCompany({
        company: companyName,
        data: {} as any,
        loading: false,
        error: errorMessage,
      })

      // Still try to load competitive analysis even if company intel fails
      loadCompetitiveAnalysis(companyName)

      toast.error(`Failed to analyze ${companyName}: ${errorMessage}`)
    }
  }, [])

  const loadCompetitiveAnalysis = useCallback(async (companyName: string) => {
    setCompetitiveLoading(true)
    setCompetitiveError(undefined)

    try {
      toast.info(`Loading competitive analysis for ${companyName} with Parallel.ai...`)

      const competitiveAnalysis = await fetchCompetitiveAnalysis(companyName)
      setCompetitiveData(competitiveAnalysis)

      toast.success(`Competitive analysis loaded for ${companyName}`)
    } catch (error) {
      console.error("Error loading competitive analysis:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setCompetitiveError(errorMessage)
      toast.error(`Failed to load competitive analysis: ${errorMessage}`)
    } finally {
      setCompetitiveLoading(false)
    }
  }, [])

  const refreshCompany = useCallback(async () => {
    if (currentCompany && !currentCompany.loading) {
      await searchCompany(currentCompany.company)
    }
  }, [currentCompany, searchCompany])

  const exportData = useCallback(() => {
    if (currentCompany && !currentCompany.loading && !currentCompany.error) {
      const exportData = {
        company_intelligence: currentCompany.data,
        competitive_analysis: competitiveData,
        export_date: new Date().toISOString(),
      }

      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${currentCompany.company.toLowerCase().replace(/\s+/g, "-")}-complete-analysis-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Complete analysis data exported successfully")
    }
  }, [currentCompany, competitiveData])

  const hasParallel = !!process.env.PARALLEL_API_KEY
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasLindy = !!process.env.LINDY_WEBHOOK_URL && !!process.env.LINDY_WEBHOOK_SECRET
  const hasAnyApi = hasParallel || hasOpenAI

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Company Intelligence Dashboard</h1>
          <p className="text-muted-foreground">Powered by Parallel.ai web intelligence</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSetupGuide(true)}>
            <Settings className="h-4 w-4 mr-2" />
            API Setup
          </Button>
          {currentCompany && !currentCompany.loading && (
            <>
              <Button variant="outline" onClick={refreshCompany} disabled={currentCompany.loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportData} disabled={currentCompany.loading || currentCompany.error}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </>
          )}
        </div>
      </div>

      {/* API Status Display */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant={hasLindy ? "default" : "secondary"} className="flex items-center gap-1">
          {hasLindy && <CheckCircle className="h-3 w-3" />}
          Lindy {hasLindy ? "✓ PRIMARY" : "✗"}
        </Badge>
        <Badge variant={hasParallel ? "default" : "secondary"} className="flex items-center gap-1">
          {hasParallel && <CheckCircle className="h-3 w-3" />}
          Parallel.ai {hasParallel ? "✓ PRIMARY" : "✗"}
        </Badge>
        <Badge variant={hasOpenAI ? "default" : "secondary"} className="flex items-center gap-1">
          {hasOpenAI && <CheckCircle className="h-3 w-3" />}
          OpenAI {hasOpenAI ? "✓ FALLBACK" : "✗"}
        </Badge>
      </div>

      <div className="max-w-xl">
        <LindyTester />
      </div>

      <div className="max-w-md">
        <WebhookTester />
      </div>

      {hasAnyApi ? (
        <Alert className="border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Live Mode:</strong> {hasLindy && "Lindy (PRIMARY)"}
            {hasParallel && (hasLindy ? " → Parallel.ai (FALLBACK)" : "Parallel.ai (FALLBACK)")}
            {hasOpenAI && " → OpenAI (FALLBACK)"} → Sample Data configured for real-time web intelligence.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>Demo Mode:</strong> No API keys configured. The dashboard will show comprehensive sample data.
            <br />
            <span className="text-sm">Configure Parallel.ai (primary) or OpenAI (fallback) for real-time data.</span>
          </AlertDescription>
        </Alert>
      )}

      {showSetupGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <ApiSetupGuide onClose={() => setShowSetupGuide(false)} />
          </div>
        </div>
      )}

      <CompanySearchForm onSearchCompany={searchCompany} isLoading={currentCompany?.loading || false} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="company-intel">Company Intelligence</TabsTrigger>
          <TabsTrigger value="competitive-intel">Competitive Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="company-intel" className="space-y-6">
          <CompanyIntelligenceDisplay company={currentCompany} />
        </TabsContent>

        <TabsContent value="competitive-intel" className="space-y-6">
          <CompetitiveAnalysisDisplay data={competitiveData} loading={competitiveLoading} error={competitiveError} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
