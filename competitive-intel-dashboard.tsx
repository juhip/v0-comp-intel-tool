"use client"

import { useState, useCallback } from "react"
import { CompanySearchForm } from "./components/company-search-form"
import { CompanyIntelTable } from "./components/company-intel-table"
import { fetchCompanyIntel } from "./services/parallel-api"
import type { CompanySearchResult } from "./types/company"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

export default function CompetitiveIntelDashboard() {
  const [companies, setCompanies] = useState<CompanySearchResult[]>([])

  const addCompany = useCallback(async (companyName: string) => {
    // Check if API key is available
    if (!process.env.PARALLEL_API_KEY) {
      toast.error("Parallel API key not configured. Please set PARALLEL_API_KEY environment variable.")
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
      toast.info(`Starting analysis for ${companyName}. This may take a few moments...`)

      const companyData = await fetchCompanyIntel(companyName)

      setCompanies((prev) =>
        prev.map((company) =>
          company.company === companyName ? { ...company, data: companyData, loading: false } : company,
        ),
      )

      toast.success(`Successfully analyzed ${companyName}`)
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
  }, [])

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
    const dataToExport = companies.filter((c) => !c.loading && !c.error).map((c) => c.data)
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

    toast.success("Data exported successfully")
  }, [companies])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Competitive Intelligence Dashboard</h1>
        <div className="flex gap-2">
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

      <CompanySearchForm
        onAddCompany={addCompany}
        searchedCompanies={companies.map((c) => c.company)}
        onRemoveCompany={removeCompany}
      />

      <CompanyIntelTable companies={companies} />
    </div>
  )
}
