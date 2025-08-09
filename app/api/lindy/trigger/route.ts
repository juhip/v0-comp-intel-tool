// Server-side proxy to call Lindy's webhook URL with a required callbackUrl.
// POST /api/lindy/trigger { company: string, includeCompetitive?: boolean, requestId?: string, metadata?: object }
//
// This route builds a callback URL at /api/lindy/callback?request_id={requestId}
// and sends it to Lindy along with your secret in multiple common headers.
//
// Uses App Router Route Handlers to read Request body and return JSON [^1].

function buildBaseUrl(req: Request) {
  // Try Origin first
  const origin = req.headers.get("origin")
  if (origin) return origin
  // Fallback to host/proto headers set by proxies
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host")
  const proto = req.headers.get("x-forwarded-proto") || "https"
  return `${proto}://${host}`
}

export async function GET() {
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
  if (!LINDY_WEBHOOK_URL) return new Response("LINDY_WEBHOOK_URL not configured", { status: 501 })
  if (!LINDY_WEBHOOK_SECRET) return new Response("LINDY_WEBHOOK_SECRET not configured", { status: 501 })

  let input: any
  try {
    input = await req.json() // Route Handlers support standard body parsing [^1]
  } catch {
    return new Response("Invalid JSON body", { status: 400 })
  }

  const company = input?.company ?? input?.companyName ?? input?.name ?? input?.query
  if (!company || typeof company !== "string") {
    return new Response("Missing company in body", { status: 400 })
  }

  const requestId: string = input?.requestId || input?.request_id || crypto.randomUUID()
  const includeCompetitive = typeof input?.includeCompetitive === "boolean" ? input.includeCompetitive : true
  const baseUrl = buildBaseUrl(req)
  const callbackUrl = `${baseUrl}/api/lindy/callback?request_id=${encodeURIComponent(requestId)}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${LINDY_WEBHOOK_SECRET}`,
    "X-Api-Key": LINDY_WEBHOOK_SECRET,
    "X-Webhook-Secret": LINDY_WEBHOOK_SECRET,
  }

  const payload = {
    company,
    include_competitive: includeCompetitive,
    format: "dashboard_v1",
    request_id: requestId,
    callbackUrl, // REQUIRED by Lindy error message
    metadata: input?.metadata ?? {},
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)

  try {
    const upstream = await fetch(LINDY_WEBHOOK_URL, {
      method: "POST",
      signal: controller.signal,
      headers,
      body: JSON.stringify(payload),
    })

    // We ignore upstream body here because Lindy will call our callbackUrl with the final data.
    return Response.json({ ok: upstream.ok, status: upstream.status, request_id: requestId })
  } catch (err: any) {
    const message = err?.name === "AbortError" ? "Upstream timeout" : (err?.message ?? "Upstream error")
    return new Response(message, { status: 504 })
  } finally {
    clearTimeout(timeout)
  }
}
