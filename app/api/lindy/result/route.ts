// Polling endpoint for the client to retrieve Lindy results by request_id.

import { getLindyResult, deleteLindyResult } from "@/lib/lindy-store"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const requestId = url.searchParams.get("request_id") || url.searchParams.get("requestId")
  if (!requestId) {
    return new Response("Missing request_id", { status: 400 })
  }
  const data = getLindyResult(requestId)
  return Response.json({ ready: !!data, data })
}

export async function DELETE(req: Request) {
  const url = new URL(req.url)
  const requestId = url.searchParams.get("request_id") || url.searchParams.get("requestId")
  if (!requestId) {
    return new Response("Missing request_id", { status: 400 })
  }
  deleteLindyResult(requestId)
  return Response.json({ ok: true })
}
