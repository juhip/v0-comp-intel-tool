"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, SendHorizonal } from "lucide-react"
import { toast } from "sonner"

export function LindyTester() {
  const [company, setCompany] = useState("Apple")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")

  const trigger = async () => {
    setLoading(true)
    setResult("")
    try {
      const res = await fetch("/api/lindy/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, includeCompetitive: true }),
      })
      const text = await res.text()
      setResult(text)
      if (res.ok) toast.success("Lindy request succeeded")
      else toast.error(`Lindy request failed: ${res.status}`)
    } catch (e: any) {
      toast.error(e?.message ?? "Request failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lindy Webhook Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company (e.g., Apple)" />
          <Button onClick={trigger} disabled={!company || loading} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <SendHorizonal className="h-4 w-4 mr-2" />}
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
        {result ? <pre className="max-h-72 overflow-auto rounded bg-muted p-3 text-xs">{result}</pre> : null}
      </CardContent>
    </Card>
  )
}
