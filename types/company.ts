export interface CompanyIntelligence {
  companyName: string
  industry: string
  headquarters: string
  founded: string
  employees: string
  revenue: string
  marketCap: string
  description: string
  keyProducts: string[]
  recentNews: string[]
}

export interface CompetitiveAnalysis {
  marketPosition: {
    marketShare: string
    ranking: string
    description: string
  }
  keyCompetitors: Array<{
    name: string
    marketShare: string
    keyStrength: string
  }>
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}
