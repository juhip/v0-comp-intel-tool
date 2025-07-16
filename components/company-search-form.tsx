"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Building2 } from "lucide-react"

interface CompanySearchFormProps {
  onSearchCompany: (companyName: string) => void
  isLoading: boolean
}

export function CompanySearchForm({ onSearchCompany, isLoading }: CompanySearchFormProps) {
  const [companyName, setCompanyName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (companyName.trim()) {
      onSearchCompany(companyName.trim())
    }
  }

  const suggestedCompanies = [
    "Apple",
    "Google",
    "Microsoft",
    "Amazon",
    "Tesla",
    "Meta",
    "Netflix",
    "Spotify",
    "Uber",
    "Airbnb",
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Intelligence Dashboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">Enter a company name to get comprehensive intelligence analysis</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="company-name" className="sr-only">
              Company Name
            </Label>
            <Input
              id="company-name"
              placeholder="Enter company name (e.g., Apple, Google, Microsoft)"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={!companyName.trim() || isLoading}>
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </form>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick suggestions:</Label>
          <div className="flex flex-wrap gap-2">
            {suggestedCompanies.map((company) => (
              <Button
                key={company}
                variant="outline"
                size="sm"
                onClick={() => setCompanyName(company)}
                disabled={isLoading}
                className="text-xs"
              >
                {company}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
