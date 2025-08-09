// Receives async callbacks from Lindy.
// Accepts POST with JSON body. request_id may be provided as a query param or in the body.
// Optionally validates secret via Authorization/X-Api-Key/X-Webhook-Secret.

import { saveLindyResult } from "@/lib/lindy-store"

function authOk(req: Request) {
  const secret = process.env.LINDY_WEBHOOK_SECRET
  if (!secret) return true // if not configured, accept (demo)
  const auth = req.headers.get("authorization")
  const xApiKey = req.headers.get("x-api-key")
  const xSecret = req.headers.get("x-webhook-secret")
  if (auth && auth.startsWith("Bearer ") && auth.slice(7) === secret) return true
  if (xApiKey === secret) return true
  if (xSecret === secret) return true
  return false
}

export async function POST(req: Request) {
  if (!authOk(req)) {
    return new Response("Unauthorized", { status: 401 })
  }

  const url = new URL(req.url)
  const qpId = url.searchParams.get("request_id") || url.searchParams.get("requestId")

  let body: any
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const bodyId = body?.request_id || body?.requestId || body?.id
  const requestId = qpId || bodyId
  if (!requestId || typeof requestId !== "string") {
    return new Response("Missing request_id", { status: 400 })
  }

  saveLindyResult(requestId, body)
  return Response.json({ ok: true })
}
