"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompanySearchForm } from "./components/company-search-form"
import { CompanyIntelligenceDisplay } from "./components/company-intelligence-display"
import { CompetitiveAnalysisDisplay } from "./components/competitive-analysis-display"
import { ParallelApiTester } from "./components/parallel-api-tester"
import { LiveApiTest } from "./components/live-api-test"
import { fetchCompanyIntel, fetchCompetitiveAnalysis } from "./services/parallel-api"
import type { CompanySearchResult } from "./types/company"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { ApiSetupGuide } from "./components/api-setup-guide"
import { Settings } from "lucide-react"

export default function CompanyIntelligenceDashboard() {
  const [currentCompany, setCurrentCompany] = useState<CompanySearchResult | null>(null)
  const [competitiveData, setCompetitiveData] = useState<any>(null)
  const [competitiveLoading, setCompetitiveLoading] = useState(false)
  const [competitiveError, setCompetitiveError] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState("live-test")
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  const searchCompany = useCallback(async (companyName: string) => {
    // Set loading state for company intelligence
    setCurrentCompany({
      company: companyName,
      data: {} as any,
      loading: true,
    })

    // Reset competitive analysis
    setCompetitiveData(null)
    setCompetitiveError(undefined)

    try {
      toast.info(`Analyzing ${companyName}. This may take a few moments...`)

      const companyData = await fetchCompanyIntel(companyName)

      setCurrentCompany({
        company: companyName,
        data: companyData,
        loading: false,
      })

      toast.success(`Successfully analyzed ${companyName}`)

      // Auto-load competitive analysis if we have competitor data
      if (companyData.competitors && companyData.competitors.length > 0) {
        loadCompetitiveAnalysis(companyName)
      }
    } catch (error) {
      console.error("Error analyzing company:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      setCurrentCompany({
        company: companyName,
        data: {} as any,
        loading: false,
        error: errorMessage,
      })

      toast.error(`Failed to analyze ${companyName}: ${errorMessage}`)
    }
  }, [])

  const loadCompetitiveAnalysis = useCallback(async (companyName: string) => {
    setCompetitiveLoading(true)
    setCompetitiveError(undefined)

    try {
      toast.info(`Loading competitive analysis for ${companyName}...`)

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

  const hasApiKeys = !!(process.env.PARALLEL_API_KEY || process.env.OPENAI_API_KEY)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Company Intelligence Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence with competitive analysis</p>
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

      {hasApiKeys && (
        <Alert className="border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Live Mode:</strong> Both Parallel.ai and OpenAI APIs are configured and ready for real-time data
            extraction.
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live-test">Live API Test</TabsTrigger>
          <TabsTrigger value="company-intel">Company Intelligence</TabsTrigger>
          <TabsTrigger value="competitive-intel">Competitive Intelligence</TabsTrigger>
          <TabsTrigger value="api-tester">API Tester</TabsTrigger>
        </TabsList>

        <TabsContent value="live-test" className="space-y-6">
          <LiveApiTest />
        </TabsContent>

        <TabsContent value="company-intel" className="space-y-6">
          <CompanyIntelligenceDisplay company={currentCompany} />
        </TabsContent>

        <TabsContent value="competitive-intel" className="space-y-6">
          {currentCompany &&
            !currentCompany.loading &&
            !currentCompany.error &&
            !competitiveData &&
            !competitiveLoading && (
              <div className="flex justify-center">
                <Button onClick={() => loadCompetitiveAnalysis(currentCompany.company)} disabled={competitiveLoading}>
                  Load Competitive Analysis
                </Button>
              </div>
            )}
          <CompetitiveAnalysisDisplay data={competitiveData} loading={competitiveLoading} error={competitiveError} />
        </TabsContent>

        <TabsContent value="api-tester" className="space-y-6">
          <ParallelApiTester />
        </TabsContent>
      </Tabs>
    </div>
  )
}
