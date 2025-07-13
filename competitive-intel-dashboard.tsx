"use client"

import { useState, useCallback, useEffect } from "react"
import { CompanySearchForm } from "./components/company-search-form"
import { CompanyIntelTable } from "./components/company-intel-table"
import { fetchCompanyIntel } from "./services/parallel-api"
import type { CompanySearchResult } from "./types/company"
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import { toast } from "sonner"
import { useAuth } from "./lib/auth-context"
import { DatabaseService } from "./lib/database-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Info } from 'lucide-react'
import Link from "next/link"
import type { CompanyAnalysis } from "./lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CompetitiveIntelDashboard() {
  const { user, subscription, loading: authLoading, isConfigured } = useAuth()
  const [companies, setCompanies] = useState<CompanySearchResult[]>([])
  const [savedAnalyses, setSavedAnalyses] = useState<CompanyAnalysis[]>([])
  const [usageInfo, setUsageInfo] = useState<{
    canAnalyze: boolean
    used: number
    limit: number
    plan: string
  } | null>(null)

  // Load user's saved analyses on mount
  useEffect(() => {
    if (user && isConfigured) {
      loadSavedAnalyses()
      checkUsageLimit()
    } else if (!isConfigured) {
      // In demo mode, set unlimited usage
      setUsageInfo({
        canAnalyze: true,
        used: 0,
        limit: 999,
        plan: "demo",
      })
    }
  }, [user, isConfigured])

  const loadSavedAnalyses = async () => {
    if (!user || !isConfigured) return

    const analyses = await DatabaseService.getUserAnalyses(user.id)
    setSavedAnalyses(analyses)
  }

  const checkUsageLimit = async () => {
    if (!user) return

    const usage = await DatabaseService.checkUsageLimit(user.id)
    setUsageInfo(usage)
  }

  const addCompany = useCallback(
    async (companyName: string) => {
      // In demo mode, allow analysis without authentication
      if (isConfigured && !user) {
        toast.error("Please sign in to analyze companies")
        return
      }

      // Check usage limit (only if configured and authenticated)
      if (isConfigured && user && usageInfo && !usageInfo.canAnalyze) {
        toast.error(`Usage limit reached (${usageInfo.used}/${usageInfo.limit}). Upgrade your plan to continue.`)
        return
      }

      // Add company with loading state
      const newCompany: CompanySearchResult = {
        company: companyName,
        data: {} as any,
        loading: true,
      }

      setCompanies((prev) => [...prev, newCompany])

      try {
        toast.info(`Starting comprehensive analysis for ${companyName}. This may take a few moments...`)

        // Fetch company data
        const companyData = await fetchCompanyIntel(companyName)

        // Save to database (only if configured and authenticated)
        if (isConfigured && user) {
          const savedAnalysis = await DatabaseService.saveAnalysis(
            user.id,
            companyName,
            companyData,
            companyData.competitive_analysis,
          )

          if (savedAnalysis) {
            // Increment usage count
            await DatabaseService.incrementUsage(user.id)

            // Refresh usage info
            await checkUsageLimit()

            // Refresh saved analyses
            await loadSavedAnalyses()
          }
        }

        setCompanies((prev) =>
          prev.map((company) =>
            company.company === companyName ? { ...company, data: companyData, loading: false } : company,
          ),
        )

        const successMessage = isConfigured && user 
          ? `Successfully analyzed ${companyName} and saved to your dashboard`
          : `Successfully analyzed ${companyName} (demo mode - not saved)`
        
        toast.success(successMessage)
      } catch (error) {
        console.error("Error analyzing company:", error)

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

        setCompanies((prev) =>
          prev.map((company) =>
            company.company === companyName ? { ...company, loading: false, error: errorMessage } : company,
          ),
        )

        toast.error(`Failed to analyze ${companyName}: ${errorMessage}`)
      }
    },
    [user, usageInfo, isConfigured],
  )

  const removeCompany = useCallback((companyName: string) => {
    setCompanies((prev) => prev.filter((company) => company.company !== companyName))
  }, [])

  const refreshCompany = useCallback(async (companyName: string) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.company === companyName ? { ...company, loading: true, error: undefined } : company,
      ),
    )

    try {
      const companyData = await fetchCompanyIntel(companyName)

      setCompanies((prev) =>
        prev.map((company) =>
          company.company === companyName ? { ...company, data: companyData, loading: false } : company,
        ),
      )

      toast.success(`Refreshed data for ${companyName}`)
    } catch (error) {
      setCompanies((prev) =>
        prev.map((company) =>
          company.company === companyName ? { ...company, loading: false, error: "Failed to fetch data" } : company,
        ),
      )

      toast.error(`Failed to refresh ${companyName}`)
    }
  }, [])

  const exportData = useCallback(() => {
    const dataToExport = companies
      .filter((c) => !c.loading && !c.error)
      .map((c) => ({
        company: c.company,
        analysis_date: new Date().toISOString(),
        company_intelligence: c.data,
        competitive_analysis: c.data?.competitive_analysis || null,
      }))

    const jsonString = JSON.stringify(dataToExport, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `competitive-intel-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Competitive intelligence data exported successfully")
  }, [companies])

  const loadSavedAnalysis = (analysis: CompanyAnalysis) => {
    const companyResult: CompanySearchResult = {
      company: analysis.company_name,
      data: analysis.analysis_data,
      loading: false,
    }

    setCompanies((prev) => {
      const existing = prev.find((c) => c.company === analysis.company_name)
      if (existing) {
        return prev.map((c) => (c.company === analysis.company_name ? companyResult : c))
      }
      return [...prev, companyResult]
    })
  }

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show demo mode or authenticated mode
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Competitive Intelligence Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive company analysis with automatic competitive intelligence
          </p>
          {usageInfo && (
            <p className="text-sm text-muted-foreground mt-1">
              Usage: {usageInfo.used}/{usageInfo.limit} analyses ({usageInfo.plan} plan)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {!isConfigured && (
            <Button variant="outline" asChild>
              <Link href="/auth/signin">Sign In (Demo)</Link>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={exportData}
            disabled={companies.filter((c) => !c.loading && !c.error).length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Configuration Status Alert */}
      {!isConfigured ? (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong>Demo Mode:</strong> Database not configured. You can analyze companies but data won't be saved.
            <br />
            <span className="text-sm">Configure Supabase to enable user accounts and data persistence.</span>
          </AlertDescription>
        </Alert>
      ) : !user ? (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>Sign in required:</strong> Create an account to save analyses and track usage limits.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Authenticated Mode:</strong> Your analyses are being saved and you have access to all features.
          </AlertDescription>
        </Alert>
      )}

      <CompanySearchForm
        onAddCompany={addCompany}
        searchedCompanies={companies.map((c) => c.company)}
        onRemoveCompany={removeCompany}
        usageInfo={usageInfo}
      />

      {/* Show saved analyses only if configured and authenticated */}
      {isConfigured && user && savedAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Saved Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedAnalyses.slice(0, 6).map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => loadSavedAnalysis(analysis)}
                >
                  <h3 className="font-medium">{analysis.company_name}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(analysis.created_at).toLocaleDateString()}</p>
                  <Badge variant="outline" className="mt-2">
                    {analysis.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <CompanyIntelTable companies={companies} onRefresh={refreshCompany} />
    </div>
  )
}
