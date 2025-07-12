"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, Users, DollarSign, Target, TrendingUp, AlertTriangle } from "lucide-react"
import type { CompanySearchResult } from "../types/company"

interface CompanyIntelTableProps {
  companies: CompanySearchResult[]
}

export function CompanyIntelTable({ companies }: CompanyIntelTableProps) {
  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Add companies to start competitive analysis</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {companies.map((result) => (
        <Card key={result.company} className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {result.company}
              {result.loading && <Skeleton className="h-4 w-20" />}
              {result.error && <Badge variant="destructive">Error</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.loading ? (
              <CompanyIntelSkeleton />
            ) : result.error ? (
              <div className="text-destructive">Failed to load data: {result.error}</div>
            ) : (
              <CompanyIntelDetails data={result.data} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CompanyIntelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}

function CompanyIntelDetails({ data }: { data: any }) {
  const sections = [
    {
      title: "Basic Information",
      icon: Building2,
      items: [
        { label: "Location", value: data.location },
        { label: "One Liner", value: data.oneLiner },
        { label: "Industry", value: data.industry },
        { label: "Employees", value: data.numberOfEmployees },
      ],
    },
    {
      title: "Financial Information",
      icon: DollarSign,
      items: [
        { label: "Funding", value: data.funding },
        { label: "Valuation", value: data.valuation },
        { label: "Revenue", value: data.revenue },
        { label: "Margin", value: data.margin },
      ],
    },
    {
      title: "Leadership",
      icon: Users,
      items: [
        { label: "Chairman/CEO", value: data.chairmanCEO },
        { label: "Leadership Team", value: data.leadership?.join(", ") || "N/A" },
      ],
    },
    {
      title: "Market Presence",
      icon: Target,
      items: [
        { label: "Customers", value: data.numberOfCustomers },
        { label: "Geographies", value: data.geographiesOfPresence?.join(", ") || "N/A" },
        { label: "Competitors", value: data.competitors?.join(", ") || "N/A" },
      ],
    },
    {
      title: "Strategic Analysis",
      icon: TrendingUp,
      items: [
        { label: "Strengths", value: data.strengths?.join(", ") || "N/A" },
        { label: "Opportunities", value: data.opportunities?.join(", ") || "N/A" },
      ],
    },
    {
      title: "Risk Assessment",
      icon: AlertTriangle,
      items: [
        { label: "Weaknesses", value: data.weaknesses?.join(", ") || "N/A" },
        { label: "Threats", value: data.threats?.join(", ") || "N/A" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Card key={section.title} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="h-4 w-4" />
              <h4 className="font-semibold text-sm">{section.title}</h4>
            </div>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div key={item.label} className="text-sm">
                  <span className="font-medium text-muted-foreground">{item.label}:</span>
                  <span className="ml-2">{item.value || "N/A"}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Additional detailed sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Vision & Mission</h4>
          <p className="text-sm text-muted-foreground">{data.visionMission || "N/A"}</p>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-2">Company Analysis</h4>
          <p className="text-sm text-muted-foreground">{data.povOnCompany || "N/A"}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Products/Services</h4>
          <div className="flex flex-wrap gap-1">
            {data.companyOfferings?.map((offering: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {offering}
              </Badge>
            )) || <span className="text-sm text-muted-foreground">N/A</span>}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-2">Recent Investors</h4>
          <div className="flex flex-wrap gap-1">
            {data.investors?.map((investor: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {investor}
              </Badge>
            )) || <span className="text-sm text-muted-foreground">N/A</span>}
          </div>
        </Card>
      </div>
    </div>
  )
}
