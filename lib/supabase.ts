import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available and valid
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate URL format
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return url.startsWith("https://") && url.includes(".supabase.co")
  } catch {
    return false
  }
}

// Check if we have valid configuration
export const isSupabaseConfigured = isValidUrl(supabaseUrl) && !!supabaseAnonKey

// Lazy initialization of Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured")
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)
  }

  return supabaseClient
}

// Export a safe client that checks configuration first
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    if (!isSupabaseConfigured) {
      // Return a function that throws an error for any method call
      return () => {
        throw new Error(
          "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
        )
      }
    }

    const client = getSupabaseClient()
    const value = client[prop as keyof typeof client]

    if (typeof value === "function") {
      return value.bind(client)
    }

    return value
  },
})

// Log configuration status in development
if (typeof window === "undefined" && process.env.NODE_ENV === "development") {
  console.log("Supabase configuration status:", {
    hasUrl: !!supabaseUrl,
    hasValidUrl: isValidUrl(supabaseUrl),
    hasKey: !!supabaseAnonKey,
    isConfigured: isSupabaseConfigured,
  })
}

// Database types remain the same...
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company?: string | null
          role?: string
        }
        Update: {
          full_name?: string | null
          company?: string | null
          role?: string
        }
      }
      company_analyses: {
        Row: {
          id: string
          user_id: string
          company_name: string
          analysis_data: any
          competitive_data: any | null
          status: "pending" | "processing" | "completed" | "failed"
          is_public: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          company_name: string
          analysis_data: any
          competitive_data?: any | null
          status?: "pending" | "processing" | "completed" | "failed"
          is_public?: boolean
          tags?: string[]
        }
        Update: {
          company_name?: string
          analysis_data?: any
          competitive_data?: any | null
          status?: "pending" | "processing" | "completed" | "failed"
          is_public?: boolean
          tags?: string[]
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: "free" | "pro" | "enterprise"
          analyses_used: number
          analyses_limit: number
          reset_date: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          plan?: "free" | "pro" | "enterprise"
          analyses_used?: number
          analyses_limit?: number
          reset_date?: string
        }
        Update: {
          plan?: "free" | "pro" | "enterprise"
          analyses_used?: number
          analyses_limit?: number
          reset_date?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
      }
      shared_analyses: {
        Row: {
          id: string
          analysis_id: string
          shared_by: string
          shared_with: string
          permission: "view" | "edit"
          created_at: string
        }
        Insert: {
          analysis_id: string
          shared_by: string
          shared_with: string
          permission?: "view" | "edit"
        }
        Update: {
          permission?: "view" | "edit"
        }
      }
      analysis_history: {
        Row: {
          id: string
          analysis_id: string
          user_id: string
          changes: any
          action: "created" | "updated" | "shared" | "exported"
          created_at: string
        }
        Insert: {
          analysis_id: string
          user_id: string
          changes: any
          action: "created" | "updated" | "shared" | "exported"
        }
        Update: never
      }
    }
  }
}

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]
export type CompanyAnalysis = Database["public"]["Tables"]["company_analyses"]["Row"]
export type UserSubscription = Database["public"]["Tables"]["user_subscriptions"]["Row"]
export type SharedAnalysis = Database["public"]["Tables"]["shared_analyses"]["Row"]
export type AnalysisHistory = Database["public"]["Tables"]["analysis_history"]["Row"]
