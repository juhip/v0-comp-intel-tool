"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "./supabase"
import type { UserProfile, UserSubscription } from "./supabase"

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  subscription: UserSubscription | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If Supabase is not configured, set loading to false and return
    if (!isSupabaseConfigured) {
      console.log("Supabase not configured - running in demo mode")
      setLoading(false)
      return
    }

    // Wrap Supabase calls in try-catch to handle any remaining errors
    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await loadUserData(session.user.id)
        } else {
          setLoading(false)
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            await loadUserData(session.user.id)
          } else {
            setProfile(null)
            setSubscription(null)
            setLoading(false)
          }
        })

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Error initializing auth:", error)
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const loadUserData = async (userId: string) => {
    if (!isSupabaseConfigured) return

    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error loading profile:", profileError)
      } else if (profileData) {
        setProfile(profileData)
      }

      // Load user subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (subscriptionError && subscriptionError.code !== "PGRST116") {
        console.error("Error loading subscription:", subscriptionError)
      } else if (subscriptionData) {
        setSubscription(subscriptionData)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: { message: "Supabase not configured" } }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      return { data: null, error: { message: "Authentication service unavailable" } }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: { message: "Supabase not configured" } }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (data.user && !error) {
        // Create user profile
        await supabase.from("user_profiles").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        })

        // Create default subscription
        await supabase.from("user_subscriptions").insert({
          user_id: data.user.id,
          plan: "free",
          analyses_limit: 5,
        })
      }

      return { data, error }
    } catch (error) {
      return { data: null, error: { message: "Authentication service unavailable" } }
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) return

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !isSupabaseConfigured) return

    try {
      const { error } = await supabase.from("user_profiles").update(updates).eq("id", user.id)

      if (!error && profile) {
        setProfile({ ...profile, ...updates })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const value = {
    user,
    profile,
    subscription,
    session,
    loading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
