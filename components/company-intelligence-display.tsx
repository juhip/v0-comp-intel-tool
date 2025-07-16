"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Building2,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Award,
  Globe,
  Lightbulb,
  BarChart3,
  Eye,
  Heart,
  AlertCircle,
  Calendar,
  MapPin,
} from "lucide-react"
import type { CompanySearchResult, CompanyIntelligence } from "../types/company"

interface CompanyIntelligenceDisplayProps {
  company: CompanySearchResult | null
}

export function CompanyIntelligenceDisplay({ company }: CompanyIntelligenceDisplayProps) {
  if (!company) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Enter a company name to start intelligence analysis</p>
        </CardContent>
      </Card>
    )
  }

  if (company.loading) {
    return <CompanyIntelligenceSkeleton />
  }

  if (company.error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive">Failed to load company data</p>
            <p className="text-sm text-muted-foreground">{company.error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const data = company.data as CompanyIntelligence

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Company Intelligence</h2>
      </div>

      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {data.companyName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{data.headquarters}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Founded {data.founded}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{data.employees} employees</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{data.revenue}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{data.marketCap}</span>
            </div>
            <div>
              <Badge variant="secondary">{data.industry}</Badge>
            </div>
          </div>
          <p className="text-muted-foreground">{data.description}</p>
        </CardContent>
      </Card>

      {/* Key Products */}
      <Card>
        <CardHeader>
          <CardTitle>Key Products & Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.keyProducts.map((product, index) => (
              <Badge key={index} variant="outline">
                {product}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent News */}
      <Card>
        <CardHeader>
          <CardTitle>Recent News & Developments</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.recentNews.map((news, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{news}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Company Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="h-6 w-6" />
            {data.companyName}
          </CardTitle>
          <p className="text-lg text-muted-foreground">{data.oneLiner}</p>
        </CardHeader>
      </Card>

      {/* Main Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Basic Information",
            icon: Building2,
            items: [
              { label: "Location", value: data.location },
              { label: "Industry", value: data.industry },
              { label: "Position Title", value: data.positionTitle },
              { label: "Number of Employees", value: data.numberOfEmployees },
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
            icon: Globe,
            items: [
              { label: "Number of Customers", value: data.numberOfCustomers },
              { label: "Geographies", value: data.geographiesOfPresence?.join(", ") || "N/A" },
              { label: "Competitors", value: data.competitors?.join(", ") || "N/A" },
            ],
          },
          {
            title: "Strategic Strengths",
            icon: TrendingUp,
            items: [
              { label: "Strengths", value: data.strengths?.join(", ") || "N/A" },
              { label: "Opportunities", value: data.opportunities?.join(", ") || "N/A" },
              { label: "Unique Characteristics", value: data.uniqueCharacteristics?.join(", ") || "N/A" },
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
        ].map((section) => (
          <Card key={section.title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <section.icon className="h-4 w-4" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.label} className="text-sm">
                    <span className="font-medium text-muted-foreground">{item.label}:</span>
                    <span className="ml-2">{item.value || "N/A"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vision & Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{data.visionMission || "N/A"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Company Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{data.povOnCompany || "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Products and Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Company Offerings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {data.companyOfferings?.map((offering: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {offering}
                </Badge>
              )) || <span className="text-sm text-muted-foreground">N/A</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Brands & Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {data.brandsServices?.map((brand: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {brand}
                </Badge>
              )) || <span className="text-sm text-muted-foreground">N/A</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Innovation and Future */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              New Products & Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.newProducts?.map((product: string, index: number) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  {product}
                </div>
              )) || <span className="text-sm text-muted-foreground">N/A</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Future Priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.futurePriorities?.map((priority: string, index: number) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  {priority}
                </div>
              )) || <span className="text-sm text-muted-foreground">N/A</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment and Deals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Latest Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.latestDeals?.map((deal: string, index: number) => (
                <div key={index} className="text-sm p-2 border-l-2 border-primary pl-3">
                  {deal}
                </div>
              )) || <span className="text-sm text-muted-foreground">N/A</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Investors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {data.investors?.map((investor: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {investor}
                </Badge>
              )) || <span className="text-sm text-muted-foreground">N/A</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Values and Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Company Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {data.values?.map((value: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {value}
                </Badge>
              )) || <span className="text-sm text-muted-foreground">N/A</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.metrics?.map((metric: string, index: number) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  {metric}
                </div>
              )) || <span className="text-sm text-muted-foreground">N/A</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              Products/Services You Like
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.productsServicesLiked?.map((item: string, index: number) => (
                <div key={index} className="text-sm p-2 bg-green-50 border border-green-200 rounded">
                  {item}
                </div>
              )) || <span className="text-sm text-muted-foreground">N/A</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              Products/Services to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.productsServicesToImprove?.map((item: string, index: number) => (
                <div key={index} className="text-sm p-2 bg-orange-50 border border-orange-200 rounded">
                  {item}
                </div>
              )) || <span className="text-sm text-muted-foreground">N/A</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Strategic Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.insights?.map((insight: string, index: number) => (
              <div key={index} className="text-sm p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                {insight}
              </div>
            )) || <span className="text-sm text-muted-foreground">No insights available</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CompanyIntelligenceSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-32 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
