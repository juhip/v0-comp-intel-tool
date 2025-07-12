"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Target, TrendingUp, AlertTriangle, Users, BarChart3, Shield, Zap, Eye, Lightbulb } from "lucide-react"

interface CompetitiveAnalysisDisplayProps {
  data: any
  loading: boolean
  error?: string
}

export function CompetitiveAnalysisDisplay({ data, loading, error }: CompetitiveAnalysisDisplayProps) {
  if (loading) {
    return <CompetitiveAnalysisSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive">Failed to load competitive analysis</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No competitive analysis data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Analysis for {data.main_company}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Market Size</h4>
              <p className="text-sm text-muted-foreground">{data.market_analysis?.market_size || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Growth Rate</h4>
              <p className="text-sm text-muted-foreground">{data.market_analysis?.growth_rate || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Trends</h4>
              <div className="flex flex-wrap gap-1">
                {data.market_analysis?.key_trends?.map((trend: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {trend}
                  </Badge>
                )) || <span className="text-sm text-muted-foreground">N/A</span>}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Barriers to Entry</h4>
              <div className="flex flex-wrap gap-1">
                {data.market_analysis?.barriers_to_entry?.map((barrier: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {barrier}
                  </Badge>
                )) || <span className="text-sm text-muted-foreground">N/A</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Positioning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Competitive Positioning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-green-600">Market Leader</h4>
              <p className="text-sm">{data.competitive_positioning?.market_leader || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">Challengers</h4>
              <div className="space-y-1">
                {data.competitive_positioning?.market_challengers?.map((challenger: string, index: number) => (
                  <p key={index} className="text-sm">
                    {challenger}
                  </p>
                )) || <span className="text-sm text-muted-foreground">N/A</span>}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-orange-600">Followers</h4>
              <div className="space-y-1">
                {data.competitive_positioning?.market_followers?.map((follower: string, index: number) => (
                  <p key={index} className="text-sm">
                    {follower}
                  </p>
                )) || <span className="text-sm text-muted-foreground">N/A</span>}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-purple-600">Niche Players</h4>
              <div className="space-y-1">
                {data.competitive_positioning?.niche_players?.map((player: string, index: number) => (
                  <p key={index} className="text-sm">
                    {player}
                  </p>
                )) || <span className="text-sm text-muted-foreground">N/A</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.competitors?.map((competitor: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {competitor.name}
                </span>
                <Badge
                  variant={
                    competitor.threat_level === "High"
                      ? "destructive"
                      : competitor.threat_level === "Medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {competitor.threat_level} Threat
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Market Share</h4>
                <p className="text-sm text-muted-foreground">{competitor.market_share}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-1 text-green-600">
                  <Shield className="h-3 w-3" />
                  Strengths
                </h4>
                <div className="space-y-1">
                  {competitor.strengths?.map((strength: string, idx: number) => (
                    <p key={idx} className="text-xs p-1 bg-green-50 rounded">
                      {strength}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  Weaknesses
                </h4>
                <div className="space-y-1">
                  {competitor.weaknesses?.map((weakness: string, idx: number) => (
                    <p key={idx} className="text-xs p-1 bg-red-50 rounded">
                      {weakness}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Key Products</h4>
                <div className="flex flex-wrap gap-1">
                  {competitor.key_products?.map((product: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Competitive Advantage
                </h4>
                <p className="text-xs text-muted-foreground">{competitor.competitive_advantage}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SWOT Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            SWOT Analysis: {data.main_company}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.swot_comparison && data.swot_comparison[data.main_company] && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Strengths
                  </h4>
                  <div className="space-y-1">
                    {data.swot_comparison[data.main_company].strengths?.map((strength: string, index: number) => (
                      <p key={index} className="text-sm p-2 bg-green-50 border-l-2 border-green-400 rounded-r">
                        {strength}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-blue-600 flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Opportunities
                  </h4>
                  <div className="space-y-1">
                    {data.swot_comparison[data.main_company].opportunities?.map(
                      (opportunity: string, index: number) => (
                        <p key={index} className="text-sm p-2 bg-blue-50 border-l-2 border-blue-400 rounded-r">
                          {opportunity}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Weaknesses
                  </h4>
                  <div className="space-y-1">
                    {data.swot_comparison[data.main_company].weaknesses?.map((weakness: string, index: number) => (
                      <p key={index} className="text-sm p-2 bg-orange-50 border-l-2 border-orange-400 rounded-r">
                        {weakness}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Threats
                  </h4>
                  <div className="space-y-1">
                    {data.swot_comparison[data.main_company].threats?.map((threat: string, index: number) => (
                      <p key={index} className="text-sm p-2 bg-red-50 border-l-2 border-red-400 rounded-r">
                        {threat}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recommendations?.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-sm">{recommendation}</p>
              </div>
            )) || <span className="text-sm text-muted-foreground">No recommendations available</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CompetitiveAnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
