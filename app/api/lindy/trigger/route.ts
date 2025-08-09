// Server-side proxy to call your Lindy public webhook URL safely.
// POST /api/lindy/trigger  { company: string, includeCompetitive?: boolean, metadata?: object }
//
// Required env vars (server):
//   - LINDY_WEBHOOK_URL
//   - LINDY_WEBHOOK_SECRET
// Optional:
//   - LINDY_AUTH_HEADER (default "Authorization"; e.g. "X-Api-Key")
//
// This keeps your Lindy secret on the server.

export async function GET() {
  // Simple readiness check for HealthCheck component
  const ok = !!process.env.LINDY_WEBHOOK_URL && !!process.env.LINDY_WEBHOOK_SECRET
  return Response.json({
    ok,
    hasUrl: !!process.env.LINDY_WEBHOOK_URL,
    hasSecret: !!process.env.LINDY_WEBHOOK_SECRET,
  })
}

export async function POST(req: Request) {
  const LINDY_WEBHOOK_URL = process.env.LINDY_WEBHOOK_URL
  const LINDY_WEBHOOK_SECRET = process.env.LINDY_WEBHOOK_SECRET
  const LINDY_AUTH_HEADER = process.env.LINDY_AUTH_HEADER || "Authorization" // or "X-Api-Key"

  if (!LINDY_WEBHOOK_URL) return new Response("LINDY_WEBHOOK_URL not configured", { status: 501 })
  if (!LINDY_WEBHOOK_SECRET) return new Response("LINDY_WEBHOOK_SECRET not configured", { status: 501 })

  let input: any
  try {
    input = await req.json() // Next.js Route Handlers support reading JSON bodies [^1]
  } catch {
    return new Response("Invalid JSON body", { status: 400 })
  }

  const company = input?.company ?? input?.companyName ?? input?.name ?? input?.query
  if (!company || typeof company !== "string") {
    return new Response("Missing company in body", { status: 400 })
  }

  const includeCompetitive = typeof input?.includeCompetitive === "boolean" ? input.includeCompetitive : true

  const payload = {
    company,
    include_competitive: includeCompetitive,
    format: "dashboard_v1",
    request_id: crypto.randomUUID(),
    metadata: input?.metadata ?? {},
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (LINDY_AUTH_HEADER.toLowerCase() === "authorization") {
    headers[LINDY_AUTH_HEADER] = `Bearer ${LINDY_WEBHOOK_SECRET}`
  } else {
    headers[LINDY_AUTH_HEADER] = LINDY_WEBHOOK_SECRET
  }
  // Also include a generic secret header for compatibility if Lindy supports it.
  headers["X-Webhook-Secret"] = LINDY_WEBHOOK_SECRET

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)

  try {
    const upstream = await fetch(LINDY_WEBHOOK_URL, {
      method: "POST",
      signal: controller.signal,
      headers,
      body: JSON.stringify(payload),
    })

    const text = await upstream.text()
    try {
      const json = JSON.parse(text)
      return new Response(JSON.stringify(json), {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      })
    } catch {
      return new Response(text || "Upstream returned non-JSON", {
        status: upstream.status,
        headers: { "Content-Type": "text/plain" },
      })
    }
  } catch (err: any) {
    const message = err?.name === "AbortError" ? "Upstream timeout" : (err?.message ?? "Upstream error")
    return new Response(message, { status: 504 })
  } finally {
    clearTimeout(timeout)
  }
}
