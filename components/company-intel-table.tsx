"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, DollarSign, Target, TrendingUp, Globe, Award, RefreshCw, Loader2 } from "lucide-react"
import type { CompanySearchResult } from "../types/company"

interface CompanyIntelTableProps {
  companies: CompanySearchResult[]
  onRefresh?: (companyName: string) => void
}

export function CompanyIntelTable({ companies, onRefresh }: CompanyIntelTableProps) {
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null)

  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies analyzed yet</h3>
            <p className="text-gray-500">
              Search for a company above to get started with competitive intelligence analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    )
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
    <div className="space-y-4">
      {companies.map((company) => (
        <Card key={company.company} className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-xl">{company.company}</CardTitle>
                  {company.data?.one_liner && (
                    <CardDescription className="mt-1">{company.data.one_liner}</CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {company.loading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                )}
                {company.error && (
                  <Badge variant="destructive" className="text-xs">
                    Error: {company.error}
                  </Badge>
                )}
                {!company.loading && !company.error && (
                  <Badge variant="default" className="text-xs">
                    ✅ Complete
                  </Badge>
                )}
                {onRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRefresh(company.company)}
                    disabled={company.loading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedCompany(expandedCompany === company.company ? null : company.company)}
                >
                  {expandedCompany === company.company ? "Collapse" : "Expand"}
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedCompany === company.company && company.data && !company.loading && (
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Company Overview</TabsTrigger>
                  <TabsTrigger value="competitive">Competitive Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  {/* Company Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Company Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <InfoRow label="Location" value={company.data.location} />
                      <InfoRow label="Industry" value={company.data.industry} />
                      <InfoRow label="Market Position" value={company.data.position_title} />
                      <InfoRow label="Employees" value={company.data.number_of_employees} />
                      <InfoRow label="CEO/Chairman" value={company.data.chairman_ceo} />
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
                      <InfoRow label="Revenue" value={company.data.revenue} />
                      <InfoRow label="Margin" value={company.data.margin} />
                      <InfoRow label="Funding" value={company.data.funding} />
                      <InfoRow label="Valuation" value={company.data.valuation} />
                      <InfoRow label="Investors" value={company.data.investors} />
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
                      <InfoRow label="Leadership Team" value={company.data.leadership} />
                      <InfoRow label="Latest Deals" value={company.data.latest_deals} />
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
                      <InfoRow label="Main Offerings" value={company.data.company_offerings} />
                      <InfoRow label="Brands/Services" value={company.data.brands_services} />
                      <InfoRow label="Product Categories" value={company.data.product_categories} />
                      <InfoRow label="New Products" value={company.data.new_products} />
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
                      <InfoRow label="Customer Base" value={company.data.number_of_customers} />
                      <InfoRow label="Geographic Presence" value={company.data.geographies} />
                      <InfoRow label="Main Competitors" value={company.data.competitors} />
                      <InfoRow label="Key Metrics" value={company.data.metrics} />
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
                      <InfoRow label="Vision & Mission" value={company.data.vision_mission} />
                      <InfoRow label="Core Values" value={company.data.values} />
                      <InfoRow label="Future Priorities" value={company.data.future_priorities} />
                      <InfoRow label="Market Perspective" value={company.data.pov_on_company} />
                    </CardContent>
                  </Card>

                  {/* SWOT Analysis */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-700">Strengths & Opportunities</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <InfoRow label="Strengths" value={company.data.strengths} />
                        <InfoRow label="Opportunities" value={company.data.opportunities} />
                        <InfoRow label="Unique Characteristics" value={company.data.unique_characteristics} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-red-700">Weaknesses & Threats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <InfoRow label="Weaknesses" value={company.data.weaknesses} />
                        <InfoRow label="Threats" value={company.data.threats} />
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
                      <InfoRow label="Well-Regarded Products" value={company.data.products_like} />
                      <InfoRow label="Products to Improve" value={company.data.products_improve} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="competitive" className="space-y-6 mt-6">
                  {company.data.competitive_analysis && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-6 w-6" />
                            Competitive Landscape Analysis
                          </CardTitle>
                          <CardDescription>
                            Comprehensive comparison of {company.data.competitive_analysis.target_company} and its main
                            competitors
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
                                {company.data.competitive_analysis.competitors.map((competitor, index) => (
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
                        {company.data.competitive_analysis.competitors.map((competitor, index) => (
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
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
