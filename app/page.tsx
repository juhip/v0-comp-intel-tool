"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Search, Loader2, Users, DollarSign, Target, TrendingUp, Globe, Award } from "lucide-react"

interface CompanyIntel {
  company_name: string
  location: string
  one_liner: string
  position_title: string
  industry: string
  number_of_employees: string
  funding: string
  valuation: string
  chairman_ceo: string
  leadership: string[]
  latest_deals: string[]
  investors: string[]
  company_offerings: string[]
  vision_mission: string
  values: string[]
  brands_services: string[]
  product_categories: string[]
  new_products: string[]
  future_priorities: string[]
  number_of_customers: string
  geographies: string[]
  competitors: string[]
  revenue: string
  margin: string
  pov_on_company: string
  unique_characteristics: string[]
  strengths: string[]
  weaknesses: string[]
  metrics: string[]
  opportunities: string[]
  threats: string[]
  products_like: string[]
  products_improve: string[]
}

interface CompetitorData {
  company_name: string
  one_liner: string
  funding: string
  investors: string[]
  positioning: string
  product_differentiation: string[]
  customers: string
  pricing: string
}

interface CompetitorAnalysis {
  target_company: string
  competitors: CompetitorData[]
}

export default function CompanyIntelligenceTool() {
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [companyData, setCompanyData] = useState<CompanyIntel | null>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "competitive">("overview")
  const [competitiveData, setCompetitiveData] = useState<CompetitorAnalysis | null>(null)

  const analyzeCompany = async () => {
    if (!companyName.trim()) return

    setLoading(true)
    setError("")

    try {
      // Company Intelligence Task
      const companyTaskPayload = {
        task_description: `Comprehensive company intelligence analysis for ${companyName}`,
        research_query: `Conduct a comprehensive business intelligence analysis of ${companyName}. Gather detailed information about the company's business model, leadership, financials, competitive position, and strategic outlook. Focus on publicly available information from official sources, news articles, financial reports, and industry analyses.`,
        structured_outputs: {
          company_name: "string",
          location: "string (headquarters location)",
          one_liner: "string (brief company description)",
          position_title: "string (market position/category leader)",
          industry: "string",
          number_of_employees: "string",
          funding: "string (total funding raised)",
          valuation: "string (latest valuation)",
          chairman_ceo: "string (current CEO/Chairman name)",
          leadership: ["array of key leadership team members"],
          latest_deals: ["array of recent acquisitions, partnerships, or major deals"],
          investors: ["array of key investors and VCs"],
          company_offerings: ["array of main products/services"],
          vision_mission: "string (company vision and mission statement)",
          values: ["array of company core values"],
          brands_services: ["array of brand names and service offerings"],
          product_categories: ["array of product/service categories"],
          new_products: ["array of recently launched products/services"],
          future_priorities: ["array of strategic priorities and future plans"],
          number_of_customers: "string (customer base size)",
          geographies: ["array of geographic markets served"],
          competitors: ["array of main competitors"],
          revenue: "string (latest annual revenue)",
          margin: "string (profit margin information)",
          pov_on_company: "string (market perspective and analyst view)",
          unique_characteristics: ["array of unique differentiators"],
          strengths: ["array of company strengths"],
          weaknesses: ["array of company weaknesses"],
          metrics: ["array of key performance metrics"],
          opportunities: ["array of market opportunities"],
          threats: ["array of potential threats"],
          products_like: ["array of well-regarded products/services"],
          products_improve: ["array of products/services needing improvement"],
        },
        research_sources: [
          "Company official website and investor relations",
          "SEC filings and financial reports",
          "Recent news articles and press releases",
          "Industry analyst reports",
          "LinkedIn company page and leadership profiles",
          "Crunchbase and funding databases",
          "Customer reviews and testimonials",
          "Competitor analysis reports",
        ],
      }

      // Competitive Intelligence Task
      const competitiveTaskPayload = {
        task_description: `Competitive intelligence analysis for ${companyName} and its main competitors`,
        research_query: `Identify the top 5-7 direct competitors of ${companyName} and analyze their positioning, funding, products, customers, and pricing strategies. Focus on companies in the same industry and market segment.`,
        structured_outputs: {
          target_company: "string",
          competitors: [
            {
              company_name: "string",
              one_liner: "string (brief company description)",
              funding: "string (total funding raised or revenue if public)",
              investors: ["array of key investors"],
              positioning: "string (market positioning and value proposition)",
              product_differentiation: ["array of key differentiators and unique features"],
              customers: "string (target customer segments and notable clients)",
              pricing: "string (pricing model and typical price points)",
            },
          ],
        },
        research_sources: [
          "Company websites and about pages",
          "Crunchbase and funding databases",
          "Pricing pages and product documentation",
          "Customer case studies and testimonials",
          "Industry reports and competitive analyses",
          "Recent funding announcements",
          "Product comparison sites",
        ],
      }

      // Fetch both company data and competitive intelligence
      const [companyResponse, competitiveResponse] = await Promise.all([
        fetch("/api/parallel-research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(companyTaskPayload),
        }),
        fetch("/api/parallel-research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(competitiveTaskPayload),
        }),
      ])

      if (!companyResponse.ok || !competitiveResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const [companyData, competitiveDataResult] = await Promise.all([
        companyResponse.json(),
        competitiveResponse.json(),
      ])

      if (companyData.demo || competitiveDataResult.demo) {
        setError("Using demo data - API integration in progress")
      }

      setCompanyData(companyData.results)
      setCompetitiveData(competitiveDataResult.results)
    } catch (err) {
      console.error("Error:", err)
      setError("Failed to analyze company. Please check your API configuration.")
    } finally {
      setLoading(false)
    }
  }

  const InfoSection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      {children}
    </div>
  )

  const InfoRow = ({ label, value }: { label: string; value: string | string[] | object }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-gray-100">
      <div className="font-medium text-gray-700">{label}</div>
      <div className="md:col-span-2">
        {Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.map((item, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {typeof item === "object" ? JSON.stringify(item) : String(item)}
              </Badge>
            ))}
          </div>
        ) : typeof value === "object" && value !== null ? (
          <span className="text-gray-900">{JSON.stringify(value)}</span>
        ) : (
          <span className="text-gray-900">{String(value)}</span>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Company Intelligence Tool</h1>
          <p className="text-xl text-gray-600">Powered by Parallel API - Get comprehensive insights on any company</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Company Research
            </CardTitle>
            <CardDescription>Enter any company name to get detailed business intelligence and analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter company name (e.g., Apple, Microsoft, Tesla)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && analyzeCompany()}
                className="flex-1"
              />
              <Button onClick={analyzeCompany} disabled={loading || !companyName.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
            {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
          </CardContent>
        </Card>

        {(companyData || competitiveData) && (
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-6 py-3 font-medium ${
                    activeTab === "overview"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Company Overview
                </button>
                <button
                  onClick={() => setActiveTab("competitive")}
                  className={`px-6 py-3 font-medium ${
                    activeTab === "competitive"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Competitive Intelligence
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "overview" && companyData && (
          <div className="space-y-6">
            {/* Company Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  {companyData.company_name}
                </CardTitle>
                <CardDescription className="text-lg">{companyData.one_liner}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Location" value={companyData.location} />
                <InfoRow label="Industry" value={companyData.industry} />
                <InfoRow label="Market Position" value={companyData.position_title} />
                <InfoRow label="Employees" value={companyData.number_of_employees} />
                <InfoRow label="CEO/Chairman" value={companyData.chairman_ceo} />
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Revenue" value={companyData.revenue} />
                <InfoRow label="Margin" value={companyData.margin} />
                <InfoRow label="Funding" value={companyData.funding} />
                <InfoRow label="Valuation" value={companyData.valuation} />
                <InfoRow label="Investors" value={companyData.investors} />
              </CardContent>
            </Card>

            {/* Leadership & Deals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Leadership & Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Leadership Team" value={companyData.leadership} />
                <InfoRow label="Latest Deals" value={companyData.latest_deals} />
              </CardContent>
            </Card>

            {/* Products & Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Products & Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Main Offerings" value={companyData.company_offerings} />
                <InfoRow label="Brands/Services" value={companyData.brands_services} />
                <InfoRow label="Product Categories" value={companyData.product_categories} />
                <InfoRow label="New Products" value={companyData.new_products} />
              </CardContent>
            </Card>

            {/* Market Position */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Market Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Customer Base" value={companyData.number_of_customers} />
                <InfoRow label="Geographic Presence" value={companyData.geographies} />
                <InfoRow label="Main Competitors" value={companyData.competitors} />
                <InfoRow label="Key Metrics" value={companyData.metrics} />
              </CardContent>
            </Card>

            {/* Strategic Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Strategic Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Vision & Mission" value={companyData.vision_mission} />
                <InfoRow label="Core Values" value={companyData.values} />
                <InfoRow label="Future Priorities" value={companyData.future_priorities} />
                <InfoRow label="Market Perspective" value={companyData.pov_on_company} />
              </CardContent>
            </Card>

            {/* SWOT Analysis */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Strengths & Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow label="Strengths" value={companyData.strengths} />
                  <InfoRow label="Opportunities" value={companyData.opportunities} />
                  <InfoRow label="Unique Characteristics" value={companyData.unique_characteristics} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700">Weaknesses & Threats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow label="Weaknesses" value={companyData.weaknesses} />
                  <InfoRow label="Threats" value={companyData.threats} />
                </CardContent>
              </Card>
            </div>

            {/* Product Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Product Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Well-Regarded Products" value={companyData.products_like} />
                <InfoRow label="Products to Improve" value={companyData.products_improve} />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "competitive" && competitiveData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Competitive Landscape Analysis
                </CardTitle>
                <CardDescription>
                  Comprehensive comparison of {competitiveData.target_company} and its main competitors
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Competitive Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Competitor Comparison Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-3 font-semibold bg-gray-50">Company</th>
                        <th className="text-left p-3 font-semibold bg-gray-50">One Liner</th>
                        <th className="text-left p-3 font-semibold bg-gray-50">Funding</th>
                        <th className="text-left p-3 font-semibold bg-gray-50">Investors</th>
                        <th className="text-left p-3 font-semibold bg-gray-50">Positioning</th>
                        <th className="text-left p-3 font-semibold bg-gray-50">Differentiation</th>
                        <th className="text-left p-3 font-semibold bg-gray-50">Customers</th>
                        <th className="text-left p-3 font-semibold bg-gray-50">Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitiveData.competitors.map((competitor, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-medium text-blue-600">{competitor.company_name}</td>
                          <td className="p-3 max-w-xs">
                            <div className="text-sm text-gray-700">{competitor.one_liner}</div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {competitor.funding}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {competitor.investors.slice(0, 2).map((investor, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {investor}
                                </Badge>
                              ))}
                              {competitor.investors.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{competitor.investors.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3 max-w-xs">
                            <div className="text-sm text-gray-700">{competitor.positioning}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {competitor.product_differentiation.slice(0, 2).map((diff, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {diff}
                                </Badge>
                              ))}
                              {competitor.product_differentiation.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{competitor.product_differentiation.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3 max-w-xs">
                            <div className="text-sm text-gray-700">{competitor.customers}</div>
                          </td>
                          <td className="p-3">
                            <Badge variant="default" className="text-xs">
                              {competitor.pricing}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Individual Competitor Cards */}
            <div className="grid gap-6">
              {competitiveData.competitors.map((competitor, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {competitor.company_name}
                    </CardTitle>
                    <CardDescription>{competitor.one_liner}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoRow label="Funding" value={competitor.funding} />
                    <InfoRow label="Key Investors" value={competitor.investors} />
                    <InfoRow label="Market Positioning" value={competitor.positioning} />
                    <InfoRow label="Product Differentiation" value={competitor.product_differentiation} />
                    <InfoRow label="Target Customers" value={competitor.customers} />
                    <InfoRow label="Pricing Model" value={competitor.pricing} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
