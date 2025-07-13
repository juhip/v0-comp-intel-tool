export interface CompanyIntel {
  // Basic Info
  company_name: string
  location: string
  one_liner: string
  position_title: string
  industry: string
  number_of_employees: string

  // Funding & Valuation
  funding: string
  valuation: string

  // Leadership
  chairman_ceo: string
  leadership: string[]

  // Business Details
  latest_deals: string[]
  investors: string[]
  company_offerings: string[]
  vision_mission: string
  values: string[]
  brands_services: string[]
  product_categories: string[]
  new_products: string[]
  future_priorities: string[]

  // Market Presence
  number_of_customers: string
  geographies: string[]
  competitors: string[]

  // Financials
  revenue: string
  margin: string

  // Analysis
  pov_on_company: string
  unique_characteristics: string[]
  strengths: string[]
  weaknesses: string[]
  metrics: string[]
  opportunities: string[]
  threats: string[]
  products_like: string[]
  products_improve: string[]

  // Competitive Analysis (now included automatically)
  competitive_analysis?: CompetitiveAnalysis
}

export interface CompetitorData {
  company_name: string
  one_liner: string
  funding: string
  investors: string[]
  positioning: string
  product_differentiation: string[]
  customers: string
  pricing: string
}

export interface CompetitiveAnalysis {
  target_company: string
  competitors: CompetitorData[]
}

export interface CompanySearchResult {
  company: string
  data: CompanyIntel
  loading: boolean
  error?: string
}
