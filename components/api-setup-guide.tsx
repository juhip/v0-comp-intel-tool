"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, Key, CheckCircle, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface ApiSetupGuideProps {
  onClose?: () => void
}

interface ConfigStatus {
  mode: "live" | "demo"
  apis: Record<string, { configured: boolean; name: string }>
}

export function ApiSetupGuide({ onClose }: ApiSetupGuideProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/config-status")
        const data = await response.json()
        setConfigStatus(data)
      } catch (error) {
        setConfigStatus({ mode: "demo", apis: {} })
      }
    }

    fetchStatus()
  }, [])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const hasParallel = configStatus?.apis.parallel?.configured || false

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Setup Guide
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant={hasParallel ? "default" : "secondary"} className="flex items-center gap-1">
            {hasParallel ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            Parallel.ai {hasParallel ? "Configured" : "Not Set"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="parallel" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="parallel">Parallel.ai Setup</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="parallel" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Parallel.ai</strong> is the primary API for real-time web data extraction and company
                intelligence. It queries the web like a database for the most current information.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Get Your API Key</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Sign up at Parallel.ai and get your API key from the platform dashboard.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://platform.parallel.ai" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Parallel.ai API Key
                  </a>
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Set Environment Variable</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Add this to your .env.local file:</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm flex items-center justify-between">
                    <span>PARALLEL_API_KEY=your_parallel_api_key_here</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard("PARALLEL_API_KEY=your_parallel_api_key_here", "Parallel.ai env var")
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Features</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Real-time web data extraction</p>
                  <p>• Structured JSON output</p>
                  <p>• Comprehensive company intelligence</p>
                  <p>• Competitive analysis</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Environment Variables Template</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Create a .env.local file with this variable:</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    <div># .env.local - API Key</div>
                    <div>PARALLEL_API_KEY=your_parallel_api_key_here</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        "# .env.local\nPARALLEL_API_KEY=your_parallel_api_key_here",
                        ".env.local template",
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Fallback System</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>1. Parallel.ai (PRIMARY)</strong> - Real-time web data extraction
                  </p>
                  <p>
                    <strong>2. Sample Data (DEMO)</strong> - Comprehensive fallback with Tesla and Apple examples
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Security Notes</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• API key is server-side only and not exposed to the client</p>
                  <p>• Never commit .env.local to version control</p>
                  <p>• Use platform environment variables for production deployment</p>
                  <p>• Dashboard works fully in demo mode without API key</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {onClose && (
          <div className="flex justify-end mt-6">
            <Button onClick={onClose}>Close Guide</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
