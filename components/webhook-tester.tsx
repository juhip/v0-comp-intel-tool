"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, SendHorizonal } from "lucide-react"
import { toast } from "sonner"

const DEFAULT_TOKEN = "af734b729c5c7e84ace66ac9c390c951a8515c26219a82b56fee763967904668"

export function WebhookTester() {
  const [token, setToken] = useState(DEFAULT_TOKEN)
  const [isPosting, setIsPosting] = useState(false)

  const sendTestWebhook = async () => {
    setIsPosting(true)
    try {
      const res = await fetch(`/api/webhooks/parallel/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          type: "test.event",
          sent_at: new Date().toISOString(),
          payload: {
            source: "dashboard",
            message: "Test webhook from WebhookTester",
          },
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`POST failed: ${res.status} ${res.statusText} ${text ? `- ${text}` : ""}`)
      }
      toast.success("Webhook POST succeeded")
    } catch (err: any) {
      toast.error(`Webhook POST failed: ${err?.message ?? "Unknown error"}`)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Webhook Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="webhook-token">Webhook Token</Label>
          <Input
            id="webhook-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter webhook token"
          />
          <p className="text-xs text-muted-foreground">
            POSTs to {"/api/webhooks/parallel/"}
            {token || "<token>"} in this app.
          </p>
        </div>
        <Button onClick={sendTestWebhook} disabled={!token || isPosting} variant="outline">
          {isPosting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <SendHorizonal className="h-4 w-4 mr-2" />}
          {isPosting ? "Sending..." : "Send Test Webhook"}
        </Button>
      </CardContent>
    </Card>
  )
}
