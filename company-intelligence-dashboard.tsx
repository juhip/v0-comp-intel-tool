"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompanySearchForm } from "./components/company-search-form"
import { CompanyIntelligenceDisplay } from "./components/company-intelligence-display"
import { CompetitiveAnalysisDisplay } from "./components/competitive-analysis-display"
import { ApiStatusDisplay } from "./components/api-status-display"
import { ModeIndicator } from "./components/mode-indicator"
import { fetchCompanyIntel } from "./services/parallel-api"
import type { CompanySearchResult } from "./types/company"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Settings } from "lucide-react"
import { toast } from "sonner"
import { ApiSetupGuide } from "./components/api-setup-guide"

export default function CompanyIntelligenceDashboard() {
  const [currentCompany, setCurrentCompany] = useState<CompanySearchResult | null>(null)
  const [activeTab, setActiveTab] = useState("company-intel")
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  const searchCompany = useCallback(async (companyName: string) => {
    // Set loading state for company intelligence
    setCurrentCompany({
      company: companyName,
      data: {} as any,
      loading: true,
    })

    try {
      toast.info(`Analyzing ${companyName} with comprehensive intelligence. This may take a few moments...`)

      const companyData = await fetchCompanyIntel(companyName)

      setCurrentCompany({
        company: companyName,
        data: companyData,
        loading: false,
      })

      toast.success(`Successfully analyzed ${companyName} with competitive intelligence`)
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

  const refreshCompany = useCallback(async () => {
    if (currentCompany && !currentCompany.loading) {
      await searchCompany(currentCompany.company)
    }
  }, [currentCompany, searchCompany])

  const exportData = useCallback(() => {
    if (currentCompany && !currentCompany.loading && !currentCompany.error) {
      const exportData = {
        company_intelligence: currentCompany.data,
        competitive_analysis: currentCompany.data.competitive_analysis,
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
  }, [currentCompany])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Company Intelligence Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analysis with competitive intelligence - powered by Parallel.ai</p>
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
      <ApiStatusDisplay />

      {/* Mode Indicator */}
      <ModeIndicator />

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
          <CompetitiveAnalysisDisplay
            data={currentCompany?.data?.competitive_analysis}
            loading={currentCompany?.loading || false}
            error={currentCompany?.error}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
