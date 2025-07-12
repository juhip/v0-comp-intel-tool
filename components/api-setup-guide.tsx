"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, Key, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface ApiSetupGuideProps {
  onClose?: () => void
}

export function ApiSetupGuide({ onClose }: ApiSetupGuideProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const hasParallelKey = !!process.env.PARALLEL_API_KEY
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Setup Guide
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant={hasParallelKey ? "default" : "secondary"} className="flex items-center gap-1">
            {hasParallelKey ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            Parallel.ai {hasParallelKey ? "Configured" : "Not Set"}
          </Badge>
          <Badge variant={hasOpenAIKey ? "default" : "secondary"} className="flex items-center gap-1">
            {hasOpenAIKey ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            OpenAI {hasOpenAIKey ? "Configured" : "Not Set"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="parallel" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="parallel">Parallel.ai (Primary)</TabsTrigger>
            <TabsTrigger value="openai">OpenAI (Fallback)</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="parallel" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Parallel.ai</strong> is the primary API for real-time web data extraction and company
                intelligence.
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
                <h3 className="font-semibold mb-2">3. API Usage</h3>
                <p className="text-sm text-muted-foreground">
                  Parallel.ai provides real-time web data extraction for the most up-to-date company information. Check
                  their pricing page for current rates.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="openai" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>OpenAI</strong> serves as a fallback when Parallel.ai is unavailable, using GPT-4 for analysis.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Get Your API Key</h3>
                <p className="text-sm text-muted-foreground mb-2">Sign up at OpenAI Platform and create an API key.</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get OpenAI API Key
                  </a>
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Set Environment Variable</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Add this to your .env.local file:</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm flex items-center justify-between">
                    <span>OPENAI_API_KEY=your_openai_api_key_here</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("OPENAI_API_KEY=your_openai_api_key_here", "OpenAI env var")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Cost Estimation</h3>
                <p className="text-sm text-muted-foreground">
                  Each company analysis uses approximately 2000-4000 tokens (~$0.06-$0.12 per analysis with GPT-4).
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Vercel Deployment</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    1. Go to your Vercel project dashboard
                    <br />
                    2. Navigate to Settings → Environment Variables
                    <br />
                    3. Add your API keys:
                  </p>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span>PARALLEL_API_KEY = your_key_here</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("PARALLEL_API_KEY", "Variable name")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>OPENAI_API_KEY = your_key_here</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("OPENAI_API_KEY", "Variable name")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Other Platforms</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Netlify:</strong> Site settings → Environment variables
                  </p>
                  <p>
                    <strong>Railway:</strong> Variables tab in your project
                  </p>
                  <p>
                    <strong>Heroku:</strong> Settings → Config Vars
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Local Development</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Create a .env.local file in your project root:</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    <div># .env.local</div>
                    <div>PARALLEL_API_KEY=your_parallel_api_key_here</div>
                    <div>OPENAI_API_KEY=your_openai_api_key_here</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        "# .env.local\nPARALLEL_API_KEY=your_parallel_api_key_here\nOPENAI_API_KEY=your_openai_api_key_here",
                        ".env.local content",
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy .env.local Template
                  </Button>
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
