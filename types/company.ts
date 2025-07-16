export interface CompanyIntel {
  // Basic Info
  companyName: string
  location: string
  oneLiner: string
  positionTitle: string
  industry: string
  numberOfEmployees: string

  // Funding & Valuation
  funding: string
  valuation: string

  // Leadership
  chairmanCEO: string
  leadership: string[]

  // Business Details
  latestDeals: string[]
  investors: string[]
  companyOfferings: string[]
  visionMission: string
  values: string[]
  brandsServices: string[]
  productServiceCategories: string[]
  newProducts: string[]
  futurePriorities: string[]

  // Market Presence
  numberOfCustomers: string
  geographiesOfPresence: string[]
  competitors: string[]

  // Financials
  revenue: string
  margin: string

  // Analysis
  povOnCompany: string
  uniqueCharacteristics: string[]
  strengths: string[]
  weaknesses: string[]
  metrics: string[]
  opportunities: string[]
  threats: string[]
  insights: string[]
  productsServicesLiked: string[]
  productsServicesToImprove: string[]
}

export interface CompanySearchResult {
  company: string
  data: CompanyIntel
  loading: boolean
  error?: string
}
