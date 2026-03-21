import { NextRequest, NextResponse } from "next/server";

const LEWIS_API_URL =
  process.env.LEWIS_API_URL ||
  "https://knl3iun7rqcvmp-8000.proxy.runpod.net/v1";

// Hard limits — enforced server-side regardless of what the client sends
const MAX_TOKENS_CAP = 200;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 1500;

// In-memory rate limiter: 15 requests per IP per 10 minutes
// Resets on cold start but provides effective burst protection
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 15;
const ipWindows = new Map<string, { count: number; windowStart: number }>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipWindows.get(ip);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    ipWindows.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  return false;
}

// Prune stale IPs every ~100 requests to prevent memory growth
let pruneCounter = 0;
function maybePrune() {
  if (++pruneCounter % 100 !== 0) return;
  const now = Date.now();
  for (const [ip, entry] of ipWindows.entries()) {
    if (now - entry.windowStart > RATE_WINDOW_MS) ipWindows.delete(ip);
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  maybePrune();

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { messages, temperature = 0.7 } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    // Enforce message count cap
    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_MESSAGES} messages per request` },
        { status: 400 }
      );
    }

    // Enforce per-message length cap
    for (const msg of messages) {
      if (typeof msg.content === "string" && msg.content.length > MAX_MESSAGE_CHARS) {
        return NextResponse.json(
          { error: `Message exceeds maximum length of ${MAX_MESSAGE_CHARS} characters` },
          { status: 400 }
        );
      }
    }

    const resp = await fetch(`${LEWIS_API_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "lewis-1.5",
        messages,
        max_tokens: MAX_TOKENS_CAP,
        temperature,
        top_p: 0.9,
        repetition_penalty: 1.1,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: `Lewis API error: ${resp.status}`, detail: text },
        { status: 502 }
      );
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ content });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
