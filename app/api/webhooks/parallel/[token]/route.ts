// Webhook endpoint for tokenized path:
// /api/webhooks/parallel/{token}
//
// Valid tokens list supports both your previously added token and the new one
// you asked to POST to.

const VALID_TOKENS = new Set<string>([
  "6e7988ede614ea35b93450525b19ac9f07daf0750363270e198e1381dfac25bc", // previous token
  "af734b729c5c7e84ace66ac9c390c951a8515c26219a82b56fee763967904668", // new token to POST to
])

function isValidToken(token: string | undefined) {
  return !!token && VALID_TOKENS.has(token)
}

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  if (!isValidToken(params.token)) {
    return new Response("Invalid token", { status: 401 })
  }
  return Response.json({ ok: true, token: params.token, message: "Webhook endpoint ready" })
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  if (!isValidToken(params.token)) {
    return new Response("Invalid token", { status: 401 })
  }

  let body: any = null
  let raw: string | null = null
  try {
    raw = await req.text()
    try {
      body = JSON.parse(raw)
    } catch {
      body = { raw }
    }
  } catch {
    // ignore
  }

  console.log("[Webhook] Token:", params.token)
  console.log("[Webhook] Time:", new Date().toISOString())
  console.log("[Webhook] Headers:", Object.fromEntries(req.headers.entries()))
  if (raw) console.log("[Webhook] Raw body (first 2k):", raw.slice(0, 2000))

  // TODO: Persist or trigger workflows here.

  return Response.json({ ok: true })
}
