import { NextRequest, NextResponse } from "next/server";

const LEWIS_API_URL =
  process.env.LEWIS_API_URL ||
  "https://knl3iun7rqcvmp-8000.proxy.runpod.net/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, max_tokens = 400, temperature = 0.7 } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const resp = await fetch(`${LEWIS_API_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "lewis-1.5",
        messages,
        max_tokens,
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
