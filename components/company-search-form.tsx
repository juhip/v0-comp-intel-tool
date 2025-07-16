"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"

interface CompanySearchFormProps {
  onSearch: (companyName: string) => void
  loading: boolean
}

export function CompanySearchForm({ onSearch, loading }: CompanySearchFormProps) {
  const [companyName, setCompanyName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (companyName.trim() && !loading) {
      onSearch(companyName.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Enter company name (e.g., Tesla, Apple, Microsoft)"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        disabled={loading}
        className="flex-1"
      />
      <Button type="submit" disabled={!companyName.trim() || loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        {loading ? "Analyzing..." : "Analyze"}
      </Button>
    </form>
  )
}
