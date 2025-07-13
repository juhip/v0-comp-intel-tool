import { supabase, isSupabaseConfigured } from "./supabase"
import type { CompanyAnalysis } from "./supabase"
import type { CompanyIntel } from "../types/company"

export class DatabaseService {
  // Check if database is available
  static isAvailable(): boolean {
    return isSupabaseConfigured
  }

  // Safe wrapper for Supabase operations
  private static async safeSupabaseOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    if (!isSupabaseConfigured) {
      console.log("Database not configured - using fallback")
      return fallback
    }

    try {
      return await operation()
    } catch (error) {
      console.error("Database operation failed:", error)
      return fallback
    }
  }

  // Save company analysis to database
  static async saveAnalysis(
    userId: string,
    companyName: string,
    analysisData: CompanyIntel,
    competitiveData?: any,
  ): Promise<CompanyAnalysis | null> {
    return this.safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from("company_analyses")
        .insert({
          user_id: userId,
          company_name: companyName,
          analysis_data: analysisData,
          competitive_data: competitiveData,
          status: "completed",
        })
        .select()
        .single()

      if (error) throw error

      // Log the creation
      await this.logAnalysisAction(data.id, userId, "created", {
        company_name: companyName,
      })

      return data
    }, null)
  }

  // Get user's analyses
  static async getUserAnalyses(userId: string): Promise<CompanyAnalysis[]> {
    return this.safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from("company_analyses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    }, [])
  }

  // Get shared analyses
  static async getSharedAnalyses(userId: string): Promise<CompanyAnalysis[]> {
    return this.safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from("company_analyses")
        .select(`
          *,
          shared_analyses!inner(permission)
        `)
        .eq("shared_analyses.shared_with", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    }, [])
  }

  // Get single analysis
  static async getAnalysis(analysisId: string): Promise<CompanyAnalysis | null> {
    return this.safeSupabaseOperation(async () => {
      const { data, error } = await supabase.from("company_analyses").select("*").eq("id", analysisId).single()

      if (error) throw error
      return data
    }, null)
  }

  // Update analysis
  static async updateAnalysis(analysisId: string, userId: string, updates: Partial<CompanyAnalysis>): Promise<boolean> {
    return this.safeSupabaseOperation(async () => {
      const { error } = await supabase.from("company_analyses").update(updates).eq("id", analysisId)

      if (error) throw error

      // Log the update
      await this.logAnalysisAction(analysisId, userId, "updated", updates)

      return true
    }, false)
  }

  // Delete analysis
  static async deleteAnalysis(analysisId: string): Promise<boolean> {
    return this.safeSupabaseOperation(async () => {
      const { error } = await supabase.from("company_analyses").delete().eq("id", analysisId)

      if (error) throw error
      return true
    }, false)
  }

  // Share analysis
  static async shareAnalysis(
    analysisId: string,
    sharedBy: string,
    sharedWith: string,
    permission: "view" | "edit" = "view",
  ): Promise<boolean> {
    return this.safeSupabaseOperation(async () => {
      const { error } = await supabase.from("shared_analyses").insert({
        analysis_id: analysisId,
        shared_by: sharedBy,
        shared_with: sharedWith,
        permission,
      })

      if (error) throw error

      // Log the sharing
      await this.logAnalysisAction(analysisId, sharedBy, "shared", {
        shared_with: sharedWith,
        permission,
      })

      return true
    }, false)
  }

  // Check usage limits
  static async checkUsageLimit(userId: string): Promise<{
    canAnalyze: boolean
    used: number
    limit: number
    plan: string
  }> {
    return this.safeSupabaseOperation(
      async () => {
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", userId)
          .single()

        if (!subscription) {
          return { canAnalyze: false, used: 0, limit: 0, plan: "none" }
        }

        const canAnalyze = subscription.analyses_used < subscription.analyses_limit

        return {
          canAnalyze,
          used: subscription.analyses_used,
          limit: subscription.analyses_limit,
          plan: subscription.plan,
        }
      },
      { canAnalyze: true, used: 0, limit: 999, plan: "demo" },
    )
  }

  // Increment usage count
  static async incrementUsage(userId: string): Promise<boolean> {
    return this.safeSupabaseOperation(async () => {
      const { error } = await supabase.rpc("increment_analyses_used", {
        user_id: userId,
      })

      if (error) throw error
      return true
    }, true)
  }

  // Log analysis action
  static async logAnalysisAction(
    analysisId: string,
    userId: string,
    action: "created" | "updated" | "shared" | "exported",
    changes: any,
  ): Promise<void> {
    await this.safeSupabaseOperation(async () => {
      await supabase.from("analysis_history").insert({
        analysis_id: analysisId,
        user_id: userId,
        action,
        changes,
      })
    }, undefined)
  }

  // Search analyses
  static async searchAnalyses(userId: string, query: string): Promise<CompanyAnalysis[]> {
    return this.safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from("company_analyses")
        .select("*")
        .eq("user_id", userId)
        .ilike("company_name", `%${query}%`)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    }, [])
  }
}
