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

  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasXAI = !!process.env.XAI_API_KEY
  const hasParallel = !!process.env.PARALLEL_API_KEY

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Setup Guide
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant={hasOpenAI ? "default" : "secondary"} className="flex items-center gap-1">
            {hasOpenAI ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            OpenAI {hasOpenAI ? "Configured" : "Not Set"}
          </Badge>
          <Badge variant={hasXAI ? "default" : "secondary"} className="flex items-center gap-1">
            {hasXAI ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            xAI {hasXAI ? "Configured" : "Not Set"}
          </Badge>
          <Badge variant={hasParallel ? "default" : "secondary"} className="flex items-center gap-1">
            {hasParallel ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            Parallel.ai {hasParallel ? "Configured" : "Not Set"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="openai" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="openai">OpenAI (Primary)</TabsTrigger>
            <TabsTrigger value="xai">xAI (Grok)</TabsTrigger>
            <TabsTrigger value="parallel">Parallel.ai</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="openai" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>OpenAI</strong> provides reliable, fast AI-powered analysis using GPT-4. Recommended as primary
                API.
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

          <TabsContent value="xai" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>xAI (Grok)</strong> provides real-time data access and analysis. Great for current information.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Get Your API Key</h3>
                <p className="text-sm text-muted-foreground mb-2">Sign up at xAI Console and get your API key.</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://console.x.ai" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get xAI API Key
                  </a>
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Set Environment Variable</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Add this to your .env.local file:</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm flex items-center justify-between">
                    <span>XAI_API_KEY=your_xai_api_key_here</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("XAI_API_KEY=your_xai_api_key_here", "xAI env var")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Features</h3>
                <p className="text-sm text-muted-foreground">
                  Grok provides real-time web access and can provide more current information than other models.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="parallel" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Parallel.ai</strong> specializes in real-time web data extraction and structured output.
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
                  Parallel.ai provides real-time web data extraction for the most up-to-date company information.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Environment Variables Template</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Create a .env.local file with these variables:</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    <div># .env.local</div>
                    <div>OPENAI_API_KEY=your_openai_api_key_here</div>
                    <div>XAI_API_KEY=your_xai_api_key_here</div>
                    <div>PARALLEL_API_KEY=your_parallel_api_key_here</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        "# .env.local\nOPENAI_API_KEY=your_openai_api_key_here\nXAI_API_KEY=your_xai_api_key_here\nPARALLEL_API_KEY=your_parallel_api_key_here",
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
                <h3 className="font-semibold mb-2">Vercel Deployment</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    1. Go to your Vercel project dashboard
                    <br />
                    2. Navigate to Settings → Environment Variables
                    <br />
                    3. Add your API keys as environment variables
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">API Priority Order</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>1. OpenAI</strong> - Fast, reliable, cost-effective
                  </p>
                  <p>
                    <strong>2. xAI</strong> - Real-time data, current information
                  </p>
                  <p>
                    <strong>3. Parallel.ai</strong> - Web extraction, structured data
                  </p>
                  <p>
                    <strong>4. Sample Data</strong> - Fallback when no APIs available
                  </p>
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
