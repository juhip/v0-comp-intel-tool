import { ApiSetupGuide } from "@/components/api-setup-guide"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">API Configuration</h1>
            <p className="text-muted-foreground">Set up your API keys for real-time company intelligence</p>
          </div>
          <ApiSetupGuide />
        </div>
      </div>
    </div>
  )
}
