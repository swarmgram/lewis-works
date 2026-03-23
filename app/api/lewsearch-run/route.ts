import { NextRequest, NextResponse } from "next/server";

const LEWIS_API = process.env.LEWIS_API_URL || "https://knl3iun7rqcvmp-8000.proxy.runpod.net/v1";
const SUPA_URL = "https://ejxyyspduqlvhbtsczfc.supabase.co";
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqeHl5c3BkdXFsdmhidHNjemZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjA4NTgsImV4cCI6MjA4ODczNjg1OH0.jlJkTcAsPjarO-DJ4Dn0Pv381icQRfS2udulK2yLFgU";

// Valid access codes — add more via env var LEWSEARCH_CODES (comma-separated)
function getValidCodes(): Set<string> {
  const base = ["LEWIS2026", "SWARM001", "DEMO2026", "PITCH001", "RESEARCH1",
                 "WAVE2026", "SYNTH001", "PANEL001", "INSIGHT1", "BRAND001"];
  const extra = (process.env.LEWSEARCH_CODES || "").split(",").map(s => s.trim()).filter(Boolean);
  return new Set([...base, ...extra]);
}

async function fetchAgents(archetypes: string[], n: number) {
  const url = `${SUPA_URL}/rest/v1/agents?select=id,username,display_name,age,gender,region,archetype,system_prompt&archetype=in.(${archetypes.join(",")})&limit=${n * 3}`;
  const res = await fetch(url, { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } });
  const rows: Array<Record<string, unknown>> = await res.json();
  const valid = rows.filter(r => r.system_prompt);
  return valid.sort(() => Math.random() - 0.5).slice(0, n);
}

async function askAgent(systemPrompt: string, question: string): Promise<{ sentiment: "positive" | "neutral" | "negative"; response: string }> {
  const res = await fetch(`${LEWIS_API}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer lewis" },
    body: JSON.stringify({
      model: "lewis-1.5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question + "\n\nRespond in 2-3 sentences, then on a new line write SENTIMENT: POSITIVE, NEUTRAL, or NEGATIVE." },
      ],
      max_tokens: 150,
      temperature: 0.75,
    }),
  });
  if (!res.ok) throw new Error(`Lewis API ${res.status}`);
  const data = await res.json();
  const text: string = data.choices[0].message.content.trim();
  const match = text.match(/SENTIMENT:\s*(POSITIVE|NEUTRAL|NEGATIVE)/i);
  const sentiment = (match?.[1]?.toLowerCase() ?? "neutral") as "positive" | "neutral" | "negative";
  const response = text.replace(/\nSENTIMENT:.*$/i, "").trim();
  return { sentiment, response };
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // ── Validate code ──────────────────────────────────────────────────────────
  if (body.action === "validate") {
    const valid = getValidCodes().has(body.code?.toUpperCase());
    return NextResponse.json({ valid });
  }

  // ── Run simulation ─────────────────────────────────────────────────────────
  if (body.action === "run") {
    const { code, brand, scenario, cohortDesc } = body;
    if (!getValidCodes().has(code?.toUpperCase())) {
      return NextResponse.json({ error: "Invalid code" }, { status: 403 });
    }

    const brandName = brand || "Your Brand";
    const scenarioText = scenario || "A new product announcement";

    // 3 cohorts × 15 agents = 45 total calls
    const cohortConfigs = [
      { label: "Young Adults (18–30)", archetypes: ["Indie Hacker", "Data Scientist", "Crypto Degen", "Cyber Poet"], n: 15 },
      { label: "Mid-Career Professionals (31–50)", archetypes: ["AI Art Critic", "Travel Blogger", "Creative Professional"], n: 15 },
      { label: "General Consumers (All Ages)", archetypes: ["Indie Hacker", "Travel Blogger", "Data Scientist"], n: 15 },
    ];

    const waves = [
      { label: "Baseline Brand Impression", question: `What's your general impression of ${brandName} as a brand? Be honest.` },
      { label: "Initial Reaction", question: `You just heard: "${scenarioText}". What's your immediate reaction?` },
      { label: "30-Day Drift", question: `It's been a month since you heard about ${brandName}'s announcement. How has your opinion settled?` },
    ];

    const results = [];

    for (const cohort of cohortConfigs) {
      const agents = await fetchAgents(cohort.archetypes, cohort.n);
      if (agents.length === 0) continue;
      const cohortWaves = [];
      const allQuotes: Array<{ persona: string; text: string }> = [];

      for (const wave of waves) {
        const counts = { positive: 0, neutral: 0, negative: 0 };
        const waveQuotes: Array<{ persona: string; text: string }> = [];

        for (const agent of agents.slice(0, 10)) {
          try {
            const result = await askAgent(agent.system_prompt as string, wave.question);
            counts[result.sentiment]++;
            if (waveQuotes.length < 2) {
              waveQuotes.push({
                persona: `${agent.display_name || agent.username}, ${agent.age || "?"} — ${agent.archetype || ""}`,
                text: result.response,
              });
            }
          } catch { counts.neutral++; }
        }

        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        cohortWaves.push({
          wave: wave.label,
          positive: Math.round((counts.positive / total) * 100),
          neutral: Math.round((counts.neutral / total) * 100),
          negative: Math.round((counts.negative / total) * 100),
          quotes: waveQuotes,
        });
        allQuotes.push(...waveQuotes);
      }

      const baseline = cohortWaves[0];
      const final = cohortWaves[cohortWaves.length - 1];
      const drift = final.positive - baseline.positive;

      results.push({
        label: cohort.label,
        n: agents.length,
        waves: cohortWaves,
        drift,
        insight: drift > 10
          ? `This cohort responded positively — ${drift > 20 ? "strong" : "moderate"} improvement across simulated days.`
          : drift < -10
          ? `Significant negative drift detected (${drift} pts). This segment warrants careful messaging.`
          : `Sentiment remained relatively stable across simulated days.`,
        quotes: allQuotes.slice(0, 2),
      });
    }

    return NextResponse.json({ success: true, brand: brandName, scenario: scenarioText, results });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
